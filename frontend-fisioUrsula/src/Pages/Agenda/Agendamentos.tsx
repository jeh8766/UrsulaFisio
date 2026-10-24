import { useEffect, useState, type FormEvent } from "react";
import ModuleLayout from "../ModuleLayout/ModuleLayout";
import "./Agendamentos.css";

type TipoAgendamento = "AVALIACAO" | "ATENDIMENTO";
type StatusAgendamento =
  | "CANCELADO_PACIENTE"
  | "CANCELADO_FISIOTERAPEUTA"
  | "CONFIRMADO"
  | "PENDENTE"
  | "REMARCADO";
type Paciente = { id: number; nome: string };
type Agendamento = {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoAgendamento: TipoAgendamento;
  statusAgendamento: StatusAgendamento;
  paciente?: Paciente;
};

const API_AGENDAMENTOS = "http://localhost:8080/agendamentos";
const API_PACIENTES = "http://localhost:8080/pacientes";

function obterDataAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatarData(data: string) {
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

function formatarTipo(tipo: TipoAgendamento) {
  return tipo === "AVALIACAO" ? "Avaliação" : "Atendimento";
}

function formatarStatus(status: StatusAgendamento) {
  const nomes: Record<StatusAgendamento, string> = {
    CANCELADO_PACIENTE: "Cancelado pelo paciente",
    CANCELADO_FISIOTERAPEUTA: "Cancelado pela fisioterapeuta",
    CONFIRMADO: "Confirmado",
    PENDENTE: "Pendente",
    REMARCADO: "Remarcado",
  };
  return nomes[status] ?? status;
}

function normalizarPaciente(v: any): Paciente | null {
  const id = Number(v?.id ?? v?.pacienteId ?? v?.idPaciente);
  const nome = String(v?.nome ?? v?.nomePaciente ?? "").trim();
  return Number.isInteger(id) && id > 0 && nome ? { id, nome } : null;
}

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacienteId, setPacienteId] = useState("");
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [pacientesEncontrados, setPacientesEncontrados] = useState<Paciente[]>(
    [],
  );
  const [pacienteSelecionado, setPacienteSelecionado] =
    useState<Paciente | null>(null);
  const [carregandoPacientes, setCarregandoPacientes] = useState(false);
  const [erroBuscaPaciente, setErroBuscaPaciente] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [tipoAgendamento, setTipoAgendamento] =
    useState<TipoAgendamento>("AVALIACAO");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const hoje = obterDataAtual();

  useEffect(() => {
    const termo = buscaPaciente.trim();
    if (!termo || pacienteSelecionado?.nome === termo) {
      setPacientesEncontrados([]);
      setCarregandoPacientes(false);
      setErroBuscaPaciente("");
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setCarregandoPacientes(true);
        setErroBuscaPaciente("");
        const r = await fetch(
          `${API_PACIENTES}?nome=${encodeURIComponent(termo)}&ativo=true`,
          { signal: controller.signal },
        );
        if (!r.ok)
          throw new Error(
            `Não foi possível pesquisar pacientes (${r.status}).`,
          );
        const dados: unknown = await r.json();
        setPacientesEncontrados(
          (Array.isArray(dados) ? dados : [])
            .map(normalizarPaciente)
            .filter((x): x is Paciente => x !== null),
        );
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setPacientesEncontrados([]);
        setErroBuscaPaciente(
          e instanceof Error ? e.message : "Erro ao carregar pacientes.",
        );
      } finally {
        if (!controller.signal.aborted) setCarregandoPacientes(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [buscaPaciente, pacienteSelecionado]);

  function selecionarPaciente(p: Paciente) {
    setPacienteSelecionado(p);
    setPacienteId(String(p.id));
    setBuscaPaciente(p.nome);
    setPacientesEncontrados([]);
    setErroBuscaPaciente("");
  }

  function limparPaciente() {
    setPacienteSelecionado(null);
    setPacienteId("");
    setBuscaPaciente("");
    setPacientesEncontrados([]);
    setErroBuscaPaciente("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    if (
      !pacienteSelecionado ||
      !pacienteId ||
      !data ||
      !horaInicio ||
      !horaFim
    ) {
      setErro(
        "Selecione um paciente da lista e preencha todos os campos obrigatórios.",
      );
      return;
    }
    if (horaInicio >= horaFim) {
      setErro("O horário de início deve ser anterior ao horário de término.");
      return;
    }
    try {
      setSalvando(true);
      const rota =
        tipoAgendamento === "AVALIACAO" ? "avaliacao" : "atendimento";

      // Busca o token CSRF -- ------------ ----------
      const respostaCsrf = await fetch("http://localhost:8080/csrf", {
        credentials: "include",
      });

      if (!respostaCsrf.ok) {
        throw new Error(
          `Não foi possível obter o token CSRF (${respostaCsrf.status}).`,
        );
      }

      const csrf = await respostaCsrf.json();

      const r = await fetch(
        `${API_AGENDAMENTOS}/${rota}/${encodeURIComponent(pacienteId)}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({ data, horaInicio, horaFim }),
        },
      );
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(
          msg || `Não foi possível criar o agendamento. Erro ${r.status}.`,
        );
      }
      const dto = await r.json();
      const salvo: Agendamento = {
        id: Number(dto.id),
        data: dto.data ?? data,
        horaInicio: dto.horaInicio ?? horaInicio,
        horaFim: dto.horaFim ?? horaFim,
        tipoAgendamento: dto.tipoAgendamento ?? tipoAgendamento,
        statusAgendamento: dto.statusAgendamento ?? "PENDENTE",
        paciente: normalizarPaciente(dto.paciente) ?? pacienteSelecionado,
      };
      setAgendamentos((xs) => [salvo, ...xs]);
      limparPaciente();
      setData("");
      setHoraInicio("");
      setHoraFim("");
      setTipoAgendamento("AVALIACAO");
      setMostrarFormulario(false);
      setSucesso("Agendamento criado com sucesso!");
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível criar o agendamento. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const filtrados = agendamentos.filter((a) => {
    const nome = a.paciente?.nome ?? "";
    const idPaciente = String(a.paciente?.id ?? "");
    const termo = busca.toLowerCase();
    return (
      (nome.toLowerCase().includes(termo) ||
        idPaciente.includes(busca) ||
        String(a.id).includes(busca)) &&
      (filtroTipo === "TODOS" || a.tipoAgendamento === filtroTipo) &&
      (filtroStatus === "TODOS" || a.statusAgendamento === filtroStatus)
    );
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
                  agendamentos.filter((a) => a.tipoAgendamento === "AVALIACAO")
                    .length
                }
              </strong>
              <span>Avaliações nesta sessão</span>
            </div>
          </article>
          <article className="agenda-stat-card">
            <span className="agenda-stat-icon confirmed">✓</span>
            <div>
              <small>Atendimentos</small>
              <strong>
                {
                  agendamentos.filter(
                    (a) => a.tipoAgendamento === "ATENDIMENTO",
                  ).length
                }
              </strong>
              <span>Atendimentos nesta sessão</span>
            </div>
          </article>
        </div>

        <section className="agenda-panel">
          <div className="agenda-panel-heading">
            <div>
              <h2>Agenda da clínica</h2>
              <p>Consulte os horários e cadastre avaliações ou atendimentos.</p>
            </div>
            <button
              type="button"
              className="agenda-primary-button"
              onClick={() => {
                setMostrarFormulario((x) => !x);
                setErro("");
                setSucesso("");
              }}
            >
              {mostrarFormulario ? "Cancelar" : "+ Novo agendamento"}
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
                  <p>Pesquise pelo nome e selecione o paciente correto.</p>
                </div>
              </div>

              <div className="agenda-form-grid">
                <label>
                  Tipo de agendamento *
                  <select
                    value={tipoAgendamento}
                    onChange={(e) =>
                      setTipoAgendamento(e.target.value as TipoAgendamento)
                    }
                    required
                  >
                    <option value="AVALIACAO">Avaliação</option>
                    <option value="ATENDIMENTO">Atendimento</option>
                  </select>
                </label>

                <div className="agenda-patient-field">
                  <label htmlFor="busca-paciente">Paciente *</label>
                  <div className="agenda-patient-input-row">
                    <input
                      id="busca-paciente"
                      type="search"
                      autoComplete="off"
                      value={buscaPaciente}
                      onChange={(e) => {
                        setBuscaPaciente(e.target.value);
                        setPacienteSelecionado(null);
                        setPacienteId("");
                      }}
                      placeholder="Digite o nome do paciente..."
                      required
                      aria-autocomplete="list"
                      aria-expanded={pacientesEncontrados.length > 0}
                    />
                    {pacienteSelecionado && (
                      <button
                        type="button"
                        className="agenda-clear-patient"
                        onClick={limparPaciente}
                        title="Trocar paciente"
                        aria-label="Trocar paciente"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {carregandoPacientes && (
                    <small className="agenda-patient-hint">
                      Pesquisando pacientes...
                    </small>
                  )}
                  {erroBuscaPaciente && (
                    <small className="agenda-patient-error" role="alert">
                      {erroBuscaPaciente}
                    </small>
                  )}
                  {!carregandoPacientes &&
                    buscaPaciente.trim() &&
                    !pacienteSelecionado &&
                    pacientesEncontrados.length === 0 &&
                    !erroBuscaPaciente && (
                      <small className="agenda-patient-hint">
                        Nenhum paciente encontrado. Confira o nome ou cadastre o
                        paciente primeiro.
                      </small>
                    )}
                  {pacientesEncontrados.length > 0 && !pacienteSelecionado && (
                    <ul
                      className="agenda-patient-results"
                      role="listbox"
                      aria-label="Pacientes encontrados"
                    >
                      {pacientesEncontrados.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={false}
                            onClick={() => selecionarPaciente(p)}
                          >
                            <span>{p.nome}</span>
                            <small>Selecionar</small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {pacienteSelecionado && (
                    <small className="agenda-patient-selected">
                      ✓ Selecionado: {pacienteSelecionado.nome}
                    </small>
                  )}
                </div>

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
                <span className="agenda-form-required-note">
                  Campos obrigatórios
                </span>
                <button
                  type="submit"
                  className="agenda-primary-button"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar agendamento"}
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
                <option value="CANCELADO_PACIENTE">
                  Cancelado pelo paciente
                </option>
                <option value="CANCELADO_FISIOTERAPEUTA">
                  Cancelado pela fisioterapeuta
                </option>
              </select>
            </label>
          </div>

          <div className="agenda-list">
            {filtrados.length > 0 ? (
              filtrados
                .slice()
                .sort((a, b) =>
                  `${a.data}T${a.horaInicio}`.localeCompare(
                    `${b.data}T${b.horaInicio}`,
                  ),
                )
                .map((a) => (
                  <article className="agenda-appointment" key={a.id}>
                    <div className="agenda-time">
                      <strong>{a.horaInicio.slice(0, 5)}</strong>
                      <span>até {a.horaFim.slice(0, 5)}</span>
                    </div>
                    <div className="agenda-appointment-info">
                      <strong>{a.paciente?.nome ?? "Paciente"}</strong>
                      <span>
                        {formatarData(a.data)} ·{" "}
                        {formatarTipo(a.tipoAgendamento)} · #{a.id}
                      </span>
                    </div>
                    <span
                      className={`agenda-status ${a.statusAgendamento.toLowerCase()}`}
                    >
                      {formatarStatus(a.statusAgendamento)}
                    </span>
                  </article>
                ))
            ) : (
              <div className="agenda-empty">
                <span className="agenda-empty-icon">◷</span>
                <h3>Nenhum agendamento encontrado</h3>
                <p>
                  {agendamentos.length === 0
                    ? "Crie um agendamento para começar a organizar a agenda."
                    : "Tente alterar a busca ou os filtros selecionados."}
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
            Exibindo <strong>{filtrados.length}</strong> de{" "}
            <strong>{agendamentos.length}</strong> agendamentos
            <span>Registros recebidos nesta sessão.</span>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
