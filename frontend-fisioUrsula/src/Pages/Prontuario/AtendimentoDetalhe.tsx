
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './AtendimentoDetalhe.css';

const API_URL = 'http://localhost:8080';

type Atendimento = {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  intercorrencia: string | null;
  evolucao: string | null;
  valor: number;
  taxaDeslocamento: number;
  statusAtendimento: string;
  statusPagamento: string;
  pacienteId: number;
  pacienteNome: string;
  sinaisVitaisId: number | null;
};

type Exercicio = {
  id: number;
  nome: string;
  tipo: string;
  descricao: string;
};

type AtendimentoExercicio = {
  id: number;
  atendimentoId: number;
  nomeExercicio: string;
};

type CsrfTokenResponse = {
  token: string;
  headerName: string;
};

type CriarSinaisVitaisResponse = {
  id: number;
  pressaoArterial: string;
  saturacao: number;
  frequenciaCardiaca: number;
  frequenciaRespiratoria: number;
};

function formatarData(data: string): string {
  if (!data) return '-';

  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

function formatarHora(hora: string): string {
  return hora?.substring(0, 5) ?? '-';
}

function formatarMoeda(valor: number | null | undefined): string {
  return Number(valor ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

async function obterMensagemErro(response: Response): Promise<string> {
  try {
    const erro = await response.json();

    return (
      erro.message ||
      erro.mensagem ||
      erro.error ||
      'Ocorreu um erro ao comunicar com o servidor.'
    );
  } catch {
    return 'Ocorreu um erro ao comunicar com o servidor.';
  }
}

async function obterTokenCsrf(): Promise<CsrfTokenResponse> {
  const response = await fetch(`${API_URL}/csrf`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Não foi possível obter o token de segurança.');
  }

  const csrf: CsrfTokenResponse = await response.json();

  if (!csrf.token || !csrf.headerName) {
    throw new Error('O servidor não retornou um token CSRF válido.');
  }

  return csrf;
}

export default function AtendimentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const atendimentoId = Number(id);

  // Dados principais
  const [atendimento, setAtendimento] = useState<Atendimento | null>(null);

  // Exercícios
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState<number[]>([]);
  const [exerciciosRegistrados, setExerciciosRegistrados] = useState<
    AtendimentoExercicio[]
  >([]);

  // Modal de exercícios
  const [modalExerciciosAberto, setModalExerciciosAberto] = useState(false);
  const [buscaExercicio, setBuscaExercicio] = useState('');

  // Sinais vitais
  const [pressaoArterial, setPressaoArterial] = useState('');
  const [saturacao, setSaturacao] = useState('');
  const [frequenciaCardiaca, setFrequenciaCardiaca] = useState('');
  const [frequenciaRespiratoria, setFrequenciaRespiratoria] = useState('');

  // Registro clínico
  const [intercorrencia, setIntercorrencia] = useState('');
  const [evolucao, setEvolucao] = useState('');

  // Estados da tela
  const [carregando, setCarregando] = useState(true);
  const [carregandoExercicios, setCarregandoExercicios] = useState(false);
  const [salvandoSinais, setSalvandoSinais] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

  const [erro, setErro] = useState('');
  const [notice, setNotice] = useState('');

  const atendimentoConcluido =
    atendimento?.statusAtendimento === 'ATENDIDO';

  const exerciciosFiltrados = useMemo(() => {
    const termo = buscaExercicio.trim().toLowerCase();

    if (!termo) return exercicios;

    return exercicios.filter((exercicio) =>
      exercicio.nome.toLowerCase().includes(termo)
    );
  }, [exercicios, buscaExercicio]);

  const exerciciosSelecionadosDetalhes = useMemo(() => {
    return exercicios.filter((exercicio) =>
      exerciciosSelecionados.includes(exercicio.id)
    );
  }, [exercicios, exerciciosSelecionados]);

  // Carrega os dados do atendimento e as listas auxiliares
  useEffect(() => {
    if (!id || !Number.isInteger(atendimentoId) || atendimentoId <= 0) {
      setErro('ID de atendimento inválido.');
      setCarregando(false);
      return;
    }

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro('');

        const [atendimentoResponse, exerciciosResponse, associadosResponse] =
          await Promise.all([
            fetch(`${API_URL}/atendimentos/${atendimentoId}`, {
              method: 'GET',
              credentials: 'include',
            }),

            fetch(`${API_URL}/exercicios?ativo=true`, {
              method: 'GET',
              credentials: 'include',
            }),

            fetch(`${API_URL}/atendimento-exercicio/${atendimentoId}`, {
              method: 'GET',
              credentials: 'include',
            }),
          ]);

        if (!atendimentoResponse.ok) {
          throw new Error(await obterMensagemErro(atendimentoResponse));
        }

        if (!exerciciosResponse.ok) {
          throw new Error(await obterMensagemErro(exerciciosResponse));
        }

        if (!associadosResponse.ok && associadosResponse.status !== 404) {
          throw new Error(await obterMensagemErro(associadosResponse));
        }

        const dadosAtendimento: Atendimento =
          await atendimentoResponse.json();

        const dadosExercicios: Exercicio[] =
          await exerciciosResponse.json();

        const dadosAssociados: AtendimentoExercicio[] =
          associadosResponse.ok
            ? await associadosResponse.json()
            : [];

        setAtendimento(dadosAtendimento);
        setExercicios(dadosExercicios);
        setExerciciosRegistrados(dadosAssociados);

        setIntercorrencia(dadosAtendimento.intercorrencia ?? '');
        setEvolucao(dadosAtendimento.evolucao ?? '');
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o atendimento.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id, atendimentoId]);

  // Salva os sinais vitais vinculados ao atendimento
  async function salvarSinaisVitais(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro('');
    setNotice('');

    if (!atendimento) return;

    if (atendimento.sinaisVitaisId !== null) {
      setErro('Os sinais vitais deste atendimento já foram registrados.');
      return;
    }

    const saturacaoNumerica = Number(saturacao);
    const frequenciaCardiacaNumerica = Number(frequenciaCardiaca);
    const frequenciaRespiratoriaNumerica = Number(frequenciaRespiratoria);

    if (
      !pressaoArterial.trim() ||
      saturacao === '' ||
      frequenciaCardiaca === '' ||
      frequenciaRespiratoria === ''
    ) {
      setErro('Preencha todos os campos de sinais vitais.');
      return;
    }

    if (
      !Number.isFinite(saturacaoNumerica) ||
      saturacaoNumerica < 0 ||
      saturacaoNumerica > 100 ||
      !Number.isInteger(frequenciaCardiacaNumerica) ||
      frequenciaCardiacaNumerica <= 0 ||
      !Number.isInteger(frequenciaRespiratoriaNumerica) ||
      frequenciaRespiratoriaNumerica <= 0
    ) {
      setErro('Informe valores válidos para os sinais vitais.');
      return;
    }

    try {
      setSalvandoSinais(true);

      const csrf = await obterTokenCsrf();

      const response = await fetch(
        `${API_URL}/sinais_vitais/atendimento/${atendimentoId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            pressaoArterial: pressaoArterial.trim(),
            saturacao: saturacaoNumerica,
            frequenciaCardiaca: frequenciaCardiacaNumerica,
            frequenciaRespiratoria: frequenciaRespiratoriaNumerica,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      const sinaisVitais: CriarSinaisVitaisResponse =
        await response.json();

      if (!sinaisVitais.id) {
        throw new Error(
          'Os sinais vitais foram enviados, mas a API não retornou o ID.'
        );
      }

      setAtendimento((anterior) =>
        anterior
          ? { ...anterior, sinaisVitaisId: sinaisVitais.id }
          : anterior
      );

      setPressaoArterial('');
      setSaturacao('');
      setFrequenciaCardiaca('');
      setFrequenciaRespiratoria('');

      setNotice('Sinais vitais registrados com sucesso!');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar os sinais vitais.'
      );
    } finally {
      setSalvandoSinais(false);
    }
  }

  // Abre o modal e carrega novamente os exercícios ativos
  async function abrirModalExercicios() {
    setErro('');
    setNotice('');

    try {
      setCarregandoExercicios(true);

      const response = await fetch(`${API_URL}/exercicios?ativo=true`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      const dados: Exercicio[] = await response.json();

      setExercicios(dados);
      setModalExerciciosAberto(true);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os exercícios.'
      );
    } finally {
      setCarregandoExercicios(false);
    }
  }

  // Marca ou desmarca um exercício sem chamar a API
  function alternarExercicio(exercicioId: number) {
    setExerciciosSelecionados((anteriores) =>
      anteriores.includes(exercicioId)
        ? anteriores.filter((id) => id !== exercicioId)
        : [...anteriores, exercicioId]
    );
  }

  // Conclui o atendimento e envia os exercícios selecionados
  async function concluirAtendimento() {
    setErro('');
    setNotice('');

    if (!atendimento) return;

    if (atendimentoConcluido) {
      setErro('Este atendimento já foi concluído.');
      return;
    }

    if (!atendimento.sinaisVitaisId) {
      setErro('Registre os sinais vitais antes de concluir o atendimento.');
      return;
    }

    if (!evolucao.trim()) {
      setErro('Informe a evolução do paciente antes de concluir.');
      return;
    }

    try {
      setConcluindo(true);

      const csrf = await obterTokenCsrf();

      const response = await fetch(
        `${API_URL}/atendimentos/${atendimentoId}/concluir`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            intercorrencia: intercorrencia.trim() || null,
            evolucao: evolucao.trim(),
            exerciciosIds: exerciciosSelecionados,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      setAtendimento((anterior) =>
        anterior
          ? {
              ...anterior,
              statusAtendimento: 'ATENDIDO',
              intercorrencia: intercorrencia.trim() || null,
              evolucao: evolucao.trim(),
            }
          : anterior
      );

      setExerciciosRegistrados(
        exerciciosSelecionadosDetalhes.map((exercicio, indice) => ({
          id: -(indice + 1),
          atendimentoId,
          nomeExercicio: exercicio.nome,
        }))
      );

      setExerciciosSelecionados([]);
      setNotice('Atendimento concluído com sucesso!');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir o atendimento.'
      );
    } finally {
      setConcluindo(false);
    }
  }

  if (carregando) {
    return (
      <ModuleLayout
        title="Atendimento"
        subtitle="Carregando os dados da sessão."
        eyebrow="PRONTUÁRIO"
      >
        <div className="detalhe-feedback">Carregando atendimento...</div>
      </ModuleLayout>
    );
  }

  if (!atendimento) {
    return (
      <ModuleLayout
        title="Atendimento"
        subtitle="Não foi possível abrir este atendimento."
        eyebrow="PRONTUÁRIO"
      >
        <div className="detalhe-feedback detalhe-feedback-erro">
          {erro || 'Atendimento não encontrado.'}
        </div>

        <button
          type="button"
          className="detalhe-button detalhe-button-secundario"
          onClick={() => navigate('/prontuarios')}
        >
          Voltar aos prontuários
        </button>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Atendimento"
      subtitle="Registre os dados clínicos e acompanhe a evolução do paciente."
      eyebrow="REGISTRO DE SESSÃO"
    >
      <div className="detalhe-page">
        {notice && (
          <div className="detalhe-feedback detalhe-feedback-sucesso" role="status">
            {notice}
          </div>
        )}

        {erro && (
          <div className="detalhe-feedback detalhe-feedback-erro" role="alert">
            {erro}
          </div>
        )}

        {/* DADOS DO AGENDAMENTO */}
        <section className="detalhe-panel">
          <div className="detalhe-panel-heading">
            <div>
              <span className="detalhe-eyebrow">DADOS DO PACIENTE</span>
              <h2>{atendimento.pacienteNome}</h2>
              <p>Paciente #{atendimento.pacienteId}</p>
            </div>

            <span
              className={`detalhe-status ${
                atendimentoConcluido ? 'detalhe-status-concluido' : ''
              }`}
            >
              {atendimento.statusAtendimento}
            </span>
          </div>

          <div className="detalhe-info-grid">
            <div className="detalhe-info-card">
              <span>Data</span>
              <strong>{formatarData(atendimento.data)}</strong>
            </div>

            <div className="detalhe-info-card">
              <span>Horário</span>
              <strong>
                {formatarHora(atendimento.horaInicio)} às{' '}
                {formatarHora(atendimento.horaFim)}
              </strong>
            </div>

            <div className="detalhe-info-card">
              <span>Atendimento</span>
              <strong>#{atendimento.id}</strong>
            </div>
          </div>
        </section>

        {/* DADOS FINANCEIROS */}
        <section className="detalhe-panel">
          <div className="detalhe-panel-heading">
            <div>
              <h2>Dados financeiros</h2>
              <p>Valores vinculados à sessão.</p>
            </div>

            <span
              className={`detalhe-status ${
                atendimento.statusPagamento === 'PAGO'
                  ? 'detalhe-status-concluido'
                  : ''
              }`}
            >
              Pagamento: {atendimento.statusPagamento}
            </span>
          </div>

          <div className="detalhe-info-grid">
            <div className="detalhe-info-card">
              <span>Valor do atendimento</span>
              <strong>{formatarMoeda(atendimento.valor)}</strong>
            </div>

            <div className="detalhe-info-card">
              <span>Taxa de deslocamento</span>
              <strong>{formatarMoeda(atendimento.taxaDeslocamento)}</strong>
            </div>

            <div className="detalhe-info-card detalhe-total-card">
              <span>Valor total</span>
              <strong>
                {formatarMoeda(
                  Number(atendimento.valor) +
                    Number(atendimento.taxaDeslocamento)
                )}
              </strong>
            </div>
          </div>

          <p className="detalhe-helper">
            O registro do pagamento é independente da conclusão do atendimento.
          </p>
        </section>

        {/* SINAIS VITAIS */}
        <section className="detalhe-panel">
          <div className="detalhe-panel-heading">
            <div>
              <h2>Sinais vitais</h2>
              <p>Registre as medições realizadas durante a sessão.</p>
            </div>

            {atendimento.sinaisVitaisId && (
              <span className="detalhe-status detalhe-status-concluido">
                Registrados
              </span>
            )}
          </div>

          {atendimento.sinaisVitaisId ? (
            <div className="detalhe-registered">
              <strong>
                <span aria-hidden="true">✓</span> Sinais vitais registrados
              </strong>
              <p>
                Registro #{atendimento.sinaisVitaisId} vinculado a este
                atendimento.
              </p>
            </div>
          ) : atendimentoConcluido ? (
            <p className="detalhe-helper">
              Não há sinais vitais registrados para este atendimento.
            </p>
          ) : (
            <form onSubmit={salvarSinaisVitais}>
              <div className="detalhe-form-grid">
                <label className="detalhe-field">
                  Pressão arterial
                  <input
                    value={pressaoArterial}
                    onChange={(evento) =>
                      setPressaoArterial(evento.target.value)
                    }
                    placeholder="Ex.: 120/80 mmHg"
                    maxLength={15}
                    required
                    disabled={salvandoSinais}
                  />
                </label>

                <label className="detalhe-field">
                  Saturação de oxigênio (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={saturacao}
                    onChange={(evento) => setSaturacao(evento.target.value)}
                    placeholder="Ex.: 98"
                    required
                    disabled={salvandoSinais}
                  />
                </label>

                <label className="detalhe-field">
                  Frequência cardíaca (bpm)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={frequenciaCardiaca}
                    onChange={(evento) =>
                      setFrequenciaCardiaca(evento.target.value)
                    }
                    placeholder="Ex.: 72"
                    required
                    disabled={salvandoSinais}
                  />
                </label>

                <label className="detalhe-field">
                  Frequência respiratória (irpm)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={frequenciaRespiratoria}
                    onChange={(evento) =>
                      setFrequenciaRespiratoria(evento.target.value)
                    }
                    placeholder="Ex.: 16"
                    required
                    disabled={salvandoSinais}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="detalhe-button detalhe-button-primary"
                disabled={salvandoSinais}
              >
                {salvandoSinais
                  ? 'Salvando sinais vitais...'
                  : 'Registrar sinais vitais'}
              </button>
            </form>
          )}
        </section>

        {/* EXERCÍCIOS */}
        <section className="detalhe-panel">
          <div className="detalhe-panel-heading">
            <div>
              <h2>Exercícios realizados</h2>
              <p>Selecione os exercícios utilizados durante a sessão.</p>
            </div>

            {!atendimentoConcluido && (
              <button
                type="button"
                className="detalhe-button detalhe-button-secundario"
                onClick={abrirModalExercicios}
                disabled={carregandoExercicios}
              >
                {carregandoExercicios
                  ? 'Carregando...'
                  : '+ Selecionar exercícios'}
              </button>
            )}
          </div>

          {exerciciosSelecionadosDetalhes.length > 0 && (
            <div className="detalhe-exercise-list">
              <h3>Selecionados nesta tela</h3>

              {exerciciosSelecionadosDetalhes.map((exercicio) => (
                <div className="detalhe-exercise-item" key={exercicio.id}>
                  <div>
                    <strong>{exercicio.nome}</strong>
                    <span>{exercicio.tipo}</span>
                  </div>

                  {!atendimentoConcluido && (
                    <button
                      type="button"
                      className="detalhe-remove-button"
                      onClick={() => alternarExercicio(exercicio.id)}
                      aria-label={`Remover ${exercicio.nome}`}
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {exerciciosRegistrados.length > 0 && (
            <div className="detalhe-exercise-list">
              <h3>Exercícios registrados no atendimento</h3>

              {exerciciosRegistrados.map((item) => (
                <div className="detalhe-exercise-item" key={item.id}>
                  <div>
                    <strong>{item.nomeExercicio}</strong>
                  </div>
                  <span className="detalhe-registered-label">Registrado</span>
                </div>
              ))}
            </div>
          )}

          {exerciciosSelecionadosDetalhes.length === 0 &&
            exerciciosRegistrados.length === 0 && (
              <p className="detalhe-helper">
                Nenhum exercício selecionado até o momento.
              </p>
            )}

          {!atendimentoConcluido && (
            <p className="detalhe-helper">
              Os exercícios selecionados serão associados ao atendimento
              quando você clicar em concluir.
            </p>
          )}
        </section>

        {/* REGISTRO CLÍNICO */}
        <section className="detalhe-panel">
          <div className="detalhe-panel-heading">
            <div>
              <h2>Registro clínico</h2>
              <p>Descreva o que aconteceu durante a sessão.</p>
            </div>
          </div>

          <div className="detalhe-form-grid detalhe-form-grid-uma-coluna">
            <label className="detalhe-field">
              Intercorrências
              <textarea
                value={intercorrencia}
                onChange={(evento) =>
                  setIntercorrencia(evento.target.value)
                }
                maxLength={250}
                rows={3}
                placeholder="Registre ocorrências relevantes durante o atendimento..."
                disabled={atendimentoConcluido || concluindo}
              />
              <small>{intercorrencia.length}/250 caracteres</small>
            </label>

            <label className="detalhe-field">
              Evolução do paciente
              <textarea
                value={evolucao}
                onChange={(evento) => setEvolucao(evento.target.value)}
                maxLength={250}
                rows={4}
                placeholder="Descreva a evolução, os procedimentos realizados e a resposta do paciente..."
                required
                disabled={atendimentoConcluido || concluindo}
              />
              <small>{evolucao.length}/250 caracteres</small>
            </label>
          </div>
        </section>

        {/* AÇÕES */}
        <div className="detalhe-actions">
          <button
            type="button"
            className="detalhe-button detalhe-button-secundario"
            onClick={() => navigate('/prontuarios')}
          >
            Voltar aos prontuários
          </button>

          {!atendimentoConcluido ? (
            <button
              type="button"
              className="detalhe-button detalhe-button-primary"
              onClick={concluirAtendimento}
              disabled={concluindo || salvandoSinais}
            >
              {concluindo ? 'Concluindo atendimento...' : 'Concluir atendimento'}
            </button>
          ) : (
            <span className="detalhe-status detalhe-status-concluido">
              Atendimento finalizado
            </span>
          )}
        </div>
      </div>

      {/* MODAL DE EXERCÍCIOS */}
      {modalExerciciosAberto && (
        <div
          className="detalhe-modal-overlay"
          onClick={() => setModalExerciciosAberto(false)}
        >
          <div
            className="detalhe-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-exercicios"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="detalhe-modal-heading">
              <div>
                <h2 id="titulo-modal-exercicios">Selecionar exercícios</h2>
                <p>Marque os exercícios utilizados nesta sessão.</p>
              </div>

              <button
                type="button"
                className="detalhe-modal-close"
                onClick={() => setModalExerciciosAberto(false)}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <input
              className="detalhe-modal-search"
              value={buscaExercicio}
              onChange={(evento) => setBuscaExercicio(evento.target.value)}
              placeholder="Buscar exercício pelo nome..."
            />

            <div className="detalhe-modal-list">
              {exerciciosFiltrados.length > 0 ? (
                exerciciosFiltrados.map((exercicio) => {
                  const selecionado = exerciciosSelecionados.includes(
                    exercicio.id
                  );

                  return (
                    <label
                      className={`detalhe-modal-exercise ${
                        selecionado ? 'detalhe-modal-exercise-selected' : ''
                      }`}
                      key={exercicio.id}
                    >
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => alternarExercicio(exercicio.id)}
                      />

                      <span className="detalhe-modal-exercise-content">
                        <strong>{exercicio.nome}</strong>
                        <small>{exercicio.tipo}</small>
                        {exercicio.descricao && (
                          <span>{exercicio.descricao}</span>
                        )}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="detalhe-helper">
                  Nenhum exercício encontrado.
                </p>
              )}
            </div>

            <div className="detalhe-modal-footer">
              <span>
                {exerciciosSelecionados.length}{' '}
                {exerciciosSelecionados.length === 1
                  ? 'exercício selecionado'
                  : 'exercícios selecionados'}
              </span>

              <button
                type="button"
                className="detalhe-button detalhe-button-primary"
                onClick={() => setModalExerciciosAberto(false)}
              >
                Confirmar seleção
              </button>
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
