chrome.runtime.onInstalled.addListener(() => {
  console.log("🔧 Job Tracker extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Message received in background script:", message);

  if (message.type === "SAVE_JOB") {
    fetch("http://localhost:5050/api/jobs/addJob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",  // ✅ send auth cookies
      body: JSON.stringify(message.jobData)
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Job saved via background:", data);
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error("❌ Failed to save job via background:", err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // keep the message channel open for async response
  }

  // You can keep your fetchJobDetails relay logic if you still need it
});
