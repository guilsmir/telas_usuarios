// src/Componentes/ModalReserva.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";

/* ---------- Tipagens ---------- */
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
  data: string; // YYYY-MM-DD (first occurrence)
  periodo: "manha" | "tarde" | "noite" | "personalizado";
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM

  recorrencia:
    | "nao"
    | "diario"
    | "semanal"
    | "mensal"
    | "anual"
    | "personalizado";
  intervaloRecorrencia: number;
  unidadeRecorrencia: RecurrenceUnit;
  diasSemana: number[];

  monthlyOption?: "day" | "weekday";
  monthlyDay?: number;
  monthlyWeekOrdinal?: number;
  monthlyWeekday?: number;

  recurrenceEnd: "never" | "after" | "onDate";
  occurrences: number;
  recurrenceEndDate: string;
}

export interface ReservationData {
  id?: string;
  nome: string;
  email: string;
  descricao: string;
  schedules: ScheduleItem[];
}

interface ModalReservaProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationData | null) => void;
  onDelete?: (id?: string) => void;
  people: Person[];
  rooms: Room[];
  initialData?: ReservationData;
}

function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

const defaultScheduleItem = (room?: Room): ScheduleItem => ({
  id: uid("s-"),
  roomId: room?.id ?? uid("r-"),
  roomName: room?.name ?? "Sala",
  data: new Date().toISOString().split("T")[0],
  periodo: "manha",
  horaInicio: "08:00",
  horaFim: "12:00",
  recorrencia: "nao",
  intervaloRecorrencia: 1,
  unidadeRecorrencia: "dias",
  diasSemana: [],
  monthlyOption: "day",
  monthlyDay: new Date().getDate(),
  monthlyWeekOrdinal: 1,
  monthlyWeekday: new Date().getDay(),
  recurrenceEnd: "never",
  occurrences: 5,
  recurrenceEndDate: "",
});

