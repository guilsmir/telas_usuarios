import React, { useState, useMemo } from "react";

// --- TIPAGEM COMPLETA ---

export interface Room {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  grade?: string;
  avatar?: string;
}

export type RecurrenceUnit = "dias" | "semanas" | "meses" | "anos";

export interface ScheduleItem {
  id: string; 
  roomId: string;
  roomName: string;
  data: string; // YYYY-MM-DD
  periodo: "manha" | "tarde" | "noite" | "personalizado";
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM
  recorrencia: "nao" | "diario" | "semanal" | "mensal" | "anual" | "personalizado";
  intervaloRecorrencia: number;
  unidadeRecorrencia: RecurrenceUnit;
  diasSemana: string[]; 
  recurrenceEnd: "never" | "after" | "onDate";
  occurrences: number;
  recurrenceEndDate: string; // YYYY-MM-DD
}

export interface ReservationData {
  nome: string;
  email: string;
  descricao: string;
  schedules: ScheduleItem[]; 
}

interface ModalReservaProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationData) => void;
  people: Person[]; 
  rooms: Room[]; 
}

// Valores padrão para um item de agendamento
const defaultScheduleItem = (room: Room): ScheduleItem => ({
  id: room.id,
  roomId: room.id,
  roomName: room.name,
  data: new Date().toISOString().split('T')[0],
  periodo: "manha",
  horaInicio: "08:00",
  horaFim: "12:00",
  recorrencia: "nao",
  intervaloRecorrencia: 1,
  unidadeRecorrencia: "dias",
  diasSemana: [],
  recurrenceEnd: "never",
  occurrences: 5,
  recurrenceEndDate: '',
});

