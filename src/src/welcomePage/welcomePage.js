import React from 'react';
import { useNavigate } from 'react-router-dom';
import './welcomePage.css';

function WelcomePage() {
  const navigate = useNavigate();
  const [showWelcomeChatbot, setShowWelcomeChatbot] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([
    { from: "bot", text: "Hi there! I'm your FC25 assistant. How can I help you today?" }
  ]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    document.body.classList.add('welcome-page');
    return () => {
      document.body.classList.remove('welcome-page');
    };
  }, []);

  const toggleWelcomeChatbot = () => {
    setShowWelcomeChatbot(!showWelcomeChatbot);
  };

  const startNewWelcomeChat = () => {
    setMessages([{ from: "bot", text: "Hi there! I'm your FC25 assistant. How can I help you today?" }]);
    setInput("");
  };

  const sendWelcomeMessage = async () => {
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
      sendWelcomeMessage();
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-text">
        <h1>Welcome to FC25!</h1>
        <p>Your smart FC25 assistant, 
          here to help you calculate profits, answer your questions, and guide you through the features we support.</p>
        <button className="login-button" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
      
      <button className="chatbot-toggle-button" onClick={toggleWelcomeChatbot}>
        {showWelcomeChatbot ? '✕' : '💬'}
      </button>

      {showWelcomeChatbot && (
        <div className="welcome-chatbot-container welcome-chatbot">
          <div className="welcome-chat-header">
            FC25 Assistant
            <button className="welcome-new-chat-button" onClick={startNewWelcomeChat}>
              New Chat
            </button>
          </div>

          <div className="welcome-chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`welcome-message ${msg.from === "user" ? "welcome-user-message" : "welcome-bot-message"}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="welcome-typing-indicator">Typing...</div>}
          </div>

          <div className="welcome-chat-input-container">
            <input
              type="text"
              className="welcome-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about FC25..."
              disabled={loading}
            />
            <button
              className="welcome-send-button"
              onClick={sendWelcomeMessage}
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
