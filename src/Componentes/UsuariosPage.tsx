import { useState } from "react";

import "../App.css";
import "../Auth.css";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  curso: string;
  papel: "adm" | "Solicitador";
  possuiReservas: boolean;
};

const mockUsers: Usuario[] = [
  {
    id: 1,
    nome: "Jonas Nascimento",
    email: "joao.nascimento@uepa.br",
    curso: "Engenharia de software",
    papel: "adm",
    possuiReservas: false,
  },
  {
    id: 2,
    nome: "Jonas Nascimento",
    email: "joao.nascimento@uepa.br",
    curso: "Engenharia de software",
    papel: "Solicitador",
    possuiReservas: true,
  },
];

function UsuariosPage() {
  const [users, setUsers] = useState<Usuario[]>(mockUsers);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [deleteUser, setDeleteUser] = useState<Usuario | null>(null);
  const [deleteBlockedUser, setDeleteBlockedUser] = useState<Usuario | null>(null);
  const [newUser, setNewUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const handleEdit = (user: Usuario) => setEditUser(user);
  const handleDelete = (user: Usuario) => {
    if (user.possuiReservas) setDeleteBlockedUser(user);
    else setDeleteUser(user);
  };
  const closeModals = () => {
    setEditUser(null);
    setDeleteUser(null);
    setDeleteBlockedUser(null);
    setNewUser(false);
    setNewName("");
    setNewEmail("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const created: Usuario = {
      id: nextId,
      nome: newName || "Novo Usuário",
      email: newEmail || "",
      curso: "",
      papel: "Solicitador",
      possuiReservas: false,
    };
    setUsers([created, ...users]);
    closeModals();
  };

  return (
    <div className="usuarios-dashboard">
      <h2>Gerenciamento de Usuários</h2>
      <div className="usuarios-header">
        <div className="usuarios-cards">
          <div className="usuarios-card">
            <div>Total de Usuários</div>
            <div>{users.length}</div>
          </div>
        </div>

        <div>
          <button className="btn-add-user" onClick={() => setNewUser(true)}>
            <i className="bi bi-plus-lg"></i>
            Novo Usuário
          </button>
        </div>
      </div>
      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: Usuario) => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>
                  <button className="action-btn" onClick={() => handleEdit(user)} title="Editar">
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="action-btn" onClick={() => handleDelete(user)} title="Excluir">
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar Usuário */}
      {editUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Editar Usuário</h3>
            <form>
              <label>Nome Completo</label>
              <input type="text" defaultValue={editUser.nome} />
              <label>Email</label>
              <input type="email" defaultValue={editUser.email} />
              <div className="usuarios-modal-actions">
                <button type="button" onClick={closeModals}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Excluir Usuário */}
      {deleteUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Confirmar exclusão</h3>
            <p>Tem certeza que deseja excluir o usuário <b>{deleteUser.nome}</b>?</p>
            <p className="usuarios-modal-warning">
              Esta ação não pode ser desfeita. O usuário perderá acesso imediato ao sistema e todos os dados associados serão removidos.
            </p>
            <div className="usuarios-modal-actions">
              <button onClick={closeModals}>Cancelar</button>
              <button className="btn-danger">Excluir Usuário</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exclusão Bloqueada */}
      {deleteBlockedUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Confirmar exclusão</h3>
            <p>Tem certeza que deseja excluir o usuário <b>{deleteBlockedUser.nome}</b>?</p>
            <p className="usuarios-modal-warning">
              Este usuário possui reservas ativas. Por favor, realoque ou cancele essas reservas primeiro.
            </p>
            <div className="usuarios-modal-actions">
              <button onClick={closeModals}>Cancelar</button>
              <button className="btn-primary">Ir para as reservas</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Usuário */}
      {newUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Novo Usuário</h3>
            <form onSubmit={handleCreateSubmit}>
              <label>Nome Completo</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <label>Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <div className="usuarios-modal-actions">
                <button type="button" onClick={closeModals}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosPage;