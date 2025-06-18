// background.js
let offscreenDocumentId = null;

// Create offscreen document for TensorFlow processing
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
    
    // Wait a bit for the document to fully load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return offscreenDocumentId;
  } catch (error) {
    console.error('❌ Failed to create offscreen document:', error);
    throw error;
  }
}

// Handle embedding requests
async function handleEmbedding(text) {
  await createOffscreenDocument();
  
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);
    
    const messageHandler = (message, sender) => {
      if (message.type === 'EMBEDDING_RESULT' && message.id === id) {
        chrome.runtime.onMessage.removeListener(messageHandler);
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.embedding);
        }
      }
    };
    
    chrome.runtime.onMessage.addListener(messageHandler);
    
    // Send embedding request to offscreen document
    chrome.runtime.sendMessage({
      type: 'COMPUTE_EMBEDDING',
      id,
      text
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(messageHandler);
      reject(new Error('Embedding computation timed out'));
    }, 30000);
  });
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📥 [background] Received message:', message.type);
  
  if (message.type === 'COMPUTE_EMBEDDING') {
    console.log('🔹 [background] Processing embedding request for:', message.text?.substring(0, 50) + '...');
    handleEmbedding(message.text)
      .then(embedding => {
        console.log('✅ [background] Embedding computed, length:', embedding?.length);
        sendResponse({ success: true, embedding });
      })
      .catch(error => {
        console.error('❌ [background] Embedding error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'SAVE_JOB') {
    // Your existing SAVE_JOB logic here
    console.log('📥 [background] Received SAVE_JOB:', message.jobData);
    
    // Example: Save to your backend
    fetch('http://localhost:5050/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(message.jobData)
    })
    .then(response => response.json())
    .then(result => {
      console.log('✅ Job saved:', result);
      sendResponse({ success: true, result });
    })
    .catch(error => {
      console.error('❌ Save job error:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
});

// Clean up offscreen document when extension is disabled/reloaded
chrome.runtime.onSuspend.addListener(() => {
  if (offscreenDocumentId) {
    chrome.offscreen.closeDocument();
  }
});