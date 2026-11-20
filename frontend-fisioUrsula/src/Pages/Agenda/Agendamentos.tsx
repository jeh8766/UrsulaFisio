
import { useEffect, useMemo, useState, type FormEvent } from "react";
import ModuleLayout from "../ModuleLayout/ModuleLayout";
import "./Agendamentos.css";

type TipoAgendamento = "AVALIACAO" | "ATENDIMENTO";

type StatusAgendamento =
  | "CANCELADO_PACIENTE"
  | "CANCELADO_FISIOTERAPEUTA"
  | "CONFIRMADO"
  | "PENDENTE"
  | "REMARCADO"
  | "CONCLUIDO"
  | "REALIZADO";

type Paciente = {
  id: number;
  nome: string;
};

type Agendamento = {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoAgendamento: TipoAgendamento;
  statusAgendamento: StatusAgendamento;
  paciente?: Paciente;
};

type RespostaCsrf = {
  headerName: string;
  token: string;
};

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

const API_AGENDAMENTOS = `${API_URL}/agendamentos`;
const API_PACIENTES = `${API_URL}/pacientes`;
const API_CSRF = `${API_URL}/csrf`;

function obterDataAtual() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function obterMesAtual() {
  const hoje = new Date();

  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
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
    CONCLUIDO: "Concluído",
    REALIZADO: "Realizado",
  };

  return nomes[status] ?? status;
}

function normalizarPaciente(v: any): Paciente | null {
  const id = Number(v?.id ?? v?.pacienteId ?? v?.idPaciente);
  const nome = String(v?.nome ?? v?.nomePaciente ?? "").trim();

  return Number.isInteger(id) && id > 0 && nome ? { id, nome } : null;
}

