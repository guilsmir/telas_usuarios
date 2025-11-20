import { NavLink, Outlet, useLocation } from "react-router-dom";
import { type MenuLink } from "../types/api";
import { type MouseEvent } from "react";

interface SidebarLayoutProps {
  menuItems: MenuLink[];
}

export default function SidebarLayout({ menuItems }: SidebarLayoutProps) {
  const { pathname } = useLocation();

  const handleMenuClick = (
    e: MouseEvent<HTMLAnchorElement>,
    itemPath: string
  ) => {
    const calendarPath = "/";

    if (pathname === calendarPath && itemPath !== calendarPath) {
      e.preventDefault();

      setTimeout(() => {
        window.location.href = itemPath;
      }, 0);

      return;
    }
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
