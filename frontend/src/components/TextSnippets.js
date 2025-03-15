import React, { useState, useEffect } from 'react';
import './TextSnippets.css';
import { fetchSnippets, addSnippet, deleteSnippet } from '../services/api'; // Ensure correct path

function TextSnippets() {
  const [snippets, setSnippets] = useState([]);
  const [newSnippet, setNewSnippet] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(''); // State for the floating message

  useEffect(() => {
    // Fetch snippets on component mount
    const fetchData = async () => {
      const data = await fetchSnippets();
      setSnippets(data);
    };
    fetchData();
  }, []);

  const handleAddSnippet = async () => {
    if (newSnippet.trim() !== '') {
      const addedSnippet = await addSnippet(newSnippet.trim());
      if (addedSnippet) {
        setSnippets([...snippets, addedSnippet]);
        setNewSnippet('');
      }
    }
  };

  const handleDeleteSnippet = async (id) => {
    const success = await deleteSnippet(id);
    if (success) {
      setSnippets(snippets.filter((snippet) => snippet.id !== id));
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessage(`"${content}" copied to clipboard!`);
      setTimeout(() => setCopiedMessage(''), 2000); // Clear message after 2 seconds
    });
  };

  return (
    <div className="container">
      {/* Floating confirmation message */}
      {copiedMessage && <div className="floating-message">{copiedMessage}</div>}

      <div className="input-section">
        <input 
          type="text" 
          value={newSnippet} 
          onChange={(e) => setNewSnippet(e.target.value)} 
          placeholder="Enter Keyword Here" 
        />
        <button onClick={handleAddSnippet}>Add</button>
      </div>

      <div className="grid-container">
        {snippets.map((snippet) => (
          <div className="card" key={snippet.id}>
            <div
              className="keyword"
              onClick={() => copyToClipboard(snippet.content)}
              title="Click to copy"
              style={{ cursor: 'pointer' }}
            >
              {snippet.content}
            </div>
            <div className="buttons">
              <button className="delete-btn" onClick={() => handleDeleteSnippet(snippet.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TextSnippets;
