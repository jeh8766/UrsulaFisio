
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './ProntuarioPaciente.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

type Filtro = 'TODOS' | 'AVALIACAO' | 'ATENDIMENTO';

type Paciente = {
  id: number;
  nome: string;
  dataNascimento: string;
  idade: number;
  faixaEtaria: string;
  vinculo: string;
  nomeResponsavel: string | null;
  telefone: string;
  criadoEm: string;
  ativo: boolean;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
  complemento: string | null;
  comorbidades: string[];
};

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

type SinaisVitais = {
  id: number;
  pressaoArterial: string;
  saturacao: number;
  frequenciaCardiaca: number;
  frequenciaRespiratoria: number;
  atendimento_Id: number | null;
  avaliacao_Id: number | null;
};

type Diagnostico = {
  id: number;
  diagnosticoId: number;
  dataDiagnostico: string;
  status: string;
  observacao: string | null;
};

type Registro = {
  id: number;
  tipo: 'AVALIACAO' | 'ATENDIMENTO';
  data: string;
  hora: string;
  titulo: string;
  statusAtendimento: string;
  statusPagamento: string;
  valor: number;
  dados: Avaliacao | Atendimento;
};

type DetalhesRegistro = {
  sinaisVitais: SinaisVitais | null;
  diagnosticos: Diagnostico[];
  erroSinais: string;
  erroDiagnosticos: string;
};

async function buscarJson<T>(
  endpoint: string,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return response.json();
}

