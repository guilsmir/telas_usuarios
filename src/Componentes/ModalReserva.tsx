import React, { useState } from "react";
//import type { RecurrenceUnit, ReservationData } from "./types"; // optional: if you split types; otherwise use below definitions

export type RecurrenceUnit = "dias" | "semanas" | "meses" | "anos";

export interface ReservationData {
  nome: string;
  email: string;
  sala: string;
  data: string; // YYYY-MM-DD
  periodo: "manha" | "tarde" | "noite" | "personalizado";
  horaInicio?: string; // HH:MM
  horaFim?: string; // HH:MM
  recorrencia: "nao" | "diario" | "semanal" | "mensal" | "anual" | "personalizado";
  intervaloRecorrencia?: number;
  unidadeRecorrencia?: RecurrenceUnit;
  diasSemana?: string[];
  recurrenceEnd?: "never" | "after" | "onDate";
  occurrences?: number;
  recurrenceEndDate?: string; // YYYY-MM-DD
  descricao?: string;
}

interface ModalReservaProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationData) => void;
  salas?: { value: string; label: string }[];
}

export default function ModalReserva({ show, onClose, onSubmit, salas }: ModalReservaProps) {
  const defaultSalas = salas ?? [
    { value: "", label: "Escolha uma sala" },
    { value: "sala-101", label: "Sala 101 — Bloco A" },
    { value: "sala-102", label: "Sala 102 — Bloco A" },
    { value: "sala-201", label: "Sala 201 — Bloco B" },
    { value: "lab-computacao", label: "Laboratório de Computação" },
  ];

  // Estado do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [sala, setSala] = useState("");
  const [dataReserva, setDataReserva] = useState("");
  const [periodo, setPeriodo] = useState<ReservationData["periodo"]>("manha");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [recorrencia, setRecorrencia] = useState<ReservationData["recorrencia"]>("nao");
  const [intervaloRecorrencia, setIntervaloRecorrencia] = useState<number>(1);
  const [unidadeRecorrencia, setUnidadeRecorrencia] = useState<RecurrenceUnit>("dias");
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [descricao, setDescricao] = useState("");
  const [wasValidated, setWasValidated] = useState(false);

  const resetForm = () => {
    setNome("");
    setEmail("");
    setSala("");
    setDataReserva("");
    setPeriodo("manha");
    setHoraInicio("");
    setHoraFim("");
    setRecorrencia("nao");
    setIntervaloRecorrencia(1);
    setUnidadeRecorrencia("dias");
    setDiasSemana([]);
    setDescricao("");
    setWasValidated(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);

    // minimal validation
    if (!nome || !email || !sala || !dataReserva) return;

    const payload: ReservationData = {
      nome,
      email,
      sala,
      data: dataReserva,
      periodo,
      horaInicio: horaInicio || undefined,
      horaFim: horaFim || undefined,
      recorrencia,
      intervaloRecorrencia: intervaloRecorrencia || undefined,
      unidadeRecorrencia,
      diasSemana: diasSemana.length ? diasSemana : undefined,
      descricao: descricao || undefined,
    };

    onSubmit(payload);
    resetForm();
    onClose();
  };

  // Renderização do modal. O componente NÃO depende do JS do Bootstrap; controlamos a visibilidade via props.
  if (!show) return null;

  return (
    <>
      {/* backdrop sibling so it doesn't block modal interactivity */}
      <div className="modal-backdrop fade show" />

      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1060 /* above backbone but below highest overlays if needed */ }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <form
              className={wasValidated ? "needs-validation was-validated" : "needs-validation"}
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="modal-header">
                <h5 className="modal-title">Criar Reserva de Sala</h5>
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

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nome</label>
                  <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
                  <div className="invalid-feedback">Informe o nome.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="invalid-feedback">Informe um email válido.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Sala</label>
                  <select className="form-select" value={sala} onChange={(e) => setSala(e.target.value)} required>
                    {defaultSalas.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">Escolha uma sala.</div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Data</label>
                    <input type="date" className="form-control" value={dataReserva} onChange={(e) => setDataReserva(e.target.value)} required />
                    <div className="invalid-feedback">Escolha a data.</div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Início</label>
                    <input type="time" className="form-control" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Fim</label>
                    <input type="time" className="form-control" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Descrição (opcional)</label>
                  <textarea className="form-control" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { resetForm(); onClose(); }}>
                  Fechar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
