// src/Componentes/RegisterPage.tsx
import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

type RegisterPageProps = {
  onGoToLogin: () => void; // NÃO é mais usado para redirecionar após cadastro
};

function RegisterPage({ onGoToLogin }: RegisterPageProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (nome && email && senha) {
      alert("Cadastro simulado com sucesso!");

      // 🔥 LOGIN AUTOMÁTICO APÓS REGISTRO
      localStorage.setItem("isLogged", "true");

      // Chama a função para abrir a tela de login apenas se precisar (não usada agora)
      onGoToLogin();
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-container">

        <div className="register-panel left-panel">
          <h2>Bem-Vindo de volta</h2>
          <p>Acesse sua conta agora mesmo</p>
          <button className="auth-button switch-button" onClick={onGoToLogin}>
            ENTRAR
          </button>
        </div>

        <div className="register-panel right-panel">
          <div className="register-form-wrapper">
            <div className="register-logo">
              <img
                src="https://propesp.uepa.br/ppgeeca/wp-content/uploads/2025/07/2-scaled.png"
                alt="Logo Uepa"
                style={{ height: "200px" }}
              />
            </div>

            <h2>Crie sua conta</h2>
            <p className="subtitle">Cadastre seus dados</p>

            <form onSubmit={handleSubmit}>
              <div className="register-input-group">
                <i className="bi bi-person"></i>
                <input
                  type="text"
                  placeholder="NOME"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="register-input-group">
                <i className="bi bi-envelope"></i>
                <input
                  type="email"
                  placeholder="EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="register-input-group">
                <i className="bi bi-lock"></i>
                <input
                  type="password"
                  placeholder="SENHA"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-button secondary register">
                CADASTRAR
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;
