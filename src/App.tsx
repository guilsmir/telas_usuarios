// src/App.tsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // remova se já importar em main.tsx
import "bootstrap-icons/font/bootstrap-icons.css"; // ícones bootstrap (bi)
import "./App.css";

import Calendario from "./Componentes/Calendario";
import ModalReserva from "./Componentes/ModalReserva";
import type { ReservationData } from "./Componentes/ModalReserva";
import SidebarFilters from "./Componentes/SidebarFilters";
import type { Person, Room } from "./Componentes/SidebarFilters";

function App() {
  const [show, setShow] = useState(false);

  const handleSubmit = (data: ReservationData) => {
    console.log("Reserva criada:", data);
  };

  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const handleSelectionChange = (people: string[], rooms: string[]) => {
    setSelectedPeople(people);
    setSelectedRooms(rooms);
    console.log("Selected filters:", { people, rooms });
    // Aqui você pode chamar a lógica que filtra o FullCalendar por pessoas/salas
  };

  // Exemplo de dados (substitua pelo fetch / props reais)
  const people: Person[] = [
    { id: "p1", name: "Ana Silva", grade: "3ª série", avatar: "https://i.pravatar.cc/40?img=32" },
    { id: "p2", name: "Bruno Pereira", grade: "2ª série", avatar: "https://i.pravatar.cc/40?img=5" },
    { id: "p3", name: "Carla Melo", grade: "1º ano kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", avatar: "https://i.pravatar.cc/40?img=12" },
    { id: "p4", name: "Diego Rodrigues", grade: "3º ano", avatar: "https://i.pravatar.cc/40?img=7" },
  ];

  const rooms: Room[] = [
    { id: "r1", name: "Laboratório de Informática" },
    { id: "r2", name: "Sala 101" },
    { id: "r3", name: "Auditório Principal" },
    { id: "r4", name: "Laboratório de Ciências" },
  ];

  return (
    <>
      <ModalReserva show={show} onClose={() => setShow(false)} onSubmit={handleSubmit} />

      {/* full viewport height container */}
      <div className="container-fluid vh-100">
        <div className="row h-100">
          {/* Sidebar */}
          <div className="col-12 col-md-4 col-lg-3 border-end p-0">
            <SidebarFilters
              people={people}
              rooms={rooms}
              onSelectionChange={handleSelectionChange}
              // opcional: SidebarFilters pode aplicar esse valor como style
              maxHeight="calc(100vh - 0px)"
            />
          </div>

          {/* Main area (calendar) */}
          {/* Use flex column so we can let the inner wrapper grow and allow FullCalendar to size to 100% */}
          <main className="col p-3 d-flex flex-column">
            {/* 
              Important: set minHeight: 0 on the flex child so overflow works correctly
              (prevents children from overflowing the flex container on some browsers).
            */}
            <div className="flex-grow-1" style={{ minHeight: 0 }}>
              {/* Pass props if needed. Calendario must render with height: 100% */}
              <Calendario
                onCreate={() => setShow(true)}
                selectedPeople={selectedPeople}
                selectedRooms={selectedRooms}
                // If Calendario expects styles/props add them here
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
