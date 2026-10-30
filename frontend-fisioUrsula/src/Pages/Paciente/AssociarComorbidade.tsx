
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './AssociarComorbidade.css';

type PatientDetails = {
  id: number;
  nome: string;
  comorbidades: string[];
};

type Comorbidade = {
  id: number;
  nome: string;
  descricao: string | null;
  codigoCID: string | null;
};

type CsrfResponse = {
  token: string;
  headerName: string;
};

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

export default function AssociarComorbidade() {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState<PatientDetails | null>(null);
  const [comorbidades, setComorbidades] = useState<Comorbidade[]>([]);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!pacienteId || !Number.isInteger(Number(pacienteId))) {
      setError('Identificador do paciente inválido.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function carregarDados() {
      setLoading(true);
      setError('');

      try {
        const [pacienteResponse, comorbidadesResponse] = await Promise.all([
          fetch(`${API_URL}/pacientes/${pacienteId}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'include',
            signal: controller.signal,
          }),
          fetch(`${API_URL}/comorbidades`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'include',
            signal: controller.signal,
          }),
        ]);

        if (!pacienteResponse.ok) {
          throw new Error(
            `Não foi possível buscar o paciente. HTTP ${pacienteResponse.status}.`
          );
        }

        if (!comorbidadesResponse.ok) {
          throw new Error(
            `Não foi possível buscar as comorbidades. HTTP ${comorbidadesResponse.status}.`
          );
        }

        const pacienteData: PatientDetails = await pacienteResponse.json();
        const comorbidadesData: Comorbidade[] =
          await comorbidadesResponse.json();

        if (!controller.signal.aborted) {
          setPaciente(pacienteData);
          setComorbidades(comorbidadesData);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar os dados.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    carregarDados();

    return () => controller.abort();
  }, [pacienteId]);

  const nomesAssociados = new Set(
    (paciente?.comorbidades || []).map((nome) =>
      nome.trim().toLocaleLowerCase('pt-BR')
    )
  );

  function jaAssociada(comorbidade: Comorbidade): boolean {
    return nomesAssociados.has(
      comorbidade.nome.trim().toLocaleLowerCase('pt-BR')
    );
  }

  function alternarSelecao(id: number) {
    setSelecionadas((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id]
    );
  }

  async function obterTokenCsrf(): Promise<CsrfResponse> {
    const response = await fetch(`${API_URL}/csrf`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        `Não foi possível obter o token de segurança. HTTP ${response.status}.`
      );
    }

    return response.json();
  }

  async function associarComorbidades() {
    if (!paciente || selecionadas.length === 0) {
      setError('Selecione pelo menos uma comorbidade.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    let associadasComSucesso = 0;
    const falhas: string[] = [];

    try {
      // O token CSRF é obtido antes das requisições POST.
      const csrf = await obterTokenCsrf();

      // O endpoint recebe uma comorbidade por requisição.
      for (const comorbidadeId of selecionadas) {
        const comorbidade = comorbidades.find(
          (item) => item.id === comorbidadeId
        );

        try {
          const response = await fetch(
            `${API_URL}/comorbidades/${paciente.id}`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                [csrf.headerName]: csrf.token,
              },
              body: JSON.stringify({
                comorbidadeId,
              }),
            }
          );

          if (!response.ok) {
            const mensagem = await response.text();

            throw new Error(
              mensagem || `Erro HTTP ${response.status}`
            );
          }

          associadasComSucesso++;
        } catch (err) {
          falhas.push(
            `${comorbidade?.nome || `Comorbidade ${comorbidadeId}`}: ${
              err instanceof Error ? err.message : 'Falha na associação'
            }`
          );
        }
      }

      if (associadasComSucesso > 0) {
        setSuccess(
          `${associadasComSucesso} comorbidade(s) associada(s) com sucesso.`
        );

        // Atualiza a lista de comorbidades do paciente.
        const response = await fetch(
          `${API_URL}/pacientes/${paciente.id}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          }
        );

        if (response.ok) {
          const atualizado: PatientDetails = await response.json();
          setPaciente(atualizado);
        }

        setSelecionadas([]);
      }

      if (falhas.length > 0) {
        setError(
          `Algumas associações não foram concluídas:\n${falhas.join('\n')}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível associar as comorbidades.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModuleLayout
      title="Associar comorbidades"
      subtitle="Selecione as condições de saúde que deseja vincular ao paciente."
      eyebrow="PRONTUÁRIO DO PACIENTE"
    >
      <main className="associate-comorbidity-page">
        <button
          type="button"
          className="associate-back-button"
          onClick={() => navigate('/pacientes')}
        >
          ← Voltar para pacientes
        </button>

        {loading && (
          <div className="associate-feedback">
            Carregando informações...
          </div>
        )}

        {error && (
          <div className="associate-message error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="associate-message success" role="status">
            {success}
          </div>
        )}

        {!loading && paciente && (
          <>
            <section className="associate-patient-card">
              <div className="associate-patient-avatar">
                {paciente.nome
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((parte) => parte[0]?.toUpperCase())
                  .join('')}
              </div>

              <div>
                <span>Paciente selecionado</span>
                <h2>{paciente.nome}</h2>
                <p>Cadastro #{paciente.id}</p>
              </div>
            </section>

            <section className="associate-content-card">
              <header className="associate-section-header">
                <div>
                  <h2>Catálogo de comorbidades</h2>
                  <p>
                    Selecione as condições que deseja associar a este paciente.
                  </p>
                </div>

                <span className="associate-count">
                  {comorbidades.length} cadastradas
                </span>
              </header>

              {comorbidades.length === 0 ? (
                <div className="associate-empty">
                  <h3>Nenhuma comorbidade cadastrada</h3>
                  <p>
                    Cadastre uma comorbidade antes de associá-la ao paciente.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/cadastro-comorbidade')}
                  >
                    + Cadastrar comorbidade
                  </button>
                </div>
              ) : (
                <>
                  <div className="associate-list">
                    {comorbidades.map((comorbidade) => {
                      const associada = jaAssociada(comorbidade);
                      const selecionada = selecionadas.includes(
                        comorbidade.id
                      );

                      return (
                        <label
                          key={comorbidade.id}
                          className={`associate-item ${
                            associada ? 'already-associated' : ''
                          } ${selecionada ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={associada || selecionada}
                            disabled={associada || saving}
                            onChange={() =>
                              alternarSelecao(comorbidade.id)
                            }
                          />

                          <span className="associate-checkbox">
                            {associada || selecionada ? '✓' : ''}
                          </span>

                          <span className="associate-item-info">
                            <strong>{comorbidade.nome}</strong>
                            <small>
                              {comorbidade.descricao ||
                                'Sem descrição cadastrada'}
                            </small>
                            {comorbidade.codigoCID && (
                              <small className="associate-cid">
                                CID: {comorbidade.codigoCID}
                              </small>
                            )}
                          </span>

                          {associada && (
                            <span className="associate-tag">
                              Já associada
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <footer className="associate-actions">
                    <span>
                      {selecionadas.length} selecionada(s)
                    </span>

                    <button
                      type="button"
                      className="associate-submit-button"
                      onClick={associarComorbidades}
                      disabled={saving || selecionadas.length === 0}
                    >
                      {saving
                        ? 'Associando...'
                        : 'Associar ao paciente'}
                    </button>
                  </footer>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </ModuleLayout>
  );
}
