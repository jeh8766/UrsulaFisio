import { NavLink, useLocation } from 'react-router-dom';
import './ModuleLayout.css';

type ModuleLayoutProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: React.ReactNode;
};

const navItems = [
  { label: 'Visão geral', path: '/dashboard', icon: '⌂' },
  { label: 'Paciente', path: '/paciente', icon: '♙' },
  { label: 'Agenda', path: '/agenda', icon: '▦' },
  { label: 'Prontuários', path: '/prontuarios', icon: '▤' },
  { label: 'Financeiro', path: '/financeiro', icon: 'R$' },
];

export default function ModuleLayout({ title, subtitle, eyebrow = 'VITTAFISIO', children }: ModuleLayoutProps) {
  const location = useLocation();
  return (
    <div className="module-shell">
      <aside className="module-sidebar">
        <NavLink to="/dashboard" className="module-brand" aria-label="VittaFisio - visão geral">
          <span className="module-brand-mark">✳</span>
          <span>Vitta<span>Fisio</span></span>
        </NavLink>
        <div className="module-profile">
          <div className="module-avatar">U</div>
          <div><strong>Fisioterapeuta</strong><small>Área profissional</small></div>
          <span className="profile-status" />
        </div>
        <p className="module-nav-label">MENU PRINCIPAL</p>
        <nav className="module-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `module-nav-link${isActive || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) ? ' active' : ''}`}>
              <span className="module-nav-icon">{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="module-sidebar-bottom">
          <div className="module-help-icon">?</div>
          <div><strong>Precisa de ajuda?</strong><small>Consulte o suporte</small></div>
        </div>
      </aside>
      <main className="module-main">
        <header className="module-topbar">
          <div className="module-breadcrumb">VittaFisio <span>/</span> <strong>{title}</strong></div>
          <div className="module-top-actions"><span className="module-date">Área de trabalho</span><button className="module-notification" aria-label="Notificações" title="Notificações">♧<i /></button><div className="module-avatar small">U</div></div>
        </header>
        <section className="module-page-heading">
          <div><p className="module-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="module-subtitle">{subtitle}</p></div>
          <div className="module-heading-mark">✳</div>
        </section>
        <div className="module-content">{children}</div>
        <footer className="module-footer"><span>© 2026 VittaFisio</span><span>Cuidado organizado, atendimento humanizado.</span></footer>
      </main>
    </div>
  );
}
