
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './AvaliacaoDetalhe.css';

const API_URL = 'http://localhost:8080';

type Avaliacao = {
  id: number;
  queixaPrincipal: string;
  observacao: string;
  valor: number;
  statusPagamento: string;
  statusAtendimento: string;
  nomePaciente: string;
  data: string;
  hora: string;
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
    throw new Error('Token CSRF inválido.');
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

function formatarData(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

function formatarHora(hora: string): string {
  return hora?.substring(0, 5) ?? '';
}

export default function AvaliacaoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);

  const [queixaPrincipal, setQueixaPrincipal] = useState('');
  const [observacao, setObservacao] = useState('');
  const [valor, setValor] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function carregarAvaliacao() {
    if (!id) {
      setErro('Identificador da avaliação não informado.');
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErro('');

      const response = await fetch(`${API_URL}/avaliacoes/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      const dados: Avaliacao = await response.json();

      setAvaliacao(dados);
      setQueixaPrincipal(dados.queixaPrincipal ?? '');
      setObservacao(dados.observacao ?? '');
      setValor(String(dados.valor ?? ''));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a avaliação.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAvaliacao();
  }, [id]);

  async function salvarAlteracoes() {
    if (!id || !avaliacao) return;

    const valorNumerico = Number(valor);

    if (
      !queixaPrincipal.trim() ||
      valor.trim() === '' ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico < 0
    ) {
      setErro('Informe a queixa principal e um valor válido.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const csrf = await obterTokenCsrf();

      const response = await fetch(`${API_URL}/avaliacoes/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          queixaPrincipal: queixaPrincipal.trim(),
          observacao: observacao.trim(),
          valor: valorNumerico,
        }),
      });

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      setMensagem('Avaliação atualizada com sucesso.');
      await carregarAvaliacao();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a avaliação.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function concluirAvaliacao() {
    if (!id || !avaliacao) return;

    if (avaliacao.statusAtendimento === 'ATENDIDO') {
      setErro('Esta avaliação já foi concluída.');
      return;
    }

    const confirmar = window.confirm(
      'Deseja realmente concluir esta avaliação?'
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const csrf = await obterTokenCsrf();

      const response = await fetch(
        `${API_URL}/avaliacoes/atualizarStatus/${id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            [csrf.headerName]: csrf.token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      setMensagem('Avaliação concluída com sucesso.');
      await carregarAvaliacao();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir a avaliação.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function registrarPagamento() {
    if (!id || !avaliacao) return;

    if (avaliacao.statusPagamento === 'PAGO') {
      setErro('Esta avaliação já está paga.');
      return;
    }

    const confirmar = window.confirm(
      'Deseja registrar o pagamento desta avaliação?'
    );

    if (!confirmar) return;

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const csrf = await obterTokenCsrf();

      const response = await fetch(`${API_URL}/avaliacoes/${id}/pagamento`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          [csrf.headerName]: csrf.token,
        },
      });

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      setMensagem('Pagamento registrado com sucesso.');
      await carregarAvaliacao();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o pagamento.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <ModuleLayout
        title="Avaliação"
        subtitle="Carregando os dados da avaliação."
        eyebrow="PRONTUÁRIO"
      >
        <div className="avaliacao-state">Carregando avaliação...</div>
      </ModuleLayout>
    );
  }

  if (!avaliacao) {
    return (
      <ModuleLayout
        title="Avaliação"
        subtitle="Não foi possível abrir o registro."
        eyebrow="PRONTUÁRIO"
      >
        <div className="avaliacao-state">
          <p>{erro || 'Avaliação não encontrada.'}</p>

          <button
            type="button"
            className="avaliacao-button secondary"
            onClick={() => navigate('/prontuarios')}
          >
            Voltar aos prontuários
          </button>
        </div>
      </ModuleLayout>
    );
  }

  const concluida = avaliacao.statusAtendimento === 'ATENDIDO';
  const paga = avaliacao.statusPagamento === 'PAGO';

  return (
    <ModuleLayout
      title="Detalhes da avaliação"
      subtitle="Consulte e atualize as informações clínicas e financeiras."
      eyebrow={`AVALIAÇÃO #${avaliacao.id}`}
    >
      <div className="avaliacao-detail">
        <div className="avaliacao-header">
          <div>
            <h2>{avaliacao.nomePaciente}</h2>
            <p>
              {formatarData(avaliacao.data)} às {formatarHora(avaliacao.hora)}
            </p>
          </div>

          <button
            type="button"
            className="avaliacao-button secondary"
            onClick={() => navigate('/prontuarios')}
          >
            Voltar aos prontuários
          </button>
        </div>

        <div className="avaliacao-status-grid">
          <div className="avaliacao-status-card">
            <span>Status da avaliação</span>
            <strong className={concluida ? 'status-success' : 'status-pending'}>
              {concluida ? 'Concluída' : 'Agendada'}
            </strong>
          </div>

          <div className="avaliacao-status-card">
            <span>Status do pagamento</span>
            <strong className={paga ? 'status-success' : 'status-pending'}>
              {paga ? 'Pago' : 'Pendente'}
            </strong>
          </div>

          <div className="avaliacao-status-card">
            <span>Valor</span>
            <strong>
              {Number(avaliacao.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </strong>
          </div>
        </div>

        {erro && (
          <p className="avaliacao-message error" role="alert">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className="avaliacao-message success" role="status">
            {mensagem}
          </p>
        )}

        <section className="avaliacao-form-panel">
          <div className="avaliacao-section-heading">
            <h3>Informações clínicas</h3>
            <p>Dados registrados durante a avaliação do paciente.</p>
          </div>

          <label className="avaliacao-field">
            Queixa principal
            <textarea
              rows={5}
              value={queixaPrincipal}
              onChange={(evento) => setQueixaPrincipal(evento.target.value)}
              disabled={salvando || concluida}
              placeholder="Descreva a queixa principal..."
            />
          </label>

          <label className="avaliacao-field">
            Observações
            <textarea
              rows={5}
              value={observacao}
              onChange={(evento) => setObservacao(evento.target.value)}
              disabled={salvando || concluida}
              placeholder="Registre observações adicionais..."
            />
          </label>

          <label className="avaliacao-field">
            Valor da avaliação (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(evento) => setValor(evento.target.value)}
              disabled={salvando || concluida}
            />
          </label>

          {!concluida && (
            <button
              type="button"
              className="avaliacao-button primary"
              onClick={salvarAlteracoes}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          )}
        </section>

        <section className="avaliacao-form-panel">
          <div className="avaliacao-section-heading">
            <h3>Ações da avaliação</h3>
            <p>Gerencie a conclusão clínica e o pagamento.</p>
          </div>

          <div className="avaliacao-actions">
            <button
              type="button"
              className="avaliacao-button primary"
              onClick={concluirAvaliacao}
              disabled={salvando || concluida}
            >
              {concluida ? 'Avaliação concluída' : 'Concluir avaliação'}
            </button>

            <button
              type="button"
              className="avaliacao-button secondary"
              onClick={registrarPagamento}
              disabled={salvando || paga}
            >
              {paga ? 'Pagamento registrado' : 'Registrar pagamento'}
            </button>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
