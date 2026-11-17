
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Prontuario.css';

const API_URL = 'http://localhost:8080';

type Agendamento = {
  id: number;
  pacienteId: number;
  nome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipoAgendamento: 'AVALIACAO' | 'ATENDIMENTO';
  statusAgendamento: string;
  atendimentoId: number | null;
};

type CsrfTokenResponse = {
  token: string;
  headerName: string;
};

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

function formatarDataApi(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

function formatarHora(hora: string): string {
  return hora?.substring(0, 5) ?? '';
}

export default function Prontuarios() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState<Agendamento | null>(null);

  const [valor, setValor] = useState('');
  const [taxaDeslocamento, setTaxaDeslocamento] = useState('0');

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('TODOS');

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState('');
  const [notice, setNotice] = useState('');

  async function carregarAgendamentos() {
    try {
      setCarregando(true);
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

      const dados: Agendamento[] = await response.json();

      const confirmados = dados.filter(
        (item) => item.statusAgendamento === 'CONFIRMADO'
      );

      setAgendamentos(confirmados);
      setAgendamentoSelecionado(null);

      if (confirmados.length === 0) {
        setNotice('Não existem agendamentos confirmados para hoje.');
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os agendamentos.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((item) => {
      const correspondeBusca =
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        String(item.id).includes(busca);

      const correspondeTipo =
        filtro === 'TODOS' || item.tipoAgendamento === filtro;

      return correspondeBusca && correspondeTipo;
    });
  }, [agendamentos, busca, filtro]);

  const atendimentosConfirmados = agendamentos.filter(
    (item) => item.tipoAgendamento === 'ATENDIMENTO'
  );

  const avaliacoesConfirmadas = agendamentos.filter(
    (item) => item.tipoAgendamento === 'AVALIACAO'
  );

  function selecionarAgendamento(item: Agendamento) {
    setErro('');
    setNotice('');

    if (item.tipoAgendamento !== 'ATENDIMENTO') {
      setAgendamentoSelecionado(null);
      setErro(
        'Este agendamento é uma avaliação. Ele deve seguir o fluxo próprio de avaliação.'
      );
      return;
    }

    // Verifica se o atendimento já foi criado anteriormente.
    if (item.atendimentoId != null) {
      navigate(`/atendimento/${item.atendimentoId}`);
      return;
    }

    // Só abre o formulário financeiro quando ainda não existe atendimento.
    setAgendamentoSelecionado(item);
    setValor('');
    setTaxaDeslocamento('0');
  }

  async function iniciarAtendimento() {
    if (!agendamentoSelecionado) {
      setErro('Selecione um agendamento de atendimento.');
      return;
    }

    const valorNumerico = Number(valor);
    const taxaNumerica = Number(taxaDeslocamento);

    if (
      valor.trim() === '' ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico < 0 ||
      !Number.isFinite(taxaNumerica) ||
      taxaNumerica < 0
    ) {
      setErro('Informe valores financeiros válidos.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setNotice('');

      const csrf = await obterTokenCsrf();

      const response = await fetch(`${API_URL}/atendimentos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          valor: valorNumerico,
          taxaDeslocamento: taxaNumerica,
          agendamentoId: agendamentoSelecionado.id,
        }),
      });

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      const atendimento = await response.json();

      if (!atendimento.id) {
        throw new Error(
          'O atendimento foi criado, mas a API não retornou seu identificador.'
        );
      }

      navigate(`/atendimento/${atendimento.id}`);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar o atendimento.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ModuleLayout
      title="Prontuários"
      subtitle="Acesse os agendamentos confirmados e inicie os registros clínicos."
      eyebrow="ACOMPANHAMENTO CLÍNICO"
    >
      <div className="records-info-banner">
        <span className="records-info-symbol">✳</span>

        <div>
          <strong>Fluxo de atendimento</strong>
          <p>
            Selecione um atendimento confirmado para criar seu registro
            clínico. As avaliações seguem um fluxo separado.
          </p>
        </div>

        <span className="records-banner-lock">▣ Dados clínicos</span>
      </div>

      <div className="records-stat-row">
        <article>
          <small>Agendamentos confirmados</small>
          <strong>{agendamentos.length}</strong>
          <span>Para hoje</span>
        </article>

        <article>
          <small>Atendimentos</small>
          <strong>{atendimentosConfirmados.length}</strong>
          <span>Podem abrir ou iniciar um atendimento</span>
        </article>

        <article>
          <small>Avaliações</small>
          <strong>{avaliacoesConfirmadas.length}</strong>
          <span>Fluxo próprio de avaliação</span>
        </article>
      </div>

      <section className="records-panel">
        <div className="records-panel-heading">
          <div>
            <h2>Agendamentos confirmados</h2>
            <p>
              Escolha um atendimento para iniciar ou continuar o registro clínico.
            </p>
          </div>

          <button
            type="button"
            className="records-primary"
            onClick={carregarAgendamentos}
            disabled={carregando || salvando}
          >
            {carregando ? 'Atualizando...' : 'Atualizar lista'}
          </button>
        </div>

        {erro && (
          <p className="records-notice" role="alert">
            {erro}
          </p>
        )}

        {notice && (
          <p className="records-notice" role="status">
            {notice}
          </p>
        )}

        <div className="records-toolbar">
          <label className="records-search">
            <span>⌕</span>
            <input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar paciente ou número do agendamento..."
            />
          </label>

          <select
            value={filtro}
            onChange={(evento) => setFiltro(evento.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="TODOS">Todos os tipos</option>
            <option value="ATENDIMENTO">Atendimentos</option>
            <option value="AVALIACAO">Avaliações</option>
          </select>
        </div>

        <div className="records-list">
          {agendamentosFiltrados.map((item) => (
            <article className="record-card" key={item.id}>
              <div className="record-avatar">
                {item.nome
                  .split(' ')
                  .slice(0, 2)
                  .map((parte) => parte[0])
                  .join('')
                  .toUpperCase()}
              </div>

              <div className="record-main">
                <div className="record-meta">
                  <span>
                    {item.tipoAgendamento === 'ATENDIMENTO'
                      ? 'Atendimento'
                      : 'Avaliação'}
                  </span>
                  <i>•</i>
                  <time>{formatarData(item.data)}</time>
                </div>

                <h3>{item.nome}</h3>

                <p>
                  Horário: {formatarHora(item.horaInicio)} às{' '}
                  {formatarHora(item.horaFim)}
                </p>

                <div className="record-bottom">
                  <span>Agendamento #{item.id}</span>
                  <span className="record-status done">Confirmado</span>
                </div>
              </div>

              <button
                type="button"
                className="records-primary"
                onClick={() => selecionarAgendamento(item)}
                disabled={salvando}
              >
                {item.tipoAgendamento !== 'ATENDIMENTO'
                  ? 'Avaliação'
                  : item.atendimentoId != null
                    ? 'Abrir atendimento'
                    : 'Iniciar atendimento'}
              </button>
            </article>
          ))}

          {agendamentosFiltrados.length === 0 && !carregando && (
            <div className="records-empty">
              Nenhum agendamento encontrado com esse filtro.
            </div>
          )}
        </div>
      </section>

      {agendamentoSelecionado && (
        <section className="records-panel">
          <div className="records-panel-heading">
            <div>
              <h2>Iniciar atendimento</h2>
              <p>
                Confira o paciente e informe os valores iniciais do
                atendimento.
              </p>
            </div>
          </div>

          <div className="atendimento-grid">
            <div className="atendimento-info-card">
              <span>Paciente</span>
              <strong>{agendamentoSelecionado.nome}</strong>
              <small>ID #{agendamentoSelecionado.pacienteId}</small>
            </div>

            <div className="atendimento-info-card">
              <span>Data e horário</span>
              <strong>{formatarData(agendamentoSelecionado.data)}</strong>
              <small>
                {formatarHora(agendamentoSelecionado.horaInicio)} às{' '}
                {formatarHora(agendamentoSelecionado.horaFim)}
              </small>
            </div>

            <label className="atendimento-field">
              Valor do atendimento (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
                placeholder="Ex.: 120,00"
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
                placeholder="Ex.: 20,00"
                disabled={salvando}
              />
            </label>
          </div>

          <div className="atendimento-actions">
            <button
              type="button"
              className="atendimento-button-secondary"
              onClick={() => setAgendamentoSelecionado(null)}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="atendimento-button-primary"
              onClick={iniciarAtendimento}
              disabled={salvando}
            >
              {salvando ? 'Criando atendimento...' : 'Criar atendimento'}
            </button>
          </div>
        </section>
      )}

      <p className="records-disclaimer">
        Os dados exibidos são carregados da API. O atendimento só é criado
        depois da confirmação no botão acima.
      </p>
    </ModuleLayout>
  );
}
