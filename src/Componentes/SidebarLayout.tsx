// src/Componentes/SidebarLayout.tsx
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { type MenuLink } from "../types/api";
import { type MouseEvent } from "react";

interface SidebarLayoutProps {
  menuItems: MenuLink[];
}

/**
 * SidebarLayout
 * - utiliza NavLink para comportamento SPA normal
 * - intercepta clique: se estivermos na rota do calendário ("/")
 *   e o usuário clicar para ir a outra rota, forçamos navegação completa
 *   via window.location.href (garante reload).
 */
export default function SidebarLayout({ menuItems }: SidebarLayoutProps) {
  const { pathname } = useLocation();

  // Função que intercepta clique nos itens do menu
const handleMenuClick = (
  e: MouseEvent<HTMLAnchorElement>,
  itemPath: string
) => {
  const calendarPath = "/";

  // Se sair do calendário, força recarregamento
  if (pathname === calendarPath && itemPath !== calendarPath) {
    e.preventDefault();

    // Evita flash de tela e garante redirecionamento suave
    setTimeout(() => {
      window.location.href = itemPath;
    }, 0);

    return;
  }
    // Caso contrário, deixamos o NavLink controlar a navegação (SPA)
    // Não chamamos preventDefault()
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", maxHeight: "100vh" }}>
      <div
        className="d-flex flex-column flex-shrink-0 p-3 bg-light border-end"
        style={{ width: 250 }}
      >
        <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
          <img
            src="/uepa.png"
            alt="Logótipo UEPA"
            style={{
              maxHeight: "50px",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <hr />

        <ul className="nav nav-pills flex-column mb-auto">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              {/* NavLink usado para active class; onClick intercepta caso precise forçar reload */}
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : "link-dark"}`
                }
                end={item.path === "/"}
                onClick={(e) => handleMenuClick(e, item.path)}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <hr />
        <small className="text-muted text-center">Painel Administrativo</small>
      </div>

      <main className="flex-grow-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
