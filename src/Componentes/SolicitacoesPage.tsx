// src/Componentes/SolicitacoesPage.tsx

import { useMemo, useState } from "react";
import { type SolicitacaoMestra, type ReservaItem } from "../types/api";

// ===============================================
// DADOS MOCK (como exemplo)
// ===============================================
const MOCK_SOLICITACOES: SolicitacaoMestra[] = [
  {
    id_solicitacao: "REQ-001",
    solicitante: "Jonas Nascimento",
    email_solicitante: "jonas@uepa.br",
    proposito: "Preenchimento de lacunas curriculares.",
    titulo_evento: "Minicurso de Introdução à IA",
    num_participantes: 25,
    data_solicitacao: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    itens_reserva: [
      {
        id_item: "IT-001",
        fk_sala: 101,
        nome_sala: "Laboratório A",
        data: "2025-10-28",
        horario_inicio: "09:00",
        horario_saida: "10:30",
        tem_conflito: true,
        status_item: "pendente",
      },
      {
        id_item: "IT-002",
        fk_sala: 202,
        nome_sala: "Sala 202",
        data: "2025-10-28",
        horario_inicio: "10:30",
        horario_saida: "12:00",
        tem_conflito: false,
        status_item: "pendente",
      },
    ],
    status_geral: "pendente",
  },
  {
    id_solicitacao: "REQ-002",
    solicitante: "Maria Silva",
    email_solicitante: "maria@uepa.br",
    proposito: "Reunião de equipe de projeto de pesquisa.",
    titulo_evento: "Reunião de Projeto Hórus",
    num_participantes: 8,
    data_solicitacao: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    itens_reserva: [
      {
        id_item: "IT-003",
        fk_sala: 305,
        nome_sala: "Sala 305",
        data: "2025-10-29",
        horario_inicio: "14:00",
        horario_saida: "16:00",
        tem_conflito: false,
        status_item: "pendente",
      },
    ],
    status_geral: "pendente",
  },
  {
    id_solicitacao: "REQ-003",
    solicitante: "Paulo Santos",
    email_solicitante: "paulo@uepa.br",
    proposito: "Defesa de TCC e Reunião da Banca",
    titulo_evento: "Defesa de TCC - Automação",
    num_participantes: 15,
    data_solicitacao: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 3
    ).toISOString(),
    itens_reserva: [
      {
        id_item: "IT-004",
        fk_sala: 101,
        nome_sala: "Laboratório A",
        data: "2025-11-01",
        horario_inicio: "15:00",
        horario_saida: "17:00",
        tem_conflito: true,
        status_item: "pendente",
      },
    ],
    status_geral: "pendente",
  },
];

// ===============================================
// MODAL DE ANÁLISE (POP-UP)
// ===============================================

interface ModalProps {
  solicitacao: SolicitacaoMestra;
  onClose: () => void;
  // Ação para processar a solicitação inteira (botões do rodapé)
  onProcessarSolicitacao: (
    solicitacaoId: string,
    acao: "aprovar" | "negar"
  ) => void;
  // Ação para processar um item específico (botões individuais)
  onProcessarItem: (itemId: string, acao: "aprovar" | "negar") => void;
}

