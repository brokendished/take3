import React, { useState } from 'react';
import './ChatbotChat.css';

function ChatbotChat() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hey! How can we help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', issue: '' });

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { from: 'user', text: input }]);

    if (step === 0) {
      setForm(prev => ({ ...prev, issue: input }));
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Got it! What’s your name?' }
      ]);
      setStep(1);
    } else if (step === 1) {
      setForm(prev => ({ ...prev, name: input }));
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Thanks! And your email?' }
      ]);
      setStep(2);
    } else if (step === 2) {
      setForm(prev => ({ ...prev, email: input }));
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Give me a sec to look into that…' }
      ]);
      setStep(3);
      setLoading(true);

      try {
        const res = await fetch('/api/aiQuote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: input,
            issue: form.issue,
            image,
            message: `User issue: ${form.issue}. Name: ${form.name}, Email: ${input}. ${image ? 'They uploaded a photo.' : 'No photo uploaded.'}`
          })
        });

        const data = await res.json();
        const reply = data.reply || 'Hmm, I couldn’t figure that one out.';
        setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      } catch (err) {
        setMessages(prev => [...prev, { from: 'bot', text: 'Something went wrong. Try again later.' }]);
      } finally {
        setLoading(false);
      }
    }

    setInput('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
    setMessages(prev => [
      ...prev,
      { from: 'user', text: '[Photo uploaded]' },
      { from: 'bot', text: 'Got it! Thanks for the photo.' }
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>{msg.text}</div>
        ))}
        {image && <img src={image} alt="Uploaded" className="preview" />}
        {loading && <div className="message bot">...</div>}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          placeholder="Type your message..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="file"
          accept="image/*"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <label htmlFor="file-upload" className="upload-button" title="Upload a photo">📸</label>
        <button onClick={sendMessage}>Send</button>
      </div>

      <footer className="footer">
        <a href="#">Contact</a> · <a href="#">Terms</a> · <a href="#">About</a>
      </footer>
    </div>
  );
}

export default ChatbotChat;
