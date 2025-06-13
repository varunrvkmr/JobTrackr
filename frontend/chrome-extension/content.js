(() => {
  console.log('Content script loaded');

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

  // Authenticated job save
  chrome.runtime.sendMessage(
    {
      type: 'SAVE_JOB',
      jobData
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Message send error:', chrome.runtime.lastError.message);
        alert('⚠️ Failed to send job data to background. Check console.');
        return;
      }

      if (response.success) {
        console.log('🎉 Job saved successfully via background:', response.data);
        alert('🎉 Job details saved successfully!');
      } else {
        console.error('⚠️ Job save failed via background:', response.error);
        alert('⚠️ Failed to save job details. Check console for details.');
      }
    }
  );

  // Floating button for autofill
  const createAutofillButton = () => {
    const btn = document.createElement('button');
    btn.innerText = 'Autofill from Profile';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '10px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    });

    btn.onclick = () => {
      fetch('http://localhost:5050/api/user_profiles/me', {
        method: 'GET',
        credentials: 'include'  // ✅ send cookies with the request
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
          return res.json();
        })
        .then((profile) => {
          console.log('✅ Retrieved profile:', profile);
          autofillForm(profile);
        })
        .catch((err) => {
          console.error('❌ Error fetching profile:', err);
          alert('⚠️ Failed to fetch profile data. Please ensure you are logged in.');
        });
    };
    document.body.appendChild(btn);
  };

  const autofillForm = (profile) => {
    const mapping = {
      full_name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email,
      phone: profile.phone,
      linkedin: profile.linkedin,
      github: profile.github,
      bio: profile.bio
    };

    for (const [key, value] of Object.entries(mapping)) {
      const input = document.querySelector(`input[name*="${key}"], textarea[name*="${key}"]`);
      if (input) input.value = value;
    }

    alert('✅ Autofilled form from your profile!');
  };

  createAutofillButton();
})();
