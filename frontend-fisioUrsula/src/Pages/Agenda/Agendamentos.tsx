import { useState, type FormEvent } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Agendamentos.css';

type TipoAgendamento = 'AVALIACAO' | 'ATENDIMENTO';

type StatusAgendamento =
  | 'CANCELADO'
  | 'CONFIRMADO'
  | 'PENDENTE'
  | 'REMARCADO'
  | 'REALIZADO';

type Agendamento = {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoAgendamento: TipoAgendamento;
  statusAgendamento: StatusAgendamento;
  paciente?: {
    id?: number;
    nome?: string;
  };
};

const API_URL = 'http://localhost:8080/agendamentos';

function obterDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarTipo(tipo: TipoAgendamento) {
  return tipo === 'AVALIACAO' ? 'Avaliação' : 'Atendimento';
}

function formatarStatus(status: StatusAgendamento) {
  const nomes: Record<StatusAgendamento, string> = {
    CANCELADO: 'Cancelado',
    CONFIRMADO: 'Confirmado',
    PENDENTE: 'Pendente',
    REMARCADO: 'Remarcado',
    REALIZADO: 'Realizado',
  };

  return nomes[status];
}

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const [pacienteId, setPacienteId] = useState('');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [tipoAgendamento, setTipoAgendamento] =
    useState<TipoAgendamento>('AVALIACAO');

  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const hoje = obterDataAtual();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro('');
    setSucesso('');

    if (!pacienteId || !data || !horaInicio || !horaFim) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!Number.isInteger(Number(pacienteId)) || Number(pacienteId) < 1) {
      setErro('Informe um ID de paciente válido.');
      return;
    }

    if (horaInicio >= horaFim) {
      setErro('O horário de início deve ser anterior ao horário de término.');
      return;
    }

    try {
      setSalvando(true);

      const resposta = await fetch(
        `${API_URL}/${encodeURIComponent(pacienteId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data,
            horaInicio,
            horaFim,
            tipoAgendamento,
          }),
        }
      );

      if (!resposta.ok) {
        const mensagem = await resposta.text();

        throw new Error(
          mensagem ||
            `Não foi possível criar o agendamento. Erro ${resposta.status}.`
        );
      }

      const agendamentoSalvo: Agendamento = await resposta.json();

      setAgendamentos((atuais) => [
        agendamentoSalvo,
        ...atuais,
      ]);

      setPacienteId('');
      setData('');
      setHoraInicio('');
      setHoraFim('');
      setTipoAgendamento('AVALIACAO');
      setMostrarFormulario(false);

      setSucesso('Agendamento criado com sucesso!');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o agendamento. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const agendamentosFiltrados = agendamentos.filter((item) => {
    const nomePaciente = item.paciente?.nome ?? '';
    const idPaciente = String(item.paciente?.id ?? '');

    const correspondeBusca =
      nomePaciente.toLowerCase().includes(busca.toLowerCase()) ||
      idPaciente.includes(busca) ||
      String(item.id).includes(busca);

    const correspondeTipo =
      filtroTipo === 'TODOS' || item.tipoAgendamento === filtroTipo;

    const correspondeStatus =
      filtroStatus === 'TODOS' ||
      item.statusAgendamento === filtroStatus;

    return correspondeBusca && correspondeTipo && correspondeStatus;
  });

  return (
    <ModuleLayout
      title="Agendamentos"
      subtitle="Organize as avaliações e os atendimentos dos pacientes."
      eyebrow="GESTÃO DE AGENDA"
    >
      <div className="agenda-page">
        <div className="agenda-stats">
          <article className="agenda-stat-card">
            <span className="agenda-stat-icon">▦</span>
            <div>
              <small>Total de agendamentos</small>
              <strong>{agendamentos.length}</strong>
              <span>Registros nesta sessão</span>
            </div>
          </article>

          <article className="agenda-stat-card">
            <span className="agenda-stat-icon pending">◷</span>
            <div>
              <small>Avaliações</small>
              <strong>
                {
                  agendamentos.filter(
                    (item) => item.tipoAgendamento === 'AVALIACAO'
                  ).length
                }
              </strong>
              <span>Avaliações agendadas</span>
            </div>
          </article>

          <article className="agenda-stat-card">
            <span className="agenda-stat-icon confirmed">✓</span>
            <div>
              <small>Atendimentos</small>
              <strong>
                {
                  agendamentos.filter(
                    (item) => item.tipoAgendamento === 'ATENDIMENTO'
                  ).length
                }
              </strong>
              <span>Atendimentos agendados</span>
            </div>
          </article>
        </div>

        <section className="agenda-panel">
          <div className="agenda-panel-heading">
            <div>
              <h2>Agenda da clínica</h2>
              <p>
                Consulte os horários e cadastre avaliações ou atendimentos.
              </p>
            </div>

            <button
              type="button"
              className="agenda-primary-button"
              onClick={() => {
                setMostrarFormulario((atual) => !atual);
                setErro('');
                setSucesso('');
              }}
            >
              {mostrarFormulario ? 'Cancelar' : '+ Novo agendamento'}
            </button>
          </div>

          {erro && (
            <div className="agenda-message error" role="alert">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="agenda-message success" role="status">
              {sucesso}
            </div>
          )}

          {mostrarFormulario && (
            <form className="agenda-form" onSubmit={handleSubmit}>
              <div className="agenda-form-heading">
                <span>01</span>
                <div>
                  <h3>Novo agendamento</h3>
                  <p>Preencha os dados para reservar um horário.</p>
                </div>
              </div>

              <div className="agenda-form-grid">
                <label>
                  Tipo de agendamento *
                  <select
                    value={tipoAgendamento}
                    onChange={(e) =>
                      setTipoAgendamento(
                        e.target.value as TipoAgendamento
                      )
                    }
                    required
                  >
                    <option value="AVALIACAO">Avaliação</option>
                    <option value="ATENDIMENTO">Atendimento</option>
                  </select>
                </label>

                <label>
                  ID do paciente *
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={pacienteId}
                    onChange={(e) => setPacienteId(e.target.value)}
                    placeholder="Ex.: 1"
                    required
                  />
                  <small>
                    Informe o ID de um paciente já cadastrado.
                  </small>
                </label>

                <label>
                  Data *
                  <input
                    type="date"
                    min={hoje}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </label>
                

                <label>
                  Hora de início *
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Hora de término *
                  <input
                    type="time"
                    min={horaInicio || undefined}
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="agenda-form-footer">
                <span className="agenda-form-required-note">* Campos obrigatórios</span>

                <button
                  type="submit"
                  className="agenda-primary-button"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar agendamento'}
                </button>
              </div>
            </form>
          )}

          <div className="agenda-toolbar">
            <label className="agenda-search">
              <span>⌕</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por paciente, ID ou agendamento..."
              />
            </label>

            <label className="agenda-filter">
              <span>Tipo</span>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="TODOS">Todos</option>
                <option value="AVALIACAO">Avaliações</option>
                <option value="ATENDIMENTO">Atendimentos</option>
              </select>
            </label>

            <label className="agenda-filter">
              <span>Status</span>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="TODOS">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="REMARCADO">Remarcado</option>
                <option value="REALIZADO">Realizado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </label>
          </div>

          <div className="agenda-list">
            {agendamentosFiltrados.length > 0 ? (
              agendamentosFiltrados
                .slice()
                .sort((a, b) =>
                  `${a.data}T${a.horaInicio}`.localeCompare(
                    `${b.data}T${b.horaInicio}`
                  )
                )
                .map((item) => (
                  <article className="agenda-appointment" key={item.id}>
                    <div className="agenda-time">
                      <strong>{item.horaInicio.slice(0, 5)}</strong>
                      <span>até {item.horaFim.slice(0, 5)}</span>
                    </div>

                    <div className="agenda-appointment-info">
                      <strong>
                        {item.paciente?.nome ||
                          `Paciente #${item.paciente?.id ?? '—'}`}
                      </strong>

                      <span>
                        {formatarData(item.data)} ·{' '}
                        {formatarTipo(item.tipoAgendamento)} · #{item.id}
                      </span>
                    </div>

                    <span
                      className={`agenda-status ${item.statusAgendamento.toLowerCase()}`}
                    >
                      {formatarStatus(item.statusAgendamento)}
                    </span>
                  </article>
                ))
            ) : (
              <div className="agenda-empty">
                <span className="agenda-empty-icon">◷</span>
                <h3>Nenhum agendamento encontrado</h3>
                <p>
                  {agendamentos.length === 0
                    ? 'Crie um agendamento para começar a organizar a agenda.'
                    : 'Tente alterar a busca ou os filtros selecionados.'}
                </p>

                {agendamentos.length === 0 && (
                  <button
                    type="button"
                    className="agenda-secondary-button"
                    onClick={() => setMostrarFormulario(true)}
                  >
                    + Novo agendamento
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="agenda-footer">
            Exibindo <strong>{agendamentosFiltrados.length}</strong> de{' '}
            <strong>{agendamentos.length}</strong> agendamentos
            <span>Registros recebidos nesta sessão.</span>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}