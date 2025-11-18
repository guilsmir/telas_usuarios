import React, { useState, useMemo, useEffect, useRef } from "react";

export type Person = {
  id: string;
  name: string;
  grade: string;
  avatar?: string;
};

export type Room = {
  id: string;
  name: string;
};

export type SidebarFiltersProps = {
  people?: Person[];
  rooms?: Room[];
  onSelectionChange?: (
    selectedPeopleIds: string[],
    selectedRoomIds: string[]
  ) => void;
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

  const [selectedPeople, setSelectedPeople] = useState<Record<string, boolean>>(
    () => ({})
  );
  const [selectedRooms, setSelectedRooms] = useState<Record<string, boolean>>(
    () => ({})
  );

  const isMounted = useRef(false);

  const selectedPeopleMap = useMemo(() => {
    return people
      .filter((p) => selectedPeople[p.id])
      .map((p) => ({ id: p.id, name: p.name }));
  }, [people, selectedPeople]);

  const selectedRoomsMap = useMemo(() => {
    return rooms
      .filter((r) => selectedRooms[r.id])
      .map((r) => ({ id: r.id, name: r.name }));
  }, [rooms, selectedRooms]);

  const filteredPeople = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.grade.toLowerCase().includes(q)
    );
  }, [people, peopleQuery]);

  const filteredRooms = useMemo(() => {
    const q = roomsQuery.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => r.name.toLowerCase().includes(q));
  }, [rooms, roomsQuery]);

  // Efeito para notificar mudança de seleção automaticamente (com prevenção de loop)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const peopleIds = Object.keys(selectedPeople).filter(
      (id) => selectedPeople[id]
    );
    const roomIds = Object.keys(selectedRooms).filter(
      (id) => selectedRooms[id]
    );

    onSelectionChange?.(peopleIds, roomIds);
  }, [selectedPeople, selectedRooms, onSelectionChange]);

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

  // Funções de Desseleção por ID (usadas nos chips)
  const deselectPerson = (id: string) => {
    setSelectedPeople((prev) => ({ ...prev, [id]: false }));
  };
  const deselectRoom = (id: string) => {
    setSelectedRooms((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="d-flex flex-column h-100 p-3" style={{ maxHeight }}>
      <div className="mb-3 flex-shrink-0">
        <label className="form-label text-primary fw-bold mb-1">Pessoas</label>

        <div className="d-flex align-items-center mb-2">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar pessoas..."
            value={peopleQuery}
            onChange={(e) => setPeopleQuery(e.target.value)}
          />
        </div>

        {selectedPeopleMap.length > 0 && (
          <div className="mt-2 mb-2 d-flex flex-wrap gap-1 border p-2 rounded bg-light w-100 overflow-hidden">
            <span className="text-secondary small me-1 flex-shrink-0">
              Selecionados:
            </span>
            {selectedPeopleMap.map((item) => (
              <span
                key={item.id}
                className="badge bg-primary-subtle text-secondary d-flex align-items-center"
                style={{ maxWidth: "50%" }}
              >
                <span
                  className="text-truncate flex-shrink-1 me-1"
                  style={{ minWidth: 0 }}
                >
                  {item.name}
                </span>
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1 flex-shrink-0"
                  aria-label="Remover"
                  onClick={() => deselectPerson(item.id)}
                  style={{
                    width: "0.45em",
                    height: "0.45em",
                    filter: "brightness(0.6)",
                  }}
                ></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex-grow-1 overflow-auto border-bottom pb-3 mb-3 custom-scrollbar-hide"
        style={{ minHeight: "0", height: "50%" }}
      >
        <div className="list-group list-group-flush">
          {filteredPeople.map((p) => (
            <div
              key={p.id}
              className={`list-group-item list-group-item-action d-flex align-items-center ${
                selectedPeople[p.id]
                  ? "border border-primary rounded border-2 p-3 my-1"
                  : "border-0 p-3 my-1"
              }`}
              onClick={() => togglePerson(p.id)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={`rounded-circle d-flex justify-content-center align-items-center me-3 bg-secondary text-white`}
                style={{ width: "40px", height: "40px", flexShrink: 0 }}
              >
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-100 h-100 rounded-circle"
                  />
                ) : (
                  p.name.charAt(0)
                )}
              </div>

              <div className="flex-grow-1 me-2 overflow-hidden">
                <div className="fw-bold text-dark text-truncate">{p.name}</div>
                <small className={`text-muted d-block text-truncate`}>
                  {p.grade}
                </small>
              </div>

              <i
                className={`bi ms-2 ${
                  selectedPeople[p.id]
                    ? "bi-check-circle-fill text-primary"
                    : "bi-circle"
                }`}
              ></i>
            </div>
          ))}
          {filteredPeople.length === 0 && (
            <div className="text-muted p-2">Nenhuma pessoa encontrada</div>
          )}
        </div>
      </div>

      <div className="mb-3 flex-shrink-0">
        <label className="form-label text-primary fw-bold mb-1">Salas</label>

        <div className="d-flex align-items-center mb-2">
          <input
            className="form-control form-control-sm"
            placeholder="Buscar salas..."
            value={roomsQuery}
            onChange={(e) => setRoomsQuery(e.target.value)}
          />
        </div>

        {selectedRoomsMap.length > 0 && (
          <div className="mt-2 mb-2 d-flex flex-wrap gap-1 border p-2 rounded bg-light w-100 overflow-hidden">
            <span className="text-secondary small me-1 flex-shrink-0">
              Selecionadas:
            </span>
            {selectedRoomsMap.map((item) => (
              <span
                key={item.id}
                className="badge bg-primary-subtle text-secondary d-flex align-items-center"
                style={{ maxWidth: "50%" }}
              >
                <span
                  className="text-truncate flex-shrink-1 me-1"
                  style={{ minWidth: 0 }}
                >
                  {item.name}
                </span>
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1 flex-shrink-0"
                  aria-label="Remover"
                  onClick={() => deselectRoom(item.id)}
                  style={{
                    width: "0.45em",
                    height: "0.45em",
                    filter: "brightness(0.6)",
                  }}
                ></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex-grow-1 overflow-auto mb-3 custom-scrollbar-hide"
        style={{ minHeight: "0", height: "50%" }}
      >
        <div className="list-group list-group-flush">
          {filteredRooms.map((r) => (
            <div
              key={r.id}
              className={`list-group-item list-group-item-action d-flex align-items-center ${
                selectedRooms[r.id]
                  ? "border border-primary rounded border-2 p-3 my-1"
                  : "border-0 p-3 my-1"
              }`}
              onClick={() => toggleRoom(r.id)}
              style={{ cursor: "pointer" }}
            >
              <i
                className={`bi bi-door-open me-3 fs-5 ${
                  selectedRooms[r.id] ? "text-primary" : "text-secondary"
                }`}
              ></i>
              <div className={`flex-grow-1 fw-bold text-dark text-truncate`}>
                {r.name}
              </div>

              <i
                className={`bi ms-2 ${
                  selectedRooms[r.id]
                    ? "bi-check-circle-fill text-primary"
                    : "bi-circle"
                }`}
              ></i>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="text-muted p-2">Nenhuma sala encontrada</div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end pt-2 border-top flex-shrink-0">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={clearAll}
        >
          <i className="bi bi-x-circle me-1"></i> Limpar Filtros
        </button>
      </div>
    </div>
  );
}
