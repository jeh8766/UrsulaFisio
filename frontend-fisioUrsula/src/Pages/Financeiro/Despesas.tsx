
import { useMemo, useState } from 'react';
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
  observacao: string;
};

const hoje = new Date();

const dataHoje = [
  hoje.getFullYear(),
  String(hoje.getMonth() + 1).padStart(2, '0'),
  String(hoje.getDate()).padStart(2, '0'),
].join('-');

const dataAnterior = (dias: number) => {
  const data = new Date();
  data.setDate(data.getDate() - dias);

  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-');
};

const despesasIniciais: Despesa[] = [
  {
    id: 1,
    descricao: 'Faixas elásticas para exercícios',
    categoria: 'MATERIAIS',
    valor: 85.9,
    dataDespesa: dataHoje,
    observacao: 'Materiais utilizados nos atendimentos.',
  },
  {
    id: 2,
    descricao: 'Combustível para deslocamentos',
    categoria: 'TRANSPORTE',
    valor: 120,
    dataDespesa: dataAnterior(2),
    observacao: 'Visitas domiciliares.',
  },
  {
    id: 3,
    descricao: 'Manutenção de equipamentos',
    categoria: 'MANUTENCAO',
    valor: 150,
    dataDespesa: dataAnterior(3),
    observacao: 'Revisão dos equipamentos de fisioterapia.',
  },
];

const categorias: { value: CategoriaDespesa; label: string }[] = [
  { value: 'MATERIAIS', label: 'Materiais' },
  { value: 'APARELHOS', label: 'Aparelhos' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'OUTROS', label: 'Outros' },
];

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatarData = (data: string) => {
  if (!data) return '-';

  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

const obterMes = (data: string) => data.slice(0, 7);

const mesAtual = dataHoje.slice(0, 7);

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>(despesasIniciais);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
  const [mesFiltro, setMesFiltro] = useState('ATUAL');

  const [formAberto, setFormAberto] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] =
    useState<CategoriaDespesa>('MATERIAIS');
  const [valor, setValor] = useState('');
  const [dataDespesa, setDataDespesa] = useState(dataHoje);
  const [observacao, setObservacao] = useState('');

  const despesasFiltradas = useMemo(() => {
    return despesas.filter((despesa) => {
      const texto = busca.trim().toLowerCase();

      const correspondeBusca =
        despesa.descricao.toLowerCase().includes(texto) ||
        despesa.observacao.toLowerCase().includes(texto);

      const correspondeCategoria =
        categoriaFiltro === 'TODAS' ||
        despesa.categoria === categoriaFiltro;

      const correspondeMes =
        mesFiltro === 'TODOS' ||
        (mesFiltro === 'ATUAL' &&
          obterMes(despesa.dataDespesa) === mesAtual) ||
        (mesFiltro !== 'ATUAL' &&
          mesFiltro !== 'TODOS' &&
          obterMes(despesa.dataDespesa) === mesFiltro);

      return (
        correspondeBusca &&
        correspondeCategoria &&
        correspondeMes
      );
    });
  }, [despesas, busca, categoriaFiltro, mesFiltro]);

  const despesasDoMes = despesas.filter(
    (despesa) => obterMes(despesa.dataDespesa) === mesAtual
  );

  const totalMes = despesasDoMes.reduce(
    (total, despesa) => total + despesa.valor,
    0
  );

  const totalGeral = despesas.reduce(
    (total, despesa) => total + despesa.valor,
    0
  );

  const limparFormulario = () => {
    setDescricao('');
    setCategoria('MATERIAIS');
    setValor('');
    setDataDespesa(dataHoje);
    setObservacao('');
  };

  const cadastrarDespesa = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const valorNumerico = Number(valor.replace(',', '.'));

    if (
      !descricao.trim() ||
      !dataDespesa ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      alert('Preencha a descrição, a data e um valor maior que zero.');
      return;
    }

    const novaDespesa: Despesa = {
      id: Date.now(),
      descricao: descricao.trim(),
      categoria,
      valor: valorNumerico,
      dataDespesa,
      observacao: observacao.trim(),
    };

    setDespesas((atuais) => [novaDespesa, ...atuais]);
    limparFormulario();
    setFormAberto(false);
  };

  const excluirDespesa = (id: number) => {
    const confirmar = window.confirm(
      'Deseja realmente excluir esta despesa?'
    );

    if (!confirmar) return;

    setDespesas((atuais) =>
      atuais.filter((despesa) => despesa.id !== id)
    );
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
            onClick={() => setFormAberto((aberto) => !aberto)}
          >
            <span className="expenses-button-symbol" aria-hidden="true">
              +
            </span>
            Nova despesa
          </button>
        </div>

        <section className="expenses-summary">
          <article className="expenses-summary-card">
            <div className="expenses-summary-icon" aria-hidden="true">
              R$
            </div>
            <div>
              <span>Total deste mês</span>
              <strong>{formatarMoeda(totalMes)}</strong>
              <small>Despesas registradas no mês atual</small>
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
                  onClick={() => {
                    limparFormulario();
                    setFormAberto(false);
                  }}
                >
                  Cancelar
                </button>

                <button type="submit" className="expenses-primary-button">
                  Salvar despesa
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

                    <td className="expenses-value">
                      {formatarMoeda(despesa.valor)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="expenses-delete-button"
                        onClick={() => excluirDespesa(despesa.id)}
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
                        Tente alterar os filtros ou cadastre uma nova despesa.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="expenses-demo-note">
          Os dados desta página são apenas demonstrativos e ficam na memória
          do navegador. Nenhuma informação é enviada ao backend ou salva
          permanentemente.
        </p>
      </div>
    </ModuleLayout>
  );
}
