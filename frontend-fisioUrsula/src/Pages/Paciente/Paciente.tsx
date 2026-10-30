
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Paciente.css';

type Patient = {
  id: number;
  name: string;
  initials: string;
  condition: string;
  phone: string;
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

type PatientDetails = {
  id: number;
  nome: string;
  dataNascimento: string;
  idade: number;
  faixaEtaria: string;
  vinculo: string;
  nomeResponsavel: string | null;
  telefone: string;
  criadoEm: string;
  ativo: boolean;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
  complemento: string | null;
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
      patient.comorbidades?.length > 0
        ? patient.comorbidades.join(', ')
        : 'Nenhuma comorbidade',
    phone: patient.telefone || 'Não informado',
    status: patient.ativo ? 'Ativo' : 'Inativo',
    color: ['sage', 'blue', 'rose', 'sand', 'lavender'][
      Math.abs(id) % 5
    ],
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
      headers: { Accept: 'application/json' },
      credentials: 'include',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status} ao consultar pacientes.`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('A API não retornou uma lista válida de pacientes.');
  }

  return (data as ApiPatient[]).map(mapPatient);
}

function formatarData(data?: string | null): string {
  if (!data) return 'Não informado';

  const partes = data.split('T')[0].split('-');

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataHora(data?: string | null): string {
  if (!data) return 'Não informado';

  return new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function Pacientes() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] =
    useState<PatientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        let resultado: Patient[];

        if (filter === 'Todos') {
          const [ativos, inativos] = await Promise.all([
            buscarPacientes(search, true, controller.signal),
            buscarPacientes(search, false, controller.signal),
          ]);

          const unicos = new Map<number, Patient>();

          [...ativos, ...inativos].forEach((patient) => {
            unicos.set(patient.id, patient);
          });

          resultado = Array.from(unicos.values());
        } else {
          resultado = await buscarPacientes(
            search,
            filter === 'Ativo',
            controller.signal
          );
        }

        if (!controller.signal.aborted) {
          setPatients(resultado);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setPatients([]);
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar pacientes.'
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

  // Busca os dados completos sempre que um paciente é selecionado.
  useEffect(() => {
    if (!selectedPatient) {
      setPatientDetails(null);
      setDetailsError('');
      return;
    }

    const controller = new AbortController();

    async function carregarDetalhes() {
      setLoadingDetails(true);
      setDetailsError('');
      setPatientDetails(null);

      try {
        const response = await fetch(
          `${API_URL}/pacientes/${selectedPatient!.id}`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'include',
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Não foi possível carregar os detalhes. Erro HTTP ${response.status}.`
          );
        }

        const data: PatientDetails = await response.json();

        if (!controller.signal.aborted) {
          setPatientDetails(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setDetailsError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar os detalhes do paciente.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDetails(false);
        }
      }
    }

    carregarDetalhes();

    return () => controller.abort();
  }, [selectedPatient]);

  // Permite fechar o modal com a tecla Escape.
  useEffect(() => {
    if (!selectedPatient) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedPatient(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPatient]);

  const filtered = useMemo(() => {
    const termo = search.trim().toLocaleLowerCase('pt-BR');

    return patients.filter((patient) => {
      const correspondeBusca =
        patient.name.toLocaleLowerCase('pt-BR').includes(termo) ||
        patient.condition.toLocaleLowerCase('pt-BR').includes(termo);

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

  function abrirDetalhes(patient: Patient) {
    setSelectedPatient(patient);
  }

  function abrirAssociacao() {
    if (!patientDetails) return;

    const pacienteId = patientDetails.id;

    setSelectedPatient(null);
    navigate(`/pacientes/${pacienteId}/comorbidades`);
  }

  return (
    <ModuleLayout
      title="Pacientes"
      subtitle="Organize os cadastros e acompanhe as informações dos seus pacientes."
      eyebrow="GESTÃO DE PACIENTES"
    >
      <div className="patients-stats">
        <article className="patient-stat-card">
          <span className="patient-stat-icon green">♧</span>
          <div>
            <small>Total de pacientes</small>
            <strong>{patients.length}</strong>
            <span>Cadastros encontrados</span>
          </div>
        </article>

        <article className="patient-stat-card">
          <span className="patient-stat-icon mint">✓</span>
          <div>
            <small>Pacientes ativos</small>
            <strong>{totalAtivos}</strong>
            <span>Em acompanhamento</span>
          </div>
        </article>

        <article className="patient-stat-card">
          <span className="patient-stat-icon peach">○</span>
          <div>
            <small>Inativos</small>
            <strong>{totalInativos}</strong>
            <span>Sem acompanhamento atual</span>
          </div>
        </article>
      </div>

      <section className="patients-panel">
        <div className="patients-panel-actions">
          <button
            type="button"
            className="patients-secondary-button"
            onClick={() => navigate('/cadastro-comorbidade')}
          >
            + Nova comorbidade
          </button>

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
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar paciente pelo nome..."
              aria-label="Buscar paciente pelo nome"
            />
          </label>

          <div className="patient-filters" aria-label="Filtrar pacientes">
            {(['Todos', 'Ativo', 'Inativo'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'selected' : ''}
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="patients-empty" role="alert">
            <strong>Erro ao carregar pacientes</strong>
            <p>{error}</p>
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
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  filtered.map((patient) => (
                    <tr
                      key={patient.id}
                      className="patient-clickable-row"
                      onClick={() => abrirDetalhes(patient)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          abrirDetalhes(patient);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Ver detalhes de ${patient.name}`}
                    >
                      <td>
                        <div className="patient-person">
                          <span className={`patient-avatar ${patient.color}`}>
                            {patient.initials}
                          </span>
                          <strong>{patient.name}</strong>
                        </div>
                      </td>

                      <td>{patient.condition}</td>
                      <td>{patient.phone}</td>

                      <td>
                        <span
                          className={`patient-status ${
                            patient.status === 'Ativo' ? 'active' : 'inactive'
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
              <div className="patients-empty">Carregando pacientes...</div>
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

      {/* Modal de detalhes do paciente */}
      {selectedPatient && (
        <div
          className="patient-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPatient(null);
            }
          }}
        >
          <section
            className="patient-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-modal-title"
          >
            <header className="patient-modal-header">
              <div>
                <span className="patient-modal-eyebrow">
                  PRONTUÁRIO DO PACIENTE
                </span>
                <h2 id="patient-modal-title">Detalhes do paciente</h2>
              </div>

              <button
                type="button"
                className="patient-modal-close"
                onClick={() => setSelectedPatient(null)}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </header>

            {loadingDetails && (
              <div className="patient-modal-loading">
                Carregando informações do paciente...
              </div>
            )}

            {detailsError && (
              <div className="patient-modal-error" role="alert">
                {detailsError}
              </div>
            )}

            {patientDetails && (
              <>
                <div className="patient-modal-profile">
                  <span className="patient-modal-avatar">
                    {getInitials(patientDetails.nome)}
                  </span>

                  <div>
                    <h3>{patientDetails.nome}</h3>
                    <p>
                      Paciente #{patientDetails.id} ·{' '}
                      {patientDetails.ativo ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>

                <div className="patient-details-content">
                  <section className="patient-detail-section">
                    <h4>Dados pessoais</h4>
                    <div className="patient-detail-grid">
                      <div>
                        <small>Data de nascimento</small>
                        <strong>
                          {formatarData(patientDetails.dataNascimento)}
                        </strong>
                      </div>
                      <div>
                        <small>Idade</small>
                        <strong>{patientDetails.idade} anos</strong>
                      </div>
                      <div>
                        <small>Faixa etária</small>
                        <strong>{patientDetails.faixaEtaria || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Vínculo</small>
                        <strong>{patientDetails.vinculo || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Nome do responsável</small>
                        <strong>{patientDetails.nomeResponsavel || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Telefone</small>
                        <strong>{patientDetails.telefone || 'Não informado'}</strong>
                      </div>
                    </div>
                  </section>

                  <section className="patient-detail-section">
                    <h4>Endereço</h4>
                    <div className="patient-detail-grid">
                      <div>
                        <small>CEP</small>
                        <strong>{patientDetails.cep || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Estado</small>
                        <strong>{patientDetails.estado || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Cidade</small>
                        <strong>{patientDetails.cidade || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Bairro</small>
                        <strong>{patientDetails.bairro || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Rua</small>
                        <strong>{patientDetails.rua || 'Não informado'}</strong>
                      </div>
                      <div>
                        <small>Número</small>
                        <strong>{patientDetails.numero ?? 'Não informado'}</strong>
                      </div>
                      <div className="patient-detail-full">
                        <small>Complemento</small>
                        <strong>{patientDetails.complemento || 'Não informado'}</strong>
                      </div>
                    </div>
                  </section>

                  <section className="patient-detail-section">
                    <div className="patient-comorbidity-heading">
                      <h4>Comorbidades associadas</h4>
                      <span>
                        {patientDetails.comorbidades?.length || 0}
                      </span>
                    </div>

                    {patientDetails.comorbidades?.length > 0 ? (
                      <div className="patient-comorbidity-list">
                        {patientDetails.comorbidades.map((item, index) => (
                          <span key={`${item}-${index}`}>{item}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="patient-no-comorbidity">
                        Nenhuma comorbidade associada a este paciente.
                      </p>
                    )}
                  </section>

                  <section className="patient-detail-section patient-registration-info">
                    <small>Data de cadastro</small>
                    <strong>{formatarDataHora(patientDetails.criadoEm)}</strong>
                  </section>
                </div>

                <footer className="patient-modal-footer">
                  <button
                    type="button"
                    className="patient-modal-secondary"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    className="patient-modal-primary"
                    onClick={abrirAssociacao}
                  >
                    + Atribuir comorbidade
                  </button>
                </footer>
              </>
            )}
          </section>
        </div>
      )}
    </ModuleLayout>
  );
}
