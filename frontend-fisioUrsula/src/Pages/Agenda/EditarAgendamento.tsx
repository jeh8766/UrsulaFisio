
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ModuleLayout from "../ModuleLayout/ModuleLayout";
import "./Agendamentos.css";

type TipoAgendamento = "AVALIACAO" | "ATENDIMENTO";

type StatusAgendamento =
  | "CANCELADO"
  | "CONFIRMADO"
  | "PENDENTE"
  | "REMARCADO";

type Paciente = {
  id: number;
  nome: string;
};

type Agendamento = {
  id: number;
  pacienteId: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoAgendamento: TipoAgendamento;
  statusAgendamento: StatusAgendamento;
  paciente: Paciente;
};

type RespostaCsrf = {
  headerName: string;
  token: string;
};

const API_AGENDAMENTOS = "http://localhost:8080/agendamentos";
const API_PACIENTES = "http://localhost:8080/pacientes";
const API_CSRF = "http://localhost:8080/csrf";

function obterDataAtual() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    CANCELADO: "Cancelado",
    CONFIRMADO: "Confirmado",
    PENDENTE: "Pendente",
    REMARCADO: "Remarcado",
  };

  return nomes[status] ?? status;
}

function normalizarPaciente(valor: any): Paciente | null {
  const id = Number(
    valor?.id ?? valor?.pacienteId ?? valor?.idPaciente,
  );

  const nome = String(
    valor?.nome ?? valor?.nomePaciente ?? "",
  ).trim();

  return Number.isInteger(id) && id > 0 && nome
    ? { id, nome }
    : null;
}


function normalizarAgendamento(valor: any): Agendamento | null {
  const id = Number(valor?.id);
  const pacienteId = Number(valor?.pacienteId);
  const nome = String(valor?.nome ?? "").trim();

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(pacienteId) ||
    pacienteId <= 0 ||
    !nome ||
    !valor?.data ||
    !valor?.horaInicio ||
    !valor?.horaFim
  ) {
    return null;
  }

  return {
    id,
    pacienteId,
    data: String(valor.data),
    horaInicio: String(valor.horaInicio).slice(0, 8),
    horaFim: String(valor.horaFim).slice(0, 8),
    tipoAgendamento: valor.tipoAgendamento,
    statusAgendamento: valor.statusAgendamento,
    paciente: {
      id: pacienteId,
      nome,
    },
  };
}

