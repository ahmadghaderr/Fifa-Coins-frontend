import React, { useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import "./Chatbot.css";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! What can I help you with?" },
  ]);
  const [loading, setLoading] = useState(false);

  const startNewChat = () => {
    setMessages([{ from: "bot", text: "Hi! What can I help you with?" }]);
    setInput("");
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage = { from: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("https://fifa-coins-backend.onrender.com/api/chatbot", {
        message: trimmedInput,
      });

      const botMessage = {
        from: "bot",
        text: response.data.reply || "Sorry, I didn't understand that.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages((prev) => [
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
    <>
      <Navbar />
      <div className="chatbot-page">
        <div className="chatbot-container">
          <div className="chat-header">
            Chat Assistant
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
              placeholder="Type your message..."
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
      </div>
    </>
  );
}
