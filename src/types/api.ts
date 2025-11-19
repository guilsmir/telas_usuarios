// src/types/api.ts

/**
 * Definições de Tipos Comuns
 * Ficheiro centralizado para interfaces de dados.
 */

export const API_BASE_URL = "http://localhost:8000";

// ===================================
// SalasPage.tsx TIPOS
// ===================================

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

// ===================================
// SolicitacoesPage.tsx TIPOS (US-08)
// ===================================

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

// ===================================
// SidebarLayout.tsx TIPOS
// ===================================

export interface MenuLink {
  path: string;
  label: string;
  icon: string; 
}

// ===================================
// AuditPage.tsx TIPOS (US-11)
// ===================================

// CORREÇÃO: Substituído 'any' pela interface real.
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