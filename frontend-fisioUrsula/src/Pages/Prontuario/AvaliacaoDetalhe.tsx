
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

type SinaisVitais = {
  id: number;
  pressaoArterial: string;
  saturacao: number;
  frequenciaCardiaca: number;
  frequenciaRespiratoria: number;
  atendimento_Id?: number | null;
  avaliacao_Id?: number | null;
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

  // Dados dos sinais vitais
  const [sinaisVitais, setSinaisVitais] = useState<SinaisVitais | null>(null);

  const [pressaoArterial, setPressaoArterial] = useState('');
  const [saturacao, setSaturacao] = useState('');
  const [frequenciaCardiaca, setFrequenciaCardiaca] = useState('');
  const [frequenciaRespiratoria, setFrequenciaRespiratoria] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoSinaisVitais, setSalvandoSinaisVitais] = useState(false);

  const [erro, setErro] = useState('');
  const [erroSinaisVitais, setErroSinaisVitais] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [mensagemSinaisVitais, setMensagemSinaisVitais] = useState('');

  async function carregarSinaisVitais(avaliacaoId: number) {
    try {
      setErroSinaisVitais('');

      const response = await fetch(
        `${API_URL}/sinais_vitais/avaliacao/${avaliacaoId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      // Uma avaliação sem sinais vitais ainda cadastrados é válida.
      if (response.status === 404) {
        setSinaisVitais(null);
        setPressaoArterial('');
        setSaturacao('');
        setFrequenciaCardiaca('');
        setFrequenciaRespiratoria('');
        return;
      }

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      const dados: SinaisVitais = await response.json();

      setSinaisVitais(dados);
      setPressaoArterial(dados.pressaoArterial ?? '');
      setSaturacao(String(dados.saturacao ?? ''));
      setFrequenciaCardiaca(String(dados.frequenciaCardiaca ?? ''));
      setFrequenciaRespiratoria(
        String(dados.frequenciaRespiratoria ?? '')
      );
    } catch (error) {
      setErroSinaisVitais(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os sinais vitais.'
      );
    }
  }

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

      await carregarSinaisVitais(dados.id);
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

  async function salvarSinaisVitais() {
    if (!id || !avaliacao) return;

    const saturacaoNumerica = Number(saturacao);
    const frequenciaCardiacaNumerica = Number(frequenciaCardiaca);
    const frequenciaRespiratoriaNumerica = Number(frequenciaRespiratoria);

    if (
      !pressaoArterial.trim() ||
      saturacao.trim() === '' ||
      frequenciaCardiaca.trim() === '' ||
      frequenciaRespiratoria.trim() === '' ||
      !Number.isFinite(saturacaoNumerica) ||
      saturacaoNumerica < 0 ||
      saturacaoNumerica > 100 ||
      !Number.isInteger(frequenciaCardiacaNumerica) ||
      frequenciaCardiacaNumerica <= 0 ||
      !Number.isInteger(frequenciaRespiratoriaNumerica) ||
      frequenciaRespiratoriaNumerica <= 0
    ) {
      setErroSinaisVitais(
        'Preencha todos os campos com valores válidos.'
      );
      return;
    }

    try {
      setSalvandoSinaisVitais(true);
      setErroSinaisVitais('');
      setMensagemSinaisVitais('');

      const csrf = await obterTokenCsrf();

      const dados = {
        pressaoArterial: pressaoArterial.trim(),
        saturacao: saturacaoNumerica,
        frequenciaCardiaca: frequenciaCardiacaNumerica,
        frequenciaRespiratoria: frequenciaRespiratoriaNumerica,
      };

      const editando = sinaisVitais !== null;

      const url = editando
        ? `${API_URL}/sinais_vitais/${sinaisVitais.id}/atualizar`
        : `${API_URL}/sinais_vitais/avaliacao/${id}`;

      const response = await fetch(url, {
        method: editando ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      setMensagemSinaisVitais(
        editando
          ? 'Sinais vitais atualizados com sucesso.'
          : 'Sinais vitais registrados com sucesso.'
      );

      await carregarSinaisVitais(Number(id));
    } catch (error) {
      setErroSinaisVitais(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar os sinais vitais.'
      );
    } finally {
      setSalvandoSinaisVitais(false);
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

        {/* SINAIS VITAIS */}
        <section className="avaliacao-form-panel">
          <div className="avaliacao-section-heading">
            <h3>Sinais vitais</h3>
            <p>
              Registre os dados clínicos coletados durante a avaliação.
            </p>
          </div>

          {erroSinaisVitais && (
            <p className="avaliacao-message error" role="alert">
              {erroSinaisVitais}
            </p>
          )}

          {mensagemSinaisVitais && (
            <p className="avaliacao-message success" role="status">
              {mensagemSinaisVitais}
            </p>
          )}

          <div className="avaliacao-vitals-grid">
            <label className="avaliacao-field">
              Pressão arterial
              <input
                type="text"
                maxLength={15}
                placeholder="Ex.: 120/80"
                value={pressaoArterial}
                onChange={(evento) =>
                  setPressaoArterial(evento.target.value)
                }
                disabled={salvandoSinaisVitais || concluida}
              />
              <small>Exemplo: 120/80 mmHg</small>
            </label>

            <label className="avaliacao-field">
              Saturação de oxigênio (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Ex.: 98"
                value={saturacao}
                onChange={(evento) => setSaturacao(evento.target.value)}
                disabled={salvandoSinaisVitais || concluida}
              />
            </label>

            <label className="avaliacao-field">
              Frequência cardíaca (bpm)
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ex.: 75"
                value={frequenciaCardiaca}
                onChange={(evento) =>
                  setFrequenciaCardiaca(evento.target.value)
                }
                disabled={salvandoSinaisVitais || concluida}
              />
            </label>

            <label className="avaliacao-field">
              Frequência respiratória (irpm)
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ex.: 18"
                value={frequenciaRespiratoria}
                onChange={(evento) =>
                  setFrequenciaRespiratoria(evento.target.value)
                }
                disabled={salvandoSinaisVitais || concluida}
              />
            </label>
          </div>

          <div className="avaliacao-actions">
            <button
              type="button"
              className="avaliacao-button primary"
              onClick={salvarSinaisVitais}
              disabled={salvandoSinaisVitais || concluida}
            >
              {salvandoSinaisVitais
                ? 'Salvando sinais vitais...'
                : sinaisVitais
                  ? 'Atualizar sinais vitais'
                  : 'Registrar sinais vitais'}
            </button>
          </div>

          {sinaisVitais && (
            <p className="avaliacao-vitals-info">
              <span className="avaliacao-vitals-indicator" />
              Sinais vitais registrados nesta avaliação.
            </p>
          )}

          {concluida && (
            <p className="avaliacao-vitals-info">
              Esta avaliação foi concluída. Os sinais vitais estão disponíveis
              apenas para consulta.
            </p>
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
