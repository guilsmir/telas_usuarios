import React, { useState } from "react";

declare const process: any;

type LoginPageProps = {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
};

function LoginPage({ onLoginSuccess, onGoToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email); 
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Falha ao realizar login. Verifique suas credenciais.");
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("isLogged", "true");

      onLoginSuccess();

    } catch (err: any) {
      console.error("Erro de login:", err);
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="card-header bg-white text-center py-4 border-0">
          <h3 className="mb-1 fw-bold text-primary">
            <i className="bi bi-calendar-check me-2"></i>
            Sistema de Reservas
          </h3>
          <p className="text-muted mb-0">Entre para gerenciar suas salas</p>
        </div>
        
        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  id="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="password" className="form-label fw-semibold mb-0">Senha</label>
                <a href="#" className="small text-decoration-none text-muted">Esqueceu?</a>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-0"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 fw-bold mb-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Entrando...
                </>
              ) : (
                "ENTRAR"
              )}
            </button>

            <div className="text-center">
              <span className="text-muted small">Não tem uma conta? </span>
              <button
                type="button"
                className="btn btn-link p-0 align-baseline fw-bold text-decoration-none"
                onClick={onGoToRegister}
                style={{ fontSize: '0.875em' }}
              >
                Cadastre-se
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;