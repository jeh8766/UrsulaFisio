
import { useEffect, useMemo, useState } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Exercicios.css';

type TipoExercicio = 'MOTOR' | 'RESPIRATORIO' | 'OUTRO';

type Exercicio = {
  id: number;
  nome: string;
  tipo: TipoExercicio;
  descricao: string | null;
  ativo: boolean;
};

type FormularioExercicio = {
  nome: string;
  tipo: TipoExercicio;
  descricao: string;
};

type FiltroStatus = 'Todos' | 'Ativos' | 'Inativos';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

const TIPOS_EXERCICIO: { value: TipoExercicio; label: string }[] = [
  { value: 'MOTOR', label: 'Motor' },
  { value: 'RESPIRATORIO', label: 'Respiratório' },
  { value: 'OUTRO', label: 'Outro' },
];

const FORMULARIO_INICIAL: FormularioExercicio = {
  nome: '',
  tipo: 'MOTOR',
  descricao: '',
};

function nomeTipo(tipo: TipoExercicio): string {
  return (
    TIPOS_EXERCICIO.find((item) => item.value === tipo)?.label || 'Outro'
  );
}

async function buscarExercicios(
  tipo: TipoExercicio | '',
  ativo: boolean,
  signal: AbortSignal
): Promise<Exercicio[]> {
  const params = new URLSearchParams();

  params.set('ativo', String(ativo));

  if (tipo) {
    params.set('tipo', tipo);
  }

  const response = await fetch(
    `${API_URL}/exercicios?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro HTTP ${response.status} ao consultar exercícios.`
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('A API não retornou uma lista válida de exercícios.');
  }

  return data as Exercicio[];
}

async function obterTokenCsrf(): Promise<{
  headerName: string;
  token: string;
}> {
  const response = await fetch(`${API_URL}/csrf`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      `Não foi possível obter o token de segurança. Erro HTTP ${response.status}.`
    );
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error('A API não retornou um token de segurança válido.');
  }

  return {
    headerName: data.headerName || 'X-XSRF-TOKEN',
    token: data.token,
  };
}

async function requisicaoMutacao(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH',
  body?: FormularioExercicio
): Promise<void> {
  const csrf = await obterTokenCsrf();

  const headers: HeadersInit = {
    Accept: 'application/json',
    [csrf.headerName]: csrf.token,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let mensagem = `Erro HTTP ${response.status}.`;

    try {
      const data = await response.json();
      mensagem =
        data.message ||
        data.mensagem ||
        data.error ||
        mensagem;
    } catch {
      // Mantém a mensagem HTTP quando a API não retorna JSON.
    }

    throw new Error(mensagem);
  }
}

