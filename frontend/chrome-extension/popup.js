
document.addEventListener('DOMContentLoaded', () => {
  const saveJobButton = document.getElementById('save-job');
  const autofillButton = document.getElementById('autofill-application');
  const statusMessage = document.getElementById('statusMessage');

  // Save job when "Save Current Job" is clicked
  saveJobButton.addEventListener('click', () => {
    console.log('popup.js - in saveJobButton addEventListener');
    saveJobButton.disabled = true;
    statusMessage.textContent = 'Saving…';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Since content.js is already loaded on all pages, just message it:
      chrome.tabs.sendMessage(tabId, { type: 'SAVE_JOB' }, response => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          statusMessage.textContent = 'Error: no listener';
          console.log('Error: no listener');
        } else if (response?.success) {
          statusMessage.textContent = 'Job saved!';
          console.log('Job saved!');
        } else {
          statusMessage.textContent = `Error: ${response?.error || 'unknown'}`;
        }

        setTimeout(() => {
          statusMessage.textContent = '';
          saveJobButton.disabled = false;
        }, 2000);
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
        //statusMessage.textContent = 'Autofill triggered!';
        //setTimeout(() => statusMessage.textContent = '', 2000);
      });
    });
  });
});
