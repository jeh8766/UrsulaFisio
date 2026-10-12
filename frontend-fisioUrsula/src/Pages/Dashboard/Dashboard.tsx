import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import './Dashboard.css';

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

const navigation = [
  { label: 'Visão geral', to: '/dashboard', icon: 'grid' as const },
  { label: 'Paciente', to: '/paciente', icon: 'users' as const },
  { label: 'Agenda', to: '/agenda', icon: 'calendar' as const },
  { label: 'Prontuários', to: '/prontuarios', icon: 'clipboard' as const },
  { label: 'Financeiro', to: '/financeiro', icon: 'wallet' as const },
];

const appointments = [
  { time: '08:30', name: 'Mariana Costa', detail: 'Reabilitação de joelho', color: 'mint', status: 'Confirmada' },
  { time: '10:00', name: 'Roberto Almeida', detail: 'Avaliação postural', color: 'peach', status: 'Em seguida' },
  { time: '13:30', name: 'Camila Ferreira', detail: 'Fisioterapia respiratória', color: 'lavender', status: 'Confirmada' },
  { time: '15:00', name: 'Pedro Henrique', detail: 'Terapia manual', color: 'blue', status: 'Confirmada' },
];

const patients = [
  { initials: 'MC', name: 'Mariana Costa', treatment: 'Reabilitação de joelho', date: 'Hoje, 08:30', color: 'mint' },
  { initials: 'RA', name: 'Roberto Almeida', treatment: 'Avaliação postural', date: 'Hoje, 10:00', color: 'peach' },
  { initials: 'CF', name: 'Camila Ferreira', treatment: 'Fisioterapia respiratória', date: 'Hoje, 13:30', color: 'lavender' },
];

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

