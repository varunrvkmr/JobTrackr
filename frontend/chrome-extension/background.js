// background-script.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("🔧 Job Tracker extension installed.");
});

// Optional: Message relay between popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Message received in background script:", message);

  // Example: Relay message to content script
  if (message.action === "fetchJobDetails") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeJobInfo" }, (response) => {
        sendResponse(response); // relay response back to popup
      });
    });

    // Tell Chrome this response is async
    return true;
  }
});
