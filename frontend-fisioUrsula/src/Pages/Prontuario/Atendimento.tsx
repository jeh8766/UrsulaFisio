
import { useState, type FormEvent } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Atendimento.css';

const API_URL = 'http://localhost:8080';

type AgendamentoOpcao = {
  id: number;
  pacienteId: number;
  nome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoAgendamento: 'AVALIACAO' | 'ATENDIMENTO';
  statusAgendamento: string;
};

type CriarSinaisVitaisResponse = {
  id: number;
  pressaoArterial: string;
  saturacao: number;
  frequenciaCardiaca: number;
  frequenciaRespiratoria: number;
};

type AtendimentoResponse = {
  id?: number;
};

type CsrfTokenResponse = {
  token: string;
  headerName: string;
};

function formatarData(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

function formatarDataApi(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarHora(hora: string): string {
  return hora?.substring(0, 5) ?? '';
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

// Busca o token CSRF gerado pelo Spring Security
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

export default function Atendimento() {
  // Agendamentos disponíveis
  const [agendamentos, setAgendamentos] = useState<AgendamentoOpcao[]>([]);
  const [agendamentoId, setAgendamentoId] = useState('');
  const [mostrarAgendamentos, setMostrarAgendamentos] = useState(false);

  // Valores do atendimento
  const [valor, setValor] = useState('');
  const [taxaDeslocamento, setTaxaDeslocamento] = useState('0');

  // Sinais vitais
  const [pressaoArterial, setPressaoArterial] = useState('');
  const [saturacao, setSaturacao] = useState('');
  const [frequenciaCardiaca, setFrequenciaCardiaca] = useState('');
  const [frequenciaRespiratoria, setFrequenciaRespiratoria] = useState('');

  // Registro clínico
  const [intercorrencia, setIntercorrencia] = useState('');
  const [evolucao, setEvolucao] = useState('');

  // Mensagens
  const [notice, setNotice] = useState('');
  const [erro, setErro] = useState('');

  // Estados de carregamento
  const [carregandoAgendamentos, setCarregandoAgendamentos] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Recupera o agendamento selecionado
  const agendamentoSelecionado = agendamentos.find(
    (item) => String(item.id) === agendamentoId
  );

  // Busca os agendamentos somente quando clicar no botão
  async function carregarAgendamentos() {
    try {
      setCarregandoAgendamentos(true);
      setErro('');
      setNotice('');

      const hoje = formatarDataApi(new Date());

      const parametros = new URLSearchParams({
        inicio: hoje,
        fim: hoje,
      });

      const response = await fetch(
        `${API_URL}/agendamentos?${parametros.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      const dados: AgendamentoOpcao[] = await response.json();

      // Apenas agendamentos do tipo ATENDIMENTO e com status CONFIRMADO
      const disponiveis = dados.filter(
        (item) =>
          item.tipoAgendamento === 'ATENDIMENTO' &&
          item.statusAgendamento === 'CONFIRMADO'
      );

      setAgendamentos(disponiveis);
      setAgendamentoId('');
      setMostrarAgendamentos(true);

      if (disponiveis.length === 0) {
        setNotice(
          'Não existem agendamentos de atendimento confirmados disponíveis para hoje.'
        );
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os agendamentos.'
      );
    } finally {
      setCarregandoAgendamentos(false);
    }
  }

  // Realizar atendimento
  async function salvarAtendimento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setNotice('');
    setErro('');

    if (!agendamentoSelecionado) {
      setErro('Selecione um agendamento confirmado.');
      return;
    }

    if (!evolucao.trim()) {
      setErro('Informe a evolução do paciente.');
      return;
    }

    if (
      !pressaoArterial.trim() ||
      saturacao === '' ||
      frequenciaCardiaca === '' ||
      frequenciaRespiratoria === ''
    ) {
      setErro('Preencha todos os campos de sinais vitais.');
      return;
    }

    const valorNumerico = Number(valor);
    const taxaNumerica = Number(taxaDeslocamento);
    const saturacaoNumerica = Number(saturacao);
    const frequenciaCardiacaNumerica = Number(frequenciaCardiaca);
    const frequenciaRespiratoriaNumerica = Number(frequenciaRespiratoria);

    if (
      valor === '' ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico < 0 ||
      !Number.isFinite(taxaNumerica) ||
      taxaNumerica < 0
    ) {
      setErro('Informe valores financeiros válidos.');
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
      setSalvando(true);

      // ETAPA 1: Obtém o token CSRF do Spring Security
      const csrf = await obterTokenCsrf();

      // ETAPA 2: Cadastra os sinais vitais
      const sinaisVitaisResponse = await fetch(
        `${API_URL}/sinais_vitais`,
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

      if (!sinaisVitaisResponse.ok) {
        throw new Error(await obterMensagemErro(sinaisVitaisResponse));
      }

      const sinaisVitais: CriarSinaisVitaisResponse =
        await sinaisVitaisResponse.json();

      if (!sinaisVitais.id) {
        throw new Error(
          'A API cadastrou os sinais vitais, mas não retornou o ID.'
        );
      }

      // ETAPA 3: Realiza o atendimento
      const atendimentoResponse = await fetch(
        `${API_URL}/atendimentos/agendamento/${agendamentoSelecionado.id}/realizar`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            intercorrencia: intercorrencia.trim() || null,
            evolucao: evolucao.trim(),
            valor: valorNumerico,
            taxaDeslocamento: taxaNumerica,
            sinaisVitaisId: sinaisVitais.id,
          }),
        }
      );

      if (!atendimentoResponse.ok) {
        throw new Error(await obterMensagemErro(atendimentoResponse));
      }

      const atendimento: AtendimentoResponse =
        await atendimentoResponse.json();

      // ETAPA 4: Atualiza a tela
      setNotice(
        `Atendimento realizado com sucesso! ${
          atendimento?.id ? `ID do atendimento: ${atendimento.id}.` : ''
        }`
      );

      // Remove o agendamento da lista disponível
      setAgendamentos((anteriores) =>
        anteriores.filter(
          (item) => item.id !== agendamentoSelecionado.id
        )
      );

      limparCampos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o atendimento.'
      );
    } finally {
      setSalvando(false);
    }
  }

  // Limpa os campos
  function limparCampos() {
    setAgendamentoId('');

    setValor('');
    setTaxaDeslocamento('0');

    setPressaoArterial('');
    setSaturacao('');
    setFrequenciaCardiaca('');
    setFrequenciaRespiratoria('');

    setIntercorrencia('');
    setEvolucao('');
  }

  function limparFormulario() {
    limparCampos();
    setNotice('');
    setErro('');
  }

  return (
    <ModuleLayout
      title="Atendimento"
      subtitle="Registre os dados clínicos e acompanhe a evolução do paciente."
      eyebrow="REGISTRO DE SESSÃO"
    >
      <form className="atendimento-page" onSubmit={salvarAtendimento}>
        {notice && (
          <div className="atendimento-notice" role="status">
            {notice}
          </div>
        )}

        {erro && (
          <div className="atendimento-notice" role="alert">
            {erro}
          </div>
        )}

        {/* AGENDAMENTO */}
        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">▦</div>

            <div>
              <h2>Agendamento</h2>
              <p>
                Busque os agendamentos confirmados de hoje para realizar um
                atendimento.
              </p>
            </div>
          </div>

          <div className="atendimento-grid">
            <div className="atendimento-field atendimento-field-full">
              <button
                type="button"
                className="atendimento-button-primary"
                onClick={carregarAgendamentos}
                disabled={carregandoAgendamentos || salvando}
              >
                {carregandoAgendamentos
                  ? 'Buscando agendamentos...'
                  : 'Buscar agendamentos'}
              </button>
            </div>

            {mostrarAgendamentos && (
              <>
                <label className="atendimento-field atendimento-field-full">
                  Selecione um agendamento

                  {agendamentos.length > 0 ? (
                    <select
                      value={agendamentoId}
                      onChange={(evento) => {
                        setAgendamentoId(evento.target.value);
                        setNotice('');
                        setErro('');
                      }}
                      required
                      disabled={salvando}
                    >
                      <option value="">
                        Selecione um agendamento
                      </option>

                      {agendamentos.map((item) => (
                        <option key={item.id} value={item.id}>
                          #{item.id} — {item.nome} —{' '}
                          {formatarHora(item.horaInicio)} às{' '}
                          {formatarHora(item.horaFim)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="atendimento-helper">
                      Não existem agendamentos de atendimento confirmados
                      disponíveis para hoje.
                    </p>
                  )}
                </label>

                {agendamentoSelecionado ? (
                  <>
                    <div className="atendimento-info-card">
                      <span>Paciente</span>
                      <strong>{agendamentoSelecionado.nome}</strong>
                      <small>
                        ID #{agendamentoSelecionado.pacienteId}
                      </small>
                    </div>

                    <div className="atendimento-info-card">
                      <span>Data e horário</span>
                      <strong>
                        {formatarData(agendamentoSelecionado.data)}
                      </strong>
                      <small>
                        {formatarHora(agendamentoSelecionado.horaInicio)} às{' '}
                        {formatarHora(agendamentoSelecionado.horaFim)}
                      </small>
                    </div>

                    <div className="atendimento-info-card">
                      <span>ID do agendamento</span>
                      <strong>#{agendamentoSelecionado.id}</strong>
                      <small>Status: Confirmado</small>
                    </div>

                    <div className="atendimento-info-card">
                      <span>Paciente relacionado</span>
                      <strong>#{agendamentoSelecionado.pacienteId}</strong>
                      <small>Identificado pelo agendamento</small>
                    </div>
                  </>
                ) : agendamentos.length > 0 ? (
                  <p className="atendimento-helper atendimento-field-full">
                    Selecione um agendamento para visualizar os dados do
                    paciente.
                  </p>
                ) : null}
              </>
            )}

            {!mostrarAgendamentos && (
              <p className="atendimento-helper atendimento-field-full">
                Clique em "Buscar agendamentos" para visualizar os atendimentos
                confirmados de hoje.
              </p>
            )}
          </div>
        </section>

        {/* DADOS FINANCEIROS */}
        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">R$</div>

            <div>
              <h2>Dados do atendimento</h2>
              <p>Informe os valores referentes à sessão realizada.</p>
            </div>
          </div>

          <div className="atendimento-grid">
            <label className="atendimento-field">
              Valor do atendimento (R$)

              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
                placeholder="0,00"
                required
                disabled={salvando}
              />
            </label>

            <label className="atendimento-field">
              Taxa de deslocamento (R$)

              <input
                type="number"
                min="0"
                step="0.01"
                value={taxaDeslocamento}
                onChange={(evento) =>
                  setTaxaDeslocamento(evento.target.value)
                }
                placeholder="0,00"
                required
                disabled={salvando}
              />
            </label>

            <div className="atendimento-info-card">
              <span>Status do atendimento</span>
              <strong>Atendido</strong>
              <small>Definido automaticamente pela API</small>
            </div>

            <div className="atendimento-info-card">
              <span>Status do pagamento</span>
              <strong>Pendente</strong>
              <small>
                O pagamento poderá ser registrado posteriormente
              </small>
            </div>

            <div className="atendimento-total">
              <span>Valor total</span>

              <strong>
                {(
                  (Number(valor) || 0) +
                  (Number(taxaDeslocamento) || 0)
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>

              <small>Atendimento + deslocamento</small>
            </div>
          </div>
        </section>

        {/* SINAIS VITAIS */}
        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">♡</div>

            <div>
              <h2>Sinais vitais</h2>
              <p>
                Registre os sinais vitais observados durante a sessão.
              </p>
            </div>
          </div>

          <div className="atendimento-grid">
            <label className="atendimento-field">
              Pressão arterial

              <input
                value={pressaoArterial}
                onChange={(evento) =>
                  setPressaoArterial(evento.target.value)
                }
                placeholder="Ex.: 120/80 mmHg"
                maxLength={15}
                required
                disabled={salvando}
              />

              <small>Exemplo de formato: 120/80 mmHg</small>
            </label>

            <label className="atendimento-field">
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
                disabled={salvando}
              />
            </label>

            <label className="atendimento-field">
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
                disabled={salvando}
              />
            </label>

            <label className="atendimento-field">
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
                disabled={salvando}
              />
            </label>
          </div>

          <p className="atendimento-helper">
            Os valores devem corresponder às medições reais do paciente.
          </p>
        </section>

        {/* REGISTRO CLÍNICO */}
        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">✎</div>

            <div>
              <h2>Registro clínico</h2>
              <p>
                Documente intercorrências e a evolução do paciente. Essas
                informações serão salvas no atendimento.
              </p>
            </div>
          </div>

          <div className="atendimento-grid">
            <label className="atendimento-field atendimento-field-full">
              Intercorrências

              <textarea
                value={intercorrencia}
                onChange={(evento) =>
                  setIntercorrencia(evento.target.value)
                }
                maxLength={250}
                rows={3}
                placeholder="Registre ocorrências relevantes durante o atendimento..."
                disabled={salvando}
              />

              <small>{intercorrencia.length}/250 caracteres</small>
            </label>

            <label className="atendimento-field atendimento-field-full">
              Evolução do paciente

              <textarea
                value={evolucao}
                onChange={(evento) => setEvolucao(evento.target.value)}
                maxLength={250}
                rows={4}
                placeholder="Descreva a evolução, os procedimentos realizados e a resposta do paciente..."
                required
                disabled={salvando}
              />

              <small>{evolucao.length}/250 caracteres</small>
            </label>
          </div>
        </section>

        {/* AÇÕES */}
        <div className="atendimento-actions">
          <button
            type="button"
            className="atendimento-button-secondary"
            onClick={limparFormulario}
            disabled={salvando}
          >
            Limpar formulário
          </button>

          <button
            type="submit"
            className="atendimento-button-primary"
            disabled={
              salvando ||
              carregandoAgendamentos ||
              !agendamentoSelecionado
            }
          >
            {salvando
              ? 'Realizando atendimento...'
              : 'Realizar atendimento'}
          </button>
        </div>
      </form>
    </ModuleLayout>
  );
}