function formatarData(data?: string | null): string {
  if (!data) return 'Não informada';

  const partes = data.split('-');
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarValor(valor?: number | null): string {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarStatus(status?: string | null): string {
  if (!status) return 'Não informado';

  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (letra) => letra.toUpperCase());
}

function textoOuPadrao(valor?: string | null): string {
  return valor?.trim() || 'Não informado';
}

export default function ProntuarioPaciente() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const [registroAberto, setRegistroAberto] = useState<string | null>(null);
  const [detalhes, setDetalhes] = useState<Record<string, DetalhesRegistro>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDados = useCallback(async (signal: AbortSignal) => {
    if (!pacienteId) {
      setErro('Identificação do paciente não encontrada.');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const id = Number(pacienteId);

      if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Identificação do paciente inválida.');
      }

      const [dadosPaciente, listaAvaliacoes, listaAtendimentos] =
        await Promise.all([
          buscarJson<Paciente>(`/pacientes/${id}`, signal),
          buscarJson<Avaliacao[]>(`/avaliacoes/paciente/${id}`, signal),
          buscarJson<Atendimento[]>(`/atendimentos/paciente/${id}`, signal),
        ]);

      if (signal.aborted) return;

      setPaciente(dadosPaciente);
      setAvaliacoes(listaAvaliacoes || []);
      setAtendimentos(listaAtendimentos || []);
    } catch (error) {
      if (signal.aborted) return;

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o prontuário.'
      );
    } finally {
      if (!signal.aborted) setCarregando(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    const controller = new AbortController();

    carregarDados(controller.signal);

    return () => controller.abort();
  }, [carregarDados]);

  const registros = useMemo<Registro[]>(() => {
    const lista: Registro[] = [
      ...avaliacoes.map((item) => ({
        id: item.id,
        tipo: 'AVALIACAO' as const,
        data: item.data,
        hora: item.hora,
        titulo: 'Avaliação fisioterapêutica',
        statusAtendimento: item.statusAtendimento,
        statusPagamento: item.statusPagamento,
        valor: item.valor,
        dados: item,
      })),
      ...atendimentos.map((item) => ({
        id: item.id,
        tipo: 'ATENDIMENTO' as const,
        data: item.data,
        hora: item.horaInicio,
        titulo: 'Atendimento fisioterapêutico',
        statusAtendimento: item.statusAtendimento,
        statusPagamento: item.statusPagamento,
        valor: item.valor,
        dados: item,
      })),
    ];

    return lista.sort((a, b) => {
      const dataA = `${a.data || ''}T${a.hora || '00:00'}`;
      const dataB = `${b.data || ''}T${b.hora || '00:00'}`;

      return dataB.localeCompare(dataA);
    });
  }, [avaliacoes, atendimentos]);

  const registrosFiltrados = registros.filter((registro) => {
    return filtro === 'TODOS' || registro.tipo === filtro;
  });

  async function abrirRegistro(registro: Registro) {
    const chave = `${registro.tipo}-${registro.id}`;

    if (registroAberto === chave) {
      setRegistroAberto(null);
      return;
    }

    setRegistroAberto(chave);

    if (detalhes[chave]) return;

    const resultado: DetalhesRegistro = {
      sinaisVitais: null,
      diagnosticos: [],
      erroSinais: '',
      erroDiagnosticos: '',
    };

    const endpointSinais =
      registro.tipo === 'AVALIACAO'
        ? `/sinais_vitais/avaliacao/${registro.id}`
        : `/sinais_vitais/atendimento/${registro.id}`;

    const requisicoes: Promise<void>[] = [
      buscarJson<SinaisVitais>(endpointSinais)
        .then((data) => {
          resultado.sinaisVitais = data;
        })
        .catch((error) => {
          resultado.erroSinais =
            error instanceof Error ? error.message : 'Erro ao consultar sinais vitais.';
        }),
    ];

    if (registro.tipo === 'AVALIACAO') {
      requisicoes.push(
        buscarJson<Diagnostico[]>(
          `/diagnosticos-avaliacoes/avaliacao/${registro.id}`
        )
          .then((data) => {
            resultado.diagnosticos = data || [];
          })
          .catch((error) => {
            resultado.erroDiagnosticos =
              error instanceof Error ? error.message : 'Erro ao consultar diagnósticos.';
          })
      );
    }

    await Promise.all(requisicoes);

    setDetalhes((anterior) => ({
      ...anterior,
      [chave]: resultado,
    }));
  }

  function abrirRegistroOriginal(registro: Registro) {
    if (registro.tipo === 'AVALIACAO') {
      navigate(`/avaliacao/${registro.id}`);
    } else {
      navigate(`/atendimento/${registro.id}`);
    }
  }

  return (
    <ModuleLayout
      title="Prontuário do paciente"
      subtitle="Histórico clínico, avaliações e atendimentos registrados."
      eyebrow="HISTÓRICO CLÍNICO"
    >
      <div className="patient-record-page">
        <button
          className="record-back-button"
          type="button"
          onClick={() => navigate('/paciente')}
        >
          ← Voltar para pacientes
        </button>

        {carregando && (
          <div className="record-state">
            Carregando prontuário do paciente...
          </div>
        )}

        {erro && (
          <div className="record-error" role="alert">
            {erro}
          </div>
        )}

        {paciente && !carregando && (
          <>
            <section className="record-patient-card">
              <div className="record-patient-avatar">
                {paciente.nome
                  ?.trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((parte) => parte[0]?.toUpperCase())
                  .join('')}
              </div>

              <div className="record-patient-main">
                <span className="record-eyebrow">PACIENTE</span>
                <h2>{paciente.nome}</h2>
                <p>
                  {paciente.idade} anos
                  {paciente.telefone ? ` · ${paciente.telefone}` : ''}
                </p>
              </div>

              <span
                className={`record-patient-status ${
                  paciente.ativo ? 'active' : 'inactive'
                }`}
              >
                {paciente.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </section>

            <section className="record-info-grid">
              <article className="record-info-card">
                <span>Data de nascimento</span>
                <strong>{formatarData(paciente.dataNascimento)}</strong>
              </article>

              <article className="record-info-card">
                <span>Faixa etária</span>
                <strong>{textoOuPadrao(paciente.faixaEtaria)}</strong>
              </article>

              <article className="record-info-card">
                <span>Vínculo</span>
                <strong>{textoOuPadrao(paciente.vinculo)}</strong>
              </article>

              <article className="record-info-card">
                <span>Responsável</span>
                <strong>{textoOuPadrao(paciente.nomeResponsavel)}</strong>
              </article>
            </section>

            <section className="record-comorbidities">
              <div>
                <h3>Comorbidades</h3>
                <p>Condições associadas ao paciente.</p>
              </div>

              {paciente.comorbidades?.length ? (
                <div className="record-tags">
                  {paciente.comorbidades.map((item, index) => (
                    <span key={`${item}-${index}`}>{item}</span>
                  ))}
                </div>
              ) : (
                <span className="record-muted">
                  Nenhuma comorbidade cadastrada.
                </span>
              )}
            </section>

            <section className="record-summary-grid">
              <article className="record-summary-card">
                <span className="record-summary-icon evaluation">▤</span>
                <div>
                  <small>Avaliações</small>
                  <strong>{avaliacoes.length}</strong>
                </div>
              </article>

              <article className="record-summary-card">
                <span className="record-summary-icon attendance">＋</span>
                <div>
                  <small>Atendimentos</small>
                  <strong>{atendimentos.length}</strong>
                </div>
              </article>

              <article className="record-summary-card">
                <span className="record-summary-icon history">◷</span>
                <div>
                  <small>Total de registros</small>
                  <strong>{registros.length}</strong>
                </div>
              </article>
            </section>

            <section className="record-history-section">
              <header className="record-history-header">
                <div>
                  <span className="record-eyebrow">ACOMPANHAMENTO</span>
                  <h2>Histórico clínico</h2>
                  <p>Consulte os dados salvos em cada registro.</p>
                </div>

                <div className="record-filters">
                  {([
                    ['TODOS', 'Todos'],
                    ['AVALIACAO', 'Avaliações'],
                    ['ATENDIMENTO', 'Atendimentos'],
                  ] as const).map(([valor, label]) => (
                    <button
                      key={valor}
                      type="button"
                      className={filtro === valor ? 'selected' : ''}
                      onClick={() => setFiltro(valor)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </header>

              {registrosFiltrados.length === 0 ? (
                <div className="record-empty">
                  <span>▤</span>
                  <h3>Nenhum registro encontrado</h3>
                  <p>
                    Este paciente ainda não possui registros para o filtro
                    selecionado.
                  </p>
                </div>
              ) : (
                <div className="record-timeline">
                  {registrosFiltrados.map((registro) => {
                    const chave = `${registro.tipo}-${registro.id}`;
                    const aberto = registroAberto === chave;
                    const detalhe = detalhes[chave];

                    return (
                      <article className="record-item" key={chave}>
                        <div className="record-timeline-marker">
                          <span
                            className={
                              registro.tipo === 'AVALIACAO'
                                ? 'evaluation'
                                : 'attendance'
                            }
                          >
                            {registro.tipo === 'AVALIACAO' ? '▤' : '＋'}
                          </span>
                        </div>

                        <div className="record-entry">
                          <button
                            type="button"
                            className="record-entry-header"
                            onClick={() => abrirRegistro(registro)}
                            aria-expanded={aberto}
                          >
                            <div className="record-entry-main">
                              <span
                                className={`record-type ${
                                  registro.tipo === 'AVALIACAO'
                                    ? 'evaluation'
                                    : 'attendance'
                                }`}
                              >
                                {registro.tipo === 'AVALIACAO'
                                  ? 'AVALIAÇÃO'
                                  : 'ATENDIMENTO'}
                              </span>

                              <h3>{registro.titulo}</h3>

                              <p>
                                {formatarData(registro.data)} às{' '}
                                {registro.hora || 'Horário não informado'}
                              </p>
                            </div>

                            <div className="record-entry-side">
                              <strong>{formatarValor(registro.valor)}</strong>
                              <span>{aberto ? '−' : '+'}</span>
                            </div>
                          </button>

                          <div className="record-entry-status">
                            <span>
                              Atendimento: {formatarStatus(registro.statusAtendimento)}
                            </span>
                            <span>
                              Pagamento: {formatarStatus(registro.statusPagamento)}
                            </span>
                          </div>

                          {aberto && (
                            <div className="record-detail">
                              {registro.tipo === 'AVALIACAO' ? (
                                <div className="record-detail-section">
                                  <h4>Dados da avaliação</h4>

                                  <div className="record-detail-grid">
                                    <div>
                                      <small>Queixa principal</small>
                                      <p>
                                        {textoOuPadrao(
                                          (registro.dados as Avaliacao)
                                            .queixaPrincipal
                                        )}
                                      </p>
                                    </div>

                                    <div>
                                      <small>Observações</small>
                                      <p>
                                        {textoOuPadrao(
                                          (registro.dados as Avaliacao)
                                            .observacao
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="record-detail-section">
                                  <h4>Dados do atendimento</h4>

                                  <div className="record-detail-grid">
                                    <div>
                                      <small>Evolução</small>
                                      <p>
                                        {textoOuPadrao(
                                          (registro.dados as Atendimento).evolucao
                                        )}
                                      </p>
                                    </div>

                                    <div>
                                      <small>Intercorrências</small>
                                      <p>
                                        {textoOuPadrao(
                                          (registro.dados as Atendimento)
                                            .intercorrencia
                                        )}
                                      </p>
                                    </div>

                                    <div>
                                      <small>Taxa de deslocamento</small>
                                      <p>
                                        {formatarValor(
                                          (registro.dados as Atendimento)
                                            .taxaDeslocamento
                                        )}
                                      </p>
                                    </div>

                                    <div>
                                      <small>Horário de término</small>
                                      <p>
                                        {(registro.dados as Atendimento)
                                          .horaFim || 'Não informado'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="record-detail-section">
                                <h4>Sinais vitais</h4>

                                {!detalhe ? (
                                  <p className="record-muted">
                                    Carregando informações...
                                  </p>
                                ) : detalhe.sinaisVitais ? (
                                  <div className="record-vitals-grid">
                                    <div>
                                      <small>Pressão arterial</small>
                                      <strong>
                                        {textoOuPadrao(
                                          detalhe.sinaisVitais.pressaoArterial
                                        )}
                                      </strong>
                                    </div>

                                    <div>
                                      <small>Saturação</small>
                                      <strong>
                                        {detalhe.sinaisVitais.saturacao}% 
                                      </strong>
                                    </div>

                                    <div>
                                      <small>Frequência cardíaca</small>
                                      <strong>
                                        {detalhe.sinaisVitais.frequenciaCardiaca} bpm
                                      </strong>
                                    </div>

                                    <div>
                                      <small>Frequência respiratória</small>
                                      <strong>
                                        {detalhe.sinaisVitais.frequenciaRespiratoria} irpm
                                      </strong>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="record-muted">
                                    {detalhe?.erroSinais
                                      ? 'Não há sinais vitais registrados para este item.'
                                      : 'Nenhum sinal vital cadastrado.'}
                                  </p>
                                )}
                              </div>

                              {registro.tipo === 'AVALIACAO' && (
                                <div className="record-detail-section">
                                  <h4>Diagnósticos da avaliação</h4>

                                  {!detalhe ? (
                                    <p className="record-muted">
                                      Carregando diagnósticos...
                                    </p>
                                  ) : detalhe.diagnosticos.length ? (
                                    <div className="record-diagnosis-list">
                                      {detalhe.diagnosticos.map((diagnostico) => (
                                        <div key={diagnostico.id}>
                                          <strong>
                                            Diagnóstico #{diagnostico.diagnosticoId}
                                          </strong>
                                          <span>
                                            Data: {formatarData(diagnostico.dataDiagnostico)}
                                          </span>
                                          <span>
                                            Status: {formatarStatus(diagnostico.status)}
                                          </span>
                                          <p>
                                            {textoOuPadrao(diagnostico.observacao)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="record-muted">
                                      {detalhe?.erroDiagnosticos
                                        ? 'Não foi possível consultar os diagnósticos.'
                                        : 'Nenhum diagnóstico associado.'}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="record-detail-footer">
                                <button
                                  type="button"
                                  onClick={() => abrirRegistroOriginal(registro)}
                                >
                                  Abrir registro completo →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </ModuleLayout>
  );
}
