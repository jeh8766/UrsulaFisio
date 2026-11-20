
import { NavLink } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import './Dashboard.css';

const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

type IconName =
  | 'grid'
  | 'users'
  | 'calendar'
  | 'clipboard'
  | 'wallet'
  | 'settings'
  | 'search'
  | 'bell'
  | 'arrow'
  | 'clock'
  | 'check'
  | 'plus'
  | 'more'
  | 'trend'
  | 'activity';

type TipoAgendamento = 'AVALIACAO' | 'ATENDIMENTO';

type StatusAgendamento =
  | 'CANCELADO'
  | 'CONFIRMADO'
  | 'PENDENTE'
  | 'CONCLUIDO';

type AgendamentoApi = {
  id: number;
  pacienteId: number;
  nome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoAgendamento: TipoAgendamento;
  statusAgendamento: StatusAgendamento;
};

type AtendimentoApi = {
  id: number;
  data: string;
  statusAtendimento: string;
  pacienteId?: number;
  pacienteNome?: string;
};

type PacienteApi = {
  id: number;
  nome: string;
  ativo: boolean;
};

type ResumoFinanceiro = {
  inicio: string;
  fim: string;
  totalRecebido: number | string;
};

type Appointment = {
  id: number;
  pacienteId: number;
  time: string;
  name: string;
  detail: string;
  color: string;
  status: StatusAgendamento;
  date: string;
};

type PatientRow = {
  id: number;
  initials: string;
  name: string;
  treatment: string;
  date: string;
  color: string;
  status: StatusAgendamento;
};

type DaySummary = {
  day: string;
  date: string;
  value: number;
};

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
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
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5M9 11h6M9 15h6" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 9h18M16 14h.01M7 5V3h10v2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.1.9-1.1 1.9-1.4-.5a8 8 0 0 1-1.6.9l-.3 1.5h-2.2l-.3-1.5a8 8 0 0 1-1.7-.9l-1.4.5-1.1-1.9 1.1-.9a7 7 0 0 1 0-1.9l-1.1-.9 1.1-1.9 1.4.5a8 8 0 0 1 1.7-.9l.3-1.5h2.2l.3 1.5a8 8 0 0 1 1.6.9l1.4-.5 1.1 1.9-1.1.9a7 7 0 0 1-.1 1.8Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    trend: (
      <>
        <path d="m3 17 6-6 4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    activity: (
      <>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </>
    ),
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

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + difference);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

function getSunday(date: Date): Date {
  const sunday = getMonday(date);
  sunday.setDate(sunday.getDate() + 6);
  return sunday;
}

function getMonthStart(date: Date): string {
  return formatDateLocal(
    new Date(date.getFullYear(), date.getMonth(), 1)
  );
}

function getMonthEnd(date: Date): string {
  return formatDateLocal(
    new Date(date.getFullYear(), date.getMonth() + 1, 0)
  );
}

