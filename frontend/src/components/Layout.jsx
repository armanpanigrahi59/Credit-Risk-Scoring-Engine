import { BarChart3, FilePlus2, LayoutDashboard, ListChecks, LogOut, Settings } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications/new", label: "New Application", icon: FilePlus2 },
  { to: "/applications", label: "Applications List", icon: ListChecks },
  { to: "/dashboard", label: "Reports", icon: BarChart3 },
  { to: "/dashboard", label: "Settings", icon: Settings }
];

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard">
          <span>CR</span>
          <strong>RiskEngine</strong>
        </Link>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.label} to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
        <small>{user?.email}</small>
      </aside>
      <main className="dashboard-shell">{children}</main>
    </div>
  );
}
