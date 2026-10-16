import { useMemo, useState } from 'react';
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

const hoje = new Date();

function dataISO(dia: number, mes: number, ano: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function dataAtualISO(): string {
  return dataISO(
    hoje.getDate(),
    hoje.getMonth() + 1,
    hoje.getFullYear(),
  );
}

function adicionarDias(data: string, quantidade: number): string {
  const novaData = new Date(`${data}T12:00:00`);
  novaData.setDate(novaData.getDate() + quantidade);

  return dataISO(
    novaData.getDate(),
    novaData.getMonth() + 1,
    novaData.getFullYear(),
  );
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
    .map((parte) => parte[0])
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

const initialAppointments: Agendamento[] = [
  {
    id: 1,
    data: dataAtualISO(),
    horaInicio: '08:00',
    horaFim: '08:50',
    nome: 'Mariana Costa',
    pacienteId: 1,
    tipoAgendamento: 'AVALIACAO',
    statusAgendamento: 'CONFIRMADO',
  },
  {
    id: 2,
    data: dataAtualISO(),
    horaInicio: '09:00',
    horaFim: '09:45',
    nome: 'Rafael Oliveira',
    pacienteId: 2,
    tipoAgendamento: 'ATENDIMENTO',
    statusAgendamento: 'CONFIRMADO',
  },
  {
    id: 3,
    data: dataAtualISO(),
    horaInicio: '10:00',
    horaFim: '10:40',
    nome: 'Camila Ferreira',
    pacienteId: 3,
    tipoAgendamento: 'ATENDIMENTO',
    statusAgendamento: 'PENDENTE',
  },
  {
    id: 4,
    data: dataAtualISO(),
    horaInicio: '11:00',
    horaFim: '11:45',
    nome: 'Beatriz Almeida',
    pacienteId: 4,
    tipoAgendamento: 'AVALIACAO',
    statusAgendamento: 'CONFIRMADO',
  },
  {
    id: 5,
    data: dataAtualISO(),
    horaInicio: '14:00',
    horaFim: '14:50',
    nome: 'João Pedro Santos',
    pacienteId: 5,
    tipoAgendamento: 'ATENDIMENTO',
    statusAgendamento: 'REALIZADO',
  },
];

export default function Agenda() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] =
    useState<Agendamento[]>(initialAppointments);

  const [dataSelecionada, setDataSelecionada] =
    useState(dataAtualISO());

  const [view, setView] = useState<'Dia' | 'Semana'>('Dia');
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

  const agendamentosVisiveis = useMemo(() => {
    const datas = view === 'Dia'
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

  function atualizarStatus(id: number, status: StatusAgendamento) {
    setAgendamentos((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? { ...item, statusAgendamento: status }
          : item,
      ),
    );
  }

  return (
    <ModuleLayout
      title="Agenda"
      subtitle="Visualize as avaliações e os atendimentos dos pacientes."
      eyebrow="ORGANIZAÇÃO DE ATENDIMENTOS"
    >
      <div className="agenda-summary">
        <div>
          <span className="agenda-summary-icon">▦</span>
          <div>
            <small>Agendamentos</small>
            <strong>{ativos.length}</strong>
          </div>
        </div>

        <div>
          <span className="agenda-summary-icon mint">✓</span>
          <div>
            <small>Avaliações</small>
            <strong>
              {ativos.filter((item) => item.tipoAgendamento === 'AVALIACAO').length}
            </strong>
          </div>
        </div>

        <div>
          <span className="agenda-summary-icon peach">◷</span>
          <div>
            <small>Pendentes</small>
            <strong>
              {ativos.filter((item) => item.statusAgendamento === 'PENDENTE').length}
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

        {agendamentosVisiveis.length === 0 ? (
          <p className="agenda-empty">
            Nenhum agendamento cadastrado neste período.
          </p>
        ) : (
          <div className="agenda-timeline">
            {agendamentosVisiveis.map((item) => (
              <article className="agenda-appointment" key={item.id}>
                <div className="agenda-time">
                  {view === 'Semana' && <span>{formatarData(item.data)}</span>}
                  <strong>{item.horaInicio}</strong>
                  <span>até {item.horaFim}</span>
                </div>

                <div className="agenda-time-line"><i /></div>

                <div className="agenda-appointment-card">
                  <div className="agenda-person-avatar">
                    {iniciais(item.nome)}
                  </div>

                  <div className="agenda-appointment-info">
                    <strong>{item.nome}</strong>
                    <span>{nomeTipo(item.tipoAgendamento)}</span>
                    <small>Paciente #{item.pacienteId}</small>
                  </div>

                  <span
                    className={`agenda-status ${item.statusAgendamento.toLowerCase()}`}
                  >
                    {nomeStatus(item.statusAgendamento)}
                  </span>

                  <select
                    aria-label={`Alterar status de ${item.nome}`}
                    value={item.statusAgendamento}
                    onChange={(evento) =>
                      atualizarStatus(
                        item.id,
                        evento.target.value as StatusAgendamento,
                      )
                    }
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="REMARCADO">Remarcado</option>
                    <option value="REALIZADO">Realizado</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="agenda-demo-note">
        Modo de demonstração: os dados são fictícios e as alterações ficam
        somente nesta página. Nada é enviado ao backend ou salvo no banco.
      </p>
    </ModuleLayout>
  );
}