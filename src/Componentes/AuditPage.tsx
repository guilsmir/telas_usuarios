// src/Componentes/AuditPage.tsx
// Este ficheiro implementa a página de auditoria com filtros e tabela de resultados.

import React, { useMemo, useState } from "react";

// =================================================================
// 1. TIPOS E INTERFACES (Consolidados)
// =================================================================
interface FilterState {
  actor: string;
  action: string;
  entity: string;
  q: string;
  from?: string;
  to?: string;
}
interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string | null;
  before: string | null;
  after: string | null;
  comment: string | null;
  timestamp: string;
}

// =================================================================
// 2. COMPONENTE AuditFilters (Consolidado)
// =================================================================
function AuditFilters({
  value,
  onChange,
  actors,
  actions,
  entities,
  onReset,
}: {
  value: FilterState;
  onChange: (filters: FilterState) => void;
  actors: string[];
  actions: string[];
  entities: string[];
  onReset: () => void;
}) {
  const handleChange = (field: keyof FilterState, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-header bg-primary text-white fw-bold">
        <i className="bi bi-funnel-fill me-2"></i> Filtros de Pesquisa
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label small text-muted">
            Busca Livre (ID/Comentário)
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Buscar ID ou texto..."
            value={value.q}
            onChange={(e) => handleChange("q", e.target.value)}
          />
        </div>

        {/* Filtro de Ator (Mock) */}
        <div className="mb-3">
          <label className="form-label small text-muted">Ator</label>
          <select
            className="form-select form-select-sm"
            value={value.actor}
            onChange={(e) => handleChange("actor", e.target.value)}
          >
            <option value="">Todos os Atores</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label small text-muted">Ação</label>
          <select
            className="form-select form-select-sm"
            value={value.action}
            onChange={(e) => handleChange("action", e.target.value)}
          >
            <option value="">Todas as Ações</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label small text-muted">Entidade</label>
          <select
            className="form-select form-select-sm"
            value={value.entity}
            onChange={(e) => handleChange("entity", e.target.value)}
          >
            <option value="">Todas as Entidades</option>
            {entities.map((e) => (
              <option key={e} value={e}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3 row">
          <div className="col">
            <label className="form-label small text-muted">De</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={value.from || ""}
              onChange={(e) => handleChange("from", e.target.value)}
            />
          </div>
          <div className="col">
            <label className="form-label small text-muted">Até</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={value.to || ""}
              onChange={(e) => handleChange("to", e.target.value)}
            />
          </div>
        </div>

        <div className="d-grid">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onReset}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i> Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 3. COMPONENTE AuditTable (Consolidado)
// =================================================================
function AuditTable({
  entries,
  onExport,
}: {
  entries: AuditEntry[];
  onExport: (rows: AuditEntry[]) => void;
}) {
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium",
      });
    } catch {
      return isoString.substring(0, 10) + " " + isoString.substring(11, 19);
    }
  };

  // Modal de Detalhes
  const DetailModal = ({
    entry,
    onClose,
  }: {
    entry: AuditEntry;
    onClose: () => void;
  }) => {
    return (
      <>
        {/* Backdrop e Modal Styling para Bootstrap */}
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1050 }}
          onClick={onClose}
        />
        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          style={{ zIndex: 1060 }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">
                  Detalhes do Registro: {entry.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Ação:</strong>{" "}
                  <span
                    className={`badge ${
                      entry.action === "create"
                        ? "bg-success"
                        : entry.action === "delete"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {entry.action.toUpperCase()}
                  </span>
                </p>
                <p>
                  <strong>Entidade:</strong> {entry.entity} (ID:{" "}
                  {entry.entityId || "-"})
                </p>
                <p>
                  <strong>Ator:</strong> {entry.actor}
                </p>
                <p>
                  <strong>Data/Hora:</strong> {formatDate(entry.timestamp)}
                </p>
                <p>
                  <strong>Comentário:</strong> {entry.comment || "-"}
                </p>
                <hr />
                <div className="row">
                  <div className="col-6">
                    <h6>Antes (Before)</h6>
                    <pre
                      className="p-2 border bg-light small overflow-auto"
                      style={{ maxHeight: "300px", whiteSpace: "pre-wrap" }}
                    >
                      {entry.before || "N/A"}
                    </pre>
                  </div>
                  <div className="col-6">
                    <h6>Depois (After)</h6>
                    <pre
                      className="p-2 border bg-light small overflow-auto"
                      style={{ maxHeight: "300px", whiteSpace: "pre-wrap" }}
                    >
                      {entry.after || "N/A"}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Resultados da Auditoria ({entries.length})</h5>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onExport(entries)}
        >
          <i className="bi bi-download me-1"></i> Exportar Dados
        </button>
      </div>

      <div
        className="table-responsive"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <table className="table table-striped table-hover align-middle mb-0 small">
          <thead className="table-light sticky-top">
            <tr>
              <th>ID</th>
              <th>Ator</th>
              <th>Ação</th>
              <th>Entidade</th>
              <th>Data/Hora</th>
              <th>Comentário</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.actor}</td>
                  <td>
                    <span
                      className={`badge ${
                        e.action === "create"
                          ? "bg-success"
                          : e.action === "delete"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {e.action.toUpperCase()}
                    </span>
                  </td>
                  <td>{e.entity}</td>
                  <td>{formatDate(e.timestamp)}</td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>
                    {e.comment}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => setSelectedEntry(e)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  Nenhum registro encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEntry && (
        <DetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}

// =================================================================
// 4. PÁGINA PRINCIPAL (AuditPage)
// =================================================================

// MOCK DE DADOS DE AUDITORIA (Substituir pela chamada real à API/Firestore)
const MOCK: AuditEntry[] = [
  {
    id: "A-0001",
    actor: "superadmin@uepa.br",
    action: "create",
    entity: "user",
    entityId: "u-123",
    before: null,
    after: JSON.stringify(
      { name: "João", email: "joao@ex.com", role: "Solicitor" },
      null,
      2
    ),
    comment: "Criação de conta via painel",
    timestamp: new Date().toISOString(),
  },
  {
    id: "A-0002",
    actor: "admin1@uepa.br",
    action: "edit",
    entity: "room",
    entityId: "r-12",
    before: JSON.stringify({ name: "Sala 101", capacity: 30 }, null, 2),
    after: JSON.stringify({ name: "Sala 101", capacity: 40 }, null, 2),
    comment: "Ajuste de capacidade da Sala 101",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "A-0003",
    actor: "system",
    action: "delete",
    entity: "reservation",
    entityId: "res-2025-09-01-55",
    before: JSON.stringify({ nome: "Evento X", sala: "r-3" }, null, 2),
    after: null,
    comment: "Cancelamento automático de reserva expirada",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export default function AuditPage() {
  // Estado para os filtros de busca
  const [filters, setFilters] = useState<FilterState>({
    actor: "",
    action: "",
    entity: "",
    q: "",
    from: undefined,
    to: undefined,
  });
  // Lista de entradas de auditoria (usando MOCK)
  const [entries] = useState<AuditEntry[]>(MOCK);

  // Geração de listas de valores únicos para os filtros dropdown
  const actors = useMemo(
    () => Array.from(new Set(entries.map((e) => e.actor))).sort(),
    [entries]
  );
  const actions = useMemo(
    () => Array.from(new Set(entries.map((e) => e.action))).sort(),
    [entries]
  );
  const entities = useMemo(
    () => Array.from(new Set(entries.map((e) => e.entity))).sort(),
    [entries]
  );

  // Lógica de filtragem
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      // Filtro por Ator
      if (filters.actor && e.actor !== filters.actor) return false;
      // Filtro por Ação
      if (filters.action && e.action !== filters.action) return false;
      // Filtro por Entidade
      if (filters.entity && e.entity !== filters.entity) return false;

      // Filtro de Busca Livre (q)
      if (filters.q) {
        const q = filters.q.toLowerCase();
        // Concatena todos os campos relevantes para a busca
        const hay = `${e.id} ${e.actor} ${e.action} ${e.entity} ${
          e.entityId ?? ""
        } ${e.comment ?? ""} ${e.before ?? ""} ${e.after ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Filtro de Data 'De'
      if (filters.from) {
        if (new Date(e.timestamp) < new Date(filters.from)) return false;
      }

      // Filtro de Data 'Até'
      if (filters.to) {
        const toDate = new Date(filters.to);
        // Garante que o filtro inclua o dia inteiro (até 23:59:59)
        toDate.setHours(23, 59, 59, 999);
        if (new Date(e.timestamp) > toDate) return false;
      }
      return true;
    });
  }, [entries, filters]);

  // Função de exportação (simulada)
  const handleExport = (rows: AuditEntry[]) => {
    console.log("Exportando", rows.length, "linhas para CSV/JSON");
    // Lógica real de conversão e download
    console.log(`Exportando ${rows.length} registros filtrados.`);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Coluna de Filtros (Sidebar) */}
        <aside className="col-12 col-md-4 col-lg-3 mb-3">
          <AuditFilters
            value={filters}
            onChange={(v) => setFilters(v)}
            actors={actors}
            actions={actions}
            entities={entities}
            onReset={() =>
              setFilters({
                actor: "",
                action: "",
                entity: "",
                q: "",
                from: undefined,
                to: undefined,
              })
            }
          />

          {/* Cartão de Ações (Exportar) */}
          <div className="card mt-3">
            <div className="card-body">
              <h6>Ações</h6>
              <p className="small text-muted">
                Exporte o conjunto de dados filtrado.
              </p>
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => handleExport(filtered)}
              >
                <i className="bi bi-file-earmark-arrow-down me-2"></i> Exportar
              </button>
            </div>
          </div>
        </aside>

        {/* Coluna da Tabela de Resultados */}
        <section className="col-12 col-md-8 col-lg-9">
          <AuditTable entries={filtered} onExport={handleExport} />
        </section>
      </div>
    </div>
  );
}
