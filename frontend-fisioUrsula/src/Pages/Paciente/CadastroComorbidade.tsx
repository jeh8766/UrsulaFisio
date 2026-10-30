
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './CadastroComorbidade.css';

type CadastroComorbidadeData = {
  nomeComorbidade: string;
  descricaoComorbidade: string;
  codigoCIDComorbidade: string;
};

type Comorbidade = {
  id: number;
  nome: string;
  descricao: string | null;
  codigoCID: string | null;
};

type RespostaCsrf = {
  headerName: string;
  token: string;
};

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

const API_COMORBIDADES_URL = `${API_URL}/comorbidades`;
const API_CSRF_URL = `${API_URL}/csrf`;

const initialForm: CadastroComorbidadeData = {
  nomeComorbidade: '',
  descricaoComorbidade: '',
  codigoCIDComorbidade: '',
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

async function extrairMensagemErro(resposta: Response): Promise<string> {
  const corpo = await resposta.text();

  const mensagemPadrao =
    `Erro ${resposta.status}: não foi possível realizar a operação.`;

  if (!corpo) {
    return mensagemPadrao;
  }

  try {
    const detalhe = JSON.parse(corpo);

    if (Array.isArray(detalhe.errors) && detalhe.errors.length > 0) {
      return detalhe.errors
        .map(
          (item: {
            defaultMessage?: string;
            message?: string;
          }) => item.defaultMessage || item.message,
        )
        .filter(Boolean)
        .join(' ');
    }

    return (
      detalhe.detail ||
      detalhe.message ||
      detalhe.mensagem ||
      detalhe.title ||
      mensagemPadrao
    );
  } catch {
    return corpo;
  }
}

export default function CadastroComorbidade() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<CadastroComorbidadeData>(initialForm);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Estados do catálogo
  const [comorbidades, setComorbidades] = useState<Comorbidade[]>([]);
  const [busca, setBusca] = useState('');
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erroLista, setErroLista] = useState('');
  const [atualizarLista, setAtualizarLista] = useState(0);

  function atualizarCampo(
    campo: keyof CadastroComorbidadeData,
    valor: string,
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setErro('');
    setSucesso(false);
  }

  function formatarCID(valor: string): string {
    return valor.toUpperCase().replace(/\s/g, '').slice(0, 6);
  }

  // Busca as comorbidades no backend.
  // A consulta é refeita quando o usuário altera a pesquisa.
  useEffect(() => {
    const controlador = new AbortController();

    const temporizador = setTimeout(async () => {
      try {
        setCarregandoLista(true);
        setErroLista('');

        const parametros = new URLSearchParams();

        if (busca.trim()) {
          parametros.set('nome', busca.trim());
        }

        const query = parametros.toString();

        const url = query
          ? `${API_COMORBIDADES_URL}?${query}`
          : API_COMORBIDADES_URL;

        const resposta = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
          signal: controlador.signal,
        });

        if (!resposta.ok) {
          throw new Error(await extrairMensagemErro(resposta));
        }

        const dados: Comorbidade[] = await resposta.json();

        setComorbidades(dados);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') {
          return;
        }

        if (e instanceof TypeError) {
          setErroLista(
            'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
          );
        } else if (e instanceof Error) {
          setErroLista(e.message);
        } else {
          setErroLista('Não foi possível carregar as comorbidades.');
        }

        setComorbidades([]);
      } finally {
        if (!controlador.signal.aborted) {
          setCarregandoLista(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [busca, atualizarLista]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro('');
    setSucesso(false);

    const nome = form.nomeComorbidade.trim();
    const descricao = form.descricaoComorbidade.trim();
    const codigoCID = form.codigoCIDComorbidade.trim().toUpperCase();

    if (!nome) {
      setErro('Informe o nome da comorbidade.');
      return;
    }

    if (nome.length > 40) {
      setErro('O nome deve possuir no máximo 40 caracteres.');
      return;
    }

    if (descricao.length > 150) {
      setErro('A descrição deve possuir no máximo 150 caracteres.');
      return;
    }

    if (
      codigoCID &&
      !/^[A-Z]\d{2}(\.\d{1,2})?$/.test(codigoCID)
    ) {
      setErro(
        'CID inválido. Utilize o formato do CID-10, como E11 ou M54.5.',
      );
      return;
    }

    try {
      setSalvando(true);

      const dadosComorbidade = {
        nome,
        descricao: descricao || null,
        codigoCID: codigoCID || null,
      };

      const csrf = await obterTokenCsrf();

      const resposta = await fetch(API_COMORBIDADES_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify(dadosComorbidade),
      });

      if (!resposta.ok) {
        throw new Error(await extrairMensagemErro(resposta));
      }

      setSucesso(true);
      setForm(initialForm);

      // Solicita novamente o catálogo após cadastrar.
      setBusca('');
      setAtualizarLista((anterior) => anterior + 1);

    } catch (e: unknown) {
      if (e instanceof TypeError) {
        setErro(
          'Não foi possível conectar à API. Verifique se o Spring Boot está rodando.',
        );
      } else if (e instanceof Error) {
        setErro(e.message);
      } else {
        setErro('Não foi possível cadastrar a comorbidade.');
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ModuleLayout
      title="Cadastrar comorbidade"
      subtitle="Cadastre e consulte as condições de saúde disponíveis no catálogo."
      eyebrow="GESTÃO DE PACIENTES"
    >
      <div className="cadastro-comorbidade-page">

        {/* INTRODUÇÃO */}

        <div className="comorbidade-page-intro">
          <div className="comorbidade-page-intro-icon" aria-hidden="true">
            ♡
          </div>

          <div>
            <h2>Nova comorbidade</h2>
            <p>
              Cadastre uma condição de saúde para utilizá-la
              posteriormente nos pacientes.
            </p>
          </div>
        </div>

        {/* FORMULÁRIO DE CADASTRO */}

        <form
          className="comorbidade-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <section className="comorbidade-form-card">

            <div className="comorbidade-form-heading">
              <div className="comorbidade-form-number">01</div>

              <div>
                <h3>Informações da comorbidade</h3>
                <p>
                  Informe os dados de identificação da condição
                  de saúde.
                </p>
              </div>
            </div>

            <div className="comorbidade-form-grid">

              <div className="comorbidade-form-field comorbidade-field-full">
                <label htmlFor="comorbidade-nome">
                  Nome da comorbidade <span>*</span>
                </label>

                <input
                  id="comorbidade-nome"
                  name="comorbidadeNome"
                  type="text"
                  placeholder="Ex.: Diabetes, Hipertensão, Asma..."
                  value={form.nomeComorbidade}
                  onChange={(e) =>
                    atualizarCampo('nomeComorbidade', e.target.value)
                  }
                  maxLength={40}
                  autoComplete="off"
                  required
                  disabled={salvando}
                />

                <small>
                  Nome que será apresentado no catálogo de comorbidades.
                </small>
              </div>

              <div className="comorbidade-form-field comorbidade-field-full">
                <label htmlFor="comorbidade-descricao">
                  Descrição
                </label>

                <textarea
                  id="comorbidade-descricao"
                  name="comorbidadeDescricao"
                  placeholder="Descreva brevemente a condição de saúde..."
                  value={form.descricaoComorbidade}
                  onChange={(e) =>
                    atualizarCampo('descricaoComorbidade', e.target.value)
                  }
                  maxLength={150}
                  rows={4}
                  autoComplete="off"
                  disabled={salvando}
                />

                <small>
                  Campo opcional. Máximo de 150 caracteres.
                  {' '}{form.descricaoComorbidade.length}/150
                </small>
              </div>

              <div className="comorbidade-form-field">
                <label htmlFor="comorbidade-cid">
                  Código CID-10
                </label>

                <input
                  id="comorbidade-cid"
                  name="comorbidadeCodigoCID"
                  type="text"
                  placeholder="Ex.: E11 ou M54.5"
                  value={form.codigoCIDComorbidade}
                  onChange={(e) =>
                    atualizarCampo(
                      'codigoCIDComorbidade',
                      formatarCID(e.target.value),
                    )
                  }
                  maxLength={6}
                  autoComplete="off"
                  disabled={salvando}
                />

                <small>
                  Informe o código de classificação da doença,
                  quando disponível.
                </small>
              </div>

            </div>
          </section>

          <div className="comorbidade-form-info">
            <span aria-hidden="true">ⓘ</span>

            <p>
              Esta comorbidade será cadastrada no catálogo geral.
              Ela ainda não estará vinculada a nenhum paciente.
              A associação será realizada posteriormente na avaliação.
            </p>
          </div>

          {erro && (
            <div className="comorbidade-form-message error" role="alert">
              <span aria-hidden="true">!</span>
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="comorbidade-form-message success" role="status">
              <span aria-hidden="true">✓</span>
              Comorbidade cadastrada com sucesso!
            </div>
          )}

          <div className="comorbidade-form-actions">

            <button
              type="button"
              className="comorbidade-form-button secondary"
              onClick={() => navigate('/paciente')}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="comorbidade-form-button primary"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Cadastrar comorbidade'}

              {!salvando && (
                <span aria-hidden="true">→</span>
              )}
            </button>

          </div>
        </form>

        {/* CATÁLOGO DE COMORBIDADES */}

        <section className="comorbidade-catalog-card">

          <div className="comorbidade-catalog-heading">
            <div className="comorbidade-catalog-title">
              <div className="comorbidade-form-number">02</div>

              <div>
                <h3>Comorbidades cadastradas</h3>
                <p>
                  Consulte e pesquise as condições de saúde do catálogo.
                </p>
              </div>
            </div>

            <div className="comorbidade-catalog-count">
              {comorbidades.length} {comorbidades.length === 1 ? 'registro' : 'registros'}
            </div>
          </div>

          {/* CAMPO DE PESQUISA */}

          <div className="comorbidade-search-container">
            <span className="comorbidade-search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              id="comorbidade-busca-catalogo"
              name="comorbidadeBuscaCatalogo"
              type="search"
              placeholder="Pesquisar comorbidade pelo nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              autoComplete="off"
            />

            {busca && (
              <button
                type="button"
                className="comorbidade-search-clear"
                onClick={() => setBusca('')}
                aria-label="Limpar pesquisa"
              >
                ×
              </button>
            )}
          </div>

          {/* ESTADOS DA LISTAGEM */}

          {carregandoLista && (
            <div className="comorbidade-catalog-state">
              <span className="comorbidade-loading-spinner" />
              <p>Carregando comorbidades...</p>
            </div>
          )}

          {!carregandoLista && erroLista && (
            <div className="comorbidade-catalog-error" role="alert">
              <span>!</span>
              <p>{erroLista}</p>

              <button
                type="button"
                onClick={() => setAtualizarLista((anterior) => anterior + 1)}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregandoLista && !erroLista && comorbidades.length === 0 && (
            <div className="comorbidade-catalog-empty">
              <span aria-hidden="true">♡</span>

              <h4>
                {busca
                  ? 'Nenhuma comorbidade encontrada'
                  : 'Nenhuma comorbidade cadastrada'}
              </h4>

              <p>
                {busca
                  ? 'Tente pesquisar utilizando outro nome.'
                  : 'As comorbidades cadastradas aparecerão aqui.'}
              </p>
            </div>
          )}

          {/* TABELA */}

          {!carregandoLista && !erroLista && comorbidades.length > 0 && (
            <div className="comorbidade-table-wrapper">
              <table className="comorbidade-catalog-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Código CID-10</th>
                  </tr>
                </thead>

                <tbody>
                  {comorbidades.map((comorbidade) => (
                    <tr key={comorbidade.id}>
                      <td>
                        <span className="comorbidade-id">
                          #{comorbidade.id}
                        </span>
                      </td>

                      <td>
                        <strong className="comorbidade-table-name">
                          {comorbidade.nome}
                        </strong>
                      </td>

                      <td>
                        <span className="comorbidade-table-description">
                          {comorbidade.descricao || 'Não informada'}
                        </span>
                      </td>

                      <td>
                        {comorbidade.codigoCID ? (
                          <span className="comorbidade-cid-badge">
                            {comorbidade.codigoCID}
                          </span>
                        ) : (
                          <span className="comorbidade-no-cid">
                            Não informado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="comorbidade-catalog-footer">
            <span>
              {busca
                ? `Resultado da pesquisa por "${busca}"`
                : 'Exibindo as comorbidades disponíveis no catálogo.'}
            </span>
          </div>

        </section>

      </div>
    </ModuleLayout>
  );
}
