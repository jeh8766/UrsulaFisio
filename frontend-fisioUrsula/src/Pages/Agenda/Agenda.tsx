
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Agenda.css';

type TipoAgendamento = 'AVALIACAO' | 'ATENDIMENTO';

type StatusAgendamento =
  | 'CANCELADO'
  | 'CONFIRMADO'
  | 'PENDENTE'
  | 'CONCLUIDO';

type Agendamento = {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  nome: string;
  pacienteId: number;
  tipoAgendamento: TipoAgendamento;
  statusAgendamento: StatusAgendamento;
};

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

type PacienteDetalhado = {
  id: number;
  nome: string;
  dataNascimento: string;
  idade: number;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
  complemento: string | null;
  nomeResponsavel?: string | null;
  faixaEtaria?: string;
  vinculo?: string;
  ativo?: boolean;
  comorbidades?: string[];
};

type CsrfTokenResponse = {
  token: string;
  headerName: string;
};

type Visualizacao = 'Dia' | 'Semana' | 'Mês';

const API_AGENDAMENTOS = 'http://localhost:8080/agendamentos';
const API_PACIENTES = 'http://localhost:8080/pacientes';

function dataAtualISO(): string {
  const hoje = new Date();

  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0'),
  ].join('-');
}

function adicionarDias(data: string, quantidade: number): string {
  const novaData = new Date(`${data}T12:00:00`);
  novaData.setDate(novaData.getDate() + quantidade);

  return [
    novaData.getFullYear(),
    String(novaData.getMonth() + 1).padStart(2, '0'),
    String(novaData.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatarData(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0] ?? '')
    .join('')
    .toUpperCase();
}

function nomeTipo(tipo: TipoAgendamento): string {
  return tipo === 'AVALIACAO'
    ? 'Avaliação fisioterapêutica'
    : 'Atendimento fisioterapêutico';
}

function nomeStatus(status: StatusAgendamento): string {
  const nomes: Record<StatusAgendamento, string> = {
    CANCELADO: 'Cancelado',
    CONFIRMADO: 'Confirmado',
    PENDENTE: 'Pendente',
    CONCLUIDO: 'Concluído',
  };

  return nomes[status];
}

function normalizarAgendamento(dado: AgendamentoApi): Agendamento {
  return {
    id: dado.id,
    data: dado.data,
    horaInicio: dado.horaInicio.slice(0, 5),
    horaFim: dado.horaFim.slice(0, 5),
    nome: dado.nome,
    pacienteId: dado.pacienteId,
    tipoAgendamento: dado.tipoAgendamento,
    statusAgendamento: dado.statusAgendamento,
  };
}

function gerarLinkWaze(paciente: PacienteDetalhado): string {
  const endereco = [
    paciente.rua,
    paciente.numero,
    paciente.bairro,
    paciente.cidade,
    paciente.estado,
    paciente.cep,
    paciente.complemento,
  ]
    .filter(
      (parte) =>
        parte !== null &&
        parte !== undefined &&
        String(parte).trim() !== '',
    )
    .join(', ');

  return `https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`;
}

function obterPrimeiroDiaDoMes(data: string): string {
  return `${data.slice(0, 7)}-01`;
}

function obterUltimoDiaDoMes(data: string): string {
  const [ano, mes] = data.split('-').map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();

  return `${ano}-${String(mes).padStart(2, '0')}-${String(
    ultimoDia,
  ).padStart(2, '0')}`;
}

function adicionarMeses(data: string, quantidade: number): string {
  const [ano, mes] = data.split('-').map(Number);
  const novaData = new Date(ano, mes - 1 + quantidade, 1);

  return [
    novaData.getFullYear(),
    String(novaData.getMonth() + 1).padStart(2, '0'),
    '01',
  ].join('-');
}

function obterDiasDoMes(data: string): (number | null)[] {
  const [ano, mes] = data.split('-').map(Number);

  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);

  // Ajusta para o calendário começar na segunda-feira.
  const deslocamento = (primeiroDia.getDay() + 6) % 7;

  return [
    ...Array.from({ length: deslocamento }, () => null),
    ...Array.from({ length: ultimoDia.getDate() }, (_, indice) => indice + 1),
  ];
}

function nomeMes(data: string): string {
  return new Date(`${data.slice(0, 7)}-01T12:00:00`).toLocaleDateString(
    'pt-BR',
    {
      month: 'long',
      year: 'numeric',
    },
  );
}

async function obterTokenCsrf(): Promise<CsrfTokenResponse> {
  const resposta = await fetch('http://localhost:8080/csrf', {
    method: 'GET',
    credentials: 'include',
  });

  if (!resposta.ok) {
    throw new Error('Não foi possível obter o token de segurança.');
  }

  const csrf: CsrfTokenResponse = await resposta.json();

  if (!csrf.token || !csrf.headerName) {
    throw new Error('Token CSRF inválido.');
  }

  return csrf;
}

export default function Agenda() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [tentativa, setTentativa] = useState(0);

  const [dataSelecionada, setDataSelecionada] = useState(dataAtualISO());
  const [view, setView] = useState<Visualizacao>('Dia');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState<Agendamento | null>(null);

  const [pacienteDetalhado, setPacienteDetalhado] =
    useState<PacienteDetalhado | null>(null);

  const [carregandoPaciente, setCarregandoPaciente] = useState(false);
  const [erroPaciente, setErroPaciente] = useState('');

  const [novoStatus, setNovoStatus] =
    useState<StatusAgendamento>('PENDENTE');

  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [erroStatus, setErroStatus] = useState('');
  const [sucessoStatus, setSucessoStatus] = useState('');

  // ============================================================
  // DATAS DA SEMANA
  // ============================================================

  const diasDaSemana = useMemo(() => {
    const selecionada = new Date(`${dataSelecionada}T12:00:00`);
    const diaSemana = selecionada.getDay();
    const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segunda = adicionarDias(dataSelecionada, diferenca);

    return Array.from({ length: 7 }, (_, indice) => {
      const dataDia = adicionarDias(segunda, indice);
      const dataObj = new Date(`${dataDia}T12:00:00`);

      return {
        data: dataDia,
        numero: dataObj.getDate(),
        nome: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][indice],
      };
    });
  }, [dataSelecionada]);

  // ============================================================
  // DATAS DO MÊS
  // ============================================================

  const diasDoMes = useMemo(
    () => obterDiasDoMes(dataSelecionada),
    [dataSelecionada],
  );

  // ============================================================
  // CARREGAMENTO DOS AGENDAMENTOS
  // ============================================================

  useEffect(() => {
    const controller = new AbortController();

    async function carregarAgendamentos() {
      try {
        setCarregando(true);
        setErro('');

        let inicio: string;
        let fim: string;

        if (view === 'Dia') {
          inicio = dataSelecionada;
          fim = dataSelecionada;
        } else if (view === 'Semana') {
          inicio = diasDaSemana[0].data;
          fim = diasDaSemana[6].data;
        } else {
          inicio = obterPrimeiroDiaDoMes(dataSelecionada);
          fim = obterUltimoDiaDoMes(dataSelecionada);
        }

        const parametros = new URLSearchParams({ inicio, fim });

        const resposta = await fetch(
          `${API_AGENDAMENTOS}?${parametros.toString()}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
            signal: controller.signal,
          },
        );

        if (!resposta.ok) {
          throw new Error(
            `Não foi possível carregar os agendamentos. Erro ${resposta.status}.`,
          );
        }

        const dados: unknown = await resposta.json();

        if (!Array.isArray(dados)) {
          throw new Error(
            'A API retornou um formato inesperado para os agendamentos.',
          );
        }

        const lista = (dados as AgendamentoApi[]).map(
          normalizarAgendamento,
        );

        setAgendamentos(lista);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          return;
        }

        setAgendamentos([]);

        setErro(
          e instanceof Error
            ? e.message
            : 'Ocorreu um erro ao carregar a agenda.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarAgendamentos();

    return () => controller.abort();
  }, [dataSelecionada, diasDaSemana, tentativa, view]);

  // ============================================================
  // DETALHES DO PACIENTE
  // ============================================================

  async function abrirDetalhes(item: Agendamento) {
    setAgendamentoSelecionado(item);
    setNovoStatus(item.statusAgendamento);

    setErroStatus('');
    setSucessoStatus('');

    setPacienteDetalhado(null);
    setErroPaciente('');
    setCarregandoPaciente(true);

    try {
      const resposta = await fetch(`${API_PACIENTES}/${item.pacienteId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!resposta.ok) {
        throw new Error(
          `Não foi possível carregar os dados do paciente. Erro ${resposta.status}.`,
        );
      }

      const paciente: PacienteDetalhado = await resposta.json();

      setPacienteDetalhado(paciente);
    } catch (e) {
      setErroPaciente(
        e instanceof Error
          ? e.message
          : 'Erro ao carregar os dados do paciente.',
      );
    } finally {
      setCarregandoPaciente(false);
    }
  }

  // ============================================================
  // ALTERAR STATUS
  // ============================================================

  async function alterarStatusAgendamento() {
    if (!agendamentoSelecionado) return;

    if (novoStatus === agendamentoSelecionado.statusAgendamento) {
      setErroStatus('Selecione um status diferente do atual.');
      return;
    }

    try {
      setSalvandoStatus(true);
      setErroStatus('');
      setSucessoStatus('');

      const csrf = await obterTokenCsrf();

      const resposta = await fetch(
        `${API_AGENDAMENTOS}/status/${agendamentoSelecionado.id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            statusAgendamento: novoStatus,
          }),
        },
      );

      if (!resposta.ok) {
        let mensagem = 'Não foi possível alterar o status do agendamento.';

        try {
          const erroApi = await resposta.json();

          mensagem =
            erroApi.message ||
            erroApi.mensagem ||
            erroApi.error ||
            mensagem;
        } catch {
          // A API pode não retornar detalhes em JSON.
        }

        throw new Error(mensagem);
      }

      setAgendamentos((anteriores) =>
        anteriores.map((item) =>
          item.id === agendamentoSelecionado.id
            ? {
                ...item,
                statusAgendamento: novoStatus,
              }
            : item,
        ),
      );

      setAgendamentoSelecionado((anterior) =>
        anterior
          ? {
              ...anterior,
              statusAgendamento: novoStatus,
            }
          : null,
      );

      setSucessoStatus('Status alterado com sucesso!');
    } catch (e) {
      setErroStatus(
        e instanceof Error
          ? e.message
          : 'Erro ao alterar o status do agendamento.',
      );
    } finally {
      setSalvandoStatus(false);
    }
  }

  function fecharDetalhes() {
    setAgendamentoSelecionado(null);
    setPacienteDetalhado(null);
    setErroPaciente('');
    setCarregandoPaciente(false);

    setErroStatus('');
    setSucessoStatus('');
    setSalvandoStatus(false);
  }

  // ============================================================
  // NAVEGAÇÃO DO CALENDÁRIO
  // ============================================================

  function navegarMes(quantidade: number) {
    const novaData = adicionarMeses(dataSelecionada, quantidade);

    setDataSelecionada(novaData);
  }

  function selecionarDiaDoMes(dia: number) {
    const dataDia = `${dataSelecionada.slice(0, 7)}-${String(dia).padStart(
      2,
      '0',
    )}`;

    setDataSelecionada(dataDia);
    setView('Dia');
  }

  function voltarParaHoje() {
    setDataSelecionada(dataAtualISO());
    setView('Dia');
  }

  // ============================================================
  // AGENDAMENTOS VISÍVEIS
  // ============================================================

  const agendamentosVisiveis = useMemo(() => {
    let resultado: Agendamento[];

    if (view === 'Dia') {
      resultado = agendamentos.filter(
        (item) => item.data === dataSelecionada,
      );
    } else if (view === 'Semana') {
      const datas = diasDaSemana.map((dia) => dia.data);

      resultado = agendamentos.filter((item) =>
        datas.includes(item.data),
      );
    } else {
      const mesAtual = dataSelecionada.slice(0, 7);

      resultado = agendamentos.filter((item) =>
        item.data.startsWith(mesAtual),
      );
    }

    return resultado.sort((a, b) => {
      const comparacaoData = a.data.localeCompare(b.data);

      return comparacaoData !== 0
        ? comparacaoData
        : a.horaInicio.localeCompare(b.horaInicio);
    });
  }, [agendamentos, dataSelecionada, diasDaSemana, view]);

  const ativos = agendamentosVisiveis.filter(
    (item) => item.statusAgendamento !== 'CANCELADO',
  );

  const agendamentosPorDia = useMemo(() => {
    const agrupados: Record<string, Agendamento[]> = {};

    agendamentos.forEach((item) => {
      if (!agrupados[item.data]) {
        agrupados[item.data] = [];
      }

      agrupados[item.data].push(item);
    });

    return agrupados;
  }, [agendamentos]);

  // ============================================================
  // TELA
  // ============================================================

  return (
    <ModuleLayout
      title="Agenda"
      subtitle="Visualize as avaliações e os atendimentos dos pacientes."
      eyebrow="ORGANIZAÇÃO DE ATENDIMENTOS"
    >
      <div className="agenda-summary">
        <div className="agenda-summary-card">
          <span className="agenda-summary-icon">▦</span>
          <div>
            <small>Agendamentos</small>
            <strong>{ativos.length}</strong>
          </div>
        </div>

        <div className="agenda-summary-card">
          <span className="agenda-summary-icon mint">✓</span>
          <div>
            <small>Avaliações</small>
            <strong>
              {
                ativos.filter(
                  (item) => item.tipoAgendamento === 'AVALIACAO',
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="agenda-summary-card">
          <span className="agenda-summary-icon peach">◷</span>
          <div>
            <small>Pendentes</small>
            <strong>
              {
                ativos.filter(
                  (item) => item.statusAgendamento === 'PENDENTE',
                ).length
              }
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="agenda-primary-button"
          onClick={() => navigate('/agendamento')}
        >
          + Novo agendamento
        </button>
      </div>

      <section className="agenda-calendar-panel">
        <div className="agenda-calendar-heading">
          <div>
            <h2>{nomeMes(dataSelecionada)}</h2>
            <p>{formatarData(dataSelecionada)}</p>
          </div>

          <div className="agenda-view-switch">
            <button
              type="button"
              className={view === 'Dia' ? 'selected' : ''}
              onClick={() => setView('Dia')}
            >
              Dia
            </button>

            <button
              type="button"
              className={view === 'Semana' ? 'selected' : ''}
              onClick={() => setView('Semana')}
            >
              Semana
            </button>

            <button
              type="button"
              className={view === 'Mês' ? 'selected' : ''}
              onClick={() => setView('Mês')}
            >
              Mês
            </button>
          </div>
        </div>

        {view === 'Mês' ? (
          <>
            <div className="agenda-month-navigation">
              <button
                type="button"
                onClick={() => navegarMes(-1)}
                aria-label="Mês anterior"
              >
                ‹
              </button>

              <strong>{nomeMes(dataSelecionada)}</strong>

              <button
                type="button"
                onClick={() => navegarMes(1)}
                aria-label="Próximo mês"
              >
                ›
              </button>

              <button
                type="button"
                className="agenda-month-today"
                onClick={voltarParaHoje}
              >
                Hoje
              </button>
            </div>

            <div className="agenda-month-calendar">
              <div className="agenda-month-weekdays">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(
                  (dia) => (
                    <span key={dia}>{dia}</span>
                  ),
                )}
              </div>

              <div className="agenda-month-grid">
                {diasDoMes.map((dia, indice) => {
                  if (dia === null) {
                    return (
                      <div
                        key={`vazio-${indice}`}
                        className="agenda-month-day outside-month"
                      />
                    );
                  }

                  const dataDia = `${dataSelecionada.slice(
                    0,
                    7,
                  )}-${String(dia).padStart(2, '0')}`;

                  const compromissos = agendamentosPorDia[dataDia] ?? [];

                  const quantidadeAtivos = compromissos.filter(
                    (item) => item.statusAgendamento !== 'CANCELADO',
                  ).length;

                  const selecionado = dataSelecionada === dataDia;
                  const hoje = dataAtualISO() === dataDia;

                  return (
                    <button
                      type="button"
                      key={dataDia}
                      className={[
                        'agenda-month-day',
                        selecionado ? 'selected' : '',
                        hoje ? 'today' : '',
                        compromissos.length > 0 ? 'has-events' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => selecionarDiaDoMes(dia)}
                      aria-label={`${formatarData(dataDia)}: ${quantidadeAtivos} agendamentos`}
                    >
                      <strong>{dia}</strong>

                      {quantidadeAtivos > 0 && (
                        <span className="agenda-month-count">
                          {quantidadeAtivos}{' '}
                          {quantidadeAtivos === 1 ? 'horário' : 'horários'}
                        </span>
                      )}

                      {compromissos.length > 0 && (
                        <div className="agenda-month-dots">
                          {compromissos
                            .filter(
                              (item) =>
                                item.statusAgendamento !== 'CANCELADO',
                            )
                            .slice(0, 4)
                            .map((item) => (
                              <i
                                key={item.id}
                                className={
                                  item.tipoAgendamento === 'AVALIACAO'
                                    ? 'evaluation'
                                    : 'attendance'
                                }
                              />
                            ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="agenda-month-legend">
              <span>
                <i className="evaluation" />
                Avaliação
              </span>

              <span>
                <i className="attendance" />
                Atendimento
              </span>
            </div>

            <div className="agenda-month-hint">
              Selecione um dia do calendário para visualizar os horários
              daquele dia.
            </div>
          </>
        ) : (
          <div className="agenda-week-strip">
            {diasDaSemana.map((dia) => (
              <button
                type="button"
                key={dia.data}
                className={`agenda-day ${
                  dataSelecionada === dia.data ? 'selected' : ''
                }`}
                onClick={() => setDataSelecionada(dia.data)}
              >
                <span>{dia.nome}</span>
                <strong>{dia.numero}</strong>

                <i
                  className={
                    agendamentos.some(
                      (item) =>
                        item.data === dia.data &&
                        item.statusAgendamento !== 'CANCELADO',
                    )
                      ? 'has-events'
                      : ''
                  }
                />
              </button>
            ))}
          </div>
        )}

        <div className="agenda-list-heading">
          <h3>
            {view === 'Dia'
              ? `Agendamentos de ${formatarData(dataSelecionada)}`
              : view === 'Semana'
                ? 'Agendamentos da semana'
                : `Agendamentos de ${nomeMes(dataSelecionada)}`}
          </h3>

          <span>{agendamentosVisiveis.length} horários</span>
        </div>

        {carregando ? (
          <p className="agenda-empty">Carregando agendamentos...</p>
        ) : erro ? (
          <div className="agenda-error" role="alert">
            <p>{erro}</p>

            <button
              type="button"
              className="agenda-primary-button"
              onClick={() => setTentativa((atual) => atual + 1)}
            >
              Tentar novamente
            </button>
          </div>
        ) : agendamentosVisiveis.length === 0 ? (
          <p className="agenda-empty">
            Nenhum agendamento cadastrado neste período.
          </p>
        ) : (
          <div className="agenda-timeline">
            {agendamentosVisiveis.map((item) => (
              <article className="agenda-appointment" key={item.id}>
                <div className="agenda-time">
                  {view !== 'Dia' && (
                    <span>{formatarData(item.data)}</span>
                  )}

                  <strong>{item.horaInicio}</strong>
                  <span>até {item.horaFim}</span>
                </div>

                <div className="agenda-time-line">
                  <i />
                </div>

                <div
                  className="agenda-appointment-card agenda-appointment-clickable"
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalhes de ${item.nome}`}
                  onClick={() => abrirDetalhes(item)}
                  onKeyDown={(evento) => {
                    if (evento.key === 'Enter' || evento.key === ' ') {
                      evento.preventDefault();
                      abrirDetalhes(item);
                    }
                  }}
                >
                  <div className="agenda-person-avatar">
                    {iniciais(item.nome || 'Paciente')}
                  </div>

                  <div className="agenda-appointment-info">
                    <strong>{item.nome || 'Paciente sem nome'}</strong>
                    <span>{nomeTipo(item.tipoAgendamento)}</span>
                    <small>Paciente #{item.pacienteId}</small>
                  </div>

                  <span
                    className={`agenda-status ${item.statusAgendamento.toLowerCase()}`}
                  >
                    {nomeStatus(item.statusAgendamento)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="agenda-demo-note">
        Os agendamentos são carregados do banco de dados pela API.
      </p>

      {/* ====================================================== */}
      {/* MODAL DE DETALHES DO AGENDAMENTO */}
      {/* ====================================================== */}

      {agendamentoSelecionado && (
        <div
          className="agenda-modal-overlay"
          onClick={fecharDetalhes}
        >
          <section
            className="agenda-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-modal-title"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header className="agenda-modal-header">
              <div>
                <span className="agenda-modal-eyebrow">
                  DETALHES DO AGENDAMENTO
                </span>

                <h2 id="agenda-modal-title">
                  {agendamentoSelecionado.nome}
                </h2>

                <p>
                  {nomeTipo(agendamentoSelecionado.tipoAgendamento)}
                </p>
              </div>

              <button
                type="button"
                className="agenda-modal-close"
                onClick={fecharDetalhes}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </header>

            {carregandoPaciente ? (
              <p className="agenda-modal-message">
                Carregando dados do paciente...
              </p>
            ) : erroPaciente ? (
              <div className="agenda-modal-error" role="alert">
                <p>{erroPaciente}</p>

                <button
                  type="button"
                  onClick={() => abrirDetalhes(agendamentoSelecionado)}
                >
                  Tentar novamente
                </button>
              </div>
            ) : pacienteDetalhado ? (
              <>
                <div className="agenda-modal-section">
                  <h3>Informações do paciente</h3>

                  <div className="agenda-modal-grid">
                    <div className="agenda-modal-field">
                      <span>Nome completo</span>
                      <strong>{pacienteDetalhado.nome}</strong>
                    </div>

                    <div className="agenda-modal-field">
                      <span>Telefone</span>
                      <strong>{pacienteDetalhado.telefone}</strong>
                    </div>

                    <div className="agenda-modal-field">
                      <span>Data de nascimento</span>
                      <strong>
                        {pacienteDetalhado.dataNascimento
                          ? new Date(
                              `${pacienteDetalhado.dataNascimento}T12:00:00`,
                            ).toLocaleDateString('pt-BR')
                          : 'Não informado'}
                      </strong>
                    </div>

                    <div className="agenda-modal-field">
                      <span>Idade</span>
                      <strong>
                        {pacienteDetalhado.idade != null
                          ? `${pacienteDetalhado.idade} anos`
                          : 'Não informada'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="agenda-modal-section">
                  <h3>Informações do agendamento</h3>

                  <div className="agenda-modal-grid">
                    <div className="agenda-modal-field">
                      <span>Data</span>
                      <strong>
                        {formatarData(agendamentoSelecionado.data)}
                      </strong>
                    </div>

                    <div className="agenda-modal-field">
                      <span>Horário</span>
                      <strong>
                        {agendamentoSelecionado.horaInicio} às{' '}
                        {agendamentoSelecionado.horaFim}
                      </strong>
                    </div>

                    <div className="agenda-modal-field">
                      <span>Status</span>
                      <strong>
                        {nomeStatus(
                          agendamentoSelecionado.statusAgendamento,
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="agenda-modal-section">
                  <h3>Endereço do paciente</h3>

                  <div className="agenda-address-card">
                    <div className="agenda-address-icon">
                      <span>⌖</span>
                    </div>

                    <div className="agenda-address-content">
                      <strong>
                        {pacienteDetalhado.rua}, {pacienteDetalhado.numero}
                      </strong>

                      {pacienteDetalhado.complemento && (
                        <p>{pacienteDetalhado.complemento}</p>
                      )}

                      <p>{pacienteDetalhado.bairro}</p>

                      <p>
                        {pacienteDetalhado.cidade} - {pacienteDetalhado.estado}
                      </p>

                      <p>CEP: {pacienteDetalhado.cep}</p>

                      <a
                        className="agenda-waze-link"
                        href={gerarLinkWaze(pacienteDetalhado)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>➤</span>
                        Abrir rota no Waze
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            <div className="agenda-modal-section">
              <h3>Alterar status do agendamento</h3>

              <div className="agenda-status-editor">
                <div className="agenda-modal-field">
                  <span>Status atual</span>

                  <strong>
                    {nomeStatus(agendamentoSelecionado.statusAgendamento)}
                  </strong>
                </div>

                <label className="agenda-modal-field">
                  <span>Novo status</span>

                  <select
                    value={novoStatus}
                    onChange={(evento) => {
                      setNovoStatus(
                        evento.target.value as StatusAgendamento,
                      );

                      setErroStatus('');
                      setSucessoStatus('');
                    }}
                    disabled={salvandoStatus}
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                </label>

                {erroStatus && (
                  <p className="agenda-status-error" role="alert">
                    {erroStatus}
                  </p>
                )}

                {sucessoStatus && (
                  <p className="agenda-status-success" role="status">
                    {sucessoStatus}
                  </p>
                )}

                <button
                  type="button"
                  className="agenda-primary-button agenda-status-save"
                  onClick={alterarStatusAgendamento}
                  disabled={
                    salvandoStatus ||
                    novoStatus ===
                      agendamentoSelecionado.statusAgendamento
                  }
                >
                  {salvandoStatus ? 'Salvando...' : 'Salvar status'}
                </button>
              </div>
            </div>

            <footer className="agenda-modal-footer">
              <button type="button" onClick={fecharDetalhes}>
                Fechar
              </button>
            </footer>
          </section>
        </div>
      )}
    </ModuleLayout>
  );
}
