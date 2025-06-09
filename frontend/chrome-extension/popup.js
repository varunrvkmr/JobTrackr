document.addEventListener('DOMContentLoaded', () => {
  const saveJobButton = document.getElementById('save-job');
  const autofillButton = document.getElementById('autofill-application');
  const statusMessage = document.getElementById('status');

  // Save job when "Save Current Job" is clicked
  saveJobButton.addEventListener('click', () => {
    console.log('Save Job button clicked');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Active tab fetched:', tabs);

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      }, () => {
        console.log('Content script executed for saving job');
        statusMessage.textContent = 'Job save triggered!';
        setTimeout(() => (statusMessage.textContent = ''), 2000);
      });
    });
  });

  // Autofill application when "Autofill Application" is clicked
  autofillButton.addEventListener('click', () => {
    console.log('Autofill Application button clicked');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Active tab fetched:', tabs);

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          // Trigger the floating button click if it exists
          const autofillBtn = document.querySelector('button');
          if (autofillBtn && autofillBtn.innerText.includes('Autofill from Profile')) {
            autofillBtn.click();
          } else {
            alert('⚠️ No autofill button found on the page.');
          }
        }
      });
    });
  });
});
