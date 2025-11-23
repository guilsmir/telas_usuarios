import { useState, useEffect } from "react";
import "../App.css";
import "../Auth.css";

// Configuração da API
const API_BASE_URL = "http://localhost:8000";

// Tipagem simplificada 
type Usuario = {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: number; // Mantido apenas para controle interno se necessário
  possuiReservas: boolean;
};

function UsuariosPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para Modais
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [deleteUser, setDeleteUser] = useState<Usuario | null>(null);
  const [deleteBlockedUser, setDeleteBlockedUser] = useState<Usuario | null>(null);
  
  // Estados para Novo Usuário
  const [newUser, setNewUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState(""); 

  // --- Helpers ---

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // --- CRUD Operations ---

  // 1. READ (Listar)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const formattedUsers: Usuario[] = data.map((u: any) => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          tipo_usuario: u.tipo_usuario, // Guardamos, mas não mostramos na tela
          possuiReservas: false 
        }));
        setUsers(formattedUsers);
      } else {
        console.error("Erro ao buscar usuários");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. CREATE (Criar)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        nome: newName,
        email: newEmail,
        senha: newPassword,
        tipo_usuario: 1 // Cria sempre como usuário comum 
      };

      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Usuário criado com sucesso!");
        fetchUsers();
        closeModals();
      } else {
        const err = await response.json();
        alert(`Erro: ${err.detail || "Não foi possível criar"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
  };

  // 3. UPDATE (Editar)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      // Enviamos apenas nome e email. O tipo_usuario mantém o que já era.
      const payload = {
        nome: editUser.nome,
        email: editUser.email,
        tipo_usuario: editUser.tipo_usuario 
      };

      const response = await fetch(`${API_BASE_URL}/users/${editUser.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Usuário atualizado!");
        fetchUsers();
        closeModals();
      } else {
        alert("Erro ao atualizar usuário.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 4. DELETE (Remover)
  const confirmDelete = async () => {
    if (!deleteUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${deleteUser.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.status === 204) {
        alert("Usuário removido.");
        fetchUsers();
        closeModals();
      } else {
        const err = await response.json();
        alert(`Erro: ${err.detail || "Não foi possível remover"}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- UI Handlers ---

  const handleEditBtn = (user: Usuario) => setEditUser(user);
  
  const handleDeleteBtn = (user: Usuario) => {
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
    setNewPassword("");
  };

  return (
    <div className="usuarios-dashboard">
      <h2>Gerenciamento de Usuários</h2>
      
      <div className="usuarios-header">
        <div className="usuarios-cards">
          <div className="usuarios-card">
            <div>Total de Usuários</div>
            <div>{loading ? "..." : users.length}</div>
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
        {loading ? (
          <p style={{textAlign: 'center', padding: '2rem'}}>Carregando dados...</p>
        ) : (
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
                    <button className="action-btn" onClick={() => handleEditBtn(user)} title="Editar">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="action-btn" onClick={() => handleDeleteBtn(user)} title="Excluir">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAIS --- */}

      {/* 1. Modal Editar */}
      {editUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Editar Usuário</h3>
            <form onSubmit={handleEditSubmit}>
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={editUser.nome} 
                onChange={e => setEditUser({...editUser, nome: e.target.value})} 
              />
              <label>Email</label>
              <input 
                type="email" 
                value={editUser.email} 
                onChange={e => setEditUser({...editUser, email: e.target.value})} 
              />
              
              <div className="usuarios-modal-actions">
                <button type="button" onClick={closeModals}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Confirmar Exclusão */}
      {deleteUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Confirmar exclusão</h3>
            <p>Tem certeza que deseja excluir <b>{deleteUser.nome}</b>?</p>
            <p className="usuarios-modal-warning">
              Esta ação removerá o acesso do usuário ao sistema.
            </p>
            <div className="usuarios-modal-actions">
              <button onClick={closeModals}>Cancelar</button>
              <button onClick={confirmDelete} className="btn-danger">Excluir Usuário</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Exclusão Bloqueada */}
      {deleteBlockedUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Ação Bloqueada</h3>
            <p>O usuário <b>{deleteBlockedUser.nome}</b> possui reservas ativas.</p>
            <div className="usuarios-modal-actions">
              <button onClick={closeModals} className="btn-primary">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Novo Usuário */}
      {newUser && (
        <div className="usuarios-modal-bg">
          <div className="usuarios-modal">
            <button className="close-btn" onClick={closeModals}>&times;</button>
            <h3>Novo Usuário</h3>
            <form onSubmit={handleCreateSubmit}>
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                required 
              />
              
              <label>Email</label>
              <input 
                type="email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                required 
              />

              <label>Senha Inicial</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="Mínimo 6 caracteres"
              />

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
