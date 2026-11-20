import { useEffect, useMemo, useState, type FormEvent } from 'react';
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

type PatientForm = {
  nome: string;
  dataNascimento: string;
  vinculo: string;
  nomeResponsavel: string;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
  complemento: string;
};

type ApiPacienteComorbidade = {
  id: number;
  dataDiagnostico: string | null;
  statusDiagnostico: 'ATIVO' | 'INATIVO';
  observacao: string | null;
  pacienteNome: string;
  comorbidadeNome: string;
};

type CsrfTokenResponse = {
  token: string;
  headerName: string;
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
    condition: 'Carregando comorbidades...',
    phone: patient.telefone || 'Não informado',
    status: patient.ativo ? 'Ativo' : 'Inativo',
    color: ['sage', 'blue', 'rose', 'sand', 'lavender'][Math.abs(id) % 5],
  };
}

async function buscarComorbidadesAtivas(
  pacienteId: number,
  signal?: AbortSignal
): Promise<string[]> {
  const response = await fetch(
    `${API_URL}/paciente-comorbidade/paciente/${pacienteId}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro HTTP ${response.status} ao consultar as comorbidades do paciente.`
    );
  }

  const vinculos: ApiPacienteComorbidade[] = await response.json();

  return vinculos
    .filter((vinculo) => vinculo.statusDiagnostico === 'ATIVO')
    .map((vinculo) => vinculo.comorbidadeNome);
}

async function buscarPacientes(
  nome: string,
  ativo: boolean,
  signal: AbortSignal
): Promise<Patient[]> {
  const params = new URLSearchParams();
  params.set('ativo', String(ativo));

  if (nome.trim()) params.set('nome', nome.trim());

  const response = await fetch(`${API_URL}/pacientes?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status} ao consultar pacientes.`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('A API não retornou uma lista válida de pacientes.');
  }

  const pacientes = (data as ApiPatient[]).map(mapPatient);

  return Promise.all(
    pacientes.map(async (patient) => {
      const comorbidades = await buscarComorbidadesAtivas(
        patient.id,
        signal
      );

      return {
        ...patient,
        condition:
          comorbidades.length > 0
            ? comorbidades.join(', ')
            : 'Nenhuma comorbidade',
      };
    })
  );
}

