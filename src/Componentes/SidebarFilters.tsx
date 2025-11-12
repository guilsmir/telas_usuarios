import React, { useState, useMemo, useEffect } from "react";

// Tipos
export type Person = {
  id: string;
  name: string;
  grade: string; // série / turma
  avatar?: string; // url opcional
};

export type Room = {
  id: string;
  name: string;
};

export type SidebarFiltersProps = {
  people?: Person[];
  rooms?: Room[];
  /**
   * Callback chamado sempre que a seleção muda. Recebe arrays de ids selecionados.
   */
  onSelectionChange?: (selectedPeopleIds: string[], selectedRoomIds: string[]) => void;
  /**
   * Altura máxima do sidebar (ex.: 'calc(100vh - 120px)') — por padrão 540px.
   */
  maxHeight?: string;
};

// Componente
export default function SidebarFilters({
  people = [],
  rooms = [],
  onSelectionChange,
  maxHeight = "540px",
}: SidebarFiltersProps) {
  const [peopleQuery, setPeopleQuery] = useState("");
  const [roomsQuery, setRoomsQuery] = useState("");

  const [selectedPeople, setSelectedPeople] = useState<Record<string, boolean>>(() => ({}));
  const [selectedRooms, setSelectedRooms] = useState<Record<string, boolean>>(() => ({}));

  // Filtragens memoizadas
  const filteredPeople = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => p.name.toLowerCase().includes(q) || p.grade.toLowerCase().includes(q));
  }, [people, peopleQuery]);

  const filteredRooms = useMemo(() => {
    const q = roomsQuery.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => r.name.toLowerCase().includes(q));
  }, [rooms, roomsQuery]);

  // Efeito para notificar mudança de seleção automaticamente
  useEffect(() => {
    const peopleIds = Object.keys(selectedPeople).filter((id) => selectedPeople[id]);
    const roomIds = Object.keys(selectedRooms).filter((id) => selectedRooms[id]);
    onSelectionChange?.(peopleIds, roomIds);
  }, [selectedPeople, selectedRooms, onSelectionChange]);

  // Helpers
  const togglePerson = (id: string) => {
    setSelectedPeople((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRoom = (id: string) => {
    setSelectedRooms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearAll = () => {
    setSelectedPeople({});
    setSelectedRooms({});
    setPeopleQuery("");
    setRoomsQuery("");
  };

  return (
    <div className="p-3" style={{ maxHeight, overflow: "auto"}}>
      <div className="mb-3">
        <label className="form-label">Pessoas</label>
        <input className="form-control mb-2" placeholder="Buscar pessoas..." value={peopleQuery} onChange={(e) => setPeopleQuery(e.target.value)} />
        <div>
          {filteredPeople.map((p) => (
            <div key={p.id} className="form-check">
              <input className="form-check-input" type="checkbox" id={`person-${p.id}`} checked={!!selectedPeople[p.id]} onChange={() => togglePerson(p.id)} />
              <label className="form-check-label" htmlFor={`person-${p.id}`}>
                {p.name} <small className="text-muted">({p.grade})</small>
              </label>
            </div>
          ))}
          {filteredPeople.length === 0 && <div className="text-muted">Nenhuma pessoa encontrada</div>}
        </div>
      </div>

      <hr />

      <div className="mb-3">
        <label className="form-label">Salas</label>
        <input className="form-control mb-2" placeholder="Buscar salas..." value={roomsQuery} onChange={(e) => setRoomsQuery(e.target.value)} />
        <div>
          {filteredRooms.map((r) => (
            <div key={r.id} className="form-check">
              <input className="form-check-input" type="checkbox" id={`room-${r.id}`} checked={!!selectedRooms[r.id]} onChange={() => toggleRoom(r.id)} />
              <label className="form-check-label" htmlFor={`room-${r.id}`}>
                {r.name}
              </label>
            </div>
          ))}
          {filteredRooms.length === 0 && <div className="text-muted">Nenhuma sala encontrada</div>}
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
          Limpar
        </button>
        <small className="text-muted align-self-center">Total pessoas: {people.length} • Salas: {rooms.length}</small>
      </div>
    </div>
  );
}
