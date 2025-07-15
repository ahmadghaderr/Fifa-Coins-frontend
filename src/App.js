import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from "./welcomePage/welcomePage"; 
import LoginSignup from './Login/Login';
import './App.css';
import CalculateHome from './CalculateHome/CalculateHome';
import History from './History/History';
import Admin from './Admin/Admin';
import Navbar from './Navbar/Navbar';
import Chatbot from './Chatbot/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} /> 
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/Navbar" element={<Navbar />} /> 
        <Route path="/CalculateHome" element={<CalculateHome />} />
        <Route path="/History" element={<History />} />
        <Route  path="/Admin" element={<Admin />} />
        <Route  path="/Chatbot" element={<Chatbot />} />

      </Routes>
    </Router>
  );
}

export default App;