function formatarData(data?: string | null): string {
  if (!data) return 'Não informado';
  const partes = data.split('T')[0].split('-');
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataHora(data?: string | null): string {
  if (!data) return 'Não informado';
  const dataConvertida = new Date(data);
  if (Number.isNaN(dataConvertida.getTime())) return data;
  return dataConvertida.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

async function obterCsrf(): Promise<CsrfTokenResponse> {
  const response = await fetch(`${API_URL}/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Não foi possível obter o token de segurança.');
  }

  return response.json();
}

export default function Pacientes() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshList, setRefreshList] = useState(0);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] =
    useState<PatientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [editando, setEditando] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [inativando, setInativando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [sucessoAcao, setSucessoAcao] = useState('');
  const [formPaciente, setFormPaciente] = useState<PatientForm>({
    nome: '',
    dataNascimento: '',
    vinculo: '',
    nomeResponsavel: '',
    telefone: '',
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: 1,
    complemento: '',
  });

  // Carrega a listagem conforme pesquisa, filtro e alterações realizadas.
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

        if (!controller.signal.aborted) setPatients(resultado);
      } catch (err) {
        if (controller.signal.aborted) return;
        setPatients([]);
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar pacientes.'
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [search, filter, refreshList]);

  // Busca os dados completos sempre que um paciente é selecionado.
  useEffect(() => {
    if (!selectedPatient) {
      setPatientDetails(null);
      setDetailsError('');
      setLoadingDetails(false);
      return;
    }

    const pacienteId = selectedPatient.id;
    const controller = new AbortController();

    async function carregarDetalhes() {
      setLoadingDetails(true);
      setDetailsError('');
      setPatientDetails(null);

      try {
        const response = await fetch(`${API_URL}/pacientes/${pacienteId}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Não foi possível carregar os detalhes. Erro HTTP ${response.status}.`
          );
        }

        const data: PatientDetails = await response.json();
        const comorbidadesAtivas = await buscarComorbidadesAtivas(
          pacienteId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setPatientDetails({ ...data, comorbidades: comorbidadesAtivas });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setDetailsError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar os detalhes do paciente.'
        );
      } finally {
        if (!controller.signal.aborted) setLoadingDetails(false);
      }
    }

    carregarDetalhes();
    return () => controller.abort();
  }, [selectedPatient]);

  // Permite fechar o modal com a tecla Escape.
  useEffect(() => {
    if (!selectedPatient) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !salvandoEdicao && !inativando) {
        setSelectedPatient(null);
        setEditando(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPatient, salvandoEdicao, inativando]);

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
    setEditando(false);
    setErroAcao('');
    setSucessoAcao('');
    setSelectedPatient(patient);
  }

  function iniciarEdicao() {
    if (!patientDetails) return;

    setFormPaciente({
      nome: patientDetails.nome || '',
      dataNascimento: patientDetails.dataNascimento?.slice(0, 10) || '',
      vinculo: patientDetails.vinculo || '',
      nomeResponsavel: patientDetails.nomeResponsavel || '',
      telefone: patientDetails.telefone || '',
      cep: patientDetails.cep || '',
      estado: patientDetails.estado || '',
      cidade: patientDetails.cidade || '',
      bairro: patientDetails.bairro || '',
      rua: patientDetails.rua || '',
      numero: patientDetails.numero ?? 1,
      complemento: patientDetails.complemento || '',
    });
    setErroAcao('');
    setSucessoAcao('');
    setEditando(true);
  }

  async function salvarEdicao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!patientDetails) return;

    setSalvandoEdicao(true);
    setErroAcao('');
    setSucessoAcao('');

    try {
      const csrf = await obterCsrf();
      const payload = {
        nome: formPaciente.nome.trim(),
        dataNascimento: formPaciente.dataNascimento,
        vinculo: formPaciente.vinculo,
        nomeResponsavel: formPaciente.nomeResponsavel.trim(),
        telefone: formPaciente.telefone.trim(),
        cep: formPaciente.cep.trim(),
        estado: formPaciente.estado.trim(),
        cidade: formPaciente.cidade.trim(),
        bairro: formPaciente.bairro.trim(),
        rua: formPaciente.rua.trim(),
        numero: Number(formPaciente.numero),
        complemento: formPaciente.complemento.trim(),
      };

      const response = await fetch(
        `${API_URL}/pacientes/${patientDetails.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const mensagem = await response.text();
        throw new Error(
          mensagem || `Erro HTTP ${response.status} ao atualizar paciente.`
        );
      }

      // Reconsulta o cadastro para não depender do formato do corpo do PUT.
      const detalheResponse = await fetch(
        `${API_URL}/pacientes/${patientDetails.id}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        }
      );

      if (!detalheResponse.ok) {
        throw new Error(
          'Os dados foram enviados, mas não foi possível atualizar a visualização. Reabra o paciente.'
        );
      }

      const atualizado: PatientDetails = await detalheResponse.json();
      const comorbidadesAtivas = await buscarComorbidadesAtivas(
        patientDetails.id
      );

      setPatientDetails({ ...atualizado, comorbidades: comorbidadesAtivas });
      setSelectedPatient((anterior) =>
        anterior
          ? {
              ...anterior,
              name: atualizado.nome,
              initials: getInitials(atualizado.nome),
              phone: atualizado.telefone || 'Não informado',
            }
          : null
      );
      setEditando(false);
      setSucessoAcao('Dados do paciente atualizados com sucesso.');
      setRefreshList((valor) => valor + 1);
    } catch (err) {
      setErroAcao(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o paciente.'
      );
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function inativarPaciente() {
    if (!patientDetails || !patientDetails.ativo) return;

    const confirmar = window.confirm(
      `Deseja realmente inativar o paciente ${patientDetails.nome}?`
    );
    if (!confirmar) return;

    setInativando(true);
    setErroAcao('');
    setSucessoAcao('');

    try {
      const csrf = await obterCsrf();
      const response = await fetch(
        `${API_URL}/pacientes/${patientDetails.id}/inativar`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            [csrf.headerName]: csrf.token,
          },
        }
      );

      if (!response.ok) {
        const mensagem = await response.text();
        throw new Error(
          mensagem || `Erro HTTP ${response.status} ao inativar paciente.`
        );
      }

      setPatientDetails((anterior) =>
        anterior ? { ...anterior, ativo: false } : null
      );
      setSelectedPatient((anterior) =>
        anterior ? { ...anterior, status: 'Inativo' } : null
      );
      setSucessoAcao('Paciente inativado com sucesso.');
      setRefreshList((valor) => valor + 1);
    } catch (err) {
      setErroAcao(
        err instanceof Error
          ? err.message
          : 'Não foi possível inativar o paciente.'
      );
    } finally {
      setInativando(false);
    }
  }

  function abrirAssociacao() {
    if (!patientDetails) return;
    const pacienteId = patientDetails.id;
    setSelectedPatient(null);
    navigate(`/pacientes/${pacienteId}/comorbidades`);
  }

  function abrirProntuarioCompleto() {
    if (!patientDetails) return;
    const pacienteId = patientDetails.id;
    setSelectedPatient(null);
    navigate(`/pacientes/${pacienteId}/prontuario`);
  }

  function atualizarCampo<K extends keyof PatientForm>(
    campo: K,
    valor: PatientForm[K]
  ) {
    setFormPaciente((anterior) => ({ ...anterior, [campo]: valor }));
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

      {selectedPatient && (
        <div
          className="patient-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPatient(null);
              setEditando(false);
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
                <h2 id="patient-modal-title">
                  {editando ? 'Editar paciente' : 'Detalhes do paciente'}
                </h2>
              </div>
              <button
                type="button"
                className="patient-modal-close"
                onClick={() => {
                  setSelectedPatient(null);
                  setEditando(false);
                }}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </header>

            {erroAcao && (
              <div className="patient-modal-error" role="alert">
                {erroAcao}
              </div>
            )}
            {sucessoAcao && (
              <div className="patient-modal-success" role="status">
                {sucessoAcao}
              </div>
            )}

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
                {editando ? (
                  <form className="patient-edit-form" onSubmit={salvarEdicao}>
                    <div className="patient-edit-grid">
                      <label>
                        Nome completo
                        <input
                          required
                          value={formPaciente.nome}
                          onChange={(event) =>
                            atualizarCampo('nome', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Data de nascimento
                        <input
                          required
                          type="date"
                          value={formPaciente.dataNascimento}
                          onChange={(event) =>
                            atualizarCampo('dataNascimento', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Telefone
                        <input
                          required
                          value={formPaciente.telefone}
                          onChange={(event) =>
                            atualizarCampo('telefone', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Vínculo
                        <input
                          required
                          value={formPaciente.vinculo}
                          onChange={(event) =>
                            atualizarCampo('vinculo', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Nome do responsável
                        <input
                          value={formPaciente.nomeResponsavel}
                          onChange={(event) =>
                            atualizarCampo('nomeResponsavel', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        CEP
                        <input
                          required
                          value={formPaciente.cep}
                          onChange={(event) =>
                            atualizarCampo('cep', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Estado
                        <input
                          required
                          maxLength={2}
                          value={formPaciente.estado}
                          onChange={(event) =>
                            atualizarCampo('estado', event.target.value.toUpperCase())
                          }
                        />
                      </label>

                      <label>
                        Cidade
                        <input
                          required
                          value={formPaciente.cidade}
                          onChange={(event) =>
                            atualizarCampo('cidade', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Bairro
                        <input
                          required
                          value={formPaciente.bairro}
                          onChange={(event) =>
                            atualizarCampo('bairro', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Rua
                        <input
                          required
                          value={formPaciente.rua}
                          onChange={(event) =>
                            atualizarCampo('rua', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Número
                        <input
                          required
                          type="number"
                          min="1"
                          value={formPaciente.numero}
                          onChange={(event) =>
                            atualizarCampo('numero', Number(event.target.value))
                          }
                        />
                      </label>

                      <label>
                        Complemento
                        <input
                          value={formPaciente.complemento}
                          onChange={(event) =>
                            atualizarCampo('complemento', event.target.value)
                          }
                        />
                      </label>
                    </div>

                    <div className="patient-edit-actions">
                      <button
                        type="button"
                        className="patient-modal-secondary"
                        onClick={() => setEditando(false)}
                        disabled={salvandoEdicao}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="patient-modal-primary"
                        disabled={salvandoEdicao}
                      >
                        {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                      </button>
                    </div>
                  </form>
                ) : (
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
                            <strong>{formatarData(patientDetails.dataNascimento)}</strong>
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
                          <span>{patientDetails.comorbidades?.length || 0}</span>
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
                        onClick={iniciarEdicao}
                      >
                        ✎ Editar dados
                      </button>
                      <button
                        type="button"
                        className="patient-modal-history"
                        onClick={abrirAssociacao}
                      >
                        + Atribuir comorbidade
                      </button>
                      <button
                        type="button"
                        className="patient-modal-history"
                        onClick={abrirProntuarioCompleto}
                      >
                        Ver prontuário completo →
                      </button>
                      {patientDetails.ativo && (
                        <button
                          type="button"
                          className="patient-modal-inactivate"
                          onClick={inativarPaciente}
                          disabled={inativando}
                        >
                          {inativando ? 'Inativando...' : 'Inativar paciente'}
                        </button>
                      )}
                    </footer>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </ModuleLayout>
  );
}
