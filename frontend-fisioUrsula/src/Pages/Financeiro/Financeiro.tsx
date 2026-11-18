
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Financeiro.css';

type StatusPagamento = 'PAGO' | 'PENDENTE';

type AtendimentoApi = {
  id: number;
  data: string;
  horaInicio?: string;
  horaFim?: string;
  pacienteId?: number;
  pacienteNome?: string;
  valor: number | string | null;
  taxaDeslocamento: number | string | null;
  statusAtendimento: string;
  statusPagamento: StatusPagamento;
};

type AvaliacaoApi = {
  id: number;
  queixaPrincipal: string;
  observacao?: string | null;
  valor: number | string;
  statusPagamento: StatusPagamento;
  statusAtendimento: string;
  nomePaciente: string;
  data: string;
  hora: string;
};

type RecebimentoApi = {
  atendimentoId: number;
  dataPagamento: string;
  pacienteNome: string;
  valor: number | string;
  taxaDeslocamento: number | string;
};

type DespesaApi = {
  id: number;
  descricao: string;
  categoria: string;
  valor: number | string;
  dataDespesa: string;
  observacao?: string | null;
};

type ResumoFinanceiro = {
  inicio: string;
  fim: string;
  faturamentoBruto: number | string;
  totalRecebido: number | string;
  totalPendente: number | string;
  totalDespesas: number | string;
  resultadoOperacional: number | string;
  quantidadeAtendimentos: number;
  quantidadePagos: number;
  quantidadePendentes: number;
  quantidadeAvaliacoes: number;
  quantidadeAtendimentosNormais: number;
};

type RegistroFinanceiro = {
  chave: string;
  id: number;
  atendimentoId?: number;
  avaliacaoId?: number;
  statusPagamento?: StatusPagamento;
  descricao: string;
  origem: string;
  data: string;
  valor: number;
  status: 'Recebido' | 'Pendente' | 'Despesa';
  tipo: 'Entrada' | 'Saída';
};

type RespostaCsrf = {
  headerName: string;
  token: string;
};

const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

const API_CSRF_URL = `${API_BASE}/csrf`;

