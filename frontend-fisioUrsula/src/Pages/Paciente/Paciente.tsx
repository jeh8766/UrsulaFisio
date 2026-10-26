import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Paciente.css';

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

type Patient = {
  id: number;
  name: string;
  initials: string;
  condition: string;
  phone: string;
  lastVisit: string;
  status: 'Ativo' | 'Inativo';
  color: string;
};

type ApiPatient = {
  id: number;
  nome: string;
  idade: number;
  faixaEtaria: string;
  vinculo: string;
  telefone: string;
  ativo: boolean;
  comorbidades: string[];
};

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function mapPatient(patient: ApiPatient): Patient {
  const id = Number(patient.id);
  const name = patient.nome || 'Nome não informado';

  return {
    id,
    name,
    initials: getInitials(name),

    condition:
      Array.isArray(patient.comorbidades) &&
      patient.comorbidades.length > 0
        ? patient.comorbidades.join(', ')
        : 'Não informado',

    phone: patient.telefone || 'Não informado',

    lastVisit: 'Não informado',

    status: patient.ativo ? 'Ativo' : 'Inativo',

    color: [
      'sage',
      'blue',
      'rose',
      'sand',
      'lavender',
    ][Math.abs(id) % 5],
  };
}

async function buscarPacientes(
  nome: string,
  ativo: boolean,
  signal: AbortSignal
): Promise<Patient[]> {
  const params = new URLSearchParams();

  params.set('ativo', String(ativo));

  if (nome.trim()) {
    params.set('nome', nome.trim());
  }

  const response = await fetch(
    `${API_URL}/pacientes?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Não foi possível consultar os pacientes. Erro HTTP ${response.status}.`
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      'A resposta da API não contém uma lista válida de pacientes.'
    );
  }

  return (data as ApiPatient[]).map(mapPatient);
}

export default function Pacientes() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState<
    'Todos' | 'Ativo' | 'Inativo'
  >('Todos');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        let resultado: Patient[];

        if (filter === 'Todos') {
          const [ativos, inativos] = await Promise.all([
            buscarPacientes(
              search,
              true,
              controller.signal
            ),
            buscarPacientes(
              search,
              false,
              controller.signal
            ),
          ]);

          const pacientesUnicos = new Map<number, Patient>();

          [...ativos, ...inativos].forEach((patient) => {
            pacientesUnicos.set(patient.id, patient);
          });

          resultado = Array.from(pacientesUnicos.values());
        } else {
          resultado = await buscarPacientes(
            search,
            filter === 'Ativo',
            controller.signal
          );
        }

        if (controller.signal.aborted) {
          return;
        }

        setPatients(resultado);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setPatients([]);

        setError(
          err instanceof Error
            ? err.message
            : 'Ocorreu um erro ao carregar os pacientes.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [search, filter]);

  const filtered = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase('pt-BR');

    return patients.filter((patient) => {
      const correspondeBusca =
        patient.name
          .toLocaleLowerCase('pt-BR')
          .includes(termo) ||
        patient.condition
          .toLocaleLowerCase('pt-BR')
          .includes(termo);

      const correspondeStatus =
        filter === 'Todos' || patient.status === filter;

      return correspondeBusca && correspondeStatus;
    });
  }, [patients, search, filter]);

  const totalAtivos = patients.filter(
    (patient) => patient.status === 'Ativo'
  ).length;

  const totalInativos = patients.filter(
    (patient) => patient.status === 'Inativo'
  ).length;

  return (
    <ModuleLayout
      title="Pacientes"
      subtitle="Organize os cadastros e acompanhe as informações dos seus pacientes."
      eyebrow="GESTÃO DE PACIENTES"
    >
      <div className="patients-stats">
        <article className="patient-stat-card">
          <span className="patient-stat-icon green">
            <Icon name="users" size={20} />
          </span>

          <div>
            <small>Total de pacientes</small>
            <strong>{patients.length}</strong>
            <span>Cadastros encontrados</span>
          </div>
        </article>

        <article className="patient-stat-card">
          <span className="patient-stat-icon mint">
            <Icon name="check" size={20} />
          </span>

          <div>
            <small>Pacientes ativos</small>
            <strong>{totalAtivos}</strong>
            <span>Em acompanhamento</span>
          </div>
        </article>

        <article className="patient-stat-card">
          <span className="patient-stat-icon peach">
            <Icon name="grid" size={20} />
          </span>

          <div>
            <small>Inativos</small>
            <strong>{totalInativos}</strong>
            <span>Sem acompanhamento atual</span>
          </div>
        </article>
      </div>

      <section className="patients-panel">
        <div className="patients-panel-heading">
          <div>
            <h2>Lista de pacientes</h2>
            <p>
              Consulte e gerencie os cadastros registrados.
            </p>
          </div>

          <button
            type="button"
            className="patients-primary-button"
            onClick={() => navigate('/cadastro-paciente')}
          >
            + Novo paciente
          </button>
        </div>

        <div className="patients-toolbar">
          <label className="patient-search">
            <Icon name="search" size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar paciente pelo nome..."
              aria-label="Buscar paciente pelo nome"
            />
          </label>

          <div
            className="patient-filters"
            aria-label="Filtrar pacientes"
          >
            {(['Todos', 'Ativo', 'Inativo'] as const).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'selected' : ''}
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        {error && (
          <div className="patients-empty" role="alert">
            <strong>Erro ao carregar pacientes</strong>
            <p>{error}</p>
            <p>
              Verifique se o backend está rodando e se a URL da
              API está correta.
            </p>
          </div>
        )}

        {!error && (
          <div className="patients-table-wrap">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Comorbidades</th>
                  <th>Telefone</th>
                  <th>Última consulta</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  filtered.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="patient-person">
                          <span
                            className={`patient-avatar ${patient.color}`}
                          >
                            {patient.initials}
                          </span>

                          <strong>{patient.name}</strong>
                        </div>
                      </td>

                      <td>{patient.condition}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.lastVisit}</td>

                      <td>
                        <span
                          className={`patient-status ${
                            patient.status === 'Ativo'
                              ? 'active'
                              : 'inactive'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {loading && (
              <div className="patients-empty">
                Carregando pacientes...
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="patients-empty">
                Nenhum paciente encontrado para esta busca.
              </div>
            )}
          </div>
        )}

        <div className="patients-table-footer">
          Exibindo <strong>{filtered.length}</strong> de{' '}
          <strong>{patients.length}</strong> pacientes

          <span>Dados carregados da API.</span>
        </div>
      </section>
    </ModuleLayout>
  );
}