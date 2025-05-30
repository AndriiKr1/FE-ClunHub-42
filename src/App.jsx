import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './components/WelcomePage/WelcomePage';
import RegisterPage from './components/Registration/RegisterPage';
import LoginPage from './components/Login/LoginPage';
import ForgotPasswordPage from './components/ForgotPassword/ForgotPasswordPage';
import Dashboard from './components/Dashboard/Dashboard';
import AddTask from './components/AddTask/AddTask';
import Calendar from './components/Calendar/Calendar';
import CompletedTasks from './components/CompletedTasks/CompletedTasks';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addtask" element={<AddTask />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/completed" element={<CompletedTasks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