const obterDataLocal = (data: Date) =>
  [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-');

const hoje = obterDataLocal(new Date());
const mesAtual = hoje.slice(0, 7);

const obterInicioMes = (mes: string) => `${mes}-01`;

const obterFimMes = (mes: string) => {
  const [ano, numeroMes] = mes.split('-').map(Number);
  return obterDataLocal(new Date(ano, numeroMes, 0));
};

const numero = (
  valor: number | string | null | undefined,
): number => {
  const convertido = Number(valor ?? 0);
  return Number.isFinite(convertido) ? convertido : 0;
};

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatarData = (data: string) => {
  if (!data) return '-';

  const [ano, mes, dia] = data.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
};

const formatarPeriodo = (mes: string) => {
  const data = new Date(`${mes}-02T12:00:00`);

  return data.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

async function obterTokenCsrf(): Promise<RespostaCsrf> {
  const resposta = await fetch(API_CSRF_URL, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível obter o token CSRF (${resposta.status}).`,
    );
  }

  const csrf: RespostaCsrf = await resposta.json();

  if (!csrf.headerName || !csrf.token) {
    throw new Error('O backend não retornou um token CSRF válido.');
  }

  return csrf;
}

async function requisicao<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const metodo = (options?.method ?? 'GET').toUpperCase();
  const headers = new Headers(options?.headers);

  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(metodo)) {
    const csrf = await obterTokenCsrf();
    headers.set(csrf.headerName, csrf.token);
  }

  const resposta = await fetch(url, {
    ...options,
    method: metodo,
    credentials: 'include',
    headers,
  });

  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem || `Erro na requisição (${resposta.status}).`,
    );
  }

  if (resposta.status === 204 || resposta.status === 205) {
    return undefined as T;
  }

  const texto = await resposta.text();

  if (!texto.trim()) {
    return undefined as T;
  }

  return JSON.parse(texto) as T;
}

export default function Financeiro() {
  const navigate = useNavigate();

  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);

  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [atendimentos, setAtendimentos] = useState<AtendimentoApi[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoApi[]>([]);
  const [recebimentos, setRecebimentos] = useState<RecebimentoApi[]>([]);
  const [despesas, setDespesas] = useState<DespesaApi[]>([]);

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('TODOS');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [atualizandoPagamentoId, setAtualizandoPagamentoId] =
    useState<number | null>(null);

  const [
    atualizandoPagamentoAvaliacaoId,
    setAtualizandoPagamentoAvaliacaoId,
  ] = useState<number | null>(null);

  const carregarFinanceiro = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const inicio = obterInicioMes(mesSelecionado);
      const fim = obterFimMes(mesSelecionado);

      const parametrosResumo = new URLSearchParams({
        inicio,
        fim,
      });

      const parametrosAtendimentos = new URLSearchParams({
        dataInicio: inicio,
        dataFim: fim,
      });

      const parametrosDespesas = new URLSearchParams({
        inicio,
        fim,
      });

      const [
        dadosResumo,
        dadosAtendimentos,
        dadosRecebimentos,
        dadosDespesas,
        dadosAvaliacoes,
      ] = await Promise.all([
        requisicao<ResumoFinanceiro>(
          `${API_BASE}/financeiro/resumo?${parametrosResumo.toString()}`,
        ),

        requisicao<AtendimentoApi[]>(
          `${API_BASE}/atendimentos/data?${parametrosAtendimentos.toString()}`,
        ),

        requisicao<RecebimentoApi[]>(
          `${API_BASE}/financeiro/recebimentos?${parametrosResumo.toString()}`,
        ),

        requisicao<DespesaApi[]>(
          `${API_BASE}/despesas/periodo?${parametrosDespesas.toString()}`,
        ),

        requisicao<AvaliacaoApi[]>(
          `${API_BASE}/avaliacoes`,
        ),
      ]);

      setResumo(dadosResumo);
      setAtendimentos(dadosAtendimentos ?? []);
      setRecebimentos(dadosRecebimentos ?? []);
      setDespesas(dadosDespesas ?? []);

      // Mantém somente as avaliações do mês selecionado.
      setAvaliacoes(
        (dadosAvaliacoes ?? []).filter(
          (avaliacao) =>
            avaliacao.data?.slice(0, 7) === mesSelecionado,
        ),
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os dados financeiros.',
      );
    } finally {
      setCarregando(false);
    }
  }, [mesSelecionado]);

  useEffect(() => {
    void carregarFinanceiro();
  }, [carregarFinanceiro]);

  // Altera o pagamento de um atendimento.
  async function alterarStatusPagamento(
    atendimentoId: number,
    statusAtual: StatusPagamento,
  ) {
    try {
      setAtualizandoPagamentoId(atendimentoId);
      setErro('');

      const novoStatus: StatusPagamento =
        statusAtual === 'PAGO' ? 'PENDENTE' : 'PAGO';

      await requisicao<void>(
        `${API_BASE}/atendimentos/${atendimentoId}/pagamento`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            statusPagamento: novoStatus,
          }),
        },
      );

      await carregarFinanceiro();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar o status do pagamento.',
      );
    } finally {
      setAtualizandoPagamentoId(null);
    }
  }

  // Registra o pagamento de uma avaliação.
  async function registrarPagamentoAvaliacao(avaliacaoId: number) {
    try {
      setAtualizandoPagamentoAvaliacaoId(avaliacaoId);
      setErro('');

      await requisicao<void>(
        `${API_BASE}/avaliacoes/${avaliacaoId}/pagamento`,
        {
          method: 'PATCH',
        },
      );

      await carregarFinanceiro();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o pagamento da avaliação.',
      );
    } finally {
      setAtualizandoPagamentoAvaliacaoId(null);
    }
  }

  // Monta as movimentações de atendimentos, avaliações e despesas.
  const movimentacoes = useMemo<RegistroFinanceiro[]>(() => {
    const recebimentosPorAtendimento = new Map(
      recebimentos.map((recebimento) => [
        recebimento.atendimentoId,
        recebimento,
      ]),
    );

    const entradasAtendimentos: RegistroFinanceiro[] =
      atendimentos.map((atendimento) => {
        const recebimento = recebimentosPorAtendimento.get(
          atendimento.id,
        );

        const valorTotal =
          numero(atendimento.valor) +
          numero(atendimento.taxaDeslocamento);

        /*
         * Se o pagamento foi realizado, usamos a data real
         * do recebimento. Se está pendente, usamos a data
         * do atendimento.
         */
        const dataMovimentacao =
          atendimento.statusPagamento === 'PAGO' && recebimento
            ? recebimento.dataPagamento
            : atendimento.data;

        return {
          chave: `atendimento-${atendimento.id}`,
          id: atendimento.id,
          atendimentoId: atendimento.id,
          statusPagamento: atendimento.statusPagamento,
          descricao: 'Atendimento fisioterapêutico',
          origem: atendimento.pacienteNome || 'Paciente não informado',
          data: dataMovimentacao,
          valor: valorTotal,
          status:
            atendimento.statusPagamento === 'PAGO'
              ? 'Recebido'
              : 'Pendente',
          tipo: 'Entrada',
        };
      });

    const entradasAvaliacoes: RegistroFinanceiro[] =
      avaliacoes.map((avaliacao) => ({
        chave: `avaliacao-${avaliacao.id}`,
        id: avaliacao.id,
        avaliacaoId: avaliacao.id,
        statusPagamento: avaliacao.statusPagamento,
        descricao: 'Avaliação fisioterapêutica',
        origem: avaliacao.nomePaciente || 'Paciente não informado',
        data: avaliacao.data,
        valor: numero(avaliacao.valor),
        status:
          avaliacao.statusPagamento === 'PAGO'
            ? 'Recebido'
            : 'Pendente',
        tipo: 'Entrada',
      }));

    const saidas: RegistroFinanceiro[] = despesas.map((despesa) => ({
      chave: `despesa-${despesa.id}`,
      id: despesa.id,
      descricao: despesa.descricao,
      origem: despesa.categoria,
      data: despesa.dataDespesa,
      valor: numero(despesa.valor),
      status: 'Despesa',
      tipo: 'Saída',
    }));

    return [
      ...entradasAtendimentos,
      ...entradasAvaliacoes,
      ...saidas,
    ].sort((a, b) => b.data.localeCompare(a.data));
  }, [atendimentos, recebimentos, avaliacoes, despesas]);

  const movimentacoesFiltradas = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    return movimentacoes.filter((item) => {
      const correspondeBusca =
        item.descricao.toLowerCase().includes(texto) ||
        item.origem.toLowerCase().includes(texto);

      const correspondeFiltro =
        filtro === 'TODOS' ||
        (filtro === 'ENTRADAS' && item.tipo === 'Entrada') ||
        (filtro === 'DESPESAS' && item.tipo === 'Saída') ||
        (filtro === 'RECEBIDO' && item.status === 'Recebido') ||
        (filtro === 'PENDENTE' && item.status === 'Pendente');

      return correspondeBusca && correspondeFiltro;
    });
  }, [movimentacoes, busca, filtro]);

  const faturamentoBruto = numero(resumo?.faturamentoBruto);
  const totalRecebido = numero(resumo?.totalRecebido);
  const totalPendente = numero(resumo?.totalPendente);
  const totalDespesas = numero(resumo?.totalDespesas);
  const resultadoOperacional = numero(resumo?.resultadoOperacional);

  return (
    <ModuleLayout
      title="Financeiro"
      subtitle="Acompanhe recebimentos, pendências e movimentações da clínica."
      eyebrow="CONTROLE FINANCEIRO"
    >
      <div className="finance-page">
        <section className="finance-period">
          <div>
            <h2>Visão financeira</h2>
            <p>
              Consulte os resultados de {formatarPeriodo(mesSelecionado)}.
            </p>
          </div>

          <div className="finance-period-actions">
            <label>
              <span>Período</span>
              <input
                type="month"
                value={mesSelecionado}
                onChange={(event) =>
                  setMesSelecionado(event.target.value)
                }
                aria-label="Selecionar mês do financeiro"
              />
            </label>

            <button
              className="finance-reports-button"
              type="button"
              onClick={() => navigate('/relatorios')}
              aria-label="Acessar relatórios"
            >
              <span aria-hidden="true">▤</span>
              Relatórios
            </button>
          </div>
        </section>

        {erro && (
          <div className="finance-error" role="alert">
            <strong>Não foi possível carregar o financeiro.</strong>
            <p>{erro}</p>
            <button
              type="button"
              onClick={() => void carregarFinanceiro()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <section className="finance-summary">
          <article>
            <div className="finance-card-top">
              <span>Faturamento bruto</span>
              <span className="finance-icon received">↙</span>
            </div>
            <strong>{formatarMoeda(faturamentoBruto)}</strong>
            <small>
              {resumo?.quantidadeAtendimentos ?? 0} atendimentos e avaliações
              realizados
            </small>
          </article>

          <article>
            <div className="finance-card-top">
              <span>Total recebido</span>
              <span className="finance-icon received">R$</span>
            </div>
            <strong>{formatarMoeda(totalRecebido)}</strong>
            <small>Recebimentos registrados no mês</small>
          </article>

          <article>
            <div className="finance-card-top">
              <span>Valores pendentes</span>
              <span className="finance-icon pending">◷</span>
            </div>
            <strong>{formatarMoeda(totalPendente)}</strong>
            <small>
              {resumo?.quantidadePendentes ?? 0} pagamentos pendentes
            </small>
          </article>

          <article>
            <div className="finance-card-top">
              <span>Total de despesas</span>
              <span className="finance-icon overdue">↗</span>
            </div>
            <strong>{formatarMoeda(totalDespesas)}</strong>
            <small>{despesas.length} despesas registradas</small>
          </article>

          <article>
            <div className="finance-card-top">
              <span>Resultado operacional</span>
              <span className="finance-icon received">=</span>
            </div>
            <strong>{formatarMoeda(resultadoOperacional)}</strong>
            <small>Recebimentos menos despesas</small>
          </article>
        </section>

        <section className="finance-panel">
          <div className="finance-panel-heading">
            <div>
              <h2>Movimentações</h2>
              <p>
                Atendimentos, avaliações, recebimentos e despesas do período
                selecionado.
              </p>
            </div>

            <button
              className="finance-primary"
              type="button"
              onClick={() => navigate('/despesas')}
            >
              + Nova despesa
            </button>
          </div>

          <div className="finance-toolbar">
            <label className="finance-search">
              <span>⌕</span>
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar movimentação..."
              />
            </label>

            <select
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
              aria-label="Filtrar movimentações"
            >
              <option value="TODOS">Todas as movimentações</option>
              <option value="ENTRADAS">Atendimentos e avaliações</option>
              <option value="RECEBIDO">Recebidos</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="DESPESAS">Despesas</option>
            </select>
          </div>

          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={6} className="finance-empty">
                      Carregando movimentações...
                    </td>
                  </tr>
                ) : (
                  <>
                    {movimentacoesFiltradas.map((item) => (
                      <tr key={item.chave}>
                        <td>
                          <div className="finance-description">
                            <span
                              className={`finance-kind ${
                                item.tipo === 'Entrada' ? 'in' : 'out'
                              }`}
                            >
                              {item.tipo === 'Entrada' ? '↙' : '↗'}
                            </span>

                            <div>
                              <strong>{item.descricao}</strong>
                              <small>{item.origem}</small>
                            </div>
                          </div>
                        </td>

                        <td>{formatarData(item.data)}</td>

                        <td>
                          {item.tipo === 'Entrada' ? 'Entrada' : 'Saída'}
                        </td>

                        <td>
                          <strong
                            className={
                              item.tipo === 'Entrada'
                                ? 'finance-amount-in'
                                : 'finance-amount-out'
                            }
                          >
                            {item.tipo === 'Entrada' ? '+' : '−'}{' '}
                            {formatarMoeda(item.valor)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`finance-status ${
                              item.status.toLowerCase()
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td>
                          {/* Ação para pagamentos de atendimentos */}
                          {item.tipo === 'Entrada' &&
                            item.atendimentoId &&
                            item.statusPagamento && (
                              <button
                                type="button"
                                className={`finance-payment-button ${
                                  item.statusPagamento === 'PAGO'
                                    ? 'paid'
                                    : 'pending'
                                }`}
                                disabled={
                                  atualizandoPagamentoId ===
                                  item.atendimentoId
                                }
                                onClick={() =>
                                  void alterarStatusPagamento(
                                    item.atendimentoId!,
                                    item.statusPagamento!,
                                  )
                                }
                              >
                                {atualizandoPagamentoId ===
                                item.atendimentoId
                                  ? 'Atualizando...'
                                  : item.statusPagamento === 'PAGO'
                                    ? 'Marcar pendente'
                                    : 'Marcar recebido'}
                              </button>
                            )}

                          {/* Ação para pagamentos de avaliações */}
                          {item.tipo === 'Entrada' &&
                            item.avaliacaoId &&
                            item.statusPagamento &&
                            (item.statusPagamento === 'PENDENTE' ? (
                              <button
                                type="button"
                                className="finance-payment-button pending"
                                disabled={
                                  atualizandoPagamentoAvaliacaoId ===
                                  item.avaliacaoId
                                }
                                onClick={() =>
                                  void registrarPagamentoAvaliacao(
                                    item.avaliacaoId!,
                                  )
                                }
                              >
                                {atualizandoPagamentoAvaliacaoId ===
                                item.avaliacaoId
                                  ? 'Atualizando...'
                                  : 'Marcar recebido'}
                              </button>
                            ) : (
                              <span className="finance-status recebido">
                                Pagamento registrado
                              </span>
                            ))}
                        </td>
                      </tr>
                    ))}

                    {movimentacoesFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="finance-empty">
                          Nenhuma movimentação encontrada neste período.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="finance-table-footer">
            {movimentacoesFiltradas.length} movimentações exibidas
            <span>{formatarPeriodo(mesSelecionado)}</span>
          </div>
        </section>

        <p className="finance-disclaimer">
          O faturamento bruto considera os atendimentos e avaliações
          realizados no período. O total recebido considera os pagamentos
          registrados. O resultado operacional é calculado subtraindo as
          despesas dos recebimentos do período.
        </p>
      </div>
    </ModuleLayout>
  );
}
