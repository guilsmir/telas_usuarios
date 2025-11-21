import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import "./Auth.css";
import LoginPage from "./Pages/LoginPage";
import SalasPage from "./Pages/SalasPage";
import SettingsPage from "./Pages/SettingsPage";
import UsuariosPage from "./Pages/UsuariosPage";
import CalendarioPage from "./Pages/CalendarioPage";
import SidebarLayout from "./Componentes/SidebarLayout";
import { api } from "./services/api"; 
import type { MenuLink, Person, Room } from "./Types/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLogged") === "true"
  );
  const [people, setPeople] = useState<Person[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGlobalData();
    }
  }, [isAuthenticated]);

  const fetchGlobalData = async () => {
    try {
      const [usersData, roomsData] = await Promise.all([
        api.getUsers(),
        api.getRooms()
      ]);
      
      setPeople(usersData);
      setRoomsList(roomsData);

    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      if (String(error).includes("401")) handleLogout();
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} onGoToRegister={()=>{}} />;
  }

  const adminMenuItems: MenuLink[] = [
    { path: "/", label: "Calendário", icon: "bi-calendar-date" },
    { path: "/usuarios", label: "Usuários", icon: "bi-people" },
    { path: "/salas", label: "Salas", icon: "bi-door-open" },
    { path: "/configuracoes", label: "Configurações", icon: "bi-gear" },
  ];

  return (
    <Router>
      <Routes>
        <Route element={<SidebarLayout menuItems={adminMenuItems} />}>
          <Route path="/" element={<CalendarioPage people={people} rooms={roomsList} />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/salas" element={<SalasPage />} />
          <Route path="/configuracoes" element={<SettingsPage onLogout={handleLogout} />} />
        </Route>
      </Routes>
    </Router>
  );
}