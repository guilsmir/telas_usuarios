// src/App.tsx
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
  //  Mantém login salvo no navegador
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLogged") === "true"
  );

  //  Primeira tela deve ser o REGISTRO
  const [currentPage, setCurrentPage] = useState<"login" | "register">(
    "register"
  );

  // ===================================================================
  //  DADOS MOCKADOS
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

  // Menu lateral
  const adminMenuItems: MenuLink[] = [
    { path: "/", label: "Calendário", icon: "bi-calendar-date" },
    { path: "/solicitacoes", label: "Solicitações", icon: "bi-inbox" },
    { path: "/usuarios", label: "Usuários", icon: "bi-people" },
    {
      path: "/auditoria",
      label: "Registros de Auditoria",
      icon: "bi-journal-check",
    },
  ];

  // ===================================================================
  //  FLUXO DE AUTENTICAÇÃO
  // ===================================================================
  if (!isAuthenticated) {
    // Tela de LOGIN
    if (currentPage === "login") {
      return (
        <LoginPage
          onLoginSuccess={() => {
            localStorage.setItem("isLogged", "true"); // salva login
            setIsAuthenticated(true); // entra no sistema
          }}
          onGoToRegister={() => setCurrentPage("register")}
        />
      );
    }

    // Tela de REGISTRO
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
  //  USUÁRIO LOGADO → ACESSA ROTAS DO SISTEMA
  // ===================================================================
  return (
    <Router>
      <Routes>
        <Route element={<SidebarLayout menuItems={adminMenuItems} />}>
          <Route
            path="/"
            element={<CalendarioPage people={mockPeople} rooms={rooms} />}
          />
          <Route path="/solicitacoes" element={<SolicitacoesPage />} />
          <Route path="/auditoria" element={<AuditPage />} />

          <Route
            path="/usuarios"
            element={
              <div className="p-4">
                <h3 className="text-secondary">
                  Gerência de Usuários (Em Breve)
                </h3>
                <p className="text-muted">
                  Esta tela será implementada futuramente.
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
