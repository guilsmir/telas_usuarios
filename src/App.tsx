import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import "./Auth.css";

// Login / Registro
import LoginPage from "./Componentes/LoginPage";
import RegisterPage from "./Componentes/RegisterPage";

// COMPONENTES DO SISTEMA
import Calendario from "./Componentes/Calendario";
import ModalReserva, {
  type ReservationData,
  type Person,
  type Room,
} from "./Componentes/ModalReserva";
import SidebarFilters from "./Componentes/SidebarFilters";

import AuditPage from "./Componentes/AuditPage";
import SolicitacoesPage from "./Componentes/SolicitacoesPage";
import SidebarLayout from "./Componentes/SidebarLayout";

import { type MenuLink } from "./types/api";

// [MERGE] Import vindo do GitHub (Nova tela de Usuários)
import UsuariosPage from "./Componentes/UsuariosPage";

// [MERGE] Import vindo da sua versão Local (Tela de Configurações)
import SettingsPage from "./Componentes/SettingsPage";

// ===================================================================
//  COMPONENTE: Calendário com filtros (rota "/")
// ===================================================================
function CalendarioPage({
  people,
  rooms,
}: {
  people: Person[];
  rooms: Room[];
}) {
  const [show, setShow] = useState(false);
  const [lastReservation, setLastReservation] =
    useState<ReservationData | null>(null);

  const [updatedEvent, setUpdatedEvent] = useState<any | null>(null);
  const [deletedEventId, setDeletedEventId] = useState<string | null>(null);

  const handleEventClick = useCallback(
    (reservationWithId?: (ReservationData & { id?: string }) | null) => {
      if (!reservationWithId) return;
      setLastReservation(reservationWithId);
      setShow(true);
    },
    []
  );

  const handleReservationSubmit = (
    data: (ReservationData & { id?: string }) | null
  ) => {
    if (!data) {
      setShow(false);
      return;
    }

    const sched = data.schedules?.[0];

    if (data.id) {
      const updated = {
        id: data.id,
        title: data.nome || sched?.roomName || "Reserva",
        start: sched ? `${sched.data}T${sched.horaInicio}` : undefined,
        end: sched ? `${sched.data}T${sched.horaFim}` : undefined,
        extendedProps: { reservation: data },
      };

      setUpdatedEvent(updated);
      setLastReservation(null);
      setShow(false);

      setTimeout(() => setUpdatedEvent(null), 150);
    } else {
      console.log("Criando nova reserva:", data);
      setLastReservation(null);
      setShow(false);
    }
  };

  const handleReservationDelete = (id?: string) => {
    if (!id) return;
    setDeletedEventId(id);
    setLastReservation(null);
    setShow(false);
    setTimeout(() => setDeletedEventId(null), 150);
  };

  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const handleSelectionChange = (p: string[], r: string[]) => {
    setSelectedPeople(p);
    setSelectedRooms(r);
  };

  return (
    <div className="d-flex h-100">
      <ModalReserva
        show={show}
        onClose={() => {
          setShow(false);
          setLastReservation(null);
        }}
        onSubmit={handleReservationSubmit}
        onDelete={handleReservationDelete}
        people={people}
        rooms={rooms}
        initialData={lastReservation ?? undefined}
      />

      {/* SIDEBAR */}
      <div className="col-12 col-md-4 col-lg-3 border-end p-0">
        <SidebarFilters
          people={people}
          rooms={rooms}
          onSelectionChange={handleSelectionChange}
          maxHeight="100%"
        />
      </div>

      {/* CALENDÁRIO */}
      <main className="col p-3 d-flex flex-column flex-grow-1">
        <div className="flex-grow-1" style={{ minHeight: 0 }}>
          <Calendario
            onCreate={() => setShow(true)}
            selectedPeople={selectedPeople}
            selectedRooms={selectedRooms}
            onEventClick={handleEventClick}
            updatedEvent={updatedEvent}
            deletedEventId={deletedEventId}
          />
        </div>
      </main>
    </div>
  );
}

// ===================================================================
//  APP PRINCIPAL + LOGIN + ROTAS DO SISTEMA
// ===================================================================
export default function App() {
  // Mantém login salvo no navegador
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLogged") === "true"
  );

  // [CORREÇÃO] Primeira tela deve ser o LOGIN (não registro) quando deslogado
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login");

  // ===================================================================
  //  DADOS MOCKADOS (Unificados)
  // ===================================================================
  const mockPeople: Person[] = [
    {
      id: "p1",
      name: "Ana Silva",
      email: "ana@empresa.com",
      grade: "Professora",
    },
    {
      id: "p2",
      name: "João Pereira",
      email: "joao@empresa.com",
      grade: "Aluno",
    },
    {
      id: "p3",
      name: "Carlos Souza",
      email: "carlos@empresa.com",
      grade: "Professor",
    },
  ];

  const rooms: Room[] = [
    { id: "r1", name: "Sala 101" },
    { id: "r2", name: "Auditório" },
  ];

  // ===================================================================
  //  MENU LATERAL (Unificado: Itens Padrão + Usuários + Configurações)
  // ===================================================================
  const adminMenuItems: MenuLink[] = [
    { path: "/", label: "Calendário", icon: "bi-calendar-date" },
    { path: "/solicitacoes", label: "Solicitações", icon: "bi-inbox" },
    // Item vindo do GitHub
    { path: "/usuarios", label: "Usuários", icon: "bi-people" },
    {
      path: "/auditoria",
      label: "Registros de Auditoria",
      icon: "bi-journal-check",
    },
    // Item vindo da sua versão Local
    {
      path: "/configuracoes",
      label: "Configurações",
      icon: "bi-gear",
    },
  ];

  // ===================================================================
  //  LÓGICA DE LOGOUT (Da sua versão Local)
  // ===================================================================
  const handleLogout = () => {
    localStorage.removeItem("isLogged");
    setIsAuthenticated(false);
    // Retorna para login automaticamente devido à mudança de estado
  };

  // ===================================================================
  //  FLUXO DE AUTENTICAÇÃO (Login / Registro)
  // ===================================================================
  if (!isAuthenticated) {
    if (currentPage === "login") {
      return (
        <LoginPage
          onLoginSuccess={() => {
            localStorage.setItem("isLogged", "true");
            setIsAuthenticated(true);
          }}
          onGoToRegister={() => setCurrentPage("register")}
        />
      );
    }

    if (currentPage === "register") {
      return (
        <RegisterPage
          onGoToLogin={() => {
            setCurrentPage("login");
          }}
        />
      );
    }
  }

  // ===================================================================
  //  USUÁRIO LOGADO -> ROTAS DO SISTEMA
  // ===================================================================
  return (
    <Router>
      <Routes>
        {/* Layout com Sidebar contendo o menu unificado */}
        <Route element={<SidebarLayout menuItems={adminMenuItems} />}>
          {/* Rota Principal: Calendário */}
          <Route
            path="/"
            element={<CalendarioPage people={mockPeople} rooms={rooms} />}
          />

          {/* Rota de Solicitações */}
          <Route path="/solicitacoes" element={<SolicitacoesPage />} />

          {/* Rota de Auditoria */}
          <Route path="/auditoria" element={<AuditPage />} />

          {/* [MERGE] Rota de Usuários (Vinda do GitHub) */}
          <Route path="/usuarios" element={<UsuariosPage />} />

          {/* [MERGE] Rota de Configurações (Sua versão Local) */}
          <Route
            path="/configuracoes"
            element={<SettingsPage onLogout={handleLogout} />}
          />
        </Route>
      </Routes>
    </Router>
  );
}