/* ---------- Componente ---------- */
export default function ModalReserva({
  show,
  onClose,
  onSubmit,
  people,
  rooms,
  initialData,
}: ModalReservaProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [wasValidated, setWasValidated] = useState(false);
  const [roomSelectValue, setRoomSelectValue] = useState("");

  // AUTOCOMPLETE state
  const [nameQuery, setNameQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const nameWrapperRef = useRef<HTMLDivElement | null>(null);
  const emailWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (show && initialData) {
      setNome(initialData.nome ?? "");
      setEmail(initialData.email ?? "");
      setDescricao(initialData.descricao ?? "");
      const cloned = (initialData.schedules || []).map((s) => ({
        ...s,
        id: s.id ?? uid("s-"),
      }));
      setSchedules(cloned);
      setWasValidated(false);
      setRoomSelectValue("");
    } else if (show && !initialData) {
      setNome("");
      setEmail("");
      setDescricao("");
      setSchedules([]);
      setWasValidated(false);
      setRoomSelectValue("");
    }
    // hide suggestions on open/close
    setShowNameSuggestions(false);
    setShowEmailSuggestions(false);
  }, [show, initialData]);

  const peopleByEmail = useMemo(() => {
    return people.reduce((acc, person) => {
      acc[person.email] = person;
      return acc;
    }, {} as Record<string, Person>);
  }, [people]);

  // suggestions derived from queries
  const nameSuggestions = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    if (!q) return [];
    return people
      .filter(
        (p) =>
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.grade ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [nameQuery, people]);

  const emailSuggestions = useMemo(() => {
    const q = emailQuery.trim().toLowerCase();
    if (!q) return [];
    return people
      .filter((p) => (p.email ?? "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [emailQuery, people]);

  // click outside handlers to hide suggestion lists
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        nameWrapperRef.current &&
        !nameWrapperRef.current.contains(e.target as Node)
      )
        setShowNameSuggestions(false);
      if (
        emailWrapperRef.current &&
        !emailWrapperRef.current.contains(e.target as Node)
      )
        setShowEmailSuggestions(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleNameInput = (v: string) => {
    setNome(v);
    setNameQuery(v);
    setShowNameSuggestions(Boolean(v.trim()));
    // if input matches exactly an email->no action, we only search names/grades here
  };

  const handleEmailInput = (v: string) => {
    setEmail(v);
    setEmailQuery(v);
    setShowEmailSuggestions(Boolean(v.trim()));
    // also try to auto-fill name if exact email match
    const exact = peopleByEmail[v];
    if (exact) {
      setNome(exact.name);
      setNameQuery(exact.name);
    }
  };

  const selectPerson = (person: Person) => {
    setNome(person.name);
    setEmail(person.email);
    setNameQuery(person.name);
    setEmailQuery(person.email);
    setShowNameSuggestions(false);
    setShowEmailSuggestions(false);
  };

  const handleRoomSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    const room = rooms.find((r) => r.id === roomId);
    if (room && !schedules.some((s) => s.roomId === roomId))
      setSchedules((prev) => [...prev, defaultScheduleItem(room)]);
    setRoomSelectValue("");
  };

  const handleRemoveRoom = (roomId: string) =>
    setSchedules((prev) => prev.filter((s) => s.roomId !== roomId));

  /**
   * updateSchedule: updates a schedule safely and
   * - ensures diasSemana is cleared when the new state will not be weekly-related
   */
  const updateSchedule = (roomId: string, updates: Partial<ScheduleItem>) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.roomId !== roomId) return item;
        const newItem: ScheduleItem = { ...item, ...updates };

        const effectiveRec = updates.recorrencia ?? item.recorrencia;
        const effectiveUnit =
          updates.unidadeRecorrencia ?? item.unidadeRecorrencia;

        const isWeekly =
          effectiveRec === "semanal" ||
          (effectiveRec === "personalizado" && effectiveUnit === "semanas");
        if (!isWeekly) newItem.diasSemana = [];

        if (!newItem.unidadeRecorrencia)
          newItem.unidadeRecorrencia = item.unidadeRecorrencia ?? "dias";
        if (!newItem.recorrencia)
          newItem.recorrencia = item.recorrencia ?? "nao";

        return newItem;
      })
    );
  };

  const toggleWeekday = (roomId: string, weekday: number) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.roomId !== roomId) return item;
        const s = { ...item };
        const found = s.diasSemana.includes(weekday);
        s.diasSemana = found
          ? s.diasSemana.filter((d) => d !== weekday)
          : [...s.diasSemana, weekday].sort();
        return s;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);
    if (!nome || !email || schedules.length === 0) return;

    // 1. Encontrar o ID do usuário
    const userFound = people.find((p) => p.email === email);
    const fkUsuario = userFound ? Number(userFound.id) : 0;

    // 2. Transformar itens para o formato do Backend
    const payloadBackend = schedules.map((item) => {
      const dtInicio = new Date(`${item.data}T${item.horaInicio}:00`);
      const dtFim = new Date(`${item.data}T${item.horaFim}:00`);

      // Regra RFC5545 básica
      let rrule = "";
      switch (item.recorrencia) {
        case "diario":
          rrule = "FREQ=DAILY;INTERVAL=1";
          break;
        case "semanal":
          rrule = "FREQ=WEEKLY;INTERVAL=1";
          break;
        case "mensal":
          rrule = "FREQ=MONTHLY;INTERVAL=1";
          break;
        case "anual":
          rrule = "FREQ=YEARLY;INTERVAL=1";
          break;
        default:
          rrule = "";
      }

      return {
        fk_usuario: fkUsuario,
        fk_sala: Number(item.roomId),
        tipo: "Aula", // Ajuste conforme necessário
        recurrency: rrule,
        dia_horario_inicio: dtInicio.toISOString(),
        dia_horario_saida: dtFim.toISOString(),
        uso: descricao,
        justificativa: descricao,
        oficio: "",
      };
    });

    console.log("Payload corrigido para o Back:", payloadBackend);

    // Envia para o componente pai fazer o POST/PUT
    // @ts-expect-error: O payload enviado para o backend difere da interface ReservationData, mas é o esperado pela API.
    onSubmit(payloadBackend);
  };

  const isEditing = !!initialData?.id;

  // UI helpers
  const weekOrdinalOptions = [
    { value: 1, label: "Primeira" },
    { value: 2, label: "Segunda" },
    { value: 3, label: "Terceira" },
    { value: 4, label: "Quarta" },
    { value: 5, label: "Quinta" },
    { value: -1, label: "Última" },
  ];
  const weekdays = [
    { idx: 0, label: "Dom" },
    { idx: 1, label: "Seg" },
    { idx: 2, label: "Ter" },
    { idx: 3, label: "Qua" },
    { idx: 4, label: "Qui" },
    { idx: 5, label: "Sex" },
    { idx: 6, label: "Sáb" },
  ];

  /* Preset period helper: sets start/end times when user picks a preset */
  const applyPeriodPreset = (
    roomId: string,
    period: ScheduleItem["periodo"]
  ) => {
    if (period === "manha")
      updateSchedule(roomId, {
        periodo: "manha",
        horaInicio: "08:00",
        horaFim: "12:00",
      });
    else if (period === "tarde")
      updateSchedule(roomId, {
        periodo: "tarde",
        horaInicio: "13:00",
        horaFim: "17:00",
      });
    else if (period === "noite")
      updateSchedule(roomId, {
        periodo: "noite",
        horaInicio: "18:00",
        horaFim: "22:00",
      });
    else updateSchedule(roomId, { periodo: "personalizado" }); // preserve times or let user set
  };

  /* Small helper to clear all fields - used by "Limpar" */
  const resetFields = () => {
    setNome("");
    setEmail("");
    setDescricao("");
    setSchedules([]);
    setWasValidated(false);
    setRoomSelectValue("");
    setNameQuery("");
    setEmailQuery("");
    setShowNameSuggestions(false);
    setShowEmailSuggestions(false);
  };

  // ---------- RENDER ----------
  return (
    <>
      {/* hide scrollbars style - webkit + firefox + IE/Edge and specific textarea rule */}
      <style>
        {`
          /* hide scrollbars for modal list containers */
          .modal .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .modal .hide-scrollbar::-webkit-scrollbar { display: none; }
          .modal .hide-scrollbar { -webkit-overflow-scrolling: touch; }

          /* hide scrollbar for the description textarea specifically */
          .modal textarea.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .modal textarea.no-scrollbar::-webkit-scrollbar { display: none; }

          /* simple suggestion dropdown styling */
          .suggestions {
            position: absolute;
            z-index: 1055;
            background: #fff;
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 6px 18px rgba(0,0,0,0.08);
            border-radius: 6px;
            max-height: 240px;
            overflow-y: auto;
            width: 100%;
          }
          .suggestions::-webkit-scrollbar { display: none; }
          .suggestion-item { padding: 8px 12px; cursor: pointer; }
          .suggestion-item:hover, .suggestion-item.active { background: rgba(13,110,253,0.06); }
          .suggestion-sub { display:block; font-size: 12px; color: #6c757d; }
        `}
      </style>

      <div
        className={`modal ${show ? "d-block" : "d-none"}`}
        tabIndex={-1}
        style={{ backgroundColor: "rgba(13,18,25,0.55)" }}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
            <form
              className={`needs-validation ${
                wasValidated ? "was-validated" : ""
              }`}
              onSubmit={handleSubmit}
              noValidate
            >
              <div
                className="modal-header bg-gradient p-3"
                style={{
                  background:
                    "linear-gradient(90deg, #0d6efd 0%, #6610f2 100%)",
                  color: "#fff",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <i
                    className="bi bi-calendar2-event-fill fs-4"
                    style={{ color: "#fff" }}
                  />
                  <div>
                    <h5
                      className="modal-title mb-0"
                      style={{ color: "rgba(33, 37, 41,1)" }}
                    >
                      {isEditing ? "Editar Reserva" : "Nova Reserva"}
                    </h5>
                    <small style={{ color: "rgba(33, 37, 41,0.5)" }}>
                      Preencha os dados e defina recorrência se necessário
                    </small>
                  </div>
                </div>

                <div className="ms-auto d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => onClose()}
                  />
                </div>
              </div>

              <div className="modal-body p-4">
                <div className="row gx-4">
                  {/* LEFT */}
                  <div className="col-lg-5">
                    <div className="bg-white rounded-3 p-3 shadow-sm mb-3">
                      {/* NAME with autocomplete */}
                      <label className="form-label small text-muted">
                        Nome
                      </label>
                      <div
                        style={{ position: "relative" }}
                        ref={nameWrapperRef}
                      >
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={nome}
                          onChange={(e) => handleNameInput(e.target.value)}
                          onFocus={() =>
                            setShowNameSuggestions(Boolean(nameQuery.trim()))
                          }
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter") {
                              // if suggestions exist pick first
                              if (nameSuggestions.length > 0) {
                                ev.preventDefault();
                                selectPerson(nameSuggestions[0]);
                              }
                            }
                          }}
                          placeholder="Digite nome ou cargo..."
                          aria-autocomplete="list"
                        />
                        {showNameSuggestions && nameSuggestions.length > 0 && (
                          <div className="suggestions" role="listbox">
                            {nameSuggestions.map((p) => (
                              <div
                                key={p.email}
                                className="suggestion-item"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectPerson(p);
                                }}
                              >
                                <strong>{p.name}</strong>
                                <span className="suggestion-sub">
                                  {p.grade ?? "—"} · {p.email}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="invalid-feedback">Nome obrigatório.</div>

                      {/* EMAIL with autocomplete */}
                      <label className="form-label small text-muted mt-3">
                        E-mail
                      </label>
                      <div
                        style={{ position: "relative" }}
                        ref={emailWrapperRef}
                      >
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => handleEmailInput(e.target.value)}
                          onFocus={() =>
                            setShowEmailSuggestions(Boolean(emailQuery.trim()))
                          }
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter") {
                              if (emailSuggestions.length > 0) {
                                ev.preventDefault();
                                selectPerson(emailSuggestions[0]);
                              }
                            }
                          }}
                          placeholder="Digite ou selecione um e-mail..."
                          aria-autocomplete="list"
                        />
                        {showEmailSuggestions &&
                          emailSuggestions.length > 0 && (
                            <div className="suggestions" role="listbox">
                              {emailSuggestions.map((p) => (
                                <div
                                  key={p.email}
                                  className="suggestion-item"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectPerson(p);
                                  }}
                                >
                                  <strong>{p.email}</strong>
                                  <span className="suggestion-sub">
                                    {p.name} · {p.grade ?? "—"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                      <div className="invalid-feedback">E-mail inválido.</div>

                      <label className="form-label small text-muted mt-3">
                        Descrição
                      </label>
                      <textarea
                        className="form-control no-scrollbar"
                        rows={5}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        style={{ resize: "none" }}
                      />
                      {/* removed optional label and counter (per your request) */}
                    </div>

                    <div className="dropdown w-100">
                      <button
                        className="btn btn-outline-secondary w-100 dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-building"></i> Selecionar sala
                      </button>
                      <ul
                        className="dropdown-menu p-3"
                        style={{ minWidth: 320 }}
                      >
                        <li>
                          <select
                            className="form-select"
                            onChange={handleRoomSelection}
                            value={roomSelectValue || ""}
                          >
                            <option value="">Escolha uma sala...</option>
                            {rooms
                              .filter(
                                (r) => !schedules.some((s) => s.roomId === r.id)
                              )
                              .map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                          </select>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li className="px-2">
                          <small className="text-muted">
                            Dica: você pode adicionar várias salas e configurar
                            horários/recorrência para cada uma.
                          </small>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="col-lg-7">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Salas & Horários</h6>
                      <small className="text-muted">
                        {schedules.length} selecionada(s)
                      </small>
                    </div>

                    <div
                      className="list-group hide-scrollbar"
                      style={{ maxHeight: 520, overflow: "auto" }}
                    >
                      {schedules.map((item) => {
                        const prefix = `sched-${item.roomId}`;
                        const recType = item.recorrencia ?? "nao";
                        const showExplicitWeekly = recType === "semanal";

                        return (
                          <div
                            key={item.id}
                            className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm"
                          >
                            <div className="d-flex align-items-start justify-content-between">
                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-primary rounded-pill">
                                    {item.roomName}
                                  </span>
                                  <strong className="small">{item.data}</strong>
                                  <small className="text-muted ms-2">
                                    {item.horaInicio} — {item.horaFim}
                                  </small>
                                </div>
                                <div className="mt-2 small text-muted">
                                  Recorrência:{" "}
                                  <span className="text-body">
                                    {recType === "nao" ? "Não" : recType}
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveRoom(item.roomId)}
                                  title="Remover sala"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>

                            <div className="row mt-3 gx-2 gy-2">
                              <div className="col-12 col-md-5">
                                <label className="form-label small text-muted">
                                  Data inicial
                                </label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={item.data}
                                  onChange={(e) =>
                                    updateSchedule(item.roomId, {
                                      data: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              {/* Period selector (compact) */}
                              <div className="col-12 col-md-7">
                                <label className="form-label small text-muted">
                                  Período
                                </label>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.periodo === "manha"
                                        ? "btn-primary text-white"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      applyPeriodPreset(item.roomId, "manha")
                                    }
                                  >
                                    Manhã
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.periodo === "tarde"
                                        ? "btn-primary text-white"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      applyPeriodPreset(item.roomId, "tarde")
                                    }
                                  >
                                    Tarde
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.periodo === "noite"
                                        ? "btn-primary text-white"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      applyPeriodPreset(item.roomId, "noite")
                                    }
                                  >
                                    Noite
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.periodo === "personalizado"
                                        ? "btn-outline-primary"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      applyPeriodPreset(
                                        item.roomId,
                                        "personalizado"
                                      )
                                    }
                                  >
                                    Personalizar
                                  </button>
                                  <div className="ms-auto small text-muted align-self-center">
                                    {item.horaInicio} — {item.horaFim}
                                  </div>
                                </div>
                              </div>

                              {/* show time inputs only when personalizado */}
                              {item.periodo === "personalizado" && (
                                <>
                                  <div className="col-6 col-md-3">
                                    <label className="form-label small text-muted">
                                      Início
                                    </label>
                                    <input
                                      type="time"
                                      className="form-control"
                                      value={item.horaInicio}
                                      onChange={(e) =>
                                        updateSchedule(item.roomId, {
                                          horaInicio: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="col-6 col-md-3">
                                    <label className="form-label small text-muted">
                                      Fim
                                    </label>
                                    <input
                                      type="time"
                                      className="form-control"
                                      value={item.horaFim}
                                      onChange={(e) =>
                                        updateSchedule(item.roomId, {
                                          horaFim: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </>
                              )}

                              {/* Recorrência compacta */}
                              <div className="col-12">
                                <label className="form-label small text-muted">
                                  Repetir
                                </label>
                                <div
                                  className="btn-group w-100"
                                  role="group"
                                  aria-label="Recorrência"
                                >
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.recorrencia === "nao"
                                        ? "btn-outline-secondary"
                                        : "btn-outline-light"
                                    } py-1`}
                                    onClick={() =>
                                      updateSchedule(item.roomId, {
                                        recorrencia: "nao",
                                      })
                                    }
                                  >
                                    Nunca
                                  </button>

                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.recorrencia === "diario"
                                        ? "btn-primary text-white"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      updateSchedule(item.roomId, {
                                        recorrencia: "diario",
                                        intervaloRecorrencia: 1,
                                        unidadeRecorrencia: "dias",
                                      })
                                    }
                                  >
                                    Diário
                                  </button>

                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.recorrencia === "semanal"
                                        ? "btn-primary text-white"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      updateSchedule(item.roomId, {
                                        recorrencia: "semanal",
                                        intervaloRecorrencia: 1,
                                        unidadeRecorrencia: "semanas",
                                      })
                                    }
                                  >
                                    Semanal
                                  </button>

                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.recorrencia === "mensal"
                                        ? "btn-primary text-white"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      updateSchedule(item.roomId, {
                                        recorrencia: "mensal",
                                        intervaloRecorrencia: 1,
                                        unidadeRecorrencia: "meses",
                                      })
                                    }
                                  >
                                    Mensal
                                  </button>

                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.recorrencia === "anual"
                                        ? "btn-primary text-white"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      updateSchedule(item.roomId, {
                                        recorrencia: "anual",
                                        intervaloRecorrencia: 1,
                                        unidadeRecorrencia: "anos",
                                      })
                                    }
                                  >
                                    Anual
                                  </button>

                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.recorrencia === "personalizado"
                                        ? "btn-outline-primary"
                                        : "btn-outline-secondary"
                                    } py-1`}
                                    onClick={() =>
                                      updateSchedule(item.roomId, {
                                        recorrencia: "personalizado",
                                      })
                                    }
                                  >
                                    Personalizar
                                  </button>
                                </div>
                              </div>

                              {/* Weekly picker for explicit 'semanal' (only here) */}
                              {showExplicitWeekly && (
                                <div className="col-12 mt-2">
                                  <div className="small text-muted mb-1">
                                    Dias da semana
                                  </div>
                                  <div className="d-flex gap-2 flex-wrap">
                                    {weekdays.map((w) => (
                                      <button
                                        key={w.idx}
                                        type="button"
                                        className={`btn btn-sm ${
                                          item.diasSemana?.includes(w.idx)
                                            ? "btn-outline-primary"
                                            : "btn-outline-secondary"
                                        } py-1`}
                                        onClick={() =>
                                          toggleWeekday(item.roomId, w.idx)
                                        }
                                      >
                                        {w.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Monthly advanced */}
                              {item.recorrencia === "mensal" && (
                                <div className="col-12 mt-2">
                                  <div className="border rounded p-2 bg-light">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        id={`${prefix}-monthly-day`}
                                        name={`${prefix}-monthly-${item.id}`}
                                        checked={item.monthlyOption === "day"}
                                        onChange={() =>
                                          updateSchedule(item.roomId, {
                                            monthlyOption: "day",
                                          })
                                        }
                                      />
                                      <label
                                        htmlFor={`${prefix}-monthly-day`}
                                        className="form-check-label ms-2"
                                      >
                                        No dia do mês
                                      </label>
                                      {item.monthlyOption === "day" && (
                                        <input
                                          type="number"
                                          min={1}
                                          max={31}
                                          className="form-control form-control-sm mt-2"
                                          style={{ width: 110 }}
                                          value={
                                            item.monthlyDay ??
                                            new Date(item.data).getDate()
                                          }
                                          onChange={(e) =>
                                            updateSchedule(item.roomId, {
                                              monthlyDay: Math.max(
                                                1,
                                                Math.min(
                                                  31,
                                                  Number(e.target.value)
                                                )
                                              ),
                                            })
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="form-check mt-2">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        id={`${prefix}-monthly-weekday`}
                                        name={`${prefix}-monthly-${item.id}`}
                                        checked={
                                          item.monthlyOption === "weekday"
                                        }
                                        onChange={() =>
                                          updateSchedule(item.roomId, {
                                            monthlyOption: "weekday",
                                          })
                                        }
                                      />
                                      <label
                                        htmlFor={`${prefix}-monthly-weekday`}
                                        className="form-check-label ms-2"
                                      >
                                        Dia da semana (ex: segunda da semana)
                                      </label>
                                      {item.monthlyOption === "weekday" && (
                                        <div className="d-flex gap-2 mt-2">
                                          <select
                                            className="form-select form-select-sm"
                                            style={{ width: 140 }}
                                            value={item.monthlyWeekOrdinal ?? 1}
                                            onChange={(e) =>
                                              updateSchedule(item.roomId, {
                                                monthlyWeekOrdinal: Number(
                                                  e.target.value
                                                ),
                                              })
                                            }
                                          >
                                            {weekOrdinalOptions.map((opt) => (
                                              <option
                                                key={opt.value}
                                                value={opt.value}
                                              >
                                                {opt.label}
                                              </option>
                                            ))}
                                          </select>
                                          <select
                                            className="form-select form-select-sm"
                                            style={{ width: 90 }}
                                            value={item.monthlyWeekday ?? 1}
                                            onChange={(e) =>
                                              updateSchedule(item.roomId, {
                                                monthlyWeekday: Number(
                                                  e.target.value
                                                ),
                                              })
                                            }
                                          >
                                            {weekdays.map((w) => (
                                              <option key={w.idx} value={w.idx}>
                                                {w.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Custom recurrence details (the weekly picker for custom weeks lives here) */}
                              {item.recorrencia === "personalizado" && (
                                <div className="col-12 mt-2">
                                  <div className="border rounded p-2 bg-light">
                                    <div className="row g-2 align-items-center">
                                      <div className="col-auto">
                                        <small className="text-muted">
                                          Repetir a cada
                                        </small>
                                      </div>
                                      <div
                                        className="col-auto"
                                        style={{ width: 110 }}
                                      >
                                        <input
                                          type="number"
                                          min={1}
                                          className="form-control form-control-sm"
                                          value={item.intervaloRecorrencia}
                                          onChange={(e) =>
                                            updateSchedule(item.roomId, {
                                              intervaloRecorrencia: Math.max(
                                                1,
                                                Number(e.target.value) || 1
                                              ),
                                            })
                                          }
                                        />
                                      </div>
                                      <div
                                        className="col-auto"
                                        style={{ minWidth: 140 }}
                                      >
                                        <select
                                          className="form-select form-select-sm"
                                          value={
                                            item.unidadeRecorrencia ?? "dias"
                                          }
                                          onChange={(e) =>
                                            updateSchedule(item.roomId, {
                                              unidadeRecorrencia: e.target
                                                .value as RecurrenceUnit,
                                            })
                                          }
                                        >
                                          <option value="dias">dias</option>
                                          <option value="semanas">
                                            semanas
                                          </option>
                                          <option value="meses">meses</option>
                                          <option value="anos">anos</option>
                                        </select>
                                      </div>
                                    </div>

                                    {(item.unidadeRecorrencia ?? "dias") ===
                                      "semanas" && (
                                      <div className="mt-2">
                                        <small className="text-muted">
                                          Dias
                                        </small>
                                        <div className="d-flex gap-2 flex-wrap mt-1">
                                          {weekdays.map((w) => (
                                            <button
                                              key={w.idx}
                                              type="button"
                                              className={`btn btn-sm ${
                                                item.diasSemana?.includes(w.idx)
                                                  ? "btn-outline-primary"
                                                  : "btn-outline-secondary"
                                              } py-1`}
                                              onClick={() =>
                                                toggleWeekday(
                                                  item.roomId,
                                                  w.idx
                                                )
                                              }
                                            >
                                              {w.label}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* End rule */}
                              {item.recorrencia !== "nao" && (
                                <div className="col-12 mt-2">
                                  <div className="d-flex gap-3 align-items-center">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        id={`${prefix}-end-never`}
                                        name={`${prefix}-end-${item.id}`}
                                        checked={item.recurrenceEnd === "never"}
                                        onChange={() =>
                                          updateSchedule(item.roomId, {
                                            recurrenceEnd: "never",
                                          })
                                        }
                                      />
                                      <label
                                        htmlFor={`${prefix}-end-never`}
                                        className="form-check-label ms-2"
                                      >
                                        Nunca
                                      </label>
                                    </div>

                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        id={`${prefix}-end-after`}
                                        name={`${prefix}-end-${item.id}`}
                                        checked={item.recurrenceEnd === "after"}
                                        onChange={() =>
                                          updateSchedule(item.roomId, {
                                            recurrenceEnd: "after",
                                          })
                                        }
                                      />
                                      <label
                                        htmlFor={`${prefix}-end-after`}
                                        className="form-check-label ms-2"
                                      >
                                        Após
                                      </label>
                                      {item.recurrenceEnd === "after" && (
                                        <input
                                          type="number"
                                          min={1}
                                          className="form-control form-control-sm ms-2"
                                          style={{ width: 110 }}
                                          value={item.occurrences}
                                          onChange={(e) =>
                                            updateSchedule(item.roomId, {
                                              occurrences: Math.max(
                                                1,
                                                Number(e.target.value) || 1
                                              ),
                                            })
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        id={`${prefix}-end-ondate`}
                                        name={`${prefix}-end-${item.id}`}
                                        checked={
                                          item.recurrenceEnd === "onDate"
                                        }
                                        onChange={() =>
                                          updateSchedule(item.roomId, {
                                            recurrenceEnd: "onDate",
                                          })
                                        }
                                      />
                                      <label
                                        htmlFor={`${prefix}-end-ondate`}
                                        className="form-check-label ms-2"
                                      >
                                        Em
                                      </label>
                                      {item.recurrenceEnd === "onDate" && (
                                        <input
                                          type="date"
                                          className="form-control form-control-sm ms-2"
                                          style={{ width: 170 }}
                                          value={item.recurrenceEndDate}
                                          onChange={(e) =>
                                            updateSchedule(item.roomId, {
                                              recurrenceEndDate: e.target.value,
                                            })
                                          }
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {schedules.length === 0 && (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-calendar3 fs-1 mb-2"></i>
                          <div>Nenhuma sala selecionada</div>
                          <small className="d-block">
                            Adicione uma sala para configurar horário e
                            recorrência.
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="modal-footer border-0 p-3"
                style={{ background: "#fafafa" }}
              >
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetFields}
                    >
                      <i className="bi bi-arrow-counterclockwise"></i> Limpar
                    </button>

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        onClose();
                      }}
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={schedules.length === 0}
                    >
                      <i className="bi bi-save2 me-2"></i>{" "}
                      {isEditing
                        ? "Atualizar Reserva"
                        : `Salvar (${schedules.length})`}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
