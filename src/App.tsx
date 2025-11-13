// src/App.tsx
import React, { useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "bootstrap-icons/font/bootstrap-icons.css"; 
import "./App.css";

import Calendario from "./Componentes/Calendario";
import ModalReserva, { type ReservationData, type Person, type Room } from "./Componentes/ModalReserva";
import SidebarFilters from "./Componentes/SidebarFilters";

function App() {
  const [show, setShow] = useState(false);
  const [lastReservation, setLastReservation] = useState<ReservationData | null>(null);

  const handleReservationSubmit = (data: ReservationData) => {
    console.log("Dados de Reserva Submetidos:", data);
    setLastReservation(data);
    alert('Reserva submetida com sucesso! (Verifique o console para os dados completos)');
  };

  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  // CORREÇÃO: Estabilizar a função com useCallback
  const handleSelectionChange = useCallback((people: string[], rooms: string[]) => {
    setSelectedPeople(people);
    setSelectedRooms(rooms);
    console.log("Selected filters:", { people, rooms });
  }, []); 

  // Exemplo de dados (substitua pelo fetch / props reais)
  const mockPeople: Person[] = [
  { id: 'p1', name: 'Ana Silva', email: 'ana.silva@empresa.com.br', grade: 'Gerente' },
  { id: 'p2', name: 'Bruno Costa', email: 'bruno.costa@empresa.com.br', grade: 'Analista Sênior' },
  { id: 'p3', name: 'Carla Dias', email: 'carla.dias@empresa.com.br', grade: 'Estagiária' },
  { id: 'p4', name: 'Felipe Rocha', email: 'felipe.rocha@empresa.com.br', grade: 'Diretor' },
  { id: 'p5', name: 'Juliana Martins', email: 'juliana.martins@empresa.com.br', grade: 'Coordenadora' },
  { id: 'p6', name: 'Ricardo Lima', email: 'ricardo.lima@empresa.com.br', grade: 'Analista Pleno' },
  { id: 'p7', name: 'Mariana Ferreira', email: 'mariana.ferreira@empresa.com.br', grade: 'Gerente de Projetos' },
  { id: 'p8', name: 'Lucas Almeida', email: 'lucas.almeida@empresa.com.br', grade: 'Analista Júnior' },
  { id: 'p9', name: 'Paula Barbosa', email: 'paula.barbosa@empresa.com.br', grade: 'Supervisora' },
  { id: 'p10', name: 'Gustavo Nunes', email: 'gustavo.nunes@empresa.com.br', grade: 'Diretor de Operações' },
  { id: 'p11', name: 'Fernanda Oliveira', email: 'fernanda.oliveira@empresa.com.br', grade: 'Analista de RH' },
  { id: 'p12', name: 'Rafael Santos', email: 'rafael.santos@empresa.com.br', grade: 'Coordenador Técnico' },
  { id: 'p13', name: 'Beatriz Mendes', email: 'beatriz.mendes@empresa.com.br', grade: 'Gerente de Marketing' },
  { id: 'p14', name: 'Thiago Ribeiro', email: 'thiago.ribeiro@empresa.com.br', grade: 'Estagiário' },
  { id: 'p15', name: 'Camila Lopes', email: 'camila.lopes@empresa.com.br', grade: 'Supervisora de Vendas' },
  { id: 'p16', name: 'Eduardo Pereira', email: 'eduardo.pereira@empresa.com.br', grade: 'Analista de Sistemas' },
  { id: 'p17', name: 'Sofia Carvalho', email: 'sofia.carvalho@empresa.com.br', grade: 'Assistente Administrativa' },
  { id: 'p18', name: 'João Figueiredo', email: 'joao.figueiredo@empresa.com.br', grade: 'Gerente de TI' },
  { id: 'p19', name: 'Patrícia Azevedo', email: 'patricia.azevedo@empresa.com.br', grade: 'Coordenadora de Projetos' },
  { id: 'p20', name: 'André Gonçalves', email: 'andre.goncalves@empresa.com.br', grade: 'Diretor Financeiro' }
]

  const rooms: Room[] = [
    { id: "r1", name: "Laboratório de Informática" },
    { id: "r2", name: "Sala 101" },
    { id: "r3", name: "Auditório Principal" },
    { id: "r4", name: "Laboratório de Ciências" },
  ];

  return (
    <>
      <ModalReserva
        show={show}
        onClose={() => setShow(false)}
        onSubmit={handleReservationSubmit}
        people={mockPeople}
        rooms={rooms}
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
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;