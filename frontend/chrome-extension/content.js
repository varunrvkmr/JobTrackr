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
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to extract the company application URL from LinkedIn job postings
const getLinkedInApplyUrl = () => {
  try {
    // Find all hidden <code> elements
    const codeBlocks = document.querySelectorAll('code[style*="display: none"]');

    for (const codeBlock of codeBlocks) {
      const jsonText = codeBlock.innerText.trim();

      // Try parsing as JSON
      try {
        const jsonData = JSON.parse(jsonText);

        // Check if applyMethod and companyApplyUrl exist
        const companyApplyUrl = jsonData?.data?.applyMethod?.companyApplyUrl;
        if (companyApplyUrl) {
          console.log('✅ Found company application URL:', companyApplyUrl);
          return companyApplyUrl;
        }
      } catch (innerError) {
        // Ignore JSON parse errors for non-relevant <code> blocks
      }
    }
    
    console.warn('⚠️ No company application URL found.');
    return null;
  } catch (error) {
    console.error('❌ Error extracting company application URL:', error);
    return null;
  }
};


  // Platform-specific Selectors
  const config = {
    LinkedIn: {
      title: 'h1.t-24.t-bold.inline',
      company: 'div.job-details-jobs-unified-top-card__company-name a',
      location: 'div.job-details-jobs-unified-top-card__primary-description-container div span.tvm__text',
      position: 'h1.t-24.t-bold.inline',
      link: getLinkedInApplyUrl() || window.location.href, // Prefer the actual application link
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

  // Helper function to extract and merge multiple content blocks
  const extractAndMerge = (selector) => {
    return Array.from(document.querySelectorAll(selector))
      .map((el) => el.innerText.trim())
      .join('\n');
  };

  const jobData = {
    company: platform === 'Otta'
      ? document.querySelector(selectors.company)?.innerText.trim().split(', ')[1] || 'No company'
      : document.querySelector(selectors.company)?.innerText.trim() || 'No company',
    location: platform === 'Otta' ? 'Not provided' : document.querySelector(selectors.location)?.innerText.trim() || 'No location',
    position: platform === 'Otta'
      ? document.querySelector(selectors.title)?.innerText.trim().split(', ')[0] || 'Unknown Position'
      : document.querySelector(selectors.title)?.innerText.trim() || 'Unknown Position',
    date_applied: formatDate(),
    link: platform === 'LinkedIn' ? getLinkedInApplyUrl() || window.location.href : window.location.href, // Get LinkedIn apply link if available
    job_description:
      (platform === 'Otta' || platform === 'Jobright'
        ? [
            extractAndMerge(selectors.responsibilities),
            extractAndMerge(selectors.required),
            extractAndMerge(selectors.preferred)
          ].join('\n\n')
        : document.querySelector(selectors.job_description)?.innerText.trim()) || 'No job description available',
    status: 'Saved'
  };

  console.log('Extracted Job Data:', jobData);

  // Send job data to the backend
  fetch('http://localhost:5050/api/jobs/addJob', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(jobData),
    mode: 'cors',
    credentials: 'omit'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('✅ Job saved:', data);
      alert('🎉 Job details saved successfully!');
    })
    .catch((error) => {
      console.error('❌ API Error:', error.message);
      alert('⚠️ Failed to save job details. Check the console for more info.');
    });
})();
