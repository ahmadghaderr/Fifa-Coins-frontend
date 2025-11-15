import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './welcomePage.css';


import heroImage from '../assets/ronaldoMarcelo.JPG';

function WelcomePage() {
  const navigate = useNavigate();
  const [showWelcomeChatbot, setShowWelcomeChatbot] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      from: "bot", 
      text: "Hi there! I'm your FC25 assistant. How can I help you today?" 
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('welcome-page');
    return () => {
      document.body.classList.remove('welcome-page');
    };
  }, []);

  const toggleWelcomeChatbot = useCallback(() => {
    setShowWelcomeChatbot(prev => !prev);
  }, []);

  const startNewWelcomeChat = useCallback(() => {
    setMessages([
      { 
        id: Date.now(), 
        from: "bot", 
        text: "Hi there! I'm your FC25 assistant. How can I help you today?" 
      }
    ]);
    setInput("");
  }, []);

  const sendWelcomeMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { 
      id: Date.now(), 
      from: "user", 
      text: trimmedInput 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://fifa-coins-backend.onrender.com/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { 
        id: Date.now() + 1, 
        from: "bot", 
        text: data.reply || "Sorry, I didn't understand that." 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          from: "bot", 
          text: "Unable to reach the server. Try again later." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !loading && input.trim()) {
      sendWelcomeMessage();
    }
  }, [input, loading, sendWelcomeMessage]);

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <img 
          src={heroImage} 
          alt="Ronaldo and Marcelo celebrating" 
          className="welcome-hero-image" 
        />
        
        <div className="welcome-text-content">
          <h1 className="welcome-title">Welcome TO FC26!</h1>
          <p className="welcome-description">
            Your smart FC26 assistant, here to help you calculate profits, 
            answer questions, and guide you through features.
          </p>
          <button 
            className="welcome-login-button" 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>

      <button 
        className={`welcome-chatbot-toggle ${showWelcomeChatbot ? 'active' : ''}`} 
        onClick={toggleWelcomeChatbot}
        aria-label="Toggle chatbot"
      >
        {showWelcomeChatbot ? '✕' : '💬'}
      </button>

      {showWelcomeChatbot && (
        <div className="welcome-chatbot-container">
          <div className="welcome-chat-header">
            <span>FC25 Assistant</span>
            <button 
              className="welcome-new-chat-button" 
              onClick={startNewWelcomeChat}
              aria-label="Start new chat"
            >
              New Chat
            </button>
          </div>

          <div className="welcome-chat-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`welcome-message ${
                  msg.from === "user" 
                    ? "welcome-user-message" 
                    : "welcome-bot-message"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="welcome-typing-indicator">
                <span>Typing</span>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="welcome-chat-input-container">
            <input
              type="text"
              className="welcome-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about FC26..."
              disabled={loading}
            />
            <button 
              className="welcome-send-button" 
              onClick={sendWelcomeMessage} 
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomePage;