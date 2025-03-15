document.addEventListener('DOMContentLoaded', () => {
    const snippetsGrid = document.getElementById('snippets-grid');
    const saveJobButton = document.getElementById('save-job');
    const statusMessage = document.getElementById('status');
  
    // Fetch saved snippets and render them in the grid
    fetch('http://localhost:5050/api/snippets/all')
      .then((response) => response.json())
      .then((snippets) => {
        snippetsGrid.innerHTML = ''; // Clear existing grid
        snippets.forEach((snippet) => renderSnippetCard(snippet)); // Render all snippets
      })
      .catch((error) => {
        console.error('Error fetching snippets:', error);
        statusMessage.textContent = 'Failed to load saved snippets.';
      });
  
    // Save job when the "Save Job" button is clicked
    saveJobButton.addEventListener('click', () => {
      console.log('Save Job button clicked');
  
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Active tab fetched:', tabs);
  
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          console.log('Content script executed');
        });
      });
    });
  });
  
  // Render a single snippet card
  function renderSnippetCard(snippet) {
    const card = document.createElement('div');
    card.className = 'card';
  
    const keyword = document.createElement('div');
    keyword.className = 'keyword';
    keyword.textContent = snippet.content;
  
    // Add click event to copy text to clipboard
    keyword.addEventListener('click', () => {
      navigator.clipboard.writeText(snippet.content)
        .then(() => console.log("Copied to clipboard"))
        .catch((error) => console.error('Error copying to clipboard:', error));
    });
  
    card.appendChild(keyword);
    document.getElementById('snippets-grid').appendChild(card);
  }
  
  // Function to extract job details from the active tab
  function fetchJobDetails() {
    const hostname = window.location.hostname;
    const platform = hostname.includes('linkedin')
      ? 'LinkedIn'
      : hostname.includes('otta')
      ? 'Otta'
      : hostname.includes('jobright')
      ? 'Jobright'
      : 'unknown';
  
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
        location: null, // No explicit location in Otta's example
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
  
    // Extract job details based on the platform
    const jobData = {
      position: platform === 'Otta'
        ? document.querySelector(selectors.title)?.innerText.trim().split(', ')[0] || 'Unknown Position'
        : document.querySelector(selectors.title)?.innerText.trim() || 'Unknown Position',
      company: platform === 'Otta'
        ? document.querySelector(selectors.title)?.innerText.trim().split(', ')[1] || 'No company'
        : document.querySelector(selectors.company)?.innerText.trim() || 'No company',
      location: platform === 'Otta'
        ? 'Not provided' // No location explicitly defined for Otta
        : document.querySelector(selectors.location)?.innerText.trim() || 'No location',
      job_description:
        platform === 'Otta' || platform === 'Jobright'
          ? [
              extractAndMerge(selectors.responsibilities),
              extractAndMerge(selectors.required),
              extractAndMerge(selectors.preferred)
            ].join('\n\n')
          : document.querySelector(selectors.job_description)?.innerText.trim() || 'No job description available'
    };
  
    return jobData;
  }
  
  
  
  // Function to save a job to the backend
  function saveJob(jobData, statusMessage) {
    if (!jobData.title || !jobData.company) {
      console.error('Incomplete job data:', jobData);
      statusMessage.textContent = 'Incomplete job details.';
      return;
    }
    
    fetch('http://localhost:5050/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...jobData,
        status: 'Saved',
        date_applied: new Date().toISOString().split('T')[0],
      }),
    })
      .then((response) => {
        if (response.ok) {
          statusMessage.textContent = 'Job saved successfully!';
          setTimeout(() => (statusMessage.textContent = ''), 2000); // Clear status after 2 seconds
        } else {
          console.error('Failed to save job:', response.statusText);
          statusMessage.textContent = 'Failed to save job.';
        }
      })
      .catch((error) => {
        console.error('Error saving job:', error);
        statusMessage.textContent = 'Error saving job.';
      });
  }
  
  // Function to edit a snippet
  function editSnippet(id) {
    const newContent = prompt('Edit your snippet:');
    if (newContent) {
      fetch(`http://localhost:5050/api/snippets/edit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })
        .then((response) => response.json())
        .then((updatedSnippet) => {
          alert('Snippet updated!');
          location.reload(); // Reload to show updated data
        })
        .catch((error) => console.error('Error editing snippet:', error));
    }
  }
  