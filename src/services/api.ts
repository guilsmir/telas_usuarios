import type { 
  Person, 
  Room, 
  ApiRoom, 
  ApiUser, 
  BackendReservationPayload, 
  UserPayload,
  Sala,
  RoomType
} from "../types/api";

declare const process: any;
const API_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

const TIPO_USUARIO_MAP: Record<number, string> = {
  1: "Aluno",
  2: "Professor",
  3: "Administrador"
};

export const api = {
  // --- AUTH ---
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!response.ok) throw new Error("Falha no login. Verifique suas credenciais.");
    
    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("isLogged", "true");
    return data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("isLogged");
  },

  getUsersRaw: async (): Promise<ApiUser[]> => {
    const response = await fetch(`${API_URL}/users/`, {
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) throw new Error("401 Unauthorized");
    if (!response.ok) throw new Error("Erro ao buscar usuários");
    
    return await response.json();
  },

  getUsers: async (): Promise<Person[]> => {
    const users = await api.getUsersRaw();
    return users.map((u) => ({
      id: String(u.id),
      name: u.nome,
      email: u.email,
      grade: TIPO_USUARIO_MAP[u.tipo_usuario] || "Outro",
      avatar: undefined 
    }));
  },

  createUser: async (payload: UserPayload): Promise<ApiUser> => {
    const response = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.detail || "Erro ao criar usuário.";
      throw new Error(msg);
    }
    return await response.json();
  },

  updateUser: async (id: number, payload: Partial<UserPayload>): Promise<ApiUser> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.detail || "Erro ao atualizar usuário.";
      throw new Error(msg);
    }
    return await response.json();
  },

  deleteUser: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Erro ao excluir usuário.");
    }
  },

  // --- SALAS ---
  getRooms: async (): Promise<Room[]> => {
    const response = await fetch(`${API_URL}/rooms/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao buscar salas");
    const data: ApiRoom[] = await response.json();

    return data
      .filter((r) => r.sala_ativada || r.ativada)
      .map((r) => ({
        id: String(r.id),
        name: r.descricao_sala || `Sala ${r.codigo_sala} (${r.tipo_sala || ''})`,
      }));
  },

  // --- RESERVAS ---
  getReservations: async (start?: string, end?: string) => {
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString();

    const params = new URLSearchParams({
        date_from: start || defaultStart,
        date_to: end || defaultEnd
    });

    const response = await fetch(`${API_URL}/reservations/?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao buscar reservas");
    const data = await response.json();
    return data.items || []; 
  },

  createReservation: async (payload: BackendReservationPayload) => {
    const response = await fetch(`${API_URL}/reservations/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erro ao criar reserva");
    }
    return await response.json();
  },

  updateReservation: async (id: string, payload: Partial<BackendReservationPayload>) => {
    const response = await fetch(`${API_URL}/reservations/${id}`, {
      method: "PUT", 
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erro ao atualizar reserva");
    }
    return await response.json();
  },

  deleteReservation: async (id: string) => {
    const response = await fetch(`${API_URL}/reservations/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao deletar reserva");
    return true;
  },

  // --- INTEGRAÇÃO GOOGLE ---
  getGoogleStatus: async (): Promise<boolean> => {
    const response = await fetch(`${API_URL}/google/status`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) throw new Error("401 Unauthorized");
    if (!response.ok) throw new Error("Erro ao verificar status do Google");

    const data = await response.json();
    
    return (
        data === true || 
        data?.connected === true || 
        data === "connected" || 
        (typeof data === 'string' && data.includes("success"))
    );
  },

  connectGoogle: async (): Promise<string> => {
    const response = await fetch(`${API_URL}/google/connect`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) throw new Error("401 Unauthorized");
    if (!response.ok) throw new Error("Erro ao iniciar conexão com Google");

    const data = await response.json();
    
    let redirectUrl = "";
    if (typeof data === 'string') {
        redirectUrl = data;
    } else if (typeof data === 'object' && data !== null) {
        redirectUrl = data.url || data.authorization_url || data.auth_url || data.redirect_url || data.link || "";
    }

    if (!redirectUrl || !redirectUrl.startsWith("http")) {
        console.error("Resposta inválida da API:", data);
        throw new Error("URL de redirecionamento não encontrada.");
    }

    return redirectUrl;
  }, 

  // --- SALAS (CRUD) ---
  getSalasRaw: async (): Promise<Sala[]> => {
    const response = await fetch(`${API_URL}/rooms/`, {
      headers: getAuthHeaders(),
    });
    if (response.status === 401) throw new Error("401 Unauthorized");
    if (!response.ok) throw new Error("Erro ao buscar salas");
    return await response.json();
  },

  createSala: async (payload: Partial<Sala>): Promise<Sala> => {
    const response = await fetch(`${API_URL}/rooms/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        sala_ativada: payload.ativada 
      }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.detail ? JSON.stringify(errData.detail) : "Erro ao criar sala.";
        throw new Error(msg);
    }
    return await response.json();
  },

  updateSala: async (id: number, payload: Partial<Sala>): Promise<Sala> => {
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...payload,
        sala_ativada: payload.ativada
      }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.detail ? JSON.stringify(errData.detail) : "Erro ao atualizar sala.";
        throw new Error(msg);
    }
    return await response.json();
  },

  deleteSala: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Erro ao excluir sala.");
  },

  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await fetch(`${API_URL}/room-types/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao buscar tipos de sala");
    return await response.json();
  },
};