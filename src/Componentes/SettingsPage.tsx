import React, { useState, useEffect } from "react";

declare const process: any;

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Verificando conexão...");

  const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || "http://localhost:8000";

  useEffect(() => {
    checkGoogleStatus();
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("access_token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const checkGoogleStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/google/status`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(), 
        } as HeadersInit,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Status Google:", data); 
        const isConnected = 
            data === true || 
            data?.connected === true || 
            data === "connected" || 
            (typeof data === 'string' && data.includes("success")); 
        
        setIsGoogleConnected(isConnected);
        setStatusMessage(isConnected ? "Sua conta Google está vinculada." : "Nenhuma conta vinculada.");
      } else {
        if (response.status === 401) {
            setStatusMessage("Sessão expirada. Faça login novamente.");
        } else {
            setIsGoogleConnected(false);
            setStatusMessage("Não conectado.");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setStatusMessage("Não foi possível verificar o status.");
    }
  };

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando conexão com Google...");
      
      const response = await fetch(`${API_BASE_URL}/google/connect`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        } as HeadersInit,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Resposta BRUTA da API:", data);

        let redirectUrl = "";

        if (typeof data === 'string') {
            redirectUrl = data;
        } else if (typeof data === 'object' && data !== null) {
            redirectUrl = data.url || data.authorization_url || data.auth_url || data.redirect_url || data.link || "";
        }

        if (redirectUrl && redirectUrl.startsWith("http")) {
            console.log("Redirecionando para:", redirectUrl);
            window.location.href = redirectUrl;
        } else {
            console.error("URL não encontrada no objeto:", data);
            alert(`A API respondeu, mas não achamos o link. \n\nO que chegou foi:\n${JSON.stringify(data, null, 2)}`);
        }

      } else {
        if (response.status === 401) {
            alert("Sessão expirada. Faça login novamente.");
            onLogout();
        } else {
            alert(`Erro na API: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Erro de comunicação com o servidor.");
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