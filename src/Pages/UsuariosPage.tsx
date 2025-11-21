import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { ApiUser, UserPayload } from "../Types/api"

const TIPO_USUARIO_MAP: Record<number, string> = {
  1: "Aluno",
  2: "Professor",
  3: "Administrador"
};

function UsuariosPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<ApiUser | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    tipo_usuario: 1, 
    senha: "", 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsersRaw();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      if (String(err.message).includes("401")) {
         setError("Sessão expirada. Faça login novamente.");
      } else {
         setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditUser(null);
    setFormData({ nome: "", email: "", tipo_usuario: 1, senha: ""});
    setIsModalOpen(true);
  };

  const handleEdit = (user: ApiUser) => {
    setEditUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
      senha: "", 
    });
    setIsModalOpen(true);
  };

  const handleDeleteModal = (user: ApiUser) => {
    setDeleteUser(user);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setEditUser(null);
    setDeleteUser(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload: UserPayload = {
        nome: formData.nome,
        email: formData.email,
        tipo_usuario: editUser ? editUser.tipo_usuario : Number(formData.tipo_usuario),
      };

      if (!editUser || formData.senha) {
        payload.senha = formData.senha;
      }

      if (editUser) {
        await api.updateUser(editUser.id, payload);
      } else {
        await api.createUser(payload);
      }

      await fetchUsers();
      closeModals();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await api.deleteUser(deleteUser.id);
      setUsers(users.filter(u => u.id !== deleteUser.id));
      closeModals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="p-4">Carregando usuários...</div>;

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0">Gerenciamento de Usuários</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="bi bi-person-plus-fill me-2"></i>Novo Usuário
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-2">Total</div>
              <div className="h3 mb-0 fw-bold">{users.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-2">Professores/Alunos</div>
              <div className="h3 mb-0 fw-bold text-info">
                {users.filter(u => u.tipo_usuario !== 3).length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-muted small mb-2">Admin</div>
              <div className="h3 mb-0 fw-bold text-warning">
                {users.filter(u => u.tipo_usuario === 3).length}
              </div>
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
                  <th className="ps-4 py-3">Nome</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Papel</th>
                  <th className="pe-4 py-3 text-end">Ação</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="ps-4 fw-medium">{user.nome}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${
                        user.tipo_usuario === 3 ? 'bg-warning text-dark' : 
                        user.tipo_usuario === 2 ? 'bg-info text-dark' : 'bg-secondary'
                      }`}>
                        {TIPO_USUARIO_MAP[user.tipo_usuario] || "Desconhecido"}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <button className="btn btn-sm btn-link text-secondary me-2 p-0" onClick={() => handleEdit(user)} title="Editar">
                        <i className="bi bi-pencil fs-6"></i>
                      </button>
                      <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => handleDeleteModal(user)} title="Excluir">
                        <i className="bi bi-trash fs-6"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editUser ? 'Editar Usuário' : 'Novo Usuário'}</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <form id="userForm" onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Nome Completo</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {!editUser ? (
                    <div className="mb-3">
                      <label className="form-label">Papel</label>
                      <select 
                        className="form-select"
                        name="tipo_usuario"
                        value={formData.tipo_usuario}
                        onChange={handleInputChange}
                      >
                        <option value="1">Aluno</option>
                        <option value="2">Professor</option>
                        <option value="3">Administrador</option>
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3">
                        <label className="form-label text-muted">Papel</label>
                        <input 
                            type="text" 
                            className="form-control bg-light" 
                            value={TIPO_USUARIO_MAP[formData.tipo_usuario]} 
                            disabled 
                        />
                        <small className="text-muted">O papel do usuário não pode ser alterado.</small>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">
                      {editUser ? "Nova Senha (opcional)" : "Senha"}
                    </label>
                    <input 
                      type="password" 
                      className="form-control"
                      name="senha"
                      value={formData.senha}
                      onChange={handleInputChange}
                      required={!editUser} 
                      placeholder={editUser ? "Deixe em branco para manter a atual" : ""}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>Cancelar</button>
                <button type="submit" form="userForm" className="btn btn-primary">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Exclusão</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja excluir o usuário <b>{deleteUser.nome}</b>?</p>
                <div className="alert alert-warning mb-0 small">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Esta ação é irreversível.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Excluir Definitivamente</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosPage;