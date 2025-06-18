// content.js - Updated to use background script for embeddings
(async () => {
  console.log('🔹 content.js loaded');

  // Load canonical data
  console.log('🔹 Fetching canonical.json…');
  const canonical = await fetch(
    chrome.runtime.getURL('canonical.json')
  ).then(r => r.json());
  console.log('✅ canonical loaded:', canonical);

  // Helper function to compute embeddings via background script
  const embedText = async (text) => {
    const resp = await fetch('http://localhost:5050/api/embed', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text] })
    });
    if (!resp.ok) {
      throw new Error(`Embed failed: ${resp.status}`);
    }
    const { embeddings } = await resp.json();
    return embeddings[0];
  };

  // Cosine similarity function
  const cosineSim = (a, b) => {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  // Extract form fields
  const extractFields = () => {
    const els = Array.from(document.querySelectorAll('input,textarea,select'));
    return els.map(el => {
      const raw = (document.querySelector(`label[for="${el.id}"]`)?.innerText
                   || el.placeholder
                   || el.getAttribute('aria-label')
                   || '').trim().toLowerCase()
                   .replace(/[^a-z0-9 ]/g, '');
      return { el, label: raw };
    });
  };

  // Precompute canonical embeddings
  console.log('🔹 Computing canonical embeddings…');
  const canonicalVecs = {};
  for (const [key, examples] of Object.entries(canonical)) {
    try {
      canonicalVecs[key] = await embedText(examples[0]);
      console.log(`✅ Embedded ${key}`);
    } catch (error) {
      console.error(`❌ Failed to embed ${key}:`, error);
    }
  }
  console.log('✅ Canonical embeddings ready');

  // Autofill form function
  const autofillForm = async (profile) => {
    try {
      console.log('🔹 Starting autofill process...');
      
      // Extract and embed field labels
      const fields = extractFields();
      console.log(`🔹 Found ${fields.length} form fields`);
      
      for (const field of fields) {
        if (field.label) {
          try {
            field.vec = await embedText(field.label);
          } catch (error) {
            console.warn(`⚠️ Failed to embed field "${field.label}":`, error);
          }
        }
      }

      // Match fields to canonical vectors
      for (const field of fields) {
        if (!field.vec) continue;
        
        let best = null;
        for (const [key, cVec] of Object.entries(canonicalVecs)) {
          const score = cosineSim(field.vec, cVec);
          if (score > 0.7 && (!best || score > best.score)) {
            best = { key, score };
          }
        }
        if (best) {
          field.match = best.key;
          console.log(`🔹 Matched "${field.label}" to "${best.key}" (score: ${best.score.toFixed(3)})`);
        }
      }

      // Fill matched fields
      const filledCount = fields.filter(field => {
        if (!field.match) return false;
        
        let value = profile[field.match];
        if (field.match === 'full_name') {
          value = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }
        
        if (value != null && value !== '') {
          field.el.value = value;
          field.el.dispatchEvent(new Event('input', { bubbles: true }));
          field.el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      }).length;

      console.log(`✅ Autofilled ${filledCount} fields`);
      alert(`✅ Autofilled ${filledCount} fields from your profile!`);
      
    } catch (error) {
      console.error('❌ Autofill error:', error);
      alert('⚠️ Autofill failed: ' + error.message);
    }
  };

  //     - platform detection (LinkedIn/Otta/Jobright)
  //     - selectors/config
  //     - extractAndMerge helper
  //     Code goes here:
  //     function buildJobData() { ... }
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
  else if (hostname.includes('otta')) platform = 'Otta';
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
      title: 'h1.sc-f48b4843-0.kSSTOp',
      company: 'h1.sc-f48b4843-0.kSSTOp a',
      location: null,
      responsibilities: 'div.sc-ac6b1503-0.eckgeU ul li[data-testid="job-involves-bullet"]',
      required: 'div.sc-ac6b1503-0.eckgeU ul li[data-testid="job-requirement-bullet"]',
      preferred: 'div.sc-ac6b1503-0.eckgeU ul li[data-testid="job-requirement-bullet"]'
    },
    Jobright: {
      title: 'h1.ant-typography.index_job-title__sStdA.css-19pqdq5',
      company: 'h2.ant-typography.index_company-row__vOzgg.css-19pqdq5 strong',
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

  const jobData = {
    company: platform === 'Otta'
      ? document.querySelector(selectors.company)?.innerText.trim().split(', ')[1] || 'No company'
      : document.querySelector(selectors.company)?.innerText.trim() || 'No company',
    job_title: platform === 'Otta'
      ? document.querySelector(selectors.title)?.innerText.trim().split(', ')[0] || 'Unknown Position'
      : document.querySelector(selectors.title)?.innerText.trim() || 'Unknown Position',
    location: platform === 'Otta'
      ? 'Not provided'
      : document.querySelector(selectors.location)?.innerText.trim() || 'No location',
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
}

  // Message handlers
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'SAVE_JOB') {
      console.log('📥 [content] Received SAVE_JOB');
      try {
        const jobData = buildJobData();
        console.log('🔹 [content] jobData:', jobData);

        chrome.runtime.sendMessage(
          { type: 'SAVE_JOB', jobData },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('❌ [content] Error sending SAVE_JOB:', chrome.runtime.lastError);
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              console.log('📨 [content] Background response:', response);
              sendResponse(response);
            }
          }
        );
      } catch (err) {
        console.error('❌ [content] buildJobData error:', err);
        sendResponse({ success: false, error: err.message });
      }
      return true;
    }

    if (msg.type === 'AUTOFILL') {
      console.log('📥 [content] Received AUTOFILL');
      
      fetch('http://localhost:5050/api/user_profiles/me', {
        credentials: 'include'
      })
        .then(res => {
          console.log('🔹 [content] Profile fetch status:', res.status);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(profile => {
          console.log('🔹 [content] Profile data:', profile);
          return autofillForm(profile);
        })
        .catch(err => {
          console.error('❌ [content] AUTOFILL error:', err);
          alert('⚠️ Failed to autofill: ' + err.message);
        });
      
      return true;
    }
  });

  console.log('✅ content.js ready – waiting for SAVE_JOB or AUTOFILL');
})();