export default function Exercicios() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>('Todos');
  const [filtroTipo, setFiltroTipo] = useState<TipoExercicio | ''>('');

  const [modalAberto, setModalAberto] = useState(false);
  const [exercicioEditando, setExercicioEditando] =
    useState<Exercicio | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioExercicio>(FORMULARIO_INICIAL);

  const [salvando, setSalvando] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState<number | null>(
    null
  );
  const [erroFormulario, setErroFormulario] = useState('');

  async function carregarExercicios(signal?: AbortSignal) {
    setLoading(true);
    setErro('');

    try {
      let resultado: Exercicio[];

      if (filtroStatus === 'Todos') {
        const [ativos, inativos] = await Promise.all([
          buscarExercicios(filtroTipo, true, signal || new AbortController().signal),
          buscarExercicios(filtroTipo, false, signal || new AbortController().signal),
        ]);

        const unicos = new Map<number, Exercicio>();

        [...ativos, ...inativos].forEach((exercicio) => {
          unicos.set(exercicio.id, exercicio);
        });

        resultado = Array.from(unicos.values());
      } else {
        resultado = await buscarExercicios(
          filtroTipo,
          filtroStatus === 'Ativos',
          signal || new AbortController().signal
        );
      }

      if (!signal?.aborted) {
        setExercicios(resultado);
      }
    } catch (err) {
      if (signal?.aborted) return;

      setExercicios([]);
      setErro(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar exercícios.'
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    carregarExercicios(controller.signal);

    return () => controller.abort();
  }, [filtroStatus, filtroTipo]);

  useEffect(() => {
    if (!modalAberto) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !salvando) {
        fecharModal();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalAberto, salvando]);

  const exerciciosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    return exercicios.filter((exercicio) => {
      const correspondeBusca =
        exercicio.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
        (exercicio.descricao || '')
          .toLocaleLowerCase('pt-BR')
          .includes(termo);

      const correspondeStatus =
        filtroStatus === 'Todos' ||
        (filtroStatus === 'Ativos' && exercicio.ativo) ||
        (filtroStatus === 'Inativos' && !exercicio.ativo);

      return correspondeBusca && correspondeStatus;
    });
  }, [exercicios, busca, filtroStatus]);

  const totalAtivos = exercicios.filter(
    (exercicio) => exercicio.ativo
  ).length;

  const totalInativos = exercicios.filter(
    (exercicio) => !exercicio.ativo
  ).length;

  function abrirCadastro() {
    setExercicioEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErroFormulario('');
    setModalAberto(true);
  }

  function abrirEdicao(exercicio: Exercicio) {
    setExercicioEditando(exercicio);
    setFormulario({
      nome: exercicio.nome,
      tipo: exercicio.tipo,
      descricao: exercicio.descricao || '',
    });
    setErroFormulario('');
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setExercicioEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErroFormulario('');
  }

  function atualizarCampo(
    campo: keyof FormularioExercicio,
    valor: string
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  async function salvarExercicio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroFormulario('');
    setAviso('');

    const nome = formulario.nome.trim();

    if (!nome) {
      setErroFormulario('Informe o nome do exercício.');
      return;
    }

    if (nome.length > 30) {
      setErroFormulario('O nome deve ter no máximo 30 caracteres.');
      return;
    }

    const dados: FormularioExercicio = {
      nome,
      tipo: formulario.tipo,
      descricao: formulario.descricao.trim(),
    };

    setSalvando(true);

    try {
      if (exercicioEditando) {
        await requisicaoMutacao(
          `${API_URL}/exercicios/${exercicioEditando.id}`,
          'PUT',
          dados
        );

        setAviso('Exercício atualizado com sucesso.');
      } else {
        await requisicaoMutacao(
          `${API_URL}/exercicios`,
          'POST',
          dados
        );

        setAviso('Exercício cadastrado com sucesso.');
      }

      setModalAberto(false);
      setExercicioEditando(null);
      setFormulario(FORMULARIO_INICIAL);

      await carregarExercicios();
    } catch (err) {
      setErroFormulario(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o exercício.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(exercicio: Exercicio) {
    const acao = exercicio.ativo ? 'inativar' : 'ativar';

    const confirmado = window.confirm(
      exercicio.ativo
        ? `Deseja realmente inativar o exercício "${exercicio.nome}"?`
        : `Deseja reativar o exercício "${exercicio.nome}"?`
    );

    if (!confirmado) return;

    setAlterandoStatus(exercicio.id);
    setErro('');
    setAviso('');

    try {
      await requisicaoMutacao(
        `${API_URL}/exercicios/${exercicio.id}/${acao}`,
        'PATCH'
      );

      setAviso(
        exercicio.ativo
          ? 'Exercício inativado com sucesso.'
          : 'Exercício reativado com sucesso.'
      );

      await carregarExercicios();
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar a situação do exercício.'
      );
    } finally {
      setAlterandoStatus(null);
    }
  }

  return (
    <ModuleLayout
      title="Exercícios"
      subtitle="Gerencie a biblioteca de exercícios utilizados nos atendimentos."
      eyebrow="BIBLIOTECA DE EXERCÍCIOS"
    >
      <section className="exercises-stats">
        <article className="exercise-stat-card">
          <span className="exercise-stat-icon green">▤</span>
          <div>
            <small>Total de exercícios</small>
            <strong>{exercicios.length}</strong>
            <span>Exercícios cadastrados</span>
          </div>
        </article>

        <article className="exercise-stat-card">
          <span className="exercise-stat-icon mint">✓</span>
          <div>
            <small>Exercícios ativos</small>
            <strong>{totalAtivos}</strong>
            <span>Disponíveis para utilização</span>
          </div>
        </article>

        <article className="exercise-stat-card">
          <span className="exercise-stat-icon peach">○</span>
          <div>
            <small>Exercícios inativos</small>
            <strong>{totalInativos}</strong>
            <span>Preservados no histórico</span>
          </div>
        </article>
      </section>

      <section className="exercises-panel">
        <div className="exercises-panel-heading">
          <div>
            <h2>Biblioteca de exercícios</h2>
            <p>Consulte, cadastre e gerencie os exercícios disponíveis.</p>
          </div>

          <button
            type="button"
            className="exercise-primary-button"
            onClick={abrirCadastro}
          >
            + Novo exercício
          </button>
        </div>

        {aviso && (
          <div className="exercise-notice" role="status">
            {aviso}
            <button
              type="button"
              onClick={() => setAviso('')}
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        )}

        {erro && (
          <div className="exercise-error" role="alert">
            <strong>Não foi possível carregar ou atualizar os exercícios.</strong>
            <p>{erro}</p>
            <button
              type="button"
              onClick={() => carregarExercicios()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="exercises-toolbar">
          <label className="exercise-search">
            <span>⌕</span>
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar exercício pelo nome..."
              aria-label="Buscar exercício pelo nome"
            />
          </label>

          <div className="exercise-select-wrap">
            <label htmlFor="filtro-tipo-exercicio">Tipo</label>
            <select
              id="filtro-tipo-exercicio"
              value={filtroTipo}
              onChange={(event) =>
                setFiltroTipo(event.target.value as TipoExercicio | '')
              }
            >
              <option value="">Todos os tipos</option>
              {TIPOS_EXERCICIO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className="exercise-filters"
            aria-label="Filtrar exercícios por situação"
          >
            {(['Todos', 'Ativos', 'Inativos'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={filtroStatus === item ? 'selected' : ''}
                onClick={() => setFiltroStatus(item)}
                aria-pressed={filtroStatus === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="exercises-table-wrap">
          <table className="exercises-table">
            <thead>
              <tr>
                <th>Exercício</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                !erro &&
                exerciciosFiltrados.map((exercicio) => (
                  <tr key={exercicio.id}>
                    <td>
                      <div className="exercise-name">
                        <span className="exercise-row-icon">
                          {exercicio.tipo === 'RESPIRATORIO' ? '◉' : '✣'}
                        </span>
                        <div>
                          <strong>{exercicio.nome}</strong>
                          <small>Exercício #{exercicio.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`exercise-type ${exercicio.tipo.toLowerCase()}`}>
                        {nomeTipo(exercicio.tipo)}
                      </span>
                    </td>

                    <td className="exercise-description">
                      {exercicio.descricao?.trim() || 'Sem descrição'}
                    </td>

                    <td>
                      <span
                        className={`exercise-status ${
                          exercicio.ativo ? 'active' : 'inactive'
                        }`}
                      >
                        {exercicio.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td>
                      <div className="exercise-actions">
                        <button
                          type="button"
                          className="exercise-edit-button"
                          onClick={() => abrirEdicao(exercicio)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={
                            exercicio.ativo
                              ? 'exercise-deactivate-button'
                              : 'exercise-activate-button'
                          }
                          onClick={() => alterarStatus(exercicio)}
                          disabled={alterandoStatus === exercicio.id}
                        >
                          {alterandoStatus === exercicio.id
                            ? 'Aguarde...'
                            : exercicio.ativo
                              ? 'Inativar'
                              : 'Reativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <div className="exercises-empty">
              Carregando exercícios...
            </div>
          )}

          {!loading && !erro && exerciciosFiltrados.length === 0 && (
            <div className="exercises-empty">
              <strong>Nenhum exercício encontrado.</strong>
              <p>
                Tente alterar os filtros ou cadastre um novo exercício.
              </p>
            </div>
          )}
        </div>

        <div className="exercises-table-footer">
          Exibindo <strong>{exerciciosFiltrados.length}</strong> de{' '}
          <strong>{exercicios.length}</strong> exercícios
          <span>Dados carregados da API.</span>
        </div>
      </section>

      {modalAberto && (
        <div
          className="exercise-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <section
            className="exercise-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-modal-title"
          >
            <header className="exercise-modal-header">
              <div>
                <span className="exercise-modal-eyebrow">
                  BIBLIOTECA DE EXERCÍCIOS
                </span>
                <h2 id="exercise-modal-title">
                  {exercicioEditando ? 'Editar exercício' : 'Novo exercício'}
                </h2>
                <p>
                  Preencha as informações para manter sua biblioteca organizada.
                </p>
              </div>

              <button
                type="button"
                className="exercise-modal-close"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </header>

            <form onSubmit={salvarExercicio}>
              <div className="exercise-form-content">
                <label className="exercise-form-field">
                  Nome do exercício
                  <input
                    type="text"
                    value={formulario.nome}
                    onChange={(event) =>
                      atualizarCampo('nome', event.target.value)
                    }
                    placeholder="Ex.: Alongamento de membros superiores"
                    maxLength={30}
                    required
                    autoFocus
                  />
                  <small>{formulario.nome.length}/30 caracteres</small>
                </label>

                <label className="exercise-form-field">
                  Tipo de exercício
                  <select
                    value={formulario.tipo}
                    onChange={(event) =>
                      atualizarCampo('tipo', event.target.value)
                    }
                    required
                  >
                    {TIPOS_EXERCICIO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="exercise-form-field">
                  Descrição
                  <textarea
                    value={formulario.descricao}
                    onChange={(event) =>
                      atualizarCampo('descricao', event.target.value)
                    }
                    placeholder="Descreva como o exercício deve ser realizado..."
                    rows={5}
                  />
                  <small>Campo opcional.</small>
                </label>

                {erroFormulario && (
                  <div className="exercise-form-error" role="alert">
                    {erroFormulario}
                  </div>
                )}
              </div>

              <footer className="exercise-modal-footer">
                <button
                  type="button"
                  className="exercise-modal-secondary"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="exercise-modal-primary"
                  disabled={salvando}
                >
                  {salvando
                    ? 'Salvando...'
                    : exercicioEditando
                      ? 'Salvar alterações'
                      : 'Cadastrar exercício'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </ModuleLayout>
  );
}
