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
  // --- Autofill Application (new flow) ---
  autofillButton.addEventListener('click', () => {
    console.log('Autofill Application button clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      // Send a message to content.js to kick off runAutofillFlow()
      chrome.tabs.sendMessage(tabId, { action: 'RUN_AUTOFILL' }, (response) => {
        if (chrome.runtime.lastError) {
          // content.js might not be injected yet
          console.warn('Content script not found, injecting…');
          chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
          }, () => {
            // retry after injection
            chrome.tabs.sendMessage(tabId, { action: 'RUN_AUTOFILL' });
          });
        } else {
          console.log('Autofill message sent:', response);
        }
        statusMessage.textContent = 'Autofill triggered!';
        setTimeout(() => statusMessage.textContent = '', 2000);
      });
    });
  });
});
