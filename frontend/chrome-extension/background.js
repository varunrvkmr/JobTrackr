// background.js

let offscreenDocumentId = null;

// — Offscreen TF.js setup for embeddings —————————————————————————

async function createOffscreenDocument() {
  if (offscreenDocumentId) {
    return offscreenDocumentId;
  }

  try {
    console.log('🔹 Creating offscreen document...');
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS'],
      justification: 'Use TensorFlow.js for semantic text embeddings'
    });
    offscreenDocumentId = 'offscreen-tensorflow';
    console.log('✅ Offscreen document created');
    // give it a moment to load
    await new Promise(r => setTimeout(r, 1000));
    return offscreenDocumentId;
  } catch (err) {
    console.error('❌ Failed to create offscreen document:', err);
    throw err;
  }
}

async function handleEmbedding(text) {
  await createOffscreenDocument();

  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);

    function messageHandler(message, sender) {
      if (message.type === 'EMBEDDING_RESULT' && message.id === id) {
        chrome.runtime.onMessage.removeListener(messageHandler);
        if (message.error) reject(new Error(message.error));
        else resolve(message.embedding);
      }
    }

    chrome.runtime.onMessage.addListener(messageHandler);
    chrome.runtime.sendMessage({ type: 'COMPUTE_EMBEDDING', id, text });

    // Timeout guard
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(messageHandler);
      reject(new Error('Embedding computation timed out'));
    }, 30000);
  });
}

// — Background message router ——————————————————————————————————

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📥 [background] Message:', message.type);

  // 1) Proxy arbitrary fetches to avoid CORS in the page
  if (message.type === 'CORS_FETCH') {
    const { url, init } = message;
    fetch(url, init)
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        sendResponse({
          ok:      response.ok,
          status:  response.status,
          data,
        });
      })
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;  // keep channel open
  }

  // 2) Embedding requests from offscreen script
  if (message.type === 'COMPUTE_EMBEDDING') {
    console.log('🔹 [background] COMPUTE_EMBEDDING:', message.text?.slice(0, 50) + '…');
    handleEmbedding(message.text)
      .then(emb => sendResponse({ success: true, embedding: emb, id: message.id }))
      .catch(err  => sendResponse({ success: false, error: err.message, id: message.id }));
    return true;
  }

  // 3) Save job requests
  if (message.type === 'SAVE_JOB') {
    console.log('🔹 [background] SAVE_JOB:', message.jobData);
    fetch('http://localhost:5050/api/jobs/addJob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(message.jobData)
    })
      .then(r => r.json())
      .then(result => sendResponse({ success: true, result }))
      .catch(err    => sendResponse({ success: false, error: err.message }));
    return true;
  }

});

// Clean up offscreen document when extension is suspended/reloaded
chrome.runtime.onSuspend.addListener(() => {
  if (offscreenDocumentId) {
    chrome.offscreen.closeDocument();
  }
});
