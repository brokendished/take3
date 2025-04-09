
import React, { useState } from 'react';
import './ChatbotChat.css';

function ChatbotChat() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hey! How can I help today?' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: ''
  });

  const categories = [
    "Plumbing", "Painting", "Car", "AC / HVAC", "Outdoor",
    "Electrical", "Handyman", "Windows & Doors", "Appliance Repair", "Other"
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { from: 'user', text: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');

    if (step === 0) {
      setMessages([...updatedMessages, {
        from: 'bot',
        text: 'Got it! What type of help do you need?',
        buttons: categories
      }]);
      setStep(0.5);
    } else if (step === 0.5) {
      // Shouldn’t happen — users should click a button here
    } else if (step === 1) {
      setForm(prev => ({ ...prev, name: input }));
      setMessages([...updatedMessages, { from: 'bot', text: 'Cool — and your email?' }]);
      setStep(2);
    } else if (step === 2) {
      const validEmail = input.includes('@') && input.includes('.');
      if (validEmail) {
        setForm(prev => ({ ...prev, email: input }));
        setStep(4);
        await handleAIResponse(updatedMessages, { ...form, email: input });
      } else {
        setMessages([...updatedMessages, { from: 'bot', text: 'No worries — can I grab your phone number instead?' }]);
        setStep(3);
      }
    } else if (step === 3) {
      const cleaned = input.replace(/\D/g, '');
      if (cleaned.length >= 7) {
        setForm(prev => ({ ...prev, phone: input }));
        setStep(4);
        await handleAIResponse(updatedMessages, { ...form, phone: input });
      } else {
        setMessages([...updatedMessages, {
          from: 'bot',
          text: 'Totally cool — I just need some way to reach you. Email or phone?'
        }]);
      }
    } else {
      await handleAIResponse(updatedMessages, form);
    }
  };

  const handleAIResponse = async (allMessages, formData) => {
    setLoading(true);
    setMessages([...allMessages, { from: 'bot', text: 'Let me think for a second...' }]);

    try {
      const res = await fetch('/api/aiQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image,
          messages: allMessages
        })
      });

      const data = await res.json();
      const reply = data.reply || 'Hmm, I couldn’t figure that one out.';
      setMessages(prev => [...prev, { from: 'bot', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { from: 'bot', text: 'Something went wrong. Try again later.' }]);
    } finally {
      setLoading(false);
    }
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

  const handleCategoryClick = (category) => {
    const msg = `Selected: ${category}`;
    setForm(prev => ({ ...prev, category }));
    const newMessages = [...messages, { from: 'user', text: msg }];
    setMessages([...newMessages, { from: 'bot', text: 'Thanks! What’s your name?' }]);
    setStep(1);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            {msg.text}
            {msg.buttons && (
              <div className="chat-button-container">
                {msg.buttons.map((btn, j) => (
                  <button key={j} className="chat-button" onClick={() => handleCategoryClick(btn)}>{btn}</button>
                ))}
              </div>
            )}
          </div>
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
    