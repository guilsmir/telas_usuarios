import React, { useState } from "react";

// Interface para as props que o App.tsx vai passar
interface SettingsPageProps {
  onLogout: () => void;
}

/**
 * Componente que consolida:
 * US-12: Configurações Pessoais
 * US-13: Configurações do Sistema
 * US-11: Ação de Logout
 *  'useState' local para controlar os formulários.
 * A lógica de salvar (backend) está simulada com 'alert()'.
 */
const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  // --- Estado para US-12 (Configurações Pessoais) ---
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [defaultView, setDefaultView] = useState("dayGridMonth");
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);
  const [notifyOnDenial, setNotifyOnDenial] = useState(true);

  // --- Estado para US-13 (Configurações do Sistema) ---
  // Estes são mocks; o backend forneceria os valores reais.
  const [defaultOpen, setDefaultOpen] = useState("08:00");
  const [defaultClose, setDefaultClose] = useState("22:00");
  const [semesterStart, setSemesterStart] = useState("2025-01-20");
  const [semesterEnd, setSemesterEnd] = useState("2025-06-30");
  const [approvalTemplate, setApprovalTemplate] = useState(
    "Sua reserva para [SALA] no dia [DATA] foi APROVADA."
  );

  /**
   * Simula o salvamento das preferências pessoais (US-12).

   */
  const handleSavePersonalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { timezone, defaultView, notifyOnApproval, notifyOnDenial };
    console.log("Mock: Enviando Config. Pessoais:", payload);
    alert("Configurações pessoais salvas (simulação)!");
    // Ex: await fetch('/api/user/settings', { method: 'POST', body: JSON.stringify(payload) });
  };

  /**
   * Simula o salvamento das configurações do sistema (US-13).
   */
  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      defaultOpen,
      defaultClose,
      semesterStart,
      semesterEnd,
      approvalTemplate,
    };
    console.log("Mock: Enviando Config. Sistema:", payload);
    alert("Configurações do sistema salvas (simulação)!");
    // Ex: await fetch('/api/system/settings', { method: 'POST', body: JSON.stringify(payload) });
  };

  return (
    <div className="p-4" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2 className="mb-4">Configurações</h2>

      {/* --- Card para US-12: Configurações Pessoais --- */}
      <div className="card mb-4">
        <h5 className="card-header">
          <i className="bi bi-person-fill me-2"></i>
          Configurações Pessoais
        </h5>
        <div className="card-body">
          <form onSubmit={handleSavePersonalSettings}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="timezone" className="form-label">
                  Fuso Horário
                </label>
                <select
                  id="timezone"
                  className="form-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                  <option value="America/Manaus">Manaus (AMT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="defaultView" className="form-label">
                  Visualização Padrão do Calendário
                </label>
                <select
                  id="defaultView"
                  className="form-select"
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                >
                  <option value="dayGridMonth">Mês</option>
                  <option value="timeGridWeek">Semana</option>
                  <option value="timeGridDay">Dia</option>
                </select>
              </div>
            </div>

            <label className="form-label">Preferências de Notificação</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="notifyApproval"
                checked={notifyOnApproval}
                onChange={(e) => setNotifyOnApproval(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="notifyApproval">
                Receber email quando minha solicitação for APROVADA
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="notifyDenial"
                checked={notifyOnDenial}
                onChange={(e) => setNotifyOnDenial(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="notifyDenial">
                Receber email quando minha solicitação for NEGADA
              </label>
            </div>

            <hr />
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-save me-2"></i>
              Salvar minhas Preferências
            </button>
          </form>
        </div>
      </div>

      {/* --- Card para US-13: Configurações do Sistema --- */}
      {/* (Nota: Na implementação real, esta div inteira seria oculta se o usuário não fosse Admin) */}
      <div className="card mb-4">
        <h5 className="card-header bg-light">
          <i className="bi bi-sliders me-2"></i>
          Configurações do Sistema
        </h5>
        <div className="card-body">
          <form onSubmit={handleSaveSystemSettings}>
            <div className="row">
              <label className="form-label">
                Horário Padrão de Abertura do Sistema
              </label>
              <div className="col-md-6 mb-3">
                <div className="input-group">
                  <span className="input-group-text">Abre às</span>
                  <input
                    type="time"
                    className="form-control"
                    value={defaultOpen}
                    onChange={(e) => setDefaultOpen(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="input-group">
                  <span className="input-group-text">Fecha às</span>
                  <input
                    type="time"
                    className="form-control"
                    value={defaultClose}
                    onChange={(e) => setDefaultClose(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <label className="form-label">Definições do Semestre Atual</label>
              <div className="col-md-6 mb-3">
                <div className="input-group">
                  <span className="input-group-text">Início</span>
                  <input
                    type="date"
                    className="form-control"
                    value={semesterStart}
                    onChange={(e) => setSemesterStart(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="input-group">
                  <span className="input-group-text">Fim</span>
                  <input
                    type="date"
                    className="form-control"
                    value={semesterEnd}
                    onChange={(e) => setSemesterEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="emailTemplate" className="form-label">
                Template de Email (Aprovação)
              </label>
              <textarea
                id="emailTemplate"
                className="form-control"
                rows={3}
                value={approvalTemplate}
                onChange={(e) => setApprovalTemplate(e.target.value)}
              ></textarea>
            </div>
            <hr />
            <button type="submit" className="btn btn-warning">
              <i className="bi bi-save me-2"></i>
              Salvar Configurações do Sistema
            </button>
          </form>
        </div>
      </div>

      {/* --- Card para US-11: Logout --- */}
      <div className="card border-danger">
        <h5 className="card-header text-danger">
          <i className="bi bi-box-arrow-right me-2"></i>
          Encerrar Sessão
        </h5>
        <div className="card-body">
          <button className="btn btn-danger" onClick={onLogout}>
            Sair (Logout)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