function AnaliseModal({
  solicitacao,
  onClose,
  onProcessarSolicitacao,
  onProcessarItem,
}: ModalProps) {
  const totalConflitos = solicitacao.itens_reserva.filter(
    (i) => i.tem_conflito
  ).length;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
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
          <div className="modal-content shadow-lg rounded-3">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-bold text-dark">
                Analisar Solicitação: {solicitacao.id_solicitacao}
              </h5>
              {totalConflitos > 0 && (
                <span className="badge bg-danger text-white ms-3 p-2 rounded-pill">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>{" "}
                  CONFLITO DETECTADO ({totalConflitos})
                </span>
              )}
              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-4">
              <h6 className="text-primary mb-3">
                <i className="bi bi-tag-fill me-2"></i>
                {solicitacao.titulo_evento}
              </h6>

              <div className="row g-2 mb-4 small text-muted">
                <div className="col-sm-6">
                  <i className="bi bi-person me-2"></i> **Solicitante:**{" "}
                  {solicitacao.solicitante}
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-envelope me-2"></i> **Email:**{" "}
                  {solicitacao.email_solicitante}
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-people me-2"></i> **Participantes:**{" "}
                  {solicitacao.num_participantes}
                </div>
                <div className="col-sm-6">
                  <i className="bi bi-clock me-2"></i> **Solicitado em:**{" "}
                  {new Date(solicitacao.data_solicitacao).toLocaleString(
                    "pt-BR"
                  )}
                </div>
              </div>

              <strong className="d-block mb-2">Propósito:</strong>
              <p className="alert alert-secondary p-2 small">
                {solicitacao.proposito}
              </p>

              <hr className="my-3" />

              <h6 className="fw-bold mb-3">
                Detalhes das Reservas Solicitadas:
              </h6>
              {solicitacao.itens_reserva.map((item) => (
                <div
                  key={item.id_item}
                  className={`card mb-2 ${
                    item.tem_conflito
                      ? "border-danger shadow-sm"
                      : "border-light"
                  }`}
                >
                  <div
                    className={`card-body p-3 d-flex justify-content-between align-items-center ${
                      item.tem_conflito ? "bg-danger-subtle" : "bg-white"
                    }`}
                  >
                    {/* Detalhes do Item */}
                    <div className="d-flex flex-column">
                      <strong
                        className={`mb-1 ${
                          item.tem_conflito ? "text-danger" : "text-dark"
                        }`}
                      >
                        <i
                          className={`bi bi-door-closed-fill me-2 ${
                            item.tem_conflito ? "text-danger" : "text-primary"
                          }`}
                        ></i>
                        {item.nome_sala}
                        {item.tem_conflito && (
                          <span className="small text-danger ms-2">
                            (CONFLITO DE DISPONIBILIDADE/DUPLICIDADE)
                          </span>
                        )}
                      </strong>
                      <small className="text-muted ms-4">
                        <i className="bi bi-calendar-event me-1"></i>{" "}
                        {item.data} | <i className="bi bi-clock me-1"></i>{" "}
                        {item.horario_inicio} - {item.horario_saida}
                      </small>
                    </div>

                    {/* ================================================== */}
                    {/*  Botões de ação individuais            */}
                    {/* ================================================== */}
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => onProcessarItem(item.id_item, "aprovar")}
                        disabled={item.status_item !== "pendente"}
                      >
                        <i className="bi bi-check-lg"></i> Aprovar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onProcessarItem(item.id_item, "negar")}
                        disabled={item.status_item !== "pendente"}
                      >
                        <i className="bi bi-x-lg"></i> Negar
                      </button>
                    </div>
                    {/* ================================================== */}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                <i className="bi bi-x-lg me-1"></i> Fechar
              </button>

              {/* Ações em Massa - Canto Inferior Direito */}
              <div>
                <button
                  type="button"
                  className="btn btn-danger me-2 shadow-sm"
                  onClick={() =>
                    onProcessarSolicitacao(solicitacao.id_solicitacao, "negar")
                  }
                >
                  <i className="bi bi-trash-fill me-1"></i> Negar Tudo
                </button>
                <button
                  type="button"
                  className="btn btn-success shadow-sm"
                  onClick={() =>
                    onProcessarSolicitacao(
                      solicitacao.id_solicitacao,
                      "aprovar"
                    )
                  }
                >
                  <i className="bi bi-check-lg me-1"></i> Aprovar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ===============================================
// PÁGINA PRINCIPAL DE SOLICITAÇÕES
// ===============================================

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] =
    useState<SolicitacaoMestra[]>(MOCK_SOLICITACOES);
  const [selectedSolicitacao, setSelectedSolicitacao] =
    useState<SolicitacaoMestra | null>(null);

  const totalSolicitacoes = solicitacoes.length;
  const totalConflitos = useMemo(() => {
    return solicitacoes.filter((s) =>
      s.itens_reserva.some((i) => i.tem_conflito)
    ).length;
  }, [solicitacoes]);

  /**
   * Simula o processamento da solicitação INTEIRA
   */
  const handleProcessarSolicitacao = (
    solicitacaoId: string,
    acao: "aprovar" | "negar"
  ) => {
    console.log(
      `[API CALL] Solicitação ${solicitacaoId} - Ação EM MASSA: ${acao}`
    );

    // Simulação de remoção da lista após processamento
    setSolicitacoes((prev) =>
      prev.filter((s) => s.id_solicitacao !== solicitacaoId)
    );
    setSelectedSolicitacao(null); // Fecha o modal
  };

  /**
   * Simula o processamento de um ITEM INDIVIDUAL
   */
  const handleProcessarItem = (itemId: string, acao: "aprovar" | "negar") => {
    console.log(`[API CALL] Item ${itemId} - Ação INDIVIDUAL: ${acao}`);
    // Lógica para atualizar o estado de um item (ex: mudar o status para 'aprovado')

    // Simulação:
    // 1. Encontra a solicitação
    // 2. Encontra o item
    // 3. Atualiza o status do item
    setSolicitacoes((prevSolicitacoes) => {
      return prevSolicitacoes.map((solicitacao) => {
        // Encontra a solicitação que contém o item
        const itemIndex = solicitacao.itens_reserva.findIndex(
          (i) => i.id_item === itemId
        );
        if (itemIndex === -1) {
          return solicitacao; // Não é esta solicitação, retorna como está
        }

        // Cria uma nova cópia dos itens
        const novosItens = [...solicitacao.itens_reserva];
        // Atualiza o item específico
        novosItens[itemIndex] = {
          ...novosItens[itemIndex],
          status_item: acao === "aprovar" ? "aprovado" : "negado",
        };

        // Atualiza a solicitação no modal (para refletir o estado do botão)
        if (
          selectedSolicitacao?.id_solicitacao === solicitacao.id_solicitacao
        ) {
          setSelectedSolicitacao((prevModal) =>
            prevModal ? { ...prevModal, itens_reserva: novosItens } : null
          );
        }

        return {
          ...solicitacao,
          itens_reserva: novosItens,
        };
      });
    });

    alert(
      `Item ${itemId} foi ${
        acao === "aprovar" ? "aprovado" : "negado"
      } (simulação).`
    );
  };

  // Função auxiliar para obter o resumo da sala
  const getSalaSummary = (items: ReservaItem[]) => {
    const uniqueRooms = new Set(items.map((i) => i.fk_sala));
    if (uniqueRooms.size === 1) return items[0].nome_sala;
    return `${uniqueRooms.size} sala${uniqueRooms.size > 1 ? "s" : ""}`;
  };

  // Função auxiliar para obter o resumo de data/hora
  const getDateTimeSummary = (items: ReservaItem[]) => {
    const firstItem = items[0];
    if (!firstItem) return "-";
    const datePart = firstItem.data.split("-").reverse().join("/");
    return `${datePart} às ${firstItem.horario_inicio}`;
  };

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-4 fw-bold">Gestão de Solicitações de Reserva</h3>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card text-center border-primary shadow-sm">
            <div className="card-body">
              <p className="card-text text-muted small mb-1">
                Solicitações Pendentes
              </p>
              <h4 className="card-title mb-0 text-primary fw-bold">
                {totalSolicitacoes}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card text-center border-danger shadow-sm">
            <div className="card-body">
              <p className="card-text text-muted small mb-1">
                Com Conflito (Atenção!)
              </p>
              <h4 className="card-title mb-0 text-danger fw-bold">
                {totalConflitos}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h5 className="mb-0">Lista de Análise ({totalSolicitacoes})</h5>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "15%" }}>Solicitante</th>
                <th style={{ width: "30%" }}>Propósito</th>
                <th style={{ width: "15%" }}>DATA/HORA</th>
                <th style={{ width: "10%" }}>Sala(s)</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "10%" }}>Conflito</th>
                <th style={{ width: "10%" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((s) => (
                <tr
                  key={s.id_solicitacao}
                  className={
                    s.itens_reserva.some((i) => i.tem_conflito)
                      ? "table-danger bg-opacity-10"
                      : ""
                  }
                >
                  <td>{s.solicitante}</td>
                  <td
                    title={s.proposito}
                    className="text-truncate"
                    style={{ maxWidth: 200 }}
                  >
                    {s.proposito}
                  </td>
                  <td>{getDateTimeSummary(s.itens_reserva)}</td>
                  <td>{getSalaSummary(s.itens_reserva)}</td>
                  <td>
                    <span className="badge bg-warning text-dark rounded-pill">
                      {s.status_geral.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {s.itens_reserva.some((i) => i.tem_conflito) ? (
                      <span className="text-danger fw-bold">SIM</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary shadow-sm"
                      onClick={() => setSelectedSolicitacao(s)}
                      title="Abrir detalhes e opções de aprovação"
                    >
                      Analisar
                    </button>
                  </td>
                </tr>
              ))}
              {solicitacoes.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    <i className="bi bi-check-circle-fill me-2 text-success"></i>{" "}
                    Nenhuma solicitação pendente no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Análise */}
      {selectedSolicitacao && (
        <AnaliseModal
          solicitacao={selectedSolicitacao}
          onClose={() => setSelectedSolicitacao(null)}
          onProcessarSolicitacao={handleProcessarSolicitacao}
          onProcessarItem={handleProcessarItem}
        />
      )}
    </div>
  );
}
