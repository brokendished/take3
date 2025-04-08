import React, { useState } from 'react';
import './ChatbotChat.css';

function ChatbotChat() {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hey! What’s going on at your place today?' }]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      let botReply = "Cool! Got it.";

      if (step === 0) {
        botReply = "Could you upload a photo of the issue?";
        setStep(1);
      } else if (step === 1) {
        botReply = "Thanks! What's your name?";
        setStep(2);
      } else if (step === 2) {
        botReply = "And your email?";
        setStep(3);
        setForm(prev => ({ ...prev, name: input }));
      } else if (step === 3) {
        botReply = "Awesome – we’ll send a quote shortly!";
        setForm(prev => ({ ...prev, email: input }));
      }

      setMessages(prev => [...prev, { from: 'bot', text: botReply }]);
    }, 600);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setMessages(prev => [...prev, { from: 'user', text: '[Photo uploaded]' }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: "Thanks! What's your name?" }]);
      setStep(2);
    }, 600);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from}`}>{msg.text}</div>
        ))}
        {image && <img src={image} alt="upload preview" className="preview" />}
      </div>
      {step === 1 ? (
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      ) : (
        <div className="input-area">
          <input
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
      <footer className="footer">
        <a href="#">Contact</a> · <a href="#">Terms</a> · <a href="#">About</a>
      </footer>
    </div>
  );
}

export default ChatbotChat;