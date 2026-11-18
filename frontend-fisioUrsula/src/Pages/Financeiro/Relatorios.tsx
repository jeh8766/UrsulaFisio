
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Relatorios.css';

const API_BASE = (
    import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

type StatusPagamento = 'PAGO' | 'PENDENTE';

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

type Atendimento = {
    id: number;
    data: string;
    horaInicio: string | null;
    horaFim: string | null;
    intercorrencia: string | null;
    evolucao: string | null;
    valor: number | string | null;
    taxaDeslocamento: number | string | null;
    statusAtendimento: string;
    statusPagamento: StatusPagamento;
    pacienteId: number;
    pacienteNome: string;
    sinaisVitaisId: number | null;
};

type Avaliacao = {
    id: number;
    queixaPrincipal: string;
    observacao: string | null;
    valor: number | string;
    statusPagamento: StatusPagamento;
    statusAtendimento: string;
    nomePaciente: string;
    data: string;
    hora: string;
};

type Recebimento = {
    atendimentoId: number;
    dataPagamento: string;
    pacienteNome: string;
    valor: number | string | null;
    taxaDeslocamento: number | string | null;
};

type Despesa = {
    id: number;
    descricao: string;
    categoria: string;
    valor: number | string;
    dataDespesa: string;
    observacao: string | null;
};

function hojeISO(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function primeiroDiaMes(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');

    return `${ano}-${mes}-01`;
}

function numero(valor: number | string | null | undefined): number {
    const resultado = Number(valor ?? 0);
    return Number.isFinite(resultado) ? resultado : 0;
}

function dinheiro(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatarData(data: string | null | undefined): string {
    if (!data) return '-';

    const partes = data.slice(0, 10).split('-');

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function nomePeriodo(inicio: string, fim: string): string {
    if (!inicio || !fim) return 'Período selecionado';

    const [ano, mes] = inicio.split('-');
    const [anoFim, mesFim] = fim.split('-');

    if (ano === anoFim && mes === mesFim) {
        const data = new Date(Number(ano), Number(mes) - 1, 1);

        return data.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
        });
    }

    return `${formatarData(inicio)} até ${formatarData(fim)}`;
}

async function buscar<T>(url: string): Promise<T> {
    const resposta = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!resposta.ok) {
        const mensagem = await resposta.text();

        throw new Error(
            mensagem || `Erro HTTP ${resposta.status} ao consultar ${url}.`
        );
    }

    const texto = await resposta.text();

    if (!texto.trim()) {
        return undefined as T;
    }

    return JSON.parse(texto) as T;
}

export default function Relatorios() {
    const [inicio, setInicio] = useState(primeiroDiaMes);
    const [fim, setFim] = useState(hojeISO);

    const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
    const [despesas, setDespesas] = useState<Despesa[]>([]);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [carregado, setCarregado] = useState(false);

    const carregarRelatorio = useCallback(async () => {
        if (!inicio || !fim) {
            setErro('Informe a data inicial e a data final.');
            return;
        }

        if (inicio > fim) {
            setErro('A data inicial não pode ser posterior à data final.');
            return;
        }

        setCarregando(true);
        setErro('');
        setCarregado(false);

        setResumo(null);
        setAtendimentos([]);
        setAvaliacoes([]);
        setRecebimentos([]);
        setDespesas([]);

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

        try {
            const [
                dadosResumo,
                dadosAtendimentos,
                dadosRecebimentos,
                dadosDespesas,
                dadosAvaliacoes,
            ] = await Promise.all([
                buscar<ResumoFinanceiro>(
                    `${API_BASE}/financeiro/resumo?${parametrosResumo.toString()}`
                ),

                buscar<Atendimento[]>(
                    `${API_BASE}/atendimentos/data?${parametrosAtendimentos.toString()}`
                ),

                buscar<Recebimento[]>(
                    `${API_BASE}/financeiro/recebimentos?${parametrosResumo.toString()}`
                ),

                buscar<Despesa[]>(
                    `${API_BASE}/despesas/periodo?${parametrosDespesas.toString()}`
                ),

                buscar<Avaliacao[]>(
                    `${API_BASE}/avaliacoes`
                ),
            ]);

            setResumo(dadosResumo);
            setAtendimentos(dadosAtendimentos ?? []);
            setRecebimentos(dadosRecebimentos ?? []);
            setDespesas(dadosDespesas ?? []);

            // O endpoint de avaliações retorna todas.
            // Aqui filtramos pelo período escolhido no relatório.
            const avaliacoesDoPeriodo = (dadosAvaliacoes ?? []).filter(
                (avaliacao) =>
                    avaliacao.data >= inicio &&
                    avaliacao.data <= fim
            );

            setAvaliacoes(avaliacoesDoPeriodo);

            setCarregado(true);
        } catch (error) {
            console.error('Erro ao carregar relatório financeiro:', error);

            setErro(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar os dados do relatório.'
            );
        } finally {
            setCarregando(false);
        }
    }, [inicio, fim]);

    useEffect(() => {
        void carregarRelatorio();
    }, [carregarRelatorio]);

    // Total de pagamentos de atendimentos registrados no período.
    const totalRecebimentosDetalhados = recebimentos.reduce(
        (total, item) =>
            total + numero(item.valor) + numero(item.taxaDeslocamento),
        0
    );

    // Total de despesas do período.
    const totalDespesasDetalhadas = despesas.reduce(
        (total, item) => total + numero(item.valor),
        0
    );

    // Pendências de atendimentos.
    const pendenteAtendimentos = atendimentos
        .filter((item) => item.statusPagamento === 'PENDENTE')
        .reduce(
            (total, item) =>
                total + numero(item.valor) + numero(item.taxaDeslocamento),
            0
        );

    // Pendências de avaliações.
    const pendenteAvaliacoes = avaliacoes
        .filter((item) => item.statusPagamento === 'PENDENTE')
        .reduce(
            (total, item) => total + numero(item.valor),
            0
        );

    // Soma as pendências dos dois tipos de serviço.
    const totalPendenteDetalhado =
        pendenteAtendimentos + pendenteAvaliacoes;

    // Total das avaliações pagas.
    const totalAvaliacoesPagas = avaliacoes
        .filter((item) => item.statusPagamento === 'PAGO')
        .reduce(
            (total, item) => total + numero(item.valor),
            0
        );

    // O resumo oficial continua sendo calculado pelo backend.
    const resultado = resumo
        ? numero(resumo.totalRecebido) - numero(resumo.totalDespesas)
        : 0;

    const maiorBarra = Math.max(
        resumo ? numero(resumo.totalRecebido) : 0,
        resumo ? numero(resumo.totalDespesas) : 0,
        1
    );

    const alturaRecebido = resumo
        ? (numero(resumo.totalRecebido) / maiorBarra) * 100
        : 0;

    const alturaDespesas = resumo
        ? (numero(resumo.totalDespesas) / maiorBarra) * 100
        : 0;

    function preencherMesAtual() {
        setInicio(primeiroDiaMes());
        setFim(hojeISO());
    }

    function preencherMesAnterior() {
        const hoje = new Date();

        const anterior = new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 1,
            1
        );

        const ano = anterior.getFullYear();
        const mes = String(anterior.getMonth() + 1).padStart(2, '0');

        const ultimoDia = new Date(
            ano,
            anterior.getMonth() + 1,
            0
        ).getDate();

        setInicio(`${ano}-${mes}-01`);
        setFim(`${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`);
    }

    return (
        <ModuleLayout
            title="Relatórios"
            subtitle="Acompanhe o desempenho financeiro da clínica."
            eyebrow="GESTÃO FINANCEIRA"
        >
            <main className="relatorios-page">
                <header className="relatorios-topo">
                    <div>
                        <span className="relatorios-eyebrow">
                            VISÃO GERAL
                        </span>

                        <h1>Relatórios financeiros</h1>

                        <p>
                            Consulte recebimentos, atendimentos, avaliações,
                            valores pendentes e despesas em qualquer período.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="relatorios-atualizar"
                        onClick={() => void carregarRelatorio()}
                        disabled={carregando}
                    >
                        <span className="relatorios-atualizar-icone">↻</span>
                        Atualizar relatório
                    </button>
                </header>

                <section className="relatorios-filtros">
                    <div className="relatorios-filtros-titulo">
                        <div>
                            <span className="relatorios-section-eyebrow">
                                CONSULTA
                            </span>

                            <h2>Período do relatório</h2>
                        </div>

                        <span className="relatorios-periodo-atual">
                            {nomePeriodo(inicio, fim)}
                        </span>
                    </div>

                    <div className="relatorios-filtros-conteudo">
                        <label className="relatorios-campo">
                            <span>Data inicial</span>

                            <input
                                type="date"
                                value={inicio}
                                onChange={(event) =>
                                    setInicio(event.target.value)
                                }
                            />
                        </label>

                        <label className="relatorios-campo">
                            <span>Data final</span>

                            <input
                                type="date"
                                value={fim}
                                onChange={(event) =>
                                    setFim(event.target.value)
                                }
                            />
                        </label>

                        <button
                            type="button"
                            className="relatorios-buscar"
                            onClick={() => void carregarRelatorio()}
                            disabled={carregando}
                        >
                            {carregando ? 'Consultando...' : 'Gerar relatório'}
                        </button>
                    </div>

                    <div className="relatorios-periodos-rapidos">
                        <button
                            type="button"
                            onClick={preencherMesAtual}
                        >
                            Mês atual
                        </button>

                        <button
                            type="button"
                            onClick={preencherMesAnterior}
                        >
                            Mês anterior
                        </button>
                    </div>
                </section>

                {erro && (
                    <div className="relatorios-alerta erro">
                        <div>
                            <strong>
                                Não foi possível carregar o relatório
                            </strong>

                            <p>{erro}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void carregarRelatorio()}
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {carregando && (
                    <div className="relatorios-carregando">
                        <span className="relatorios-spinner" />
                        <p>Consultando os dados financeiros...</p>
                    </div>
                )}

                {!carregando && carregado && resumo && (
                    <>
                        <section className="relatorios-indicadores">
                            <article className="relatorios-card recebido">
                                <div className="relatorios-card-cabecalho">
                                    <span>Total recebido</span>
                                    <span className="relatorios-card-icone">↙</span>
                                </div>

                                <strong>
                                    {dinheiro(numero(resumo.totalRecebido))}
                                </strong>

                                <small>
                                    Pagamentos registrados no período
                                </small>
                            </article>

                            <article className="relatorios-card pendente">
                                <div className="relatorios-card-cabecalho">
                                    <span>Total pendente</span>
                                    <span className="relatorios-card-icone">◷</span>
                                </div>

                                <strong>
                                    {dinheiro(numero(resumo.totalPendente))}
                                </strong>

                                <small>
                                    {resumo.quantidadePendentes} pagamento(s)
                                    pendente(s)
                                </small>
                            </article>

                            <article className="relatorios-card despesas">
                                <div className="relatorios-card-cabecalho">
                                    <span>Total de despesas</span>
                                    <span className="relatorios-card-icone">↗</span>
                                </div>

                                <strong>
                                    {dinheiro(numero(resumo.totalDespesas))}
                                </strong>

                                <small>
                                    {despesas.length} despesa(s) registrada(s)
                                </small>
                            </article>

                            <article
                                className={`relatorios-card resultado ${
                                    resultado < 0 ? 'negativo' : ''
                                }`}
                            >
                                <div className="relatorios-card-cabecalho">
                                    <span>Resultado operacional</span>
                                    <span className="relatorios-card-icone">=</span>
                                </div>

                                <strong>{dinheiro(resultado)}</strong>

                                <small>
                                    Recebimentos menos despesas
                                </small>
                            </article>
                        </section>

                        <section className="relatorios-graficos">
                            <article className="relatorios-painel relatorios-comparativo">
                                <div className="relatorios-painel-titulo">
                                    <div>
                                        <span className="relatorios-section-eyebrow">
                                            DESEMPENHO
                                        </span>

                                        <h2>Entradas e saídas</h2>

                                        <p>
                                            Comparação financeira do período
                                            selecionado.
                                        </p>
                                    </div>
                                </div>

                                <div className="relatorios-barras">
                                    <div className="relatorios-barra-item">
                                        <div className="relatorios-barra-legenda">
                                            <span>
                                                <i className="ponto-recebido" />
                                                Recebimentos
                                            </span>

                                            <strong>
                                                {dinheiro(numero(resumo.totalRecebido))}
                                            </strong>
                                        </div>

                                        <div className="relatorios-barra-trilho">
                                            <div
                                                className="relatorios-barra preenchimento-recebido"
                                                style={{
                                                    width: `${alturaRecebido}%`,
                                                } as CSSProperties}
                                            />
                                        </div>
                                    </div>

                                    <div className="relatorios-barra-item">
                                        <div className="relatorios-barra-legenda">
                                            <span>
                                                <i className="ponto-despesa" />
                                                Despesas
                                            </span>

                                            <strong>
                                                {dinheiro(numero(resumo.totalDespesas))}
                                            </strong>
                                        </div>

                                        <div className="relatorios-barra-trilho">
                                            <div
                                                className="relatorios-barra preenchimento-despesa"
                                                style={{
                                                    width: `${alturaDespesas}%`,
                                                } as CSSProperties}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="relatorios-comparativo-rodape">
                                    <span>Resultado do período</span>

                                    <strong
                                        className={
                                            resultado < 0
                                                ? 'texto-negativo'
                                                : 'texto-positivo'
                                        }
                                    >
                                        {dinheiro(resultado)}
                                    </strong>
                                </div>
                            </article>

                            <article className="relatorios-painel relatorios-producao">
                                <div className="relatorios-painel-titulo">
                                    <div>
                                        <span className="relatorios-section-eyebrow">
                                            PRODUÇÃO
                                        </span>

                                        <h2>Atendimentos e avaliações</h2>

                                        <p>
                                            Registros vinculados ao período.
                                        </p>
                                    </div>
                                </div>

                                <div className="relatorios-producao-numero">
                                    <strong>
                                        {resumo.quantidadeAtendimentos}
                                    </strong>

                                    <span>registros encontrados</span>
                                </div>

                                <div className="relatorios-producao-linha">
                                    <span>Atendimentos normais</span>
                                    <strong>
                                        {resumo.quantidadeAtendimentosNormais}
                                    </strong>
                                </div>

                                <div className="relatorios-producao-linha">
                                    <span>Avaliações</span>
                                    <strong>
                                        {resumo.quantidadeAvaliacoes}
                                    </strong>
                                </div>

                                <div className="relatorios-producao-linha">
                                    <span>Pagos</span>
                                    <strong>{resumo.quantidadePagos}</strong>
                                </div>

                                <div className="relatorios-producao-linha">
                                    <span>Pendentes</span>
                                    <strong>{resumo.quantidadePendentes}</strong>
                                </div>
                            </article>
                        </section>

                        <section className="relatorios-painel relatorios-detalhes">
                            <div className="relatorios-painel-titulo">
                                <div>
                                    <span className="relatorios-section-eyebrow">
                                        MOVIMENTAÇÕES
                                    </span>

                                    <h2>Detalhamento do período</h2>

                                    <p>
                                        Consulte separadamente os atendimentos,
                                        avaliações, pagamentos recebidos e
                                        despesas registradas.
                                    </p>
                                </div>
                            </div>

                            <div className="relatorios-resumo-detalhado">
                                <div>
                                    <span>
                                        Pagamentos de atendimentos listados
                                    </span>

                                    <strong className="texto-positivo">
                                        {dinheiro(totalRecebimentosDetalhados)}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Valores pendentes de atendimentos e avaliações
                                    </span>

                                    <strong>
                                        {dinheiro(totalPendenteDetalhado)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Despesas listadas</span>

                                    <strong className="texto-negativo">
                                        {dinheiro(totalDespesasDetalhadas)}
                                    </strong>
                                </div>
                            </div>

                            {/* PAGAMENTOS DE ATENDIMENTOS */}
                            <div className="relatorios-tabela-bloco">
                                <div className="relatorios-tabela-titulo">
                                    <div>
                                        <h3>Pagamentos recebidos de atendimentos</h3>

                                        <p>
                                            Filtrados pela data em que o
                                            pagamento foi registrado.
                                        </p>
                                    </div>

                                    <span className="relatorios-contagem">
                                        {recebimentos.length} registro(s)
                                    </span>
                                </div>

                                <div className="relatorios-tabela-scroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Paciente</th>
                                                <th>Data do pagamento</th>
                                                <th>Atendimento</th>
                                                <th>Valor recebido</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {recebimentos.map((item) => {
                                                const valor =
                                                    numero(item.valor) +
                                                    numero(item.taxaDeslocamento);

                                                return (
                                                    <tr key={item.atendimentoId}>
                                                        <td className="celula-paciente">
                                                            {item.pacienteNome}
                                                        </td>

                                                        <td>
                                                            {formatarData(item.dataPagamento)}
                                                        </td>

                                                        <td>
                                                            #{item.atendimentoId}
                                                        </td>

                                                        <td className="texto-positivo valor-tabela">
                                                            {dinheiro(valor)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {recebimentos.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="relatorios-vazio">
                                                        Nenhum pagamento de atendimento
                                                        registrado neste período.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* AVALIAÇÕES */}
                            <div className="relatorios-tabela-bloco">
                                <div className="relatorios-tabela-titulo">
                                    <div>
                                        <h3>Avaliações fisioterapêuticas</h3>

                                        <p>
                                            Filtradas pela data em que a
                                            avaliação foi realizada.
                                        </p>
                                    </div>

                                    <span className="relatorios-contagem">
                                        {avaliacoes.length} registro(s)
                                    </span>
                                </div>

                                <div className="relatorios-resumo-detalhado">
                                    <div>
                                        <span>Valor das avaliações pagas</span>

                                        <strong className="texto-positivo">
                                            {dinheiro(totalAvaliacoesPagas)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Valor das avaliações pendentes</span>

                                        <strong>
                                            {dinheiro(pendenteAvaliacoes)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="relatorios-tabela-scroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Paciente</th>
                                                <th>Data da avaliação</th>
                                                <th>Horário</th>
                                                <th>Queixa principal</th>
                                                <th>Valor</th>
                                                <th>Pagamento</th>
                                                <th>Situação</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {avaliacoes.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="celula-paciente">
                                                        {item.nomePaciente}
                                                    </td>

                                                    <td>
                                                        {formatarData(item.data)}
                                                    </td>

                                                    <td>
                                                        {item.hora || '-'}
                                                    </td>

                                                    <td>
                                                        {item.queixaPrincipal || '-'}
                                                    </td>

                                                    <td className="valor-tabela">
                                                        {dinheiro(numero(item.valor))}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`relatorios-status ${
                                                                item.statusPagamento === 'PAGO'
                                                                    ? 'pago'
                                                                    : 'pendente'
                                                            }`}
                                                        >
                                                            {item.statusPagamento === 'PAGO'
                                                                ? 'Pago'
                                                                : 'Pendente'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {item.statusAtendimento === 'ATENDIDO'
                                                            ? 'Realizada'
                                                            : item.statusAtendimento}
                                                    </td>
                                                </tr>
                                            ))}

                                            {avaliacoes.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="relatorios-vazio">
                                                        Nenhuma avaliação encontrada
                                                        neste período.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ATENDIMENTOS */}
                            <div className="relatorios-tabela-bloco">
                                <div className="relatorios-tabela-titulo">
                                    <div>
                                        <h3>Atendimentos realizados</h3>

                                        <p>
                                            Filtrados pela data do atendimento.
                                        </p>
                                    </div>

                                    <span className="relatorios-contagem">
                                        {atendimentos.length} registro(s)
                                    </span>
                                </div>

                                <div className="relatorios-tabela-scroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Paciente</th>
                                                <th>Data</th>
                                                <th>Horário</th>
                                                <th>Valor total</th>
                                                <th>Pagamento</th>
                                                <th>Situação</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {atendimentos.map((item) => {
                                                const valor =
                                                    numero(item.valor) +
                                                    numero(item.taxaDeslocamento);

                                                return (
                                                    <tr key={item.id}>
                                                        <td className="celula-paciente">
                                                            {item.pacienteNome}
                                                        </td>

                                                        <td>
                                                            {formatarData(item.data)}
                                                        </td>

                                                        <td>
                                                            {item.horaInicio || '--:--'}
                                                            {item.horaFim
                                                                ? ` - ${item.horaFim}`
                                                                : ''}
                                                        </td>

                                                        <td className="valor-tabela">
                                                            {dinheiro(valor)}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`relatorios-status ${
                                                                    item.statusPagamento === 'PAGO'
                                                                        ? 'pago'
                                                                        : 'pendente'
                                                                }`}
                                                            >
                                                                {item.statusPagamento === 'PAGO'
                                                                    ? 'Pago'
                                                                    : 'Pendente'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {item.statusAtendimento === 'ATENDIDO'
                                                                ? 'Realizado'
                                                                : item.statusAtendimento}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {atendimentos.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="relatorios-vazio">
                                                        Nenhum atendimento encontrado
                                                        neste período.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* DESPESAS */}
                            <div className="relatorios-tabela-bloco">
                                <div className="relatorios-tabela-titulo">
                                    <div>
                                        <h3>Despesas registradas</h3>

                                        <p>
                                            Filtradas pela data da despesa.
                                        </p>
                                    </div>

                                    <span className="relatorios-contagem">
                                        {despesas.length} registro(s)
                                    </span>
                                </div>

                                <div className="relatorios-tabela-scroll">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Descrição</th>
                                                <th>Categoria</th>
                                                <th>Data</th>
                                                <th>Observação</th>
                                                <th>Valor</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {despesas.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="celula-paciente">
                                                        {item.descricao}
                                                    </td>

                                                    <td>
                                                        {item.categoria}
                                                    </td>

                                                    <td>
                                                        {formatarData(item.dataDespesa)}
                                                    </td>

                                                    <td>
                                                        {item.observacao || '-'}
                                                    </td>

                                                    <td className="texto-negativo valor-tabela">
                                                        {dinheiro(numero(item.valor))}
                                                    </td>
                                                </tr>
                                            ))}

                                            {despesas.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="relatorios-vazio">
                                                        Nenhuma despesa encontrada
                                                        neste período.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {!carregando && !erro && !carregado && (
                    <div className="relatorios-vazio-geral">
                        <span>▤</span>

                        <h2>Selecione um período</h2>

                        <p>
                            Escolha as datas e gere o relatório para consultar
                            os dados financeiros.
                        </p>
                    </div>
                )}
            </main>
        </ModuleLayout>
    );
}