async function obterTokenCsrf(): Promise<RespostaCsrf> {
  const resposta = await fetch(API_CSRF, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível obter o token CSRF (${resposta.status}).`,
    );
  }

  const csrf: RespostaCsrf = await resposta.json();

  if (!csrf.headerName || !csrf.token) {
    throw new Error("O backend não retornou um token CSRF válido.");
  }

  return csrf;
}

export default function EditarAgendamento() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();

  const [agendamento, setAgendamento] =
    useState<Agendamento | null>(null);

  const [pacienteSelecionado, setPacienteSelecionado] =
    useState<Paciente | null>(null);

  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [pacientesEncontrados, setPacientesEncontrados] =
    useState<Paciente[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [carregandoPacientes, setCarregandoPacientes] =
    useState(false);

  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const hoje = obterDataAtual();

  // Carrega o agendamento selecionado.
  
useEffect(() => {
  const controller = new AbortController();

  async function carregarAgendamento() {
    try {
      setCarregando(true);
      setErro("");

      if (!id || !/^[1-9]\d*$/.test(id)) {
        throw new Error("O identificador do agendamento é inválido.");
      }

      const resposta = await fetch(
        `${API_AGENDAMENTOS}/${encodeURIComponent(id)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        },
      );

      if (resposta.status === 404) {
        throw new Error("Agendamento não encontrado.");
      }

      if (!resposta.ok) {
        throw new Error(
          `Não foi possível carregar o agendamento (${resposta.status}).`,
        );
      }

      const dados: unknown = await resposta.json();
      const encontrado = normalizarAgendamento(dados);

      if (!encontrado) {
        throw new Error(
          "Os dados retornados para o agendamento são inválidos.",
        );
      }

      setAgendamento(encontrado);
      setPacienteSelecionado(encontrado.paciente);
      setBuscaPaciente(encontrado.paciente.nome);
      setData(encontrado.data);
      setHoraInicio(encontrado.horaInicio.slice(0, 5));
      setHoraFim(encontrado.horaFim.slice(0, 5));
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return;
      }

      setAgendamento(null);
      setPacienteSelecionado(null);

      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar o agendamento.",
      );
    } finally {
      if (!controller.signal.aborted) {
        setCarregando(false);
      }
    }
  }

  carregarAgendamento();

  return () => controller.abort();
}, [id]);

  // Pesquisa pacientes pelo nome, usando o endpoint já existente.
  useEffect(() => {
    const termo = buscaPaciente.trim();

    if (!termo || pacienteSelecionado?.nome === termo) {
      setPacientesEncontrados([]);
      setCarregandoPacientes(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setCarregandoPacientes(true);

        const parametros = new URLSearchParams({
          nome: termo,
          ativo: "true",
        });

        const resposta = await fetch(
          `${API_PACIENTES}?${parametros.toString()}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!resposta.ok) {
          throw new Error(
            `Não foi possível pesquisar pacientes (${resposta.status}).`,
          );
        }

        const dados: unknown = await resposta.json();

        setPacientesEncontrados(
          (Array.isArray(dados) ? dados : [])
            .map(normalizarPaciente)
            .filter((paciente): paciente is Paciente => paciente !== null),
        );
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }

        setPacientesEncontrados([]);
        setErro(
          e instanceof Error
            ? e.message
            : "Erro ao pesquisar pacientes.",
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

  function selecionarPaciente(paciente: Paciente) {
    setPacienteSelecionado(paciente);
    setBuscaPaciente(paciente.nome);
    setPacientesEncontrados([]);
    setErro("");
  }

  function limparPaciente() {
    setPacienteSelecionado(null);
    setBuscaPaciente("");
    setPacientesEncontrados([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!id || !pacienteSelecionado || !data || !horaInicio || !horaFim) {
      setErro(
        "Selecione um paciente e preencha todos os campos obrigatórios.",
      );
      return;
    }

    if (horaInicio >= horaFim) {
      setErro(
        "O horário de início deve ser anterior ao horário de término.",
      );
      return;
    }

    if (data < hoje) {
      setErro("Selecione uma data de hoje em diante.");
      return;
    }

    if (agendamento?.statusAgendamento === "CANCELADO") {
      setErro(
        "Este agendamento está cancelado e não pode ser editado.",
      );
      return;
    }

    try {
      setSalvando(true);

      const csrf = await obterTokenCsrf();

      const resposta = await fetch(
        `${API_AGENDAMENTOS}/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            pacienteId: pacienteSelecionado.id,
            data,
            horaInicio,
            horaFim,
          }),
        },
      );

      if (!resposta.ok) {
        const mensagem = await resposta.text();

        throw new Error(
          mensagem ||
            `Não foi possível atualizar o agendamento (${resposta.status}).`,
        );
      }

      /*
       * Atualiza os dados locais mesmo se o backend responder
       * com HTTP 204 (sem conteúdo).
       */
      setAgendamento((atual) =>
        atual
          ? {
              ...atual,
              pacienteId: pacienteSelecionado.id,
              paciente: pacienteSelecionado,
              data,
              horaInicio,
              horaFim,
            }
          : atual,
      );

      setSucesso("Agendamento atualizado com sucesso!");
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível atualizar o agendamento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ModuleLayout
      title="Editar agendamento"
      subtitle="Altere o paciente, a data e os horários do agendamento."
      eyebrow="GESTÃO DE AGENDA"
    >
      <div className="agenda-page">
        <section className="agenda-panel">
          <div className="agenda-panel-heading">
            <div>
              <h2>Editar agendamento #{id}</h2>
              <p>
                Modifique os dados necessários e salve as alterações.
              </p>
            </div>

            <button
              type="button"
              className="agenda-secondary-button"
              onClick={() => navigate(-1)}
            >
              Voltar
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

          {carregando ? (
            <div className="agenda-empty">
              <span className="agenda-empty-icon">◷</span>
              <h3>Carregando agendamento...</h3>
              <p>Aguarde enquanto buscamos os dados.</p>
            </div>
          ) : agendamento ? (
            <>
              <div className="agenda-stats">
                <article className="agenda-stat-card">
                  <span className="agenda-stat-icon">▦</span>
                  <div>
                    <small>Tipo de agendamento</small>
                    <strong>
                      {formatarTipo(agendamento.tipoAgendamento)}
                    </strong>
                    <span>O tipo será mantido</span>
                  </div>
                </article>

                <article className="agenda-stat-card">
                  <span className="agenda-stat-icon pending">◷</span>
                  <div>
                    <small>Status atual</small>
                    <strong>
                      {formatarStatus(agendamento.statusAgendamento)}
                    </strong>
                    <span>O status será mantido</span>
                  </div>
                </article>
              </div>

              {agendamento.statusAgendamento === "CANCELADO" ? (
                <div className="agenda-message error" role="alert">
                  Este agendamento está cancelado e não pode ser editado.
                </div>
              ) : (
                <form className="agenda-form" onSubmit={handleSubmit}>
                  <div className="agenda-form-heading">
                    <span>01</span>
                    <div>
                      <h3>Dados do agendamento</h3>
                      <p>
                        Confira os dados atuais antes de salvar.
                      </p>
                    </div>
                  </div>

                  <div className="agenda-form-grid">
                    <div className="agenda-patient-field">
                      <label htmlFor="editar-busca-paciente">
                        Paciente *
                      </label>

                      <div className="agenda-patient-input-row">
                        <input
                          id="editar-busca-paciente"
                          type="search"
                          autoComplete="off"
                          value={buscaPaciente}
                          onChange={(e) => {
                            setBuscaPaciente(e.target.value);
                            setPacienteSelecionado(null);
                            setErro("");
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

                      {!carregandoPacientes &&
                        buscaPaciente.trim() &&
                        !pacienteSelecionado &&
                        pacientesEncontrados.length === 0 && (
                          <small className="agenda-patient-hint">
                            Nenhum paciente encontrado. Confira o nome.
                          </small>
                        )}

                      {pacientesEncontrados.length > 0 &&
                        !pacienteSelecionado && (
                          <ul
                            className="agenda-patient-results"
                            role="listbox"
                            aria-label="Pacientes encontrados"
                          >
                            {pacientesEncontrados.map((paciente) => (
                              <li key={paciente.id}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={false}
                                  onClick={() =>
                                    selecionarPaciente(paciente)
                                  }
                                >
                                  <span>{paciente.nome}</span>
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
                      * Campos obrigatórios
                    </span>

                    <button
                      type="submit"
                      className="agenda-primary-button"
                      disabled={salvando}
                    >
                      {salvando
                        ? "Salvando alterações..."
                        : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              )}

              <div className="agenda-footer">
                Agendamento #{agendamento.id}
                <span>
                  Data atual: {formatarData(agendamento.data)} ·{" "}
                  {agendamento.horaInicio.slice(0, 5)} às{" "}
                  {agendamento.horaFim.slice(0, 5)}
                </span>
              </div>
            </>
          ) : (
            <div className="agenda-empty">
              <span className="agenda-empty-icon">◷</span>
              <h3>Agendamento não encontrado</h3>
              <p>Verifique o identificador ou volte para a agenda.</p>

              <button
                type="button"
                className="agenda-primary-button"
                onClick={() => navigate(-1)}
              >
                Voltar para a agenda
              </button>
            </div>
          )}
        </section>
      </div>
    </ModuleLayout>
  );
}
