import React, { useState, useEffect } from "react";
import { api } from "../services/api"; 

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Verificando conexão...");

  useEffect(() => {
    checkGoogleStatus();
  }, []);

  const checkGoogleStatus = async () => {
    try {
      const isConnected = await api.getGoogleStatus();
      setIsGoogleConnected(isConnected);
      setStatusMessage(isConnected ? "Sua conta Google está vinculada." : "Nenhuma conta vinculada.");
    } catch (error: any) {
      console.error("Erro status Google:", error);
      
      if (error.message.includes("401")) {
         setStatusMessage("Sessão expirada.");
      } else {
         setIsGoogleConnected(false);
         setStatusMessage("Não conectado.");
      }
    }
  };

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    try {
      const url = await api.connectGoogle();
      window.location.href = url;

    } catch (error: any) {
      console.error("Erro conexão Google:", error);
      
      if (error.message.includes("401")) {
        alert("Sessão expirada. Faça login novamente.");
        onLogout();
      } else {
        alert(`Erro ao conectar: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 className="mb-4">Configurações da Conta</h2>
      <div className="card mb-4 shadow-sm">
        <h5 className="card-header bg-white">
          <i className="bi bi-google me-2 text-primary"></i>
          Integração Google Calendar
        </h5>
        <div className="card-body text-center py-5">
          <div className="mb-4">
            {isGoogleConnected ? (
              <div className="text-success">
                <i className="bi bi-check-circle-fill" style={{ fontSize: "4rem" }}></i>
                <h4 className="mt-3">Conectado</h4>
                <p className="text-muted">{statusMessage}</p>
              </div>
            ) : (
              <div className="text-secondary">
                <i className="bi bi-cloud-slash" style={{ fontSize: "4rem" }}></i>
                <h4 className="mt-3">Desconectado</h4>
                <p className="text-muted">Conecte sua conta para sincronizar as reservas automaticamente.</p>
              </div>
            )}
          </div>

          {!isGoogleConnected ? (
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleConnectGoogle}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Redirecionando...
                </>
              ) : (
                <>
                  <i className="bi bi-google me-2"></i>
                  Conectar Conta Google
                </>
              )}
            </button>
          ) : (
            <div className="alert alert-success d-inline-block px-4">
                <i className="bi bi-shield-check me-2"></i>
                Sincronização Ativa
            </div>
          )}
        </div>
      </div>

      <div className="card border-danger shadow-sm mt-5">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 className="text-danger mb-1">
                <i className="bi bi-box-arrow-right me-2"></i>
                Encerrar Sessão
            </h5>
            <p className="text-muted mb-0 small">Deslogar do sistema de reservas.</p>
          </div>
          <button className="btn btn-danger" onClick={onLogout}>
            Sair (Logout)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;