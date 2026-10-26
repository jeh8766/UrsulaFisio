import { NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import './ModuleLayout.css';

type IconName = 'grid' | 'users' | 'calendar' | 'clipboard' | 'wallet' | 'settings' | 'search' | 'bell' | 'arrow' | 'clock' | 'check' | 'plus' | 'more' | 'trend' | 'activity';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M9 11h6M9 15h6" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h.01M7 5V3h10v2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.1.9-1.1 1.9-1.4-.5a8 8 0 0 1-1.6.9l-.3 1.5h-2.2l-.3-1.5a8 8 0 0 1-1.7-.9l-1.4.5-1.1-1.9 1.1-.9a7 7 0 0 1 0-1.9l-1.1-.9 1.1-1.9 1.4.5a8 8 0 0 1 1.7-.9l.3-1.5h2.2l.3 1.5a8 8 0 0 1 1.6.9l1.4-.5 1.1 1.9-1.1.9a7 7 0 0 1-.1 1.8Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

type ModuleLayoutProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: React.ReactNode;
};

const navItems = [
  { label: 'Visão geral', path: '/dashboard', icon: 'grid' as IconName },
  { label: 'Paciente', path: '/paciente', icon: 'users' as IconName },
  { label: 'Agenda', path: '/agenda', icon: 'calendar' as IconName },
  { label: 'Prontuários', path: '/prontuarios', icon: 'clipboard' as IconName },
  { label: 'Financeiro', path: '/financeiro', icon: 'wallet' as IconName },
];

export default function ModuleLayout({ title, subtitle, eyebrow = 'VITTAFISIO', children }: ModuleLayoutProps) {
  const location = useLocation();
  return (
    <div className="module-shell">
      <aside className="module-sidebar">
        <NavLink to="/dashboard" className="module-brand" aria-label="VittaFisio - visão geral">
          <span className="module-brand-mark"><Icon name="activity" size={24} /></span>
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
              <span className="module-nav-icon"><Icon name={item.icon} size={19} /></span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="module-sidebar-bottom">
          <div className="module-help-icon"><Icon name="activity" size={18} /></div>
          <div><strong>Precisa de ajuda?</strong><small>Consulte o suporte</small></div>
        </div>
      </aside>
      <main className="module-main">
        <header className="module-topbar">
          <div className="module-breadcrumb">VittaFisio <span>/</span> <strong>{title}</strong></div>
          <div className="module-top-actions">
            <span className="module-date">Área de trabalho</span>
            <button className="module-notification" aria-label="Notificações" title="Notificações">
              <Icon name="bell" size={20} /><i />
            </button>
            <div className="module-avatar small">U</div>
          </div>
        </header>
        <section className="module-page-heading">
          <div><p className="module-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="module-subtitle">{subtitle}</p></div>
          <div className="module-heading-mark"><Icon name="activity" size={28} /></div>
        </section>
        <div className="module-content">{children}</div>
        <footer className="module-footer"><span>© 2026 VittaFisio</span><span>Cuidado organizado, atendimento humanizado.</span></footer>
      </main>
    </div>
  );
}