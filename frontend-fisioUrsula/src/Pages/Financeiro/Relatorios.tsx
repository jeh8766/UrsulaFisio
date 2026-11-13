import { useCallback, useEffect, useMemo, useState } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Relatorios.css';

const API_BASE = 'http://localhost:8080';

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

type RelatorioMensal = {
    mes: string;
    inicio: string;
    fim: string;
    resumo: ResumoFinanceiro;
};

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
    statusPagamento: 'PAGO' | 'PENDENTE';
    tipoAgendamento?: 'AVALIACAO' | 'ATENDIMENTO';
};

type DespesaApi = {
    id: number;
    descricao: string;
    categoria: string;
    valor: number | string;
    dataDespesa: string;
    observacao?: string | null;
};

function numero(valor: number | string | null | undefined): number {
    const convertido = Number(valor ?? 0);
    return Number.isFinite(convertido) ? convertido : 0;
}

function moeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function dataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string): string {
    if (!data) return '-';
    const [ano, mes, dia] = data.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
}

function nomeMes(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });
}

function obterUltimosMeses(quantidade: number): {
    mes: string;
    inicio: string;
    fim: string;
}[] {
    const meses = [];
    const hoje = new Date();

    // Considera somente meses encerrados.
    for (let i = 1; i <= quantidade; i++) {
        const dataInicio = new Date(
            hoje.getFullYear(),
            hoje.getMonth() - i,
            1
        );
        const dataFim = new Date(
            dataInicio.getFullYear(),
            dataInicio.getMonth() + 1,
            0
        );

        meses.push({
            mes: nomeMes(dataInicio),
            inicio: dataISO(dataInicio),
            fim: dataISO(dataFim),
        });
    }

    return meses;
}

