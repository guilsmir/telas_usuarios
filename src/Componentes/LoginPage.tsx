import React, { useState } from "react";

type LoginPageProps = {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
};

function LoginPage({ onLoginSuccess, onGoToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("raziul.cse@uepa.br");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && password) {
      alert("Login simulado com sucesso!");
      onLoginSuccess(); // Avisa o App.tsx que o login foi feito
    } else {
      alert("Por favor, preencha o email e a password.");
    }
  };

  return (
    <div className="auth-container">
      <div className="login-form-wrapper">
        <div className="auth-header">
          <h2>Login</h2>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group password-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="bi bi-eye-slash"></i>
          </div>

          <a href="#" className="auth-link">
            esqueceu sua senha ?
          </a>

          <button type="submit" className="auth-button primary">
            ENTRAR
          </button>

          <button
            type="button"
            className="auth-button secondary"
            onClick={onGoToRegister}
          >
            CADASTRAR
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;