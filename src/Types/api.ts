declare const process: any;
export const API_BASE_URL = "http://localhost:8000";

export interface Sala {
  id: number;
  codigo_sala: number;
  tipo_sala: string;
  ativada: boolean;
  sala_ativada?: boolean;
  limite_usuarios: number;
  descricao_sala: string;
  imagem: string;
}

export interface RoomType {
  id: number;
  nome: string;
}

export interface ReservaItem {
  id_item: string; 
  fk_sala: number; 
  nome_sala: string;
  data: string; 
  horario_inicio: string; 
  horario_saida: string; 
  tem_conflito: boolean; 
  status_item: 'pendente' | 'aprovado' | 'negado';
}

export interface SolicitacaoMestra {
  id_solicitacao: string;
  solicitante: string; 
  email_solicitante: string;
  proposito: string;
  titulo_evento: string; 
  num_participantes: number;
  data_solicitacao: string; 
  itens_reserva: ReservaItem[];
  status_geral: 'pendente' | 'aprovado' | 'negado' | 'parcialmente aprovado';
}

export interface MenuLink {
  path: string;
  label: string;
  icon: string; 
}

export interface FilterState { 
    actor: string; 
    action: string; 
    entity: string; 
    q: string; 
    from?: string; 
    to?: string; 
}

export interface AuditEntry {
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

export interface MenuLink {
  path: string;
  label: string;
  icon: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  grade: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface Sala {
  id: number;
  codigo_sala: number;
  tipo_sala: string;
  ativada: boolean;
  limite_usuarios: number;
  descricao_sala: string;
  imagem: string;
  sala_ativada?: boolean; 
}

export interface RoomType {
  id: number;
  nome: string;
}

export interface UsuarioAPI {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: number;
}

export interface ScheduleItem {
    id?: string;
    roomId: string;
    roomName: string;
    data: string;
    horaInicio: string;
    horaFim: string;
}

export interface ReservationData {
  id?: string;
  nome: string;
  email: string;
  descricao?: string;
  schedules: ScheduleItem[];
}

export interface ApiUser {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: number;
}

export interface ApiRoom {
  id: number;
  codigo_sala: number;
  descricao_sala: string;
  tipo_sala: string;
  sala_ativada?: boolean;
  ativada?: boolean;
}

export interface BackendReservationPayload {
  fk_usuario: number;
  fk_sala: number;
  dia_horario_inicio: string; 
  dia_horario_saida: string;  
  tipo: string;
  uso: string;
  justificativa: string;
  oficio: string;
}

export interface UserPayload {
  nome: string;
  email: string;
  tipo_usuario: number;
  senha?: string; 
}

export interface ApiUser {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: number;
}

