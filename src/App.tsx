import React, { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css"; 
import "./Auth.css"; 

import LoginPage from "./Componentes/LoginPage";
import RegisterPage from "./Componentes/RegisterPage";
import CalendarDashboard from "./CalendarDashboard"; 

type Page = "login" | "register";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentPage, setCurrentPage] = useState<Page>("login");

  const handleLoginSuccess = () => {
    setIsAuthenticated(true); 
  };

  const handleGoToRegister = () => {
    setCurrentPage("register"); 
  };

  const handleGoToLogin = () => {
    setCurrentPage("login"); 
  };

  if (isAuthenticated) {
    return <CalendarDashboard />;
  }

  if (currentPage === "login") {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={handleGoToRegister}
      />
    );
  }

  if (currentPage === "register") {
    return <RegisterPage onGoToLogin={handleGoToLogin} />;
  }

  return <div>Erro de navegação</div>;
}

export default App;