import React, { useState, useEffect } from "react";
import type { Person, Room, ReservationData } from "../Types/api";

interface ModalReservaProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationData | null) => void;
  onDelete?: (id?: string) => void;
  people: Person[];
  rooms: Room[];
  initialData?: ReservationData;
}

export default function ModalReserva({
  show,
  onClose,
  onSubmit,
  onDelete,
  people,
  rooms,
  initialData,
}: ModalReservaProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");
  const [roomId, setRoomId] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("10:00");
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [freq, setFreq] = useState("WEEKLY"); 
  const [untilDate, setUntilDate] = useState("");

  useEffect(() => {
    if (show) {
      if (initialData) {
        setNome(initialData.nome || "");
        setEmail(initialData.email || "");
        setDescricao(initialData.descricao || "");
        setIsRecurrent(false); 
        setUntilDate("");

        const sched = initialData.schedules?.[0];
        if (sched) {
          setRoomId(sched.roomId || "");
          setData(sched.data ? sched.data.split('T')[0] : "");
          setHoraInicio(sched.horaInicio || "08:00");
          setHoraFim(sched.horaFim || "10:00");
        }
      } else {
        setNome("");
        setEmail("");
        setDescricao("");
        setRoomId(rooms.length > 0 ? rooms[0].id : "");
        const today = new Date().toISOString().split('T')[0];
        setData(today);
        setHoraInicio("08:00");
        setHoraFim("10:00");
        setIsRecurrent(false);
        setFreq("WEEKLY");
        setUntilDate("");
      }
    }
  }, [show, initialData, rooms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRoom = rooms.find((r) => r.id === roomId);

    let recurrencyString = undefined;
    if (isRecurrent && untilDate) {
        const cleanDate = untilDate.replace(/-/g, ""); 
        recurrencyString = `FREQ=${freq};UNTIL=${cleanDate}T235959Z`;
    }

    const payload: ReservationData = {
      id: initialData?.id,
      nome,
      email,
      descricao,
      // @ts-ignore - Adicionando propriedade extra que o backend espera
      recurrency: recurrencyString, 
      schedules: [
        {
          id: initialData?.schedules?.[0]?.id,
          roomId,
          roomName: selectedRoom?.name || "Sala",
          data,
          horaInicio,
          horaFim,
        },
      ],
    };
    onSubmit(payload);
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {initialData ? (
                <><i className="bi bi-pencil-square me-2"></i>Editar Reserva</>
              ) : (
                <><i className="bi bi-calendar-plus me-2"></i>Nova Reserva</>
              )}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-0">
            <form id="reservaForm" onSubmit={handleSubmit}>
              <div className="row g-0">
                <div className="col-md-6 p-4 border-end">
                  <h6 className="text-primary fw-bold mb-3">
                    <i className="bi bi-person-vcard me-2"></i>Dados do Responsável
                  </h6>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Assunto / Título</label>
                    <input
                      className="form-control"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      placeholder="Ex: Aula de Física"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Responsável (Email)</label>
                    <input
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      list="peopleList"
                      placeholder="Digite para buscar..."
                      autoComplete="off"
                    />
                    <datalist id="peopleList">
                      {people.map((p) => (
                        <option key={p.id} value={p.email}>
                          {p.name}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descrição</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Detalhes adicionais..."
                    ></textarea>
                  </div>
                </div>

                <div className="col-md-6 p-4 bg-light bg-opacity-25">
                  <h6 className="text-success fw-bold mb-3">
                    <i className="bi bi-geo-alt me-2"></i>Local e Horário
                  </h6>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Sala</label>
                    <select
                      className="form-select form-select-lg"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      required
                    >
                      <option value="" disabled>Selecione uma sala...</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Data de Início</label>
                    <input
                      type="date"
                      className="form-control"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Início</label>
                      <input
                        type="time"
                        className="form-control"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Fim</label>
                      <input
                        type="time"
                        className="form-control"
                        value={horaFim}
                        onChange={(e) => setHoraFim(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {!initialData && (
                    <div className="card bg-white border-0 shadow-sm mt-3">
                        <div className="card-body">
                            <div className="form-check form-switch mb-2">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="flexSwitchCheckDefault"
                                    checked={isRecurrent}
                                    onChange={e => setIsRecurrent(e.target.checked)}
                                />
                                <label className="form-check-label fw-bold text-secondary" htmlFor="flexSwitchCheckDefault">Repetir Evento</label>
                            </div>

                            {isRecurrent && (
                                <div className="row g-2 animate__animated animate__fadeIn">
                                    <div className="col-6">
                                        <label className="form-label small">Frequência</label>
                                        <select className="form-select form-select-sm" value={freq} onChange={e => setFreq(e.target.value)}>
                                            <option value="DAILY">Diariamente</option>
                                            <option value="WEEKLY">Semanalmente</option>
                                            <option value="MONTHLY">Mensalmente</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small">Até quando?</label>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-sm" 
                                            value={untilDate} 
                                            onChange={e => setUntilDate(e.target.value)}
                                            required={isRecurrent}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                            <i className="bi bi-info-circle me-1"></i>
                                            O evento se repetirá {freq === "DAILY" ? "todos os dias" : freq === "WEEKLY" ? "toda semana" : "todo mês"} até a data selecionada.
                                        </small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                  )}
                  
                </div>
              </div>
            </form>
          </div>

          <div className="modal-footer bg-light border-top-0">
            {initialData?.id && onDelete && (
              <button
                type="button"
                className="btn btn-outline-danger me-auto"
                onClick={() => onDelete(initialData.id)}
              >
                <i className="bi bi-trash me-1"></i> Excluir
              </button>
            )}
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" form="reservaForm" className="btn btn-primary px-5 fw-bold shadow-sm">
              <i className="bi bi-check-lg me-2"></i>Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}