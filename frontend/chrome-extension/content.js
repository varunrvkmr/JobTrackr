// content.js - Updated to use background script for embeddings
(async () => {
  console.log('🔹 content.js loaded');

  function proxyFetch(url, init) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'CORS_FETCH', url, init },
        response => {
          if (!response) {
            return reject(new Error('No response from background'));
          }
          if (!response.ok) {
            return reject(new Error(
              response.error || `Server returned ${response.status}`
            ));
          }
          resolve(response.data);
        }
      );
    });
  }

  /**
   * Utility: Generate a (reasonably) unique CSS selector for an element.
   * For best results, include a dedicated selector-generator library.
   */
  function uniqueCssSelector(el) {
    if (el.id) return `#${el.id}`;
    const path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.className) {
        const classes = el.className.trim().split(/\s+/).join('.');
        selector += `.${classes}`;
      }
      const parent = el.parentNode;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.nodeName === el.nodeName);
        if (siblings.length > 1) {
          const idx = siblings.indexOf(el) + 1;
          selector += `:nth-of-type(${idx})`;
        }
      }
      path.unshift(selector);
      el = parent;
    }
    return path.join(' > ');
  }

  /**
   * Utility: Get a human-readable label for an input element.
   */
  function getNearestLabelText(el) {
    if (el.id) {
      const lab = document.querySelector(`label[for="${el.id}"]`);
      if (lab) return lab.innerText.trim();
    }
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    if (el.placeholder) return el.placeholder.trim();
    const prev = el.previousElementSibling;
    if (prev && prev.tagName === 'LABEL') return prev.innerText.trim();
    return '';
  }

  /**
   * Extract all form fields on the page for classification.
   * Enhanced to include all metadata needed by the backend.
   * Returns: [{ selector, label, placeholder, type, required, name, id, pattern, maxlength }]
   */
  function extractFields() {
    return Array.from(document.querySelectorAll('input,textarea,select')).map(el => {
      const fieldData = {
        selector: uniqueCssSelector(el),
        label: getNearestLabelText(el),
        placeholder: el.placeholder || '',
        type: el.type || 'text',
        required: el.required || false,
        name: el.name || '',
        id: el.id || ''
      };

      // Add pattern if it exists (for input validation)
      if (el.pattern) {
        fieldData.pattern = el.pattern;
      }

      // Add maxlength if it exists
      if (el.maxLength && el.maxLength !== -1) {
        fieldData.maxlength = el.maxLength;
      }

      // For select elements, capture options info
      if (el.tagName === 'SELECT') {
        fieldData.options = Array.from(el.options).map(opt => ({
          value: opt.value,
          text: opt.textContent.trim()
        }));
      }

      return fieldData;
    });
  }

  function notifyPage(msg, isError = false) {
    const div = document.createElement('div');
    div.textContent = msg;
    Object.assign(div.style, {
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '8px 12px',
      background: isError ? 'crimson' : 'seagreen',
      color: 'white',
      zIndex: 99999,
      borderRadius: '4px'
    });
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
 
  /**
   * Main autofill flow: classify fields, fetch fills, inject.
   * Enhanced to handle confidence levels and improved error handling.
   */
  async function runAutofillFlow() {
    console.log('🔹 runAutofillFlow start');
    const fields = extractFields();
    console.log(`🔹 extractFields → found ${fields.length} fields`);

    if (fields.length === 0) {
      console.warn('⚠️ No fields found—aborting');
      notifyPage('No inputs to classify', true);
      return;
    }

    try {
      // 1) Classify with enhanced field data
      console.log('🔹 proxyFetch classify…', fields);
      const classifyPayload = await proxyFetch(
        'http://localhost:5050/api/autofill/classify',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields })
        }
      );
      
      const matches = classifyPayload.matches || [];
      console.log(`🔹 classifyPayload → matches:`, matches);
      
      if (!matches.length) {
        notifyPage('⚠️ No fields matched.', true);
        return { filled: 0, total: 0 };
      }

      // 2) Fill with enhanced match data
      console.log('🔹 proxyFetch fill…', matches);
      const fillPayload = await proxyFetch(
        'http://localhost:5050/api/autofill/fill',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches })
        }
      );
      
      const fills = fillPayload.fills || [];
      console.log(`🔹 fillPayload → fills:`, fills);

      // 3) Inject into page with confidence-based handling
      console.log('🔹 injectValues…');
      let count = 0;
      let highConfidenceCount = 0;
      let warningCount = 0;
      
      for (const fill of fills) {
        const { selector, value, confidence, warning } = fill;
        const el = document.querySelector(selector);
        if (!el) {
          console.warn(`⚠️ Element not found for selector: ${selector}`);
          continue;
        }

        // Handle warnings (e.g., conflicts)
        if (warning) {
          warningCount++;
          console.warn(`⚠️ ${warning} for selector: ${selector}`);
          el.style.outline = '2px solid #FF9800';
          el.title = warning;
        } else if (confidence === 'high') {
          // Visual indication for high confidence fields
          highConfidenceCount++;
          el.style.outline = '2px solid #4CAF50';
        } else if (confidence === 'medium') {
          el.style.outline = '1px solid #2196F3';
        }

        // Remove outline after delay
        setTimeout(() => {
          el.style.outline = '';
          if (el.title === warning) el.title = '';
        }, 3000);

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();

        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = Boolean(value);
        } else if (el.isContentEditable) {
          el.textContent = value;
        } else if (el.tagName === 'SELECT') {
          // Enhanced select handling
          const opt = [...el.options].find(o => 
            o.textContent.trim() === value || 
            o.value === value ||
            o.textContent.trim().toLowerCase() === value.toLowerCase()
          );
          if (opt) {
            opt.selected = true;
          } else {
            console.warn(`⚠️ Option not found for select: ${value}`);
          }
        } else {
          el.value = value;
        }

        // Trigger events to ensure form validation and frameworks detect changes
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        count++;
      }

      const message = `✅ Autofilled ${count}/${fills.length} fields` + 
                     (highConfidenceCount > 0 ? ` (${highConfidenceCount} high confidence)` : '') +
                     (warningCount > 0 ? ` (${warningCount} warnings)` : '');
      notifyPage(message);
      
      return { filled: count, total: fills.length, highConfidence: highConfidenceCount, warnings: warningCount };

    } catch (error) {
      console.error('❌ Autofill error:', error);
      notifyPage(`❌ Autofill failed: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * buildJobData()
   * Scrapes the current page for job details based on platform-specific selectors,
   * then returns a structured jobData object ready to send to the background.
   *
   * @returns {{
   *   company: string,
   *   job_title: string,
   *   location: string,
   *   country: string,
   *   job_link: string,
   *   job_description: string,
   *   posting_status: string
   * }} jobData
   */
  function buildJobData() {
    // Platform Detection
    const hostname = window.location.hostname;
    let platform = 'unknown';

    if (hostname.includes('linkedin')) platform = 'LinkedIn';
    else if (hostname.includes('otta') || hostname.includes('welcometothejungle')) platform = 'Otta';
    else if (hostname.includes('jobright')) platform = 'Jobright';

    console.log('Detected Platform:', platform);

    const formatDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const getLinkedInApplyUrl = () => {
      try {
        const codeBlocks = document.querySelectorAll('code[style*="display: none"]');
        for (const codeBlock of codeBlocks) {
          const jsonText = codeBlock.innerText.trim();
          try {
            const jsonData = JSON.parse(jsonText);
            const companyApplyUrl = jsonData?.data?.applyMethod?.companyApplyUrl;
            if (companyApplyUrl) {
              console.log('✅ Found company application URL:', companyApplyUrl);
              return companyApplyUrl;
            }
          } catch {}
        }
        console.warn('⚠️ No company application URL found.');
        return null;
      } catch (error) {
        console.error('❌ Error extracting company application URL:', error);
        return null;
      }
    };

    const config = {
      LinkedIn: {
        title: 'h1.t-24.t-bold.inline',
        company: 'div.job-details-jobs-unified-top-card__company-name a',
        location: 'div.job-details-jobs-unified-top-card__primary-description-container div span.tvm__text',
        job_description: 'h2.text-heading-large + div.mt4 p'
      },
      
      Otta: {
      title: 'h1[data-testid="job-title"]',
      company: 'h1[data-testid="job-title"] a',
      location: 'div[data-testid="job-locations"] div[data-testid="job-location-tag"]',
    },
    Jobright: {
      title: 'h1.ant-typography.index_job-title__sStdA.css-bq1qwd',
      company: 'h2.ant-typography.index_company-row__vOzgg.css-bq1qwd strong',
      location: 'div.index_job-metadata-item__Wv_Xh span',
      responsibilities: 'section.index_sectionContent__zTR73 div.ant-space span.ant-typography.index_listText__ENCyh.css-19pqdq5',
      required: 'div.index_flex-col__Y_QL8 h4.index_qualifications-sub-title__IA6rq + div span.ant-typography.index_listText__ENCyh.css-19pqdq5',
      preferred: 'div.index_flex-col__Y_QL8 h4.index_qualifications-sub-title__IA6rq + div span.ant-typography.index_listText__ENCyh.css-19pqdq5'
    }
  };

  const selectors = config[platform] || {};

  const extractAndMerge = (selector) => {
  return Array.from(document.querySelectorAll(selector))
    .map((el) => el.innerText.trim())
      .join('\n');
  };

    

// Updated job data extraction logic
const jobData = {
    company: (() => {
      if (platform === 'Otta') {
        const companyElement = document.querySelector(selectors.company);
        return companyElement?.innerText.trim() || 'No company';
      }
      return document.querySelector(selectors.company)?.innerText.trim() || 'No company';
    })(),
    
    job_title: (() => {
    if (platform === 'Otta') {
      const titleElement = document.querySelector(selectors.title);
        if (titleElement) {
          // Extract just the text content before the company link
          const titleText = titleElement.childNodes[0]?.textContent?.trim();
          // Remove trailing comma if it exists
          return titleText?.replace(/,\s*$/, '') || 'Unknown Position';
        }
      return 'Unknown Position';
      }
      return document.querySelector(selectors.title)?.innerText.trim() || 'Unknown Position';
    })(),
    
    location: (() => {
      if (platform === 'Otta') {
        const locationElements = document.querySelectorAll(selectors.location);
        if (locationElements.length > 0) {
          return Array.from(locationElements)
            .map(el => el.innerText.trim())
            .join(', ');
        }
        return 'No location';
      }
      return document.querySelector(selectors.location)?.innerText.trim() || 'No location';
    })(),
    
    country: 'Not specified',
    job_link: platform === 'LinkedIn'
      ? getLinkedInApplyUrl() || window.location.href
      : window.location.href,
    job_description:
      (platform === 'Otta' || platform === 'Jobright'
        ? [
            extractAndMerge(selectors.responsibilities),
            extractAndMerge(selectors.required),
            extractAndMerge(selectors.preferred)
          ].join('\n\n')
        : document.querySelector(selectors.job_description)?.innerText.trim()) || 'No job description available',
    posting_status: 'Saved'
  };
      console.log('Extracted Job Data:', jobData);
      return jobData;
    }

  // Message handlers
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📥 [content] incoming message:", msg);
    if (!msg || !msg.type) {
      // skip anything that isn't a well-formed SAVE_JOB or RUN_AUTOFILL
      return;
    }

    // --- SAVE JOB ---
    if (msg.type === 'SAVE_JOB') {
      console.log('📥 [content] SAVE_JOB');
      let jobData;
      try {
        jobData = buildJobData();
      } catch (err) {
        sendResponse({ success: false, error: err.message });
        return true;
      }

      // forward to background.js (or wherever you're persisting)
      chrome.runtime.sendMessage(
        { type: 'SAVE_JOB', jobData },
        (backgroundResponse) => {
          // bubble the result back to the popup
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(backgroundResponse);
          }
        }
      );

      // indicate we'll call sendResponse asynchronously
      return true;
    }

    // --- AUTOFILL APPLICATION ---
    if (msg.type === 'RUN_AUTOFILL') {
      console.log('📥 [content] RUN_AUTOFILL');
      runAutofillFlow()
        .then((result) => sendResponse({ status: 'ok', result }))
        .catch(err => sendResponse({ status: 'error', error: err.message }));

      return true;  // because we'll sendResponse later
    }
  });

  console.log('✅ content.js ready');
})();