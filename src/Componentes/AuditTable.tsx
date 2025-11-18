// src/components/AuditTable.tsx
import React, { useMemo, useState } from "react";

export type AuditEntry = {
  id: string;
  actor: string;
  action: string; // ex: create, edit, delete, approve, deny
  entity: string; // ex: user, room, reservation, setting
  entityId?: string;
  before?: string | null; // JSON string or text
  after?: string | null; // JSON string or text
  comment?: string | null;
  timestamp: string; // ISO string
};

type Props = {
  entries: AuditEntry[]; // já filtrados pela página, ou a página passa tudo e a tabela faz paginação
  pageSizeOptions?: number[];
  initialPageSize?: number;
  onExport?: (rows: AuditEntry[]) => void; // chamado para exportar seleção
};

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function AuditTable({
  entries,
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  onExport,
}: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Clamp page if pageSize changes
  if (page > totalPages) setPage(totalPages);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [entries, page, pageSize]);

  const handleExportCSV = () => {
    const rows = entries; // export all filtered
    if (onExport) return onExport(rows);

    // fallback: export simple CSV
    const headers: Array<keyof AuditEntry> = [
      "id",
      "timestamp",
      "actor",
      "action",
      "entity",
      "entityId",
      "comment",
      "before",
      "after",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const v = r[h] ?? "";
            // escape quotes
            const s = typeof v === "string" ? v.replace(/"/g, '""') : String(v);
            return `"${s}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div>
            <strong>Registros</strong>
            <div className="text-muted small">Total: {total}</div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center">
              <label className="me-2 small text-muted mb-0">Linhas</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 80 }}
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleExportCSV}
            >
              <i className="bi bi-download me-1"></i> Exportar CSV
            </button>
          </div>
        </div>

        <div
          className="table-responsive"
          style={{ maxHeight: 420, overflow: "auto" }}
        >
          <table className="table table-hover table-sm mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th style={{ width: 120 }}>Timestamp</th>
                <th>Ator</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>EntityId</th>
                <th>Comentário</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td className="align-middle">
                    <small className="text-muted">
                      {formatDate(r.timestamp)}
                    </small>
                  </td>
                  <td className="align-middle">{r.actor}</td>
                  <td className="align-middle">
                    <span className="badge bg-secondary">{r.action}</span>
                  </td>
                  <td className="align-middle">{r.entity}</td>
                  <td className="align-middle text-muted">
                    {r.entityId ?? "-"}
                  </td>
                  <td
                    className="align-middle text-truncate"
                    style={{ maxWidth: 220 }}
                  >
                    {r.comment ?? "-"}
                  </td>
                  <td className="align-middle">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => setSelectedId(r.id)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Nenhum registro encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <small className="text-muted">
            Página {page} de {totalPages}
          </small>
          <div className="btn-group" role="group">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              « Primeiro
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Próximo
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Último »
            </button>
          </div>
        </div>
      </div>

      {/* Modal simples para detalhes (controlado por React) */}
      {selectedId && (
        <AuditDetailModal
          entry={entries.find((e) => e.id === selectedId)!}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

/* Modal */
function AuditDetailModal({
  entry,
  onClose,
}: {
  entry: AuditEntry;
  onClose: () => void;
}) {
  return (
    <>
      <div className="modal-backdrop fade show" />
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
            <div className="modal-header">
              <h5 className="modal-title">Detalhes do registro — {entry.id}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <dl className="row">
                <dt className="col-sm-3">Timestamp</dt>
                <dd className="col-sm-9">
                  {new Date(entry.timestamp).toLocaleString()}
                </dd>

                <dt className="col-sm-3">Ator</dt>
                <dd className="col-sm-9">{entry.actor}</dd>

                <dt className="col-sm-3">Ação</dt>
                <dd className="col-sm-9">{entry.action}</dd>

                <dt className="col-sm-3">Entidade</dt>
                <dd className="col-sm-9">
                  {entry.entity} {entry.entityId ? `(${entry.entityId})` : ""}
                </dd>

                <dt className="col-sm-3">Comentário</dt>
                <dd className="col-sm-9">{entry.comment ?? "-"}</dd>

                <dt className="col-sm-3">Antes</dt>
                <dd className="col-sm-9">
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      maxHeight: 200,
                      overflow: "auto",
                    }}
                  >
                    {entry.before ?? "-"}
                  </pre>
                </dd>

                <dt className="col-sm-3">Depois</dt>
                <dd className="col-sm-9">
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      maxHeight: 200,
                      overflow: "auto",
                    }}
                  >
                    {entry.after ?? "-"}
                  </pre>
                </dd>
              </dl>
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
}