export default function Relatorios() {
    const [relatorios, setRelatorios] = useState<RelatorioMensal[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Controla qual mês está aberto no detalhamento.
    const [mesSelecionado, setMesSelecionado] =
        useState<RelatorioMensal | null>(null);
    const [entradasMes, setEntradasMes] = useState<AtendimentoApi[]>([]);
    const [despesasMes, setDespesasMes] = useState<DespesaApi[]>([]);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
    const [erroDetalhes, setErroDetalhes] = useState('');

    const carregarRelatorios = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const meses = obterUltimosMeses(12);

            const resultados = await Promise.all(
                meses.map(async (mes) => {
                    const params = new URLSearchParams({
                        inicio: mes.inicio,
                        fim: mes.fim,
                    });

                    const resposta = await fetch(
                        `${API_BASE}/financeiro/resumo?${params.toString()}`,
                        {
                            method: 'GET',
                            credentials: 'include',
                            headers: { Accept: 'application/json' },
                        }
                    );

                    if (!resposta.ok) {
                        throw new Error(
                            `Não foi possível carregar o relatório de ${mes.mes}.`
                        );
                    }

                    const resumo: ResumoFinanceiro = await resposta.json();
                    return { ...mes, resumo };
                })
            );

            setRelatorios(resultados);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar os relatórios financeiros.'
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarRelatorios();
    }, [carregarRelatorios]);

    // Busca as movimentações usando exatamente o intervalo do mês clicado.
    async function abrirHistoricoMensal(item: RelatorioMensal) {
        if (mesSelecionado?.inicio === item.inicio) {
            setMesSelecionado(null);
            setEntradasMes([]);
            setDespesasMes([]);
            setErroDetalhes('');
            return;
        }

        setMesSelecionado(item);
        setCarregandoDetalhes(true);
        setErroDetalhes('');
        setEntradasMes([]);
        setDespesasMes([]);

        try {
            const parametrosAtendimentos = new URLSearchParams({
                dataInicio: item.inicio,
                dataFim: item.fim,
            });

            const parametrosDespesas = new URLSearchParams({
                inicio: item.inicio,
                fim: item.fim,
            });

            const [respostaEntradas, respostaDespesas] = await Promise.all([
                fetch(
                    `${API_BASE}/atendimentos/data?${parametrosAtendimentos.toString()}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    }
                ),
                fetch(
                    `${API_BASE}/despesas/periodo?${parametrosDespesas.toString()}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    }
                ),
            ]);

            if (!respostaEntradas.ok) {
                throw new Error(
                    `Não foi possível carregar as entradas (${respostaEntradas.status}).`
                );
            }

            if (!respostaDespesas.ok) {
                throw new Error(
                    `Não foi possível carregar as despesas (${respostaDespesas.status}).`
                );
            }

            const [entradas, despesas]: [AtendimentoApi[], DespesaApi[]] =
                await Promise.all([
                    respostaEntradas.json(),
                    respostaDespesas.json(),
                ]);

            setEntradasMes(entradas ?? []);
            setDespesasMes(despesas ?? []);
        } catch (error) {
            console.error('Erro ao carregar histórico mensal:', error);
            setErroDetalhes(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar as movimentações deste mês.'
            );
        } finally {
            setCarregandoDetalhes(false);
        }
    }

    const totais = useMemo(() => {
        return relatorios.reduce(
            (acumulado, item) => {
                acumulado.entradas += numero(item.resumo.totalRecebido);
                acumulado.despesas += numero(item.resumo.totalDespesas);
                acumulado.faturamento += numero(item.resumo.faturamentoBruto);
                acumulado.resultado += numero(item.resumo.resultadoOperacional);
                return acumulado;
            },
            { entradas: 0, despesas: 0, faturamento: 0, resultado: 0 }
        );
    }, [relatorios]);

    const maiorValorGrafico = useMemo(() => {
        return Math.max(
            1,
            ...relatorios.flatMap((item) => [
                numero(item.resumo.totalRecebido),
                numero(item.resumo.totalDespesas),
            ])
        );
    }, [relatorios]);

    const totalEntradasDetalhadas = entradasMes.reduce(
        (total, item) =>
            total + numero(item.valor) + numero(item.taxaDeslocamento),
        0
    );

    const totalDespesasDetalhadas = despesasMes.reduce(
        (total, item) => total + numero(item.valor),
        0
    );

    return (
        <ModuleLayout
            title="Relatórios Financeiros"
            subtitle="Acompanhe as entradas, despesas e resultados dos meses anteriores."
            eyebrow="CONTROLE FINANCEIRO"
        >
            <main className="relatorios-page">
                <header className="relatorios-header">
                    <div>
                        <span className="relatorios-eyebrow">
                            CONTROLE FINANCEIRO
                        </span>
                        <h1>Relatórios financeiros</h1>
                        <p>
                            Acompanhe as entradas, despesas e resultados
                            financeiros dos meses anteriores.
                        </p>
                    </div>

                    <button
                        className="relatorios-refresh-button"
                        onClick={() => void carregarRelatorios()}
                        disabled={carregando}
                    >
                        <span>↻</span>
                        Atualizar
                    </button>
                </header>

                {erro && (
                    <div className="relatorios-error">
                        <strong>Não foi possível carregar os relatórios</strong>
                        <span>{erro}</span>
                        <button onClick={() => void carregarRelatorios()}>
                            Tentar novamente
                        </button>
                    </div>
                )}

                {carregando ? (
                    <div className="relatorios-loading">
                        <div className="relatorios-spinner" />
                        <p>Carregando relatórios dos meses anteriores...</p>
                    </div>
                ) : (
                    <>
                        <section className="relatorios-periodo">
                            <div>
                                <span>Período analisado</span>
                                <strong>Últimos 12 meses encerrados</strong>
                            </div>
                            <span className="relatorios-periodo-info">
                                {relatorios.length} meses consultados
                            </span>
                        </section>

                        <section className="relatorios-cards">
                            <article className="relatorio-card">
                                <div className="relatorio-card-topo">
                                    <span>Entradas recebidas</span>
                                    <span className="relatorio-icon entrada">↓</span>
                                </div>
                                <strong className="valor-entrada">
                                    {moeda(totais.entradas)}
                                </strong>
                                <small>Valores efetivamente recebidos</small>
                            </article>

                            <article className="relatorio-card">
                                <div className="relatorio-card-topo">
                                    <span>Total de despesas</span>
                                    <span className="relatorio-icon despesa">↑</span>
                                </div>
                                <strong className="valor-despesa">
                                    {moeda(totais.despesas)}
                                </strong>
                                <small>Despesas registradas no período</small>
                            </article>

                            <article className="relatorio-card">
                                <div className="relatorio-card-topo">
                                    <span>Resultado acumulado</span>
                                    <span className="relatorio-icon resultado">=</span>
                                </div>
                                <strong
                                    className={
                                        totais.resultado >= 0
                                            ? 'valor-entrada'
                                            : 'valor-despesa'
                                    }
                                >
                                    {moeda(totais.resultado)}
                                </strong>
                                <small>
                                    {totais.resultado >= 0
                                        ? 'Resultado positivo no período'
                                        : 'Resultado negativo no período'}
                                </small>
                            </article>

                            <article className="relatorio-card">
                                <div className="relatorio-card-topo">
                                    <span>Faturamento bruto</span>
                                    <span className="relatorio-icon faturamento">$</span>
                                </div>
                                <strong>{moeda(totais.faturamento)}</strong>
                                <small>Faturamento total registrado</small>
                            </article>
                        </section>

                        <section className="relatorios-panel">
                            <div className="relatorios-panel-header">
                                <div>
                                    <h2>Entradas x despesas</h2>
                                    <p>
                                        Comparação dos valores recebidos e
                                        gastos em cada mês.
                                    </p>
                                </div>
                                <div className="relatorios-legenda">
                                    <span>
                                        <i className="legenda-entrada" />
                                        Entradas
                                    </span>
                                    <span>
                                        <i className="legenda-despesa" />
                                        Despesas
                                    </span>
                                </div>
                            </div>

                            {relatorios.length === 0 ? (
                                <div className="relatorios-empty">
                                    Nenhum relatório encontrado.
                                </div>
                            ) : (
                                <div className="relatorios-grafico">
                                    {[...relatorios].reverse().map((item) => {
                                        const entradas = numero(item.resumo.totalRecebido);
                                        const despesas = numero(item.resumo.totalDespesas);
                                        const alturaEntrada =
                                            (entradas / maiorValorGrafico) * 100;
                                        const alturaDespesa =
                                            (despesas / maiorValorGrafico) * 100;

                                        return (
                                            <div
                                                className="grafico-mes"
                                                key={item.inicio}
                                            >
                                                <div className="grafico-barras">
                                                    <div
                                                        className="grafico-barra entrada"
                                                        style={{
                                                            height: `${Math.max(
                                                                entradas > 0 ? 3 : 0,
                                                                alturaEntrada
                                                            )}%`,
                                                        }}
                                                        title={`Entradas: ${moeda(entradas)}`}
                                                    />
                                                    <div
                                                        className="grafico-barra despesa"
                                                        style={{
                                                            height: `${Math.max(
                                                                despesas > 0 ? 3 : 0,
                                                                alturaDespesa
                                                            )}%`,
                                                        }}
                                                        title={`Despesas: ${moeda(despesas)}`}
                                                    />
                                                </div>
                                                <span>
                                                    {new Date(
                                                        `${item.inicio}T12:00:00`
                                                    ).toLocaleDateString('pt-BR', {
                                                        month: 'short',
                                                    })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="relatorios-panel">
                            <div className="relatorios-panel-header">
                                <div>
                                    <h2>Histórico mensal</h2>
                                    <p>
                                        Clique no mês para consultar todas as
                                        entradas e despesas daquele período.
                                    </p>
                                </div>
                            </div>

                            <div className="relatorios-tabela-container">
                                <table className="relatorios-tabela">
                                    <thead>
                                        <tr>
                                            <th>Mês</th>
                                            <th>Faturamento</th>
                                            <th>Entradas recebidas</th>
                                            <th>Despesas</th>
                                            <th>Resultado</th>
                                            <th>Situação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relatorios.map((item) => {
                                            const resultado = numero(
                                                item.resumo.resultadoOperacional
                                            );
                                            const positivo = resultado >= 0;
                                            const selecionado =
                                                mesSelecionado?.inicio === item.inicio;

                                            return (
                                                <tr
                                                    key={item.inicio}
                                                    className={
                                                        selecionado
                                                            ? 'relatorio-mes-selecionado'
                                                            : ''
                                                    }
                                                >
                                                    <td className="mes-coluna">
                                                        <button
                                                            type="button"
                                                            className="relatorio-mes-link"
                                                            onClick={() =>
                                                                void abrirHistoricoMensal(item)
                                                            }
                                                            aria-expanded={selecionado}
                                                        >
                                                            {item.mes}
                                                            <span aria-hidden="true">
                                                                {selecionado ? '⌃' : '⌄'}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        {moeda(numero(item.resumo.faturamentoBruto))}
                                                    </td>
                                                    <td className="valor-entrada">
                                                        {moeda(numero(item.resumo.totalRecebido))}
                                                    </td>
                                                    <td className="valor-despesa">
                                                        {moeda(numero(item.resumo.totalDespesas))}
                                                    </td>
                                                    <td
                                                        className={
                                                            positivo
                                                                ? 'valor-entrada'
                                                                : 'valor-despesa'
                                                        }
                                                    >
                                                        {moeda(resultado)}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`relatorio-status ${
                                                                positivo ? 'positivo' : 'negativo'
                                                            }`}
                                                        >
                                                            {positivo ? 'Lucro' : 'Prejuízo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {relatorios.length === 0 && (
                                <div className="relatorios-empty">
                                    Não há dados financeiros para exibir.
                                </div>
                            )}
                        </section>

                        {mesSelecionado && (
                            <section
                                className="relatorios-panel relatorio-detalhes-mes"
                                aria-live="polite"
                            >
                                <div className="relatorios-panel-header">
                                    <div>
                                        <h2>
                                            Movimentações de {mesSelecionado.mes}
                                        </h2>
                                        <p>
                                            {formatarData(mesSelecionado.inicio)} até{' '}
                                            {formatarData(mesSelecionado.fim)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="relatorios-refresh-button"
                                        onClick={() => {
                                            setMesSelecionado(null);
                                            setEntradasMes([]);
                                            setDespesasMes([]);
                                            setErroDetalhes('');
                                        }}
                                    >
                                        Fechar histórico
                                    </button>
                                </div>

                                <div className="relatorio-detalhes-resumo">
                                    <article>
                                        <span>Entradas detalhadas</span>
                                        <strong className="valor-entrada">
                                            {moeda(totalEntradasDetalhadas)}
                                        </strong>
                                    </article>
                                    <article>
                                        <span>Despesas detalhadas</span>
                                        <strong className="valor-despesa">
                                            {moeda(totalDespesasDetalhadas)}
                                        </strong>
                                    </article>
                                    <article>
                                        <span>Resultado do mês</span>
                                        <strong
                                            className={
                                                totalEntradasDetalhadas -
                                                    totalDespesasDetalhadas >= 0
                                                    ? 'valor-entrada'
                                                    : 'valor-despesa'
                                            }
                                        >
                                            {moeda(
                                                totalEntradasDetalhadas -
                                                    totalDespesasDetalhadas
                                            )}
                                        </strong>
                                    </article>
                                </div>

                                {carregandoDetalhes ? (
                                    <div className="relatorios-loading">
                                        <div className="relatorios-spinner" />
                                        <p>Carregando movimentações do mês...</p>
                                    </div>
                                ) : erroDetalhes ? (
                                    <div className="relatorios-error">
                                        <strong>Não foi possível abrir o histórico</strong>
                                        <span>{erroDetalhes}</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void abrirHistoricoMensal(mesSelecionado)
                                            }
                                        >
                                            Tentar novamente
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relatorio-detalhe-bloco">
                                            <h3>Entradas — atendimentos e avaliações</h3>
                                            <div className="relatorios-tabela-container">
                                                <table className="relatorios-tabela">
                                                    <thead>
                                                        <tr>
                                                            <th>Paciente</th>
                                                            <th>Descrição</th>
                                                            <th>Data</th>
                                                            <th>Horário</th>
                                                            <th>Valor</th>
                                                            <th>Pagamento</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entradasMes.map((item) => {
                                                            const valor =
                                                                numero(item.valor) +
                                                                numero(item.taxaDeslocamento);
                                                            const avaliacao =
                                                                item.tipoAgendamento === 'AVALIACAO';

                                                            return (
                                                                <tr key={item.id}>
                                                                    <td>
                                                                        {item.pacienteNome ||
                                                                            'Paciente não informado'}
                                                                    </td>
                                                                    <td>
                                                                        {avaliacao
                                                                            ? 'Avaliação fisioterapêutica'
                                                                            : 'Sessão de fisioterapia'}
                                                                    </td>
                                                                    <td>{formatarData(item.data)}</td>
                                                                    <td>
                                                                        {item.horaInicio || '--:--'}
                                                                        {item.horaFim
                                                                            ? ` – ${item.horaFim}`
                                                                            : ''}
                                                                    </td>
                                                                    <td className="valor-entrada">
                                                                        {moeda(valor)}
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className={`relatorio-status ${
                                                                                item.statusPagamento === 'PAGO'
                                                                                    ? 'positivo'
                                                                                    : 'negativo'
                                                                            }`}
                                                                        >
                                                                            {item.statusPagamento === 'PAGO'
                                                                                ? 'Recebido'
                                                                                : 'Pendente'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {entradasMes.length === 0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan={6}
                                                                    className="relatorios-empty"
                                                                >
                                                                    Nenhuma entrada encontrada neste mês.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="relatorio-detalhe-bloco">
                                            <h3>Despesas</h3>
                                            <div className="relatorios-tabela-container">
                                                <table className="relatorios-tabela">
                                                    <thead>
                                                        <tr>
                                                            <th>Descrição</th>
                                                            <th>Categoria</th>
                                                            <th>Data</th>
                                                            <th>Valor</th>
                                                            <th>Observação</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {despesasMes.map((item) => (
                                                            <tr key={item.id}>
                                                                <td>{item.descricao}</td>
                                                                <td>{item.categoria}</td>
                                                                <td>{formatarData(item.dataDespesa)}</td>
                                                                <td className="valor-despesa">
                                                                    {moeda(numero(item.valor))}
                                                                </td>
                                                                <td>{item.observacao || '-'}</td>
                                                            </tr>
                                                        ))}
                                                        {despesasMes.length === 0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan={5}
                                                                    className="relatorios-empty"
                                                                >
                                                                    Nenhuma despesa encontrada neste mês.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>
                        )}
                    </>
                )}
            </main>
        </ModuleLayout>
    );
}
    