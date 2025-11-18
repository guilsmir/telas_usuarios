// src/components/AuditFilters.tsx

export type FilterState = {
  actor: string;
  action: string;
  entity: string;
  q: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

type Props = {
  value: FilterState;
  actors: string[];
  actions: string[]; // lista de ações possíveis (create, edit, delete, approve...)
  entities: string[]; // ex: user, room, reservation, config
  onChange: (next: FilterState) => void;
  onReset?: () => void;
};

export default function AuditFilters({
  value,
  actors,
  actions,
  entities,
  onChange,
  onReset,
}: Props) {
  const update = (patch: Partial<FilterState>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Filtros</h5>

        <div className="row g-2">
          <div className="col-12 col-md-4">
            <label className="form-label">Ator</label>
            <select
              className="form-select"
              value={value.actor}
              onChange={(e) => update({ actor: e.target.value })}
            >
              <option value="">Todos</option>
              {actors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label">Ação</label>
            <select
              className="form-select"
              value={value.action}
              onChange={(e) => update({ action: e.target.value })}
            >
              <option value="">Todas</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label">Entidade</label>
            <select
              className="form-select"
              value={value.entity}
              onChange={(e) => update({ entity: e.target.value })}
            >
              <option value="">Todas</option>
              {entities.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Busca (texto)</label>
            <input
              className="form-control"
              placeholder="buscar id, comentário, campos..."
              value={value.q}
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">De</label>
            <input
              type="date"
              className="form-control"
              value={value.from ?? ""}
              onChange={(e) => update({ from: e.target.value || undefined })}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label">Até</label>
            <input
              type="date"
              className="form-control"
              value={value.to ?? ""}
              onChange={(e) => update({ to: e.target.value || undefined })}
            />
          </div>

          <div className="col-12 d-flex justify-content-between mt-2">
            <div>
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={() => onChange(value)}
              >
                Aplicar
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  onReset?.();
                }}
              >
                Limpar
              </button>
            </div>
            <small className="text-muted align-self-center">
              Filtragem cliente — troque por API conforme precisar
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