// Componente principal do Modal
export default function ModalReserva({ show, onClose, onSubmit, people, rooms }: ModalReservaProps) {
  // --- ESTADO DO FORMULÁRIO ---
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [wasValidated, setWasValidated] = useState(false);
  const [roomSelectValue, setRoomSelectValue] = useState(""); 

  // Mapeamentos para Autocomplete
  const peopleByEmail = useMemo(() => {
    return people.reduce((acc, person) => {
      acc[person.email] = person;
      return acc;
    }, {} as Record<string, Person>);
  }, [people]);

  const peopleByName = useMemo(() => {
    return people.reduce((acc, person) => {
      acc[person.name] = person;
      return acc;
    }, {} as Record<string, Person>);
  }, [people]);

  // --- HANDLERS DE AUTOCONTAGEM ---

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNome(newName);

    if (peopleByName[newName]) {
      setEmail(peopleByName[newName].email);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (peopleByEmail[newEmail]) {
      setNome(peopleByEmail[newEmail].name);
    }
  };


  // --- HANDLERS DE SALAS ---

  const handleRoomSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r.id === roomId);

    if (room && !schedules.some(s => s.roomId === roomId)) {
      setSchedules([...schedules, defaultScheduleItem(room)]);
    }
    setRoomSelectValue(""); 
  };

  const handleRemoveRoom = (roomId: string) => {
    setSchedules(schedules.filter(s => s.roomId !== roomId));
  };

  const updateSchedule = (roomId: string, updates: Partial<ScheduleItem>) => {
    setSchedules(prevSchedules =>
      prevSchedules.map(item =>
        item.roomId === roomId ? { ...item, ...updates } : item
      )
    );
  };

  // --- LÓGICA DO FORMULÁRIO ---

  const resetForm = () => {
    setNome("");
    setEmail("");
    setDescricao("");
    setSchedules([]);
    setWasValidated(false);
    setRoomSelectValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);

    if (!nome || !email || schedules.length === 0 || !schedules.every(s => s.data && s.horaInicio && s.horaFim)) {
      return;
    }

    const payload: ReservationData = {
      nome,
      email,
      descricao: descricao || "",
      schedules,
    };

    onSubmit(payload);
    resetForm();
    onClose();
  };

  // --- COMPONENTE DE EDIÇÃO DE AGENDAMENTO (JSX) ---

  const ScheduleEditor = ({ item }: { item: ScheduleItem }) => {
    const prefix = `schedule-${item.roomId}`;
    const isCustomTime = item.periodo === "personalizado";
    const isRecurrent = item.recorrencia !== "nao";
    
    const isCustomRecurrence = item.recorrencia === "personalizado";
    const isWeekly = item.recorrencia === 'semanal' || (isCustomRecurrence && item.unidadeRecorrencia === 'semanas');


    const daysOfWeek = [
      { id: 'dom', label: 'Dom' }, { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' },
      { id: 'qua', label: 'Qua' }, { id: 'qui', label: 'Qui' }, { id: 'sex', label: 'Sex' }, { id: 'sab', label: 'Sáb' },
    ];

    const toggleDay = (day: string) => {
      const newDays = item.diasSemana.includes(day)
        ? item.diasSemana.filter(d => d !== day)
        : [...item.diasSemana, day];
      updateSchedule(item.roomId, { diasSemana: newDays });
    };

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPeriodo = e.target.value as ScheduleItem["periodo"];
      let horaInicio = item.horaInicio;
      let horaFim = item.horaFim;

      if (newPeriodo === "manha") { horaInicio = "08:00"; horaFim = "12:00"; }
      if (newPeriodo === "tarde") { horaInicio = "13:00"; horaFim = "17:00"; }
      if (newPeriodo === "noite") { horaInicio = "18:00"; horaFim = "22:00"; }

      updateSchedule(item.roomId, { periodo: newPeriodo, horaInicio, horaFim });
    };

    return (
      <div className="card mb-3 border-primary">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Agendamento: {item.roomName}</h6>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Remover Sala"
            onClick={() => handleRemoveRoom(item.roomId)}
          ></button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Data */}
            <div className="col-12 col-md-4">
              <label htmlFor={`${prefix}-data`} className="form-label">Data de Início</label>
              <input
                type="date"
                id={`${prefix}-data`}
                className="form-control"
                value={item.data}
                onChange={(e) => updateSchedule(item.roomId, { data: e.target.value })}
                required
              />
              <div className="invalid-feedback">Data obrigatória.</div>
            </div>

            {/* Período (com texto reduzido para caber) */}
            <div className="col-12 col-md-4">
              <label htmlFor={`${prefix}-periodo`} className="form-label">Período</label>
              <select
                id={`${prefix}-periodo`}
                className="form-select"
                value={item.periodo}
                onChange={handlePeriodChange}
              >
                <option value="manha">Manhã (8h - 12h)</option>
                <option value="tarde">Tarde (13h - 17h)</option>
                <option value="noite">Noite (18h - 22h)</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            {/* Horários */}
            <div className={`col-6 col-md-2 ${!isCustomTime ? 'd-none' : ''}`}>
              <label htmlFor={`${prefix}-inicio`} className="form-label">Início</label>
              <input
                type="time"
                id={`${prefix}-inicio`}
                className="form-control"
                value={item.horaInicio}
                onChange={(e) => updateSchedule(item.roomId, { horaInicio: e.target.value })}
                required
              />
              <div className="invalid-feedback">Hora de início obrigatória.</div>
            </div>
            <div className={`col-6 col-md-2 ${!isCustomTime ? 'd-none' : ''}`}>
              <label htmlFor={`${prefix}-fim`} className="form-label">Fim</label>
              <input
                type="time"
                id={`${prefix}-fim`}
                className="form-control"
                value={item.horaFim}
                onChange={(e) => updateSchedule(item.roomId, { horaFim: e.target.value })}
                required
              />
              <div className="invalid-feedback">Hora de fim obrigatória.</div>
            </div>

            {/* Recorrência */}
            <div className="col-12">
              <label htmlFor={`${prefix}-recorrencia`} className="form-label">Repetir</label>
              <select
                id={`${prefix}-recorrencia`}
                className="form-select"
                value={item.recorrencia}
                onChange={(e) => updateSchedule(item.roomId, { recorrencia: e.target.value as ScheduleItem["recorrencia"] })}
              >
                <option value="nao">Não se repete</option>
                <option value="diario">Diariamente</option>
                <option value="semanal">Semanalmente (toda {new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'long' })})</option>
                <option value="mensal">Mensalmente</option>
                <option value="anual">Anualmente</option>
                <option value="personalizado">Personalizado...</option>
              </select>
            </div>

            {/* Opções de Recorrência Customizada */}
            {isRecurrent && (
              <div className="col-12 border p-3 rounded bg-light mt-2">
                {isCustomRecurrence && (
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor={`${prefix}-intervalo`} className="form-label">Repetir a cada</label>
                      <input
                        type="number"
                        id={`${prefix}-intervalo`}
                        className="form-control"
                        min="1"
                        value={item.intervaloRecorrencia}
                        onChange={(e) => updateSchedule(item.roomId, { intervaloRecorrencia: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor={`${prefix}-unidade`} className="form-label">Unidade</label>
                      <select
                        id={`${prefix}-unidade`}
                        className="form-select"
                        value={item.unidadeRecorrencia}
                        onChange={(e) => updateSchedule(item.roomId, { unidadeRecorrencia: e.target.value as RecurrenceUnit })}
                      >
                        <option value="dias">dias</option>
                        <option value="semanas">semanas</option>
                        <option value="meses">meses</option>
                        <option value="anos">anos</option>
                      </select>
                    </div>
                  </div>
                )}

                {isWeekly && (
                  <div className="mb-3">
                    <label className="form-label d-block">Repetir em:</label>
                    <div className="btn-group w-100" role="group" aria-label="Dias da Semana">
                      {daysOfWeek.map(day => (
                        <React.Fragment key={day.id}>
                          <input
                            type="checkbox"
                            className="btn-check"
                            id={`${prefix}-day-${day.id}`}
                            checked={item.diasSemana.includes(day.id)}
                            onChange={() => toggleDay(day.id)}
                            autoComplete="off"
                          />
                          <label className={`btn btn-outline-secondary ${item.diasSemana.includes(day.id) ? 'active' : ''}`} htmlFor={`${prefix}-day-${day.id}`}>
                            {day.label}
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opções de Término */}
                <label className="form-label">Termina</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`${prefix}-recurrenceEnd`}
                    id={`${prefix}-never`}
                    checked={item.recurrenceEnd === "never"}
                    onChange={() => updateSchedule(item.roomId, { recurrenceEnd: "never" })}
                  />
                  <label className="form-check-label" htmlFor={`${prefix}-never`}>Nunca</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`${prefix}-recurrenceEnd`}
                    id={`${prefix}-after`}
                    checked={item.recurrenceEnd === "after"}
                    onChange={() => updateSchedule(item.roomId, { recurrenceEnd: "after" })}
                  />
                  <label className="form-check-label" htmlFor={`${prefix}-after`}>Após</label>
                  {item.recurrenceEnd === "after" && (
                    <div className="d-inline-flex align-items-center ms-3">
                      <input
                        type="number"
                        className="form-control form-control-sm me-1"
                        min="1"
                        style={{ width: '80px' }}
                        value={item.occurrences}
                        onChange={(e) => updateSchedule(item.roomId, { occurrences: parseInt(e.target.value) || 1 })}
                      />
                      ocorrências
                    </div>
                  )}
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`${prefix}-recurrenceEnd`}
                    id={`${prefix}-onDate`}
                    checked={item.recurrenceEnd === "onDate"}
                    onChange={() => updateSchedule(item.roomId, { recurrenceEnd: "onDate" })}
                  />
                  <label className="form-check-label" htmlFor={`${prefix}-onDate`}>Em</label>
                  {item.recurrenceEnd === "onDate" && (
                    <input
                      type="date"
                      className="form-control form-control-sm d-inline-block ms-3"
                      style={{ width: '150px' }}
                      value={item.recurrenceEndDate}
                      onChange={(e) => updateSchedule(item.roomId, { recurrenceEndDate: e.target.value })}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---

  if (!show) return null;

  return (
    <>
      {/* backdrop */}
      <div className="modal-backdrop fade show" />

      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1060, overflowY: 'auto' }}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
          <div className="modal-content">
            <form
              className={wasValidated ? "needs-validation was-validated" : "needs-validation"}
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="modal-header">
                <h5 className="modal-title text-primary "><i className="bi bi-calendar-plus me-2"></i> Criar Nova Reserva</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* O h-100 no row garante que as colunas ocupem o espaço vertical disponível */}
                <div className="row h-100" style={{ minHeight: '60vh' }}>
                  
                  {/* Coluna de Contato (h-100 para herdar a altura) */}
                  <div className="col-lg-5 border-end d-flex flex-column h-100">
                    <h6 className="text-primary mb-3 flex-shrink-0">Informações de Contato</h6>
                    
                    {/* Campos de Nome e Email - fixos (flex-shrink-0) */}
                    <div className="mb-3 flex-shrink-0">
                      <label htmlFor="nome" className="form-label">Nome</label>
                      <input
                        id="nome"
                        className="form-control"
                        value={nome}
                        onChange={handleNameChange}
                        list="datalistOptionsNames"
                        required
                      />
                      <datalist id="datalistOptionsNames">
                        {people.map((p) => (
                          <option key={p.id} value={p.name} />
                        ))}
                      </datalist>
                      <div className="invalid-feedback">Informe o nome.</div>
                    </div>

                    <div className="mb-3 flex-shrink-0">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={handleEmailChange}
                        list="datalistOptionsEmails"
                        required
                      />
                      <datalist id="datalistOptionsEmails">
                        {people.map((p) => (
                          <option key={p.id} value={p.email} />
                        ))}
                      </datalist>
                      <div className="invalid-feedback">Informe um email válido.</div>
                    </div>

                    {/* Descrição - expande para preencher o espaço (flex-grow-1) */}
                    <div className="mb-3 flex-grow-1 d-flex flex-column"> 
                      <label htmlFor="descricao" className="form-label flex-shrink-0">Descrição</label>
                      <textarea
                        id="descricao"
                        className="form-control flex-grow-1 custom-scrollbar-hide" 
                        rows={4} 
                        value={descricao}
                        placeholder="Descreva brevemente o motivo da reserva."
                        onChange={(e) => setDescricao(e.target.value)}
                        style={{ resize: 'none' }} 
                      />
                    </div>
                  </div>

                  {/* Coluna de Agendamento (h-100 para herdar a altura) */}
                  <div className="col-lg-7 d-flex flex-column h-100">
                    <h6 className="text-primary mb-3 flex-shrink-0">Salas e Horários</h6>

                    {/* Seleção Múltipla de Salas (visível - flex-shrink-0) */}
                    <div className="mb-3 flex-shrink-0">
                      <label htmlFor="sala-select" className="form-label">Adicionar Sala</label>
                      <select
                        id="sala-select"
                        className="form-select"
                        onChange={handleRoomSelection}
                        value={roomSelectValue} 
                        onBlur={() => setRoomSelectValue("")} 
                      >
                        <option value="" disabled>Buscar e selecionar uma sala...</option>
                        {rooms
                          .filter(r => !schedules.some(s => s.roomId === r.id)) 
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                      <div className="invalid-feedback">Selecione pelo menos uma sala.</div>
                    </div>

                    {/* Lista de Chips (visível - flex-shrink-0) */}
                    {schedules.length > 0 && (
                      <div className="mb-4 d-flex flex-wrap gap-2 p-2 border-bottom flex-shrink-0">
                        <span className="text-secondary small fw-bold me-1">Salas Adicionadas:</span>
                        {schedules.map(item => (
                          <span 
                            key={item.roomId} 
                            className="badge bg-primary-subtle text-secondary fw-normal p-2 d-flex align-items-center rounded-pill"
                          >
                            {item.roomName}
                            <button
                              type="button"
                              className="btn-close ms-2"
                              aria-label={`Remover ${item.roomName}`}
                              onClick={() => handleRemoveRoom(item.roomId)}
                              style={{ width: '0.45em', height: '0.45em', filter: 'brightness(0.6)' }}
                            ></button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Formulários de Agendamento por Sala (ÁREA SCROLLÁVEL) */}
                    {/* flex-grow-1: Ocupa o restante do espaço. overflow-auto: Ativa o scroll. */}
                    <div 
                        className="flex-grow-1 overflow-auto custom-scrollbar-hide pe-2" 
                        style={{ minHeight: '100px' }} 
                    >
                      {schedules.map(item => (
                        <ScheduleEditor key={item.roomId} item={item} />
                      ))}

                      {schedules.length === 0 && (
                        <div className="alert alert-warning mt-4">
                          Adicione uma sala para configurar a data e horários da reserva.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  Fechar
                </button>
                <button type="submit" className="btn btn-primary" disabled={schedules.length === 0}>
                  Salvar Reserva ({schedules.length} Agendamentos)
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}