function formatCurrency(value: number | string | null | undefined): string {
  const numericValue = Number(value ?? 0);

  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatTime(time: string): string {
  return time?.slice(0, 5) || '--:--';
}

function formatAppointmentType(type: TipoAgendamento): string {
  return type === 'AVALIACAO' ? 'Avaliação' : 'Atendimento';
}

function formatAppointmentStatus(status: StatusAgendamento): string {
  switch (status) {
    case 'CONFIRMADO':
      return 'Confirmado';
    case 'PENDENTE':
      return 'Pendente';
    case 'CONCLUIDO':
      return 'Concluído';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return status;
  }
}

function getAvatarColor(index: number): string {
  const colors = ['mint', 'peach', 'lavender', 'blue'];
  return colors[index % colors.length];
}

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>;

    if (Array.isArray(data.content)) {
      return data.content as T[];
    }

    if (Array.isArray(data.data)) {
      return data.data as T[];
    }

    if (Array.isArray(data.pacientes)) {
      return data.pacientes as T[];
    }

    if (Array.isArray(data.agendamentos)) {
      return data.agendamentos as T[];
    }

    if (Array.isArray(data.atendimentos)) {
      return data.atendimentos as T[];
    }
  }

  return [];
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao consultar ${endpoint}`);
  }

  return response.json();
}

export default function Dashboard() {
  const [activePatients, setActivePatients] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [attendances, setAttendances] = useState<AtendimentoApi[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayString = formatDateLocal(today);

  const monday = getMonday(today);
  const sunday = getSunday(today);

  const weekStart = formatDateLocal(monday);
  const weekEnd = formatDateLocal(sunday);

  const monthStart = getMonthStart(today);
  const monthEnd = getMonthEnd(today);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    const results = await Promise.allSettled([
      fetchApi<unknown>('/pacientes?ativo=true'),

      fetchApi<unknown>(
        `/agendamentos?inicio=${todayString}&fim=${todayString}`
      ),

      fetchApi<unknown>(
        `/atendimentos/data?dataInicio=${weekStart}&dataFim=${weekEnd}`
      ),

      fetchApi<ResumoFinanceiro>(
        `/financeiro/resumo?inicio=${monthStart}&fim=${monthEnd}`
      ),
    ]);

    const [
      patientsResult,
      appointmentsResult,
      attendancesResult,
      financeResult,
    ] = results;

    if (patientsResult.status === 'fulfilled') {
      const patients = extractArray<PacienteApi>(patientsResult.value);
      setActivePatients(patients.length);
    } else {
      console.error('Erro ao carregar pacientes:', patientsResult.reason);
      setActivePatients(0);
    }

    if (appointmentsResult.status === 'fulfilled') {
      const apiAppointments = extractArray<AgendamentoApi>(
        appointmentsResult.value
      );

      const mappedAppointments: Appointment[] = apiAppointments
        .filter((item) => item.statusAgendamento !== 'CANCELADO')
        .map((item, index) => ({
          id: item.id,
          pacienteId: item.pacienteId,
          time: formatTime(item.horaInicio),
          name: item.nome,
          detail: formatAppointmentType(item.tipoAgendamento),
          color: getAvatarColor(index),
          status: item.statusAgendamento,
          date: item.data,
        }))
        .sort((a, b) => a.time.localeCompare(b.time));

      setAppointments(mappedAppointments);
    } else {
      console.error(
        'Erro ao carregar agendamentos:',
        appointmentsResult.reason
      );
      setAppointments([]);
    }

    if (attendancesResult.status === 'fulfilled') {
      const apiAttendances = extractArray<AtendimentoApi>(
        attendancesResult.value
      );

      setAttendances(apiAttendances);
    } else {
      console.error(
        'Erro ao carregar atendimentos:',
        attendancesResult.reason
      );
      setAttendances([]);
    }

    if (financeResult.status === 'fulfilled') {
      setMonthlyRevenue(
        Number(financeResult.value.totalRecebido ?? 0)
      );
    } else {
      console.error(
        'Erro ao carregar resumo financeiro:',
        financeResult.reason
      );
      setMonthlyRevenue(0);
    }

    setLoading(false);
  }, [todayString, weekStart, weekEnd, monthStart, monthEnd]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const todayAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.date === todayString
    );
  }, [appointments, todayString]);

  const completedAttendances = useMemo(() => {
    return attendances.filter(
      (attendance) => attendance.statusAtendimento === 'ATENDIDO'
    );
  }, [attendances]);

  const weekDays = useMemo<DaySummary[]>(() => {
    const days: DaySummary[] = [];
    const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let index = 0; index < 7; index++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const dateString = formatDateLocal(date);

      const count = completedAttendances.filter(
        (attendance) => attendance.data === dateString
      ).length;

      days.push({
        day: labels[date.getDay()],
        date: dateString,
        value: count,
      });
    }

    return days;
  }, [completedAttendances, monday]);

  const maxChartValue = Math.max(
    1,
    ...weekDays.map((day) => day.value)
  );

  const chartDays = weekDays.map((day) => ({
    ...day,
    height:
      day.value === 0
        ? 0
        : Math.max(8, (day.value / maxChartValue) * 100),
  }));

  const upcomingAppointments = useMemo(() => {
    const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(
      today.getMinutes()
    ).padStart(2, '0')}`;

    return todayAppointments
      .filter((appointment) => appointment.time >= currentTime)
      .slice(0, 3);
  }, [todayAppointments, today]);

  const patientRows: PatientRow[] = useMemo(() => {
    const source =
      upcomingAppointments.length > 0
        ? upcomingAppointments
        : todayAppointments.slice(0, 3);

    return source.map((appointment, index) => ({
      id: appointment.id,
      initials: initials(appointment.name),
      name: appointment.name,
      treatment: appointment.detail,
      date: `Hoje, ${appointment.time}`,
      color: getAvatarColor(index),
      status: appointment.status,
    }));
  }, [upcomingAppointments, todayAppointments]);

  const currentDayLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const monthLabel = today.toLocaleDateString('pt-BR', {
    month: 'long',
  });

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <NavLink
          to="/dashboard"
          className="dashboard-brand"
          aria-label="VittaFisio - página inicial"
        >
          <span className="dashboard-brand-mark">
            <Icon name="activity" size={24} />
          </span>
          <span>
            Vitta<span>Fisio</span>
          </span>
        </NavLink>

        <div className="sidebar-caption">MENU PRINCIPAL</div>

        <nav className="dashboard-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `dashboard-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>

              {item.label === 'Agenda' && (
                <span className="nav-count">
                  {todayAppointments.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

                <div className="sidebar-help">
          <div className="help-icon">
            <Icon name="activity" size={21} />
          </div>

          <strong>Cuidar é transformar vidas.</strong>

          <p>
            Cada evolução começa com atenção, dedicação e cuidado.
          </p>

          <span className="sidebar-help-decoration">
            VittaFisio · Cuidado humanizado
          </span>
        </div>

       
      </aside>

      <main className="dashboard-main">
        {/* Cabeçalho simplificado: somente o caminho da página */}
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            <span>VittaFisio</span>
            <span className="breadcrumb-slash">/</span>
            <strong>Visão geral</strong>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-heading">
            <div>
              <p className="dashboard-eyebrow">
                {currentDayLabel.toUpperCase()}
              </p>

              <h1>Bom dia, Fisioterapeuta</h1>

              <p className="heading-description">
                Aqui está o resumo da sua clínica para hoje.
              </p>
            </div>

            <NavLink to="/agenda" className="primary-action">
              <Icon name="plus" size={18} />
              Novo agendamento
            </NavLink>
          </section>

          <section className="metrics-grid" aria-label="Resumo da clínica">
            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon green">
                  <Icon name="users" size={20} />
                </span>
              </div>

              <p className="metric-label">Pacientes ativos</p>

              <div className="metric-value">
                {loading ? '...' : activePatients}
              </div>

              <p className="metric-foot">Em acompanhamento</p>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon peach">
                  <Icon name="calendar" size={20} />
                </span>

                <span className="metric-tag">Hoje</span>
              </div>

              <p className="metric-label">Consultas agendadas</p>

              <div className="metric-value">
                {loading
                  ? '...'
                  : String(todayAppointments.length).padStart(2, '0')}
              </div>

              <p className="metric-foot">
                Compromissos não cancelados
              </p>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon lavender">
                  <Icon name="activity" size={20} />
                </span>
              </div>

              <p className="metric-label">Sessões realizadas</p>

              <div className="metric-value">
                {loading ? '...' : completedAttendances.length}
              </div>

              <p className="metric-foot">Nesta semana</p>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-icon blue">
                  <Icon name="wallet" size={20} />
                </span>

                <span className="metric-tag">{monthLabel}</span>
              </div>

              <p className="metric-label">Receita do mês</p>

              <div className="metric-value">
                {loading ? '...' : formatCurrency(monthlyRevenue)}
              </div>

              <p className="metric-foot">
                Valores efetivamente recebidos
              </p>
            </article>
          </section>

          <section className="dashboard-panels">
            <article className="panel appointments-panel">
              <div className="panel-heading">
                <div>
                  <h2>Agenda de hoje</h2>
                  <p>Seus próximos atendimentos</p>
                </div>

                <NavLink to="/agenda" className="subtle-link">
                  Ver agenda <Icon name="arrow" size={15} />
                </NavLink>
              </div>

              <div className="appointment-list">
                {todayAppointments.length === 0 ? (
                  <p className="dashboard-empty">
                    {loading
                      ? 'Carregando agendamentos...'
                      : 'Nenhum agendamento para hoje.'}
                  </p>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div
                      className="appointment-row"
                      key={appointment.id}
                    >
                      <div className="appointment-time">
                        <Icon name="clock" size={15} />
                        <span>{appointment.time}</span>
                      </div>

                      <div className={`patient-avatar ${appointment.color}`}>
                        {initials(appointment.name)}
                      </div>

                      <div className="appointment-info">
                        <strong>{appointment.name}</strong>
                        <span>{appointment.detail}</span>
                      </div>

                      <span
                        className={`appointment-status ${
                          appointment.status === 'PENDENTE' ? 'next' : ''
                        }`}
                      >
                        {formatAppointmentStatus(appointment.status)}
                      </span>

                      <button
                        type="button"
                        className="icon-button row-more"
                        aria-label={`Mais opções para ${appointment.name}`}
                      >
                        <Icon name="more" size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <NavLink to="/agenda" className="panel-bottom-link">
                Acessar agenda completa <Icon name="arrow" size={16} />
              </NavLink>
            </article>

            <article className="panel week-panel">
              <div className="panel-heading">
                <div>
                  <h2>Sua semana</h2>
                  <p>Visão rápida dos atendimentos</p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  aria-label="Atualizar dados"
                  onClick={loadDashboard}
                >
                  <Icon name="more" />
                </button>
              </div>

              <div className="week-summary">
                <div>
                  <span className="week-summary-label">
                    Atendimentos realizados
                  </span>

                  <strong>
                    {loading ? '...' : completedAttendances.length}
                  </strong>
                </div>

                <div className="week-summary-note">
                  <span className="summary-dot" />
                  Semana atual
                </div>
              </div>

              <div
                className="week-chart"
                aria-label="Atendimentos realizados por dia da semana"
              >
                {chartDays.map((day) => (
                  <div className="chart-column" key={day.date}>
                    <div className="chart-track">
                      <div
                        className={`chart-bar ${
                          day.date === todayString ? 'highlight' : ''
                        }`}
                        style={{ height: `${day.height}%` }}
                      />
                    </div>

                    <span>{day.day}</span>
                  </div>
                ))}
              </div>

              <div className="week-footer">
                <span>
                  <span className="legend-dot" />
                  Atendimentos realizados
                </span>

                <span className="week-footer-value">
                  <Icon name="activity" size={14} />
                  Dados da semana
                </span>
              </div>
            </article>
          </section>

          <section className="panel recent-panel">
            <div className="panel-heading">
              <div>
                <h2>Próximos pacientes</h2>
                <p>Acompanhe quem você atenderá hoje</p>
              </div>

              <NavLink to="/paciente" className="subtle-link">
                Ver pacientes <Icon name="arrow" size={15} />
              </NavLink>
            </div>

            <div className="patients-table-wrap">
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Tratamento</th>
                    <th>Data e horário</th>
                    <th>Status</th>
                    <th aria-label="Ações" />
                  </tr>
                </thead>

                <tbody>
                  {patientRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        {loading
                          ? 'Carregando pacientes...'
                          : 'Não há próximos pacientes para hoje.'}
                      </td>
                    </tr>
                  ) : (
                    patientRows.map((patient) => (
                      <tr key={patient.id}>
                        <td>
                          <div className="table-patient">
                            <div className={`patient-avatar ${patient.color}`}>
                              {patient.initials}
                            </div>

                            <strong>{patient.name}</strong>
                          </div>
                        </td>

                        <td>{patient.treatment}</td>

                        <td>{patient.date}</td>

                        <td>
                          <span className="table-status">
                            <span />
                            {formatAppointmentStatus(patient.status)}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="icon-button row-more"
                            aria-label={`Mais opções para ${patient.name}`}
                          >
                            <Icon name="more" size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="dashboard-disclaimer">
            {loading
              ? 'Carregando informações da clínica...'
              : 'Indicadores atualizados com os dados da aplicação.'}
          </p>
        </div>
      </main>
    </div>
  );
}
