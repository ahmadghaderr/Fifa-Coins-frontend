import React from 'react';
import { useNavigate } from 'react-router-dom';
import './welcomePage.css';

function WelcomePage() {
  const navigate = useNavigate();
  const [showChatbot, setShowChatbot] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([
    { from: "bot", text: "Hi there! I'm your FC25 assistant. How can I help you today?" }
  ]);
  const [loading, setLoading] = React.useState(false);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const startNewChat = () => {
    setMessages([{ from: "bot", text: "Hi there! I'm your FC25 assistant. How can I help you today?" }]);
    setInput("");
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { from: "user", text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://fifa-coins-backend.onrender.com/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      const data = await response.json();
      const botMessage = {
        from: "bot",
        text: data.reply || "Sorry, I didn't understand that.",
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "Unable to reach the server. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-text">
        <h1>Welcome to FC25!</h1>
        <p>Your smart FC25 assistant — 
          here to help you calculate profits, answer your questions, and guide you through the features we support.</p>
        <button className="login-button" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
      
      <button className="chatbot-toggle-button" onClick={toggleChatbot}>
        {showChatbot ? '✕' : '💬'}
      </button>

      {showChatbot && (
        <div className="chatbot-container welcome-chatbot">
          <div className="chat-header">
            FC25 Assistant
            <button className="new-chat-button" onClick={startNewChat}>
              New Chat
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.from === "user" ? "user-message" : "bot-message"}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="typing-indicator">Typing...</div>}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about FC25..."
              disabled={loading}
            />
            <button
              className="send-button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
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
