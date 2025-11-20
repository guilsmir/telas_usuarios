import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { type Sala, type RoomType } from "../types/api";

function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editSala, setEditSala] = useState<Sala | null>(null);
  const [deleteSala, setDeleteSala] = useState<Sala | null>(null);

  const [formData, setFormData] = useState<Partial<Sala>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salasData, typesData] = await Promise.all([
        api.getSalasRaw(),
        api.getRoomTypes()
      ]);

      setSalas(salasData);
      setRoomTypes(typesData);
      setError(null);

    } catch (err: any) {
      if (String(err.message).includes("401")) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      ativada: true,
      tipo_sala: roomTypes.length > 0 ? roomTypes[0].nome : "",
      limite_usuarios: 0,
      descricao_sala: "",
      codigo_sala: 0,
      imagem: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (sala: Sala) => {
    setFormData(sala);
    setEditSala(sala);
  };

  const handleDeleteModal = (sala: Sala) => {
    setDeleteSala(sala);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditSala(null);
    setDeleteSala(null);
    setFormData({});
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editSala) {
        await api.updateSala(editSala.id, formData);
      } else {
        await api.createSala(formData);
      }

      await fetchData(); 
      closeModals();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteSala) return;

    try {
      await api.deleteSala(deleteSala.id);
      setSalas(salas.filter(s => s.id !== deleteSala.id));
      closeModals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    if (type === 'number') {
        finalValue = Number(value);
    } else if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({
        ...prev,
        [name]: finalValue
    }));
  };

  if (loading) return <div className="p-4">Carregando salas...</div>;

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0">Gerenciamento de Salas</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="bi bi-plus-lg me-2"></i>Nova Sala
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-2">Total de Salas</div>
              <div className="h3 mb-0 fw-bold">{salas.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-2">Ativas</div>
              <div className="h3 mb-0 fw-bold text-success">{salas.filter((s) => s.ativada).length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-2">Inativas</div>
              <div className="h3 mb-0 fw-bold text-danger">{salas.filter((s) => !s.ativada).length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3">Código</th>
                  <th className="py-3">Tipo</th>
                  <th className="py-3">Descrição</th>
                  <th className="py-3">Capacidade</th>
                  <th className="py-3">Status</th>
                  <th className="pe-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id}>
                    <td className="ps-4 fw-medium">{sala.codigo_sala}</td>
                    <td>{sala.tipo_sala}</td>
                    <td>{sala.descricao_sala}</td>
                    <td>{sala.limite_usuarios}</td>
                    <td>
                      <span className={`badge ${sala.ativada ? 'bg-success' : 'bg-danger'}`}>
                        {sala.ativada ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="pe-4">
                      <button className="btn btn-sm btn-link text-secondary me-2 p-0" onClick={() => handleEdit(sala)} title="Editar">
                        <i className="bi bi-pencil fs-6"></i>
                      </button>
                      <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => handleDeleteModal(sala)} title="Excluir">
                        <i className="bi bi-trash fs-6"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {salas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Nenhuma sala cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(isCreateModalOpen || editSala) && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editSala ? 'Editar Sala' : 'Nova Sala'}</h5>
                <button type="button" className="btn-close" onClick={closeModals} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form id="salaForm" onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Código da Sala</label>
                    <input 
                      type="number" 
                      className="form-control"
                      name="codigo_sala" 
                      value={formData.codigo_sala} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tipo de Sala</label>
                    <select 
                      className="form-select"
                      name="tipo_sala" 
                      value={formData.tipo_sala} 
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione...</option>
                      {roomTypes.map(type => (
                        <option key={type.id} value={type.nome}>{type.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="descricao_sala" 
                      value={formData.descricao_sala || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Limite de Usuários</label>
                    <input 
                      type="number" 
                      className="form-control"
                      name="limite_usuarios" 
                      value={formData.limite_usuarios} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">URL da Imagem (opcional)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="imagem" 
                      value={formData.imagem || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="form-check mb-3">
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      id="ativadaCheck"
                      name="ativada" 
                      checked={formData.ativada} 
                      onChange={handleInputChange} 
                    />
                    <label className="form-check-label" htmlFor="ativadaCheck">
                      Sala Ativa
                    </label>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>Cancelar</button>
                <button type="submit" form="salaForm" className="btn btn-primary">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteSala && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar exclusão</h5>
                <button type="button" className="btn-close" onClick={closeModals} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja excluir a sala <b>{deleteSala.descricao_sala}</b> (Cód: {deleteSala.codigo_sala})?</p>
                <div className="alert alert-warning mb-0">
                  Esta ação não pode ser desfeita.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Excluir Sala</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalasPage;