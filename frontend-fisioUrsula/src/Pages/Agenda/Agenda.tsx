
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Agenda.css';

type TipoAgendamento = 'AVALIACAO' | 'ATENDIMENTO';

type StatusAgendamento =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'REMARCADO'
  | 'REALIZADO';

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

// Estrutura retornada pelo AgendamentoAgendaResponseDTO do backend.
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

const API_AGENDAMENTOS = 'http://localhost:8080/agendamentos';

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
    PENDENTE: 'Pendente',
    CONFIRMADO: 'Confirmado',
    CANCELADO: 'Cancelado',
    REMARCADO: 'Remarcado',
    REALIZADO: 'Realizado',
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

export default function Agenda() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [dataSelecionada, setDataSelecionada] = useState(dataAtualISO());
  const [view, setView] = useState<'Dia' | 'Semana'>('Dia');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

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

  useEffect(() => {
    const controller = new AbortController();

    async function carregarAgendamentos() {
      try {
        setCarregando(true);
        setErro('');

        const inicio = diasDaSemana[0].data;
        const fim = diasDaSemana[6].data;

        const parametros = new URLSearchParams({ inicio, fim });

        const resposta = await fetch(
          `${API_AGENDAMENTOS}?${parametros.toString()}`,
          {
            method: 'GET',
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
  }, [diasDaSemana, tentativa]);

  const agendamentosVisiveis = useMemo(() => {
    const datas =
      view === 'Dia'
        ? [dataSelecionada]
        : diasDaSemana.map((dia) => dia.data);

    return agendamentos
      .filter((item) => datas.includes(item.data))
      .sort((a, b) => {
        const comparacaoData = a.data.localeCompare(b.data);

        return comparacaoData !== 0
          ? comparacaoData
          : a.horaInicio.localeCompare(b.horaInicio);
      });
  }, [agendamentos, dataSelecionada, diasDaSemana, view]);

  const ativos = agendamentosVisiveis.filter(
    (item) => item.statusAgendamento !== 'CANCELADO',
  );

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
            <h2>
              {new Date(`${dataSelecionada}T12:00:00`).toLocaleDateString(
                'pt-BR',
                { month: 'long', year: 'numeric' },
              )}
            </h2>
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
          </div>
        </div>

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

        <div className="agenda-list-heading">
          <h3>
            {view === 'Dia'
              ? `Agendamentos de ${formatarData(dataSelecionada)}`
              : 'Agendamentos da semana'}
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
                  {view === 'Semana' && (
                    <span>{formatarData(item.data)}</span>
                  )}
                  <strong>{item.horaInicio}</strong>
                  <span>até {item.horaFim}</span>
                </div>

                <div className="agenda-time-line">
                  <i />
                </div>

                <div className="agenda-appointment-card">
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
    </ModuleLayout>
  );
}