function formatarMes(mes: string) {
  const [ano, numeroMes] = mes.split("-").map(Number);

  return new Date(ano, numeroMes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function alterarMes(mes: string, quantidade: number) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  const novaData = new Date(ano, numeroMes - 1 + quantidade, 1);

  return `${novaData.getFullYear()}-${String(
    novaData.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function obterDiasDoMes(mes: string): (number | null)[] {
  const [ano, numeroMes] = mes.split("-").map(Number);

  const primeiroDia = new Date(ano, numeroMes - 1, 1);
  const ultimoDia = new Date(ano, numeroMes, 0);

  // O calendário começa na segunda-feira.
  const deslocamento = (primeiroDia.getDay() + 6) % 7;

  return [
    ...Array.from({ length: deslocamento }, () => null),
    ...Array.from({ length: ultimoDia.getDate() }, (_, i) => i + 1),
  ];
}

function obterDataFormatadaParaApi(mes: string, dia: number) {
  return `${mes}-${String(dia).padStart(2, "0")}`;
}

async function obterTokenCsrf(): Promise<RespostaCsrf> {
  const respostaCsrf = await fetch(API_CSRF, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!respostaCsrf.ok) {
    throw new Error(
      `Não foi possível obter o token CSRF (${respostaCsrf.status}).`,
    );
  }

  const csrf: RespostaCsrf = await respostaCsrf.json();

  if (!csrf.headerName || !csrf.token) {
    throw new Error(
      "O backend não retornou um token CSRF válido. Verifique o endpoint /csrf.",
    );
  }

  return csrf;
}

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const [pacienteId, setPacienteId] = useState("");
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [pacientesEncontrados, setPacientesEncontrados] = useState<Paciente[]>([]);
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

  // Estados da visualização mensal.
  const [mesSelecionado, setMesSelecionado] = useState(obterMesAtual());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [carregandoAgendamentos, setCarregandoAgendamentos] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState("");

  const hoje = obterDataAtual();

  // ============================================================
  // CARREGAR AGENDAMENTOS DO MÊS SELECIONADO
  // ============================================================

  useEffect(() => {
    const controller = new AbortController();

    async function carregarAgendamentos() {
      try {
        setCarregandoAgendamentos(true);
        setErroCarregamento("");

        const [ano, numeroMes] = mesSelecionado.split("-").map(Number);

        const inicio = `${mesSelecionado}-01`;

        const ultimoDia = new Date(ano, numeroMes, 0).getDate();

        const fim = `${mesSelecionado}-${String(ultimoDia).padStart(2, "0")}`;

        const resposta = await fetch(
          `${API_AGENDAMENTOS}?inicio=${inicio}&fim=${fim}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          },
        );

        if (!resposta.ok) {
          throw new Error(
            `Não foi possível carregar os agendamentos (${resposta.status}).`,
          );
        }

        const dados: unknown = await resposta.json();

        const lista: Agendamento[] = (Array.isArray(dados) ? dados : [])
          .map((item: any) => {
            const paciente = normalizarPaciente(
              item.paciente ?? {
                id: item.pacienteId,
                nome: item.pacienteNome,
              },
            );

            return {
              id: Number(item.id),
              data: String(item.data ?? ""),
              horaInicio: String(item.horaInicio ?? ""),
              horaFim: String(item.horaFim ?? ""),
              tipoAgendamento: item.tipoAgendamento,
              statusAgendamento: item.statusAgendamento,
              paciente: paciente ?? undefined,
            };
          })
          .filter(
            (item) =>
              Number.isInteger(item.id) &&
              item.id > 0 &&
              item.data &&
              item.horaInicio &&
              item.horaFim,
          );

        setAgendamentos(lista);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;

        setAgendamentos([]);

        setErroCarregamento(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar os agendamentos.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregandoAgendamentos(false);
        }
      }
    }

    carregarAgendamentos();

    return () => controller.abort();
  }, [mesSelecionado]);

  // ============================================================
  // PESQUISA DE PACIENTES
  // ============================================================

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
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!r.ok) {
          throw new Error(
            `Não foi possível pesquisar pacientes (${r.status}).`,
          );
        }

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
        if (!controller.signal.aborted) {
          setCarregandoPacientes(false);
        }
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

  // ============================================================
  // CRIAR AGENDAMENTO
  // ============================================================

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

      const csrf = await obterTokenCsrf();

      const r = await fetch(
        `${API_AGENDAMENTOS}/${rota}/${encodeURIComponent(pacienteId)}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            data,
            horaInicio,
            horaFim,
          }),
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
        paciente:
          normalizarPaciente(dto.paciente) ?? pacienteSelecionado,
      };

      // Se o agendamento pertence ao mês atualmente aberto,
      // atualiza a tela imediatamente.
      if (salvo.data.startsWith(mesSelecionado)) {
        setAgendamentos((anteriores) => [
          ...anteriores.filter((a) => a.id !== salvo.id),
          salvo,
        ]);
      } else {
        // Se pertence a outro mês, navega para o mês do agendamento.
        setMesSelecionado(salvo.data.slice(0, 7));
      }

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

  // ============================================================
  // FILTROS
  // ============================================================

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return agendamentos.filter((a) => {
      const nome = a.paciente?.nome ?? "";
      const idPaciente = String(a.paciente?.id ?? "");

      const correspondeBusca =
        nome.toLowerCase().includes(termo) ||
        idPaciente.includes(termo) ||
        String(a.id).includes(termo);

      const correspondeTipo =
        filtroTipo === "TODOS" || a.tipoAgendamento === filtroTipo;

      const correspondeStatus =
        filtroStatus === "TODOS" || a.statusAgendamento === filtroStatus;

      return correspondeBusca && correspondeTipo && correspondeStatus;
    });
  }, [agendamentos, busca, filtroTipo, filtroStatus]);

  const diasDoMes = useMemo(
    () => obterDiasDoMes(mesSelecionado),
    [mesSelecionado],
  );

  const agendamentosPorDia = useMemo(() => {
    const agrupados: Record<string, Agendamento[]> = {};

    filtrados.forEach((agendamento) => {
      if (!agrupados[agendamento.data]) {
        agrupados[agendamento.data] = [];
      }

      agrupados[agendamento.data].push(agendamento);
    });

    return agrupados;
  }, [filtrados]);

  const agendamentosDoDia = diaSelecionado
    ? filtrados.filter((a) => a.data === diaSelecionado)
    : filtrados;

  function selecionarDia(dia: number) {
    const dataSelecionada = obterDataFormatadaParaApi(
      mesSelecionado,
      dia,
    );

    setDiaSelecionado((atual) =>
      atual === dataSelecionada ? null : dataSelecionada,
    );
  }

  function navegarMes(quantidade: number) {
    setMesSelecionado((mes) => alterarMes(mes, quantidade));
    setDiaSelecionado(null);
  }

  // ============================================================
  // TELA
  // ============================================================

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
              <span>Registros do mês selecionado</span>
            </div>
          </article>

          <article className="agenda-stat-card">
            <span className="agenda-stat-icon pending">◷</span>
            <div>
              <small>Avaliações</small>
              <strong>
                {
                  agendamentos.filter(
                    (a) => a.tipoAgendamento === "AVALIACAO",
                  ).length
                }
              </strong>
              <span>Avaliações do mês</span>
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
              <span>Atendimentos do mês</span>
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
                      setTipoAgendamento(
                        e.target.value as TipoAgendamento,
                      )
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
                        Nenhum paciente encontrado. Confira o nome ou cadastre
                        o paciente primeiro.
                      </small>
                    )}

                  {pacientesEncontrados.length > 0 &&
                    !pacienteSelecionado && (
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

          {/* ================================================== */}
          {/* CALENDÁRIO MENSAL */}
          {/* ================================================== */}

          <section className="agenda-calendar">
            <div className="agenda-calendar-heading">
              <div>
                <span className="agenda-calendar-eyebrow">
                  VISÃO GERAL
                </span>
                <h3>Calendário mensal</h3>
                <p>
                  Visualize os agendamentos distribuídos ao longo do mês.
                </p>
              </div>

              <div className="agenda-calendar-navigation">
                <button
                  type="button"
                  onClick={() => navegarMes(-1)}
                  aria-label="Mês anterior"
                >
                  ‹
                </button>

                <strong>{formatarMes(mesSelecionado)}</strong>

                <button
                  type="button"
                  onClick={() => navegarMes(1)}
                  aria-label="Próximo mês"
                >
                  ›
                </button>

                <button
                  type="button"
                  className="agenda-calendar-today"
                  onClick={() => {
                    setMesSelecionado(obterMesAtual());
                    setDiaSelecionado(null);
                  }}
                >
                  Hoje
                </button>
              </div>
            </div>

            <div className="agenda-calendar-weekdays">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                (dia) => (
                  <span key={dia}>{dia}</span>
                ),
              )}
            </div>

            <div className="agenda-calendar-grid">
              {diasDoMes.map((dia, indice) => {
                if (dia === null) {
                  return (
                    <div
                      key={`vazio-${indice}`}
                      className="agenda-calendar-day agenda-calendar-day-empty"
                    />
                  );
                }

                const dataDia = obterDataFormatadaParaApi(
                  mesSelecionado,
                  dia,
                );

                const compromissos = agendamentosPorDia[dataDia] ?? [];

                const selecionado = diaSelecionado === dataDia;
                const hojeEhEsteDia = hoje === dataDia;

                return (
                  <button
                    type="button"
                    key={dataDia}
                    className={[
                      "agenda-calendar-day",
                      selecionado ? "selected" : "",
                      hojeEhEsteDia ? "today" : "",
                      compromissos.length > 0
                        ? "has-appointments"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => selecionarDia(dia)}
                    aria-label={`${dia} de ${formatarMes(mesSelecionado)}, ${compromissos.length} agendamentos`}
                    aria-pressed={selecionado}
                  >
                    <span className="agenda-calendar-day-number">
                      {dia}
                    </span>

                    {compromissos.length > 0 && (
                      <div className="agenda-calendar-day-content">
                        <span className="agenda-calendar-count">
                          {compromissos.length}{" "}
                          {compromissos.length === 1
                            ? "agendamento"
                            : "agendamentos"}
                        </span>

                        <div className="agenda-calendar-dots">
                          {compromissos.slice(0, 4).map((a) => (
                            <span
                              key={a.id}
                              className={
                                a.tipoAgendamento === "AVALIACAO"
                                  ? "evaluation"
                                  : "attendance"
                              }
                              title={`${a.horaInicio.slice(0, 5)} - ${a.paciente?.nome ?? "Paciente"}`}
                            />
                          ))}

                          {compromissos.length > 4 && (
                            <small>
                              +{compromissos.length - 4}
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="agenda-calendar-legend">
              <span>
                <i className="evaluation" />
                Avaliação
              </span>

              <span>
                <i className="attendance" />
                Atendimento
              </span>
            </div>

            {diaSelecionado && (
              <div className="agenda-calendar-selection">
                <div>
                  <strong>
                    Dia selecionado: {formatarData(diaSelecionado)}
                  </strong>
                  <span>
                    {agendamentosDoDia.length}{" "}
                    {agendamentosDoDia.length === 1
                      ? "agendamento encontrado"
                      : "agendamentos encontrados"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDiaSelecionado(null)}
                >
                  Ver mês completo
                </button>
              </div>
            )}
          </section>

          {/* ================================================== */}
          {/* PESQUISA E FILTROS */}
          {/* ================================================== */}

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
                <option value="CONCLUIDO">Concluído</option>
                <option value="REALIZADO">Realizado</option>
                <option value="CANCELADO_PACIENTE">
                  Cancelado pelo paciente
                </option>
                <option value="CANCELADO_FISIOTERAPEUTA">
                  Cancelado pela fisioterapeuta
                </option>
              </select>
            </label>
          </div>

          {/* ================================================== */}
          {/* LISTA DE AGENDAMENTOS */}
          {/* ================================================== */}

          <div className="agenda-list">
            {carregandoAgendamentos ? (
              <div className="agenda-empty">
                <h3>Carregando agendamentos...</h3>
                <p>
                  Estamos buscando os compromissos deste mês.
                </p>
              </div>
            ) : erroCarregamento ? (
              <div className="agenda-message error" role="alert">
                {erroCarregamento}
              </div>
            ) : agendamentosDoDia.length > 0 ? (
              agendamentosDoDia
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
                      <strong>
                        {a.paciente?.nome ?? "Paciente"}
                      </strong>

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
                  {diaSelecionado
                    ? "Não existem agendamentos para este dia com os filtros selecionados."
                    : agendamentos.length === 0
                      ? "Não existem agendamentos cadastrados neste mês."
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
            Exibindo <strong>{agendamentosDoDia.length}</strong> de{" "}
            <strong>{filtrados.length}</strong> agendamentos filtrados
            <span>
              {diaSelecionado
                ? `Dia ${formatarData(diaSelecionado)}`
                : `Mês de ${formatarMes(mesSelecionado)}`}
            </span>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
