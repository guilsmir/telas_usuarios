// src/App.tsx
import React, { useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "bootstrap-icons/font/bootstrap-icons.css"; 
import "./App.css";

import Calendario from "./Componentes/Calendario";
import ModalReserva, { type ReservationData, type Person, type Room } from "./Componentes/ModalReserva";
import SidebarFilters from "./Componentes/SidebarFilters";

function CalendarDashboard() {
  const [show, setShow] = useState(false);
  const [lastReservation, setLastReservation] = useState<ReservationData | null>(null);

  // These two states are used to instruct Calendario to update or delete an event
  const [updatedEvent, setUpdatedEvent] = useState<any | null>(null);
  const [deletedEventId, setDeletedEventId] = useState<string | null>(null);

  // When an event is clicked in Calendario we receive a Reservation-like payload (may be partial).
  // We open the modal with that payload as initial data so the user can edit/delete.
  const handleEventClick = useCallback((reservationWithId?: ReservationData & { id?: string } | null) => {
    if (!reservationWithId) return;
    setLastReservation(reservationWithId);
    setShow(true);
  }, []);

  // Called when ModalReserva is submitted (create or update).
  // We treat presence of an id as an update; otherwise it's a create (for which we just log here).
  const handleReservationSubmit = (data: ReservationData & { id?: string } | null) => {
    console.log("Dados de Reserva Submetidos:", data);

    if (!data) {
      setShow(false);
      return;
    }

    if (data.id) {
      // Update path: inform Calendario to update the event with new values.
      // updatedEvent object should match FullCalendar event fields (id, title, start, end, extendedProps)
      const maybeFirstSchedule = data.schedules && data.schedules.length > 0 ? data.schedules[0] : null;
      const updated = {
        id: data.id,
        title: data.nome || (maybeFirstSchedule ? maybeFirstSchedule.roomName : "Reserva"),
        start: maybeFirstSchedule ? `${maybeFirstSchedule.data}T${maybeFirstSchedule.horaInicio}` : undefined,
        end: maybeFirstSchedule ? `${maybeFirstSchedule.data}T${maybeFirstSchedule.horaFim}` : undefined,
        // keep other useful info in extendedProps so it can be used later when editing again
        extendedProps: {
          reservation: data,
        },
      };
      setUpdatedEvent(updated);
      // clear lastReservation and close modal
      setLastReservation(null);
      setShow(false);
      // after passing updatedEvent prop, Calendario will apply it and we clear the state
      // (Calendario will pick it up via prop)
      setTimeout(() => setUpdatedEvent(null), 100); // small timeout to allow Calendario effect to run
    } else {
      // Create path: you likely want to add it to the calendar.
      // This project originally logs creates — keep that behavior but show how a created event could be applied.
      // We'll close modal and log the data. Integration to actually append an event to the calendar
      // can be easily added by using a similar pattern: maintain a list of events in App and pass them to Calendario.
      console.log("Criar nova reserva (implemente inclusão no calendário se desejar):", data);
      setLastReservation(null);
      setShow(false);
    }
  };

  // Called by ModalReserva when user confirms deletion of an event
  const handleReservationDelete = (id?: string) => {
    if (!id) {
      setShow(false);
      return;
    }
    setDeletedEventId(id);
    setLastReservation(null);
    setShow(false);
    // clear after giving Calendario a moment to remove it
    setTimeout(() => setDeletedEventId(null), 100);
  };

  // Mock people and rooms — keep original project values or replace with your real data
  const mockPeople: Person[] = [
  { "id": "p1", "name": "Ana Silva", "email": "ana.silva@empresa.com.br", "grade": "Professora" },
  { "id": "p2", "name": "João Pereira", "email": "joao.pereira@empresa.com.br", "grade": "Aluno" },
  { "id": "p3", "name": "Carlos Souza", "email": "carlos.souza@empresa.com.br", "grade": "Professor" },
  { "id": "p4", "name": "Mariana Oliveira", "email": "mariana.oliveira@empresa.com.br", "grade": "Aluna" },
  { "id": "p5", "name": "Ricardo Santos", "email": "ricardo.santos@empresa.com.br", "grade": "Professor" },
  { "id": "p6", "name": "Camila Costa", "email": "camila.costa@empresa.com.br", "grade": "Aluna" },
  { "id": "p7", "name": "Felipe Mendes", "email": "felipe.mendes@empresa.com.br", "grade": "Professor" },
  { "id": "p8", "name": "Larissa Rocha", "email": "larissa.rocha@empresa.com.br", "grade": "Aluna" },
  { "id": "p9", "name": "Gustavo Almeida", "email": "gustavo.almeida@empresa.com.br", "grade": "Professor" },
  { "id": "p10", "name": "Beatriz Lima", "email": "beatriz.lima@empresa.com.br", "grade": "Professora" },
  { "id": "p11", "name": "Daniel Martins", "email": "daniel.martins@empresa.com.br", "grade": "Aluno" },
  { "id": "p12", "name": "Patrícia Gomes", "email": "patricia.gomes@empresa.com.br", "grade": "Aluna" },
  { "id": "p13", "name": "Eduardo Fernandes", "email": "eduardo.fernandes@empresa.com.br", "grade": "Professor" },
  { "id": "p14", "name": "Viviane Barbosa", "email": "viviane.barbosa@empresa.com.br", "grade": "Professora" },
  { "id": "p15", "name": "André Carvalho", "email": "andre.carvalho@empresa.com.br", "grade": "Aluno" },
  { "id": "p16", "name": "Juliana Dias", "email": "juliana.dias@empresa.com.br", "grade": "Aluna" },
  { "id": "p17", "name": "Roberto Ferreira", "email": "roberto.ferreira@empresa.com.br", "grade": "Professor" },
  { "id": "p18", "name": "Isabela Pires", "email": "isabela.pires@empresa.com.br", "grade": "Professora" },
  { "id": "p19", "name": "Lucas Nogueira", "email": "lucas.nogueira@empresa.com.br", "grade": "Aluno" },
  { "id": "p20", "name": "Amanda Ribeiro", "email": "amanda.ribeiro@empresa.com.br", "grade": "Aluna" },
  { "id": "p21", "name": "Thiago Borges", "email": "thiago.borges@empresa.com.br", "grade": "Professor" },
  { "id": "p22", "name": "Renata Cunha", "email": "renata.cunha@empresa.com.br", "grade": "Professora" },
  { "id": "p23", "name": "Marcelo Viana", "email": "marcelo.viana@empresa.com.br", "grade": "Aluno" },
  { "id": "p24", "name": "Sofia Moraes", "email": "sofia.moraes@empresa.com.br", "grade": "Aluna" },
  { "id": "p25", "name": "Paulo Castro", "email": "paulo.castro@empresa.com.br", "grade": "Professor" },
  { "id": "p26", "name": "Érica Vaz", "email": "erica.vaz@empresa.com.br", "grade": "Professora" },
  { "id": "p27", "name": "Guilherme Rosa", "email": "guilherme.rosa@empresa.com.br", "grade": "Aluno" },
  { "id": "p28", "name": "Helena Torres", "email": "helena.torres@empresa.com.br", "grade": "Aluna" },
  { "id": "p29", "name": "Vinícius Melo", "email": "vinicius.melo@empresa.com.br", "grade": "Professor" },
  { "id": "p30", "name": "Clara Neves", "email": "clara.neves@empresa.com.br", "grade": "Professora" }
]

  const rooms: Room[] = [
    { id: "r1", name: "Sala 101" },
    { id: "r2", name: "Auditório" },
  ];

  // Sidebar selection state (kept minimal to preserve original design)
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const handleSelectionChange = (peopleIds: string[], roomIds: string[]) => {
    setSelectedPeople(peopleIds);
    setSelectedRooms(roomIds);
  };

  return (
    <>
      <ModalReserva
        show={show}
        onClose={() => { setShow(false); setLastReservation(null); }}
        onSubmit={handleReservationSubmit}
        onDelete={handleReservationDelete}
        people={mockPeople}
        rooms={rooms}
        initialData={lastReservation ?? undefined}
      />

      {/* full viewport height container */}
      <div className="container-fluid vh-100">
        <div className="row h-100">
          {/* Sidebar */}
          <div className="col-12 col-md-4 col-lg-3 border-end p-0">
            <SidebarFilters
              people={mockPeople}
              rooms={rooms}
              onSelectionChange={handleSelectionChange}
              maxHeight="calc(100vh - 0px)"
            />
          </div>

          {/* Main area (calendar) */}
          <main className="col p-3 d-flex flex-column">
            <div className="flex-grow-1" style={{ minHeight: 0 }}>
              <Calendario
                onCreate={() => setShow(true)}
                selectedPeople={selectedPeople}
                selectedRooms={selectedRooms}
                onEventClick={handleEventClick}
                // pass down requested update/delete to the calendar so it applies the change visually
                updatedEvent={updatedEvent}
                deletedEventId={deletedEventId}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default CalendarDashboard;