export default function Dashboard() {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <NavLink to="/dashboard" className="dashboard-brand" aria-label="VittaFisio - página inicial">
          <span className="dashboard-brand-mark"><Icon name="activity" size={24} /></span>
          <span>Vitta<span>Fisio</span></span>
        </NavLink>

        <div className="sidebar-caption">MENU PRINCIPAL</div>
        <nav className="dashboard-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `dashboard-nav-link${isActive ? ' active' : ''}`}>
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === 'Agenda' && <span className="nav-count">4</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon"><Icon name="activity" size={21} /></div>
          <strong>Cuide de quem cuida.</strong>
          <p>Organize sua rotina e acompanhe a evolução dos seus pacientes.</p>
          <button type="button" onClick={() => window.location.href = 'mailto:suporte@vittafisio.com'}>Falar com suporte <Icon name="arrow" size={15} /></button>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">FU</div>
          <div className="profile-info"><strong>Fisioterapeuta</strong><span>Administradora</span></div>
          <button type="button" className="icon-button profile-more" aria-label="Mais opções"><Icon name="more" /></button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb"><span>VittaFisio</span><span className="breadcrumb-slash">/</span><strong>Visão geral</strong></div>
          <div className="topbar-actions">
            <label className="dashboard-search"><Icon name="search" size={18} /><input type="search" placeholder="Buscar paciente..." aria-label="Buscar paciente" /></label>
            <button type="button" className="icon-button notification-button" aria-label="Notificações"><Icon name="bell" size={20} /><span /></button>
            <div className="topbar-divider" />
            <div className="topbar-user"><div className="profile-avatar small">FU</div><div><strong>Fisioterapeuta</strong><span>Seu espaço de trabalho</span></div></div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-eyebrow">SEGUNDA-FEIRA, 12 DE OUTUBRO</p>
              <h1>Bom dia, Fisioterapeuta <span>✳</span></h1>
              <p className="heading-description">Aqui está o resumo da sua clínica para hoje.</p>
            </div>
            <NavLink to="/agenda" className="primary-action"><Icon name="plus" size={18} /> Novo agendamento</NavLink>
          </section>

          <section className="metrics-grid" aria-label="Resumo da clínica">
            <article className="metric-card">
              <div className="metric-top"><span className="metric-icon green"><Icon name="users" size={20} /></span><span className="metric-change"><Icon name="trend" size={14} /> +8,2%</span></div>
              <p className="metric-label">Pacientes ativos</p><div className="metric-value">128</div><p className="metric-foot">Em acompanhamento</p>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span className="metric-icon peach"><Icon name="calendar" size={20} /></span><span className="metric-tag">Hoje</span></div>
              <p className="metric-label">Consultas agendadas</p><div className="metric-value">08</div><p className="metric-foot">4 pela manhã · 4 à tarde</p>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span className="metric-icon lavender"><Icon name="activity" size={20} /></span><span className="metric-change"><Icon name="trend" size={14} /> +12,5%</span></div>
              <p className="metric-label">Sessões realizadas</p><div className="metric-value">34</div><p className="metric-foot">Nesta semana</p>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span className="metric-icon blue"><Icon name="wallet" size={20} /></span><span className="metric-tag">Outubro</span></div>
              <p className="metric-label">Receita do mês</p><div className="metric-value">R$ 8.450<span className="metric-cents">,00</span></div><p className="metric-foot">Valores demonstrativos</p>
            </article>
          </section>

          <section className="dashboard-panels">
            <article className="panel appointments-panel">
              <div className="panel-heading"><div><h2>Agenda de hoje</h2><p>Seus próximos atendimentos</p></div><NavLink to="/agenda" className="subtle-link">Ver agenda <Icon name="arrow" size={15} /></NavLink></div>
              <div className="appointment-list">
                {appointments.map((appointment) => (
                  <div className="appointment-row" key={`${appointment.time}-${appointment.name}`}>
                    <div className="appointment-time"><Icon name="clock" size={15} /><span>{appointment.time}</span></div>
                    <div className={`patient-avatar ${appointment.color}`}>{initials(appointment.name)}</div>
                    <div className="appointment-info"><strong>{appointment.name}</strong><span>{appointment.detail}</span></div>
                    <span className={`appointment-status ${appointment.status === 'Em seguida' ? 'next' : ''}`}>{appointment.status}</span>
                    <button type="button" className="icon-button row-more" aria-label={`Mais opções para ${appointment.name}`}><Icon name="more" size={18} /></button>
                  </div>
                ))}
              </div>
              <NavLink to="/agenda" className="panel-bottom-link">Acessar agenda completa <Icon name="arrow" size={16} /></NavLink>
            </article>

            <article className="panel week-panel">
              <div className="panel-heading"><div><h2>Sua semana</h2><p>Visão rápida dos atendimentos</p></div><button type="button" className="icon-button" aria-label="Opções da semana"><Icon name="more" /></button></div>
              <div className="week-summary"><div><span className="week-summary-label">Atendimentos</span><strong>26</strong></div><div className="week-summary-note"><span className="summary-dot" /> Semana atual</div></div>
              <div className="week-chart" aria-label="Atendimentos por dia da semana">
                {[{ day: 'Seg', value: 72 }, { day: 'Ter', value: 90 }, { day: 'Qua', value: 58 }, { day: 'Qui', value: 82 }, { day: 'Sex', value: 44 }, { day: 'Sáb', value: 25 }, { day: 'Dom', value: 12 }].map((day) => (
                  <div className="chart-column" key={day.day}><div className="chart-track"><div className={`chart-bar ${day.day === 'Ter' ? 'highlight' : ''}`} style={{ height: `${day.value}%` }} /></div><span>{day.day}</span></div>
                ))}
              </div>
              <div className="week-footer"><span><span className="legend-dot" /> Atendimentos agendados</span><span className="week-footer-value"><Icon name="trend" size={14} /> Semana produtiva</span></div>
            </article>
          </section>

          <section className="panel recent-panel">
            <div className="panel-heading"><div><h2>Próximos pacientes</h2><p>Acompanhe quem você atenderá hoje</p></div><NavLink to="/paciente" className="subtle-link">Ver pacientes <Icon name="arrow" size={15} /></NavLink></div>
            <div className="patients-table-wrap">
              <table className="patients-table">
                <thead><tr><th>Paciente</th><th>Tratamento</th><th>Data e horário</th><th>Status</th><th aria-label="Ações" /></tr></thead>
                <tbody>{patients.map((patient) => <tr key={patient.name}><td><div className="table-patient"><div className={`patient-avatar ${patient.color}`}>{patient.initials}</div><strong>{patient.name}</strong></div></td><td>{patient.treatment}</td><td>{patient.date}</td><td><span className="table-status"><span /> Confirmado</span></td><td><button type="button" className="icon-button row-more" aria-label={`Mais opções para ${patient.name}`}><Icon name="more" size={18} /></button></td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <p className="dashboard-disclaimer">Painel demonstrativo — conecte os dados reais da aplicação para atualizar os indicadores e agendamentos.</p>
        </div>
      </main>
    </div>
  );
}
