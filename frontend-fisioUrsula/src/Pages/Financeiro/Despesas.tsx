import { useCallback, useEffect, useMemo, useState } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Despesas.css';

type CategoriaDespesa =
  | 'MATERIAIS'
  | 'APARELHOS'
  | 'TRANSPORTE'
  | 'MANUTENCAO'
  | 'OUTROS';

type Despesa = {
  id: number;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  dataDespesa: string;
  observacao: string | null;
};

type DespesaRequest = {
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  dataDespesa: string;
  observacao: string;
};

const API_URL = 'http://localhost:8080/despesas';

const categorias: { value: CategoriaDespesa; label: string }[] = [
  { value: 'MATERIAIS', label: 'Materiais' },
  { value: 'APARELHOS', label: 'Aparelhos' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'OUTROS', label: 'Outros' },
];

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

const obterMes = (data: string) => data.slice(0, 7);

async function requisicao<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const resposta = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem || `Erro na requisição (${resposta.status}).`,
    );
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  return resposta.json() as Promise<T>;
}

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [despesasVisiveis, setDespesasVisiveis] = useState<Despesa[]>([]);

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
  const [mesFiltro, setMesFiltro] = useState('ATUAL');

  const [formAberto, setFormAberto] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] =
    useState<CategoriaDespesa>('MATERIAIS');
  const [valor, setValor] = useState('');
  const [dataDespesa, setDataDespesa] = useState(hoje);
  const [observacao, setObservacao] = useState('');

  const [totalMes, setTotalMes] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  // GET /despesas
  // Carrega todos os registros para alimentar os cartões de resumo.
  const carregarDespesas = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const dados = await requisicao<Despesa[]>(API_URL);

      setDespesas(dados);
      setDespesasVisiveis(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as despesas.',
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDespesas();
  }, [carregarDespesas]);

  // GET /despesas/categoria
  // GET /despesas/periodo
  // A API fornece os registros do filtro principal selecionado.
  useEffect(() => {
    let ativo = true;

    async function buscarComFiltro() {
      try {
        setErro('');

        let url = API_URL;

        if (categoriaFiltro !== 'TODAS') {
          const parametros = new URLSearchParams({
            categoria: categoriaFiltro,
          });

          url = `${API_URL}/categoria?${parametros.toString()}`;
        } else if (mesFiltro === 'ATUAL') {
          const parametros = new URLSearchParams({
            inicio: obterInicioMes(mesAtual),
            fim: obterFimMes(mesAtual),
          });

          url = `${API_URL}/periodo?${parametros.toString()}`;
        } else if (mesFiltro !== 'TODOS') {
          const parametros = new URLSearchParams({
            inicio: obterInicioMes(mesFiltro),
            fim: obterFimMes(mesFiltro),
          });

          url = `${API_URL}/periodo?${parametros.toString()}`;
        }

        const dados = await requisicao<Despesa[]>(url);

        if (ativo) {
          setDespesasVisiveis(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível aplicar os filtros.',
          );
        }
      }
    }

    void buscarComFiltro();

    return () => {
      ativo = false;
    };
  }, [categoriaFiltro, mesFiltro]);

  // GET /despesas/total/periodo
  // O cartão mensal utiliza o total calculado pelo backend.
  useEffect(() => {
    let ativo = true;

    async function carregarTotalMes() {
      try {
        const parametros = new URLSearchParams({
          inicio: obterInicioMes(mesAtual),
          fim: obterFimMes(mesAtual),
        });

        const total = await requisicao<number>(
          `${API_URL}/total/periodo?${parametros.toString()}`,
        );

        if (ativo) {
          setTotalMes(Number(total) || 0);
        }
      } catch {
        if (ativo) {
          // Alternativa caso o endpoint de total falhe.
          setTotalMes(
            despesas
              .filter(
                (despesa) =>
                  obterMes(despesa.dataDespesa) === mesAtual,
              )
              .reduce(
                (soma, despesa) => soma + Number(despesa.valor),
                0,
              ),
          );
        }
      }
    }

    void carregarTotalMes();

    return () => {
      ativo = false;
    };
  }, [despesas]);

  // A busca textual complementa os filtros do backend.
  const despesasFiltradas = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    return despesasVisiveis.filter((despesa) => {
      const correspondeBusca =
        despesa.descricao.toLowerCase().includes(texto) ||
        (despesa.observacao ?? '').toLowerCase().includes(texto);

      const correspondeMes =
        categoriaFiltro !== 'TODAS' ||
        mesFiltro === 'TODOS' ||
        (mesFiltro === 'ATUAL' &&
          obterMes(despesa.dataDespesa) === mesAtual) ||
        (mesFiltro !== 'ATUAL' &&
          mesFiltro !== 'TODOS' &&
          obterMes(despesa.dataDespesa) === mesFiltro);

      return correspondeBusca && correspondeMes;
    });
  }, [despesasVisiveis, busca, categoriaFiltro, mesFiltro]);

  const despesasDoMes = useMemo(
    () =>
      despesas.filter(
        (despesa) => obterMes(despesa.dataDespesa) === mesAtual,
      ),
    [despesas],
  );

  const totalGeral = useMemo(
    () =>
      despesas.reduce(
        (total, despesa) => total + Number(despesa.valor),
        0,
      ),
    [despesas],
  );

  // Disponibiliza os meses existentes nos registros.
  const mesesDisponiveis = useMemo(
    () =>
      Array.from(
        new Set(despesas.map((despesa) => obterMes(despesa.dataDespesa))),
      ).sort((a, b) => b.localeCompare(a)),
    [despesas],
  );

  const limparFormulario = () => {
    setDescricao('');
    setCategoria('MATERIAIS');
    setValor('');
    setDataDespesa(hoje);
    setObservacao('');
  };

  // POST /despesas
  const cadastrarDespesa = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const valorNumerico = Number(valor.replace(',', '.'));

    if (
      !descricao.trim() ||
      !dataDespesa ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      setErro('Informe a descrição, a data e um valor maior que zero.');
      return;
    }

    const novaDespesa: DespesaRequest = {
      descricao: descricao.trim(),
      categoria,
      valor: valorNumerico,
      dataDespesa,
      observacao: observacao.trim(),
    };

    try {
      setSalvando(true);
      setErro('');
      setAviso('');

      await requisicao<Despesa>(API_URL, {
        method: 'POST',
        body: JSON.stringify(novaDespesa),
      });

      limparFormulario();
      setFormAberto(false);

      await carregarDespesas();

      setAviso('Despesa cadastrada com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar a despesa.',
      );
    } finally {
      setSalvando(false);
    }
  };

  // DELETE /despesas/{id}
  const excluirDespesa = async (id: number) => {
    const confirmar = window.confirm(
      'Deseja realmente excluir esta despesa?',
    );

    if (!confirmar) return;

    try {
      setErro('');
      setAviso('');

      await requisicao<void>(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      await carregarDespesas();

      setAviso('Despesa excluída com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a despesa.',
      );
    }
  };

  const nomeCategoria = (value: CategoriaDespesa) =>
    categorias.find((item) => item.value === value)?.label ?? value;

  return (
    <ModuleLayout
      title="Despesas"
      subtitle="Controle os gastos da sua clínica de fisioterapia."
      eyebrow="Financeiro"
    >
      <div className="expenses-page">
        <div className="expenses-header">
          <div>
            <h2>Visão geral das despesas</h2>
            <p>Acompanhe e organize os gastos do consultório.</p>
          </div>

          <button
            type="button"
            className="expenses-primary-button"
            onClick={() => {
              setErro('');
              setAviso('');
              setFormAberto((aberto) => !aberto);
            }}
          >
            <span className="expenses-button-symbol" aria-hidden="true">
              +
            </span>
            Nova despesa
          </button>
        </div>

        {erro && (
          <div className="expenses-message expenses-error" role="alert">
            {erro}
          </div>
        )}

        {aviso && (
          <div className="expenses-message expenses-success" role="status">
            {aviso}
          </div>
        )}

        <section className="expenses-summary">
          <article className="expenses-summary-card">
            <div className="expenses-summary-icon" aria-hidden="true">
              R$
            </div>
            <div>
              <span>Total deste mês</span>
              <strong>{formatarMoeda(totalMes)}</strong>
              <small>Calculado pelo backend</small>
            </div>
          </article>

          <article className="expenses-summary-card">
            <div className="expenses-summary-icon" aria-hidden="true">
              ▤
            </div>
            <div>
              <span>Quantidade de despesas</span>
              <strong>{despesasDoMes.length}</strong>
              <small>Registros no mês atual</small>
            </div>
          </article>

          <article className="expenses-summary-card">
            <div className="expenses-summary-icon" aria-hidden="true">
              ▣
            </div>
            <div>
              <span>Total registrado</span>
              <strong>{formatarMoeda(totalGeral)}</strong>
              <small>Todos os registros cadastrados</small>
            </div>
          </article>
        </section>

        {formAberto && (
          <section className="expenses-form-card">
            <div className="expenses-form-heading">
              <div>
                <h3>Cadastrar despesa</h3>
                <p>Informe os dados do gasto realizado.</p>
              </div>

              <button
                type="button"
                className="expenses-close-button"
                onClick={() => {
                  setFormAberto(false);
                  limparFormulario();
                  setErro('');
                }}
                aria-label="Fechar formulário"
              >
                ×
              </button>
            </div>

            <form onSubmit={cadastrarDespesa}>
              <div className="expenses-form-grid">
                <label className="expenses-field expenses-field-wide">
                  Descrição *
                  <input
                    type="text"
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    maxLength={100}
                    placeholder="Ex.: Compra de materiais"
                    required
                  />
                </label>

                <label className="expenses-field">
                  Categoria *
                  <select
                    value={categoria}
                    onChange={(event) =>
                      setCategoria(event.target.value as CategoriaDespesa)
                    }
                    required
                  >
                    {categorias.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="expenses-field">
                  Valor (R$) *
                  <input
                    type="text"
                    inputMode="decimal"
                    value={valor}
                    onChange={(event) => setValor(event.target.value)}
                    placeholder="0,00"
                    required
                  />
                </label>

                <label className="expenses-field">
                  Data da despesa *
                  <input
                    type="date"
                    value={dataDespesa}
                    onChange={(event) => setDataDespesa(event.target.value)}
                    required
                  />
                </label>

                <label className="expenses-field expenses-field-wide">
                  Observação
                  <textarea
                    value={observacao}
                    onChange={(event) => setObservacao(event.target.value)}
                    placeholder="Detalhes adicionais sobre a despesa..."
                    rows={3}
                  />
                </label>
              </div>

              <div className="expenses-form-actions">
                <button
                  type="button"
                  className="expenses-secondary-button"
                  disabled={salvando}
                  onClick={() => {
                    limparFormulario();
                    setFormAberto(false);
                    setErro('');
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="expenses-primary-button"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar despesa'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="expenses-list-card">
          <div className="expenses-list-heading">
            <div>
              <h3>Despesas registradas</h3>
              <p>
                {despesasFiltradas.length}{' '}
                {despesasFiltradas.length === 1
                  ? 'despesa encontrada'
                  : 'despesas encontradas'}
              </p>
            </div>
          </div>

          <div className="expenses-filters">
            <label className="expenses-search">
              <span className="expenses-search-symbol" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar despesa..."
                aria-label="Buscar despesa"
              />
            </label>

            <select
              value={categoriaFiltro}
              onChange={(event) => setCategoriaFiltro(event.target.value)}
              aria-label="Filtrar por categoria"
            >
              <option value="TODAS">Todas as categorias</option>
              {categorias.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={mesFiltro}
              onChange={(event) => setMesFiltro(event.target.value)}
              aria-label="Filtrar por mês"
            >
              <option value="ATUAL">Mês atual</option>
              <option value="TODOS">Todos os meses</option>
              {mesesDisponiveis
                .filter((mes) => mes !== mesAtual)
                .map((mes) => (
                  <option key={mes} value={mes}>
                    {mes.split('-').reverse().join('/')}
                  </option>
                ))}
            </select>
          </div>

          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Despesa</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={5} className="expenses-empty">
                      Carregando despesas...
                    </td>
                  </tr>
                ) : (
                  <>
                    {despesasFiltradas.map((despesa) => (
                      <tr key={despesa.id}>
                        <td>
                          <div className="expenses-description-cell">
                            <span
                              className="expenses-row-icon"
                              aria-hidden="true"
                            >
                              ▤
                            </span>
                            <div>
                              <strong>{despesa.descricao}</strong>
                              {despesa.observacao && (
                                <small>{despesa.observacao}</small>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`expenses-category expenses-category-${despesa.categoria.toLowerCase()}`}
                          >
                            {nomeCategoria(despesa.categoria)}
                          </span>
                        </td>

                        <td>{formatarData(despesa.dataDespesa)}</td>

                        <td>
                          <div className="expenses-value-cell">
                            <span
                              className="expenses-value-arrow"
                              aria-hidden="true"
                            >
                              ↓
                            </span>

                            <strong className="expenses-value">
                              − {formatarMoeda(Number(despesa.valor))}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="expenses-delete-button"
                            onClick={() => void excluirDespesa(despesa.id)}
                            aria-label={`Excluir despesa ${despesa.descricao}`}
                            title="Excluir despesa"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}

                    {despesasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={5} className="expenses-empty">
                          <span aria-hidden="true">▤</span>
                          <strong>Nenhuma despesa encontrada</strong>
                          <p>
                            Tente alterar os filtros ou cadastre uma nova
                            despesa.
                          </p>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ModuleLayout>
  );
}
