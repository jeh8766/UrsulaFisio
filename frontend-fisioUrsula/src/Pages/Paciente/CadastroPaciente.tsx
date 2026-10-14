
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './CadastroPaciente.css';

export type CadastroPacienteData = {
  nome: string;
  dataNascimento: string;
  vinculo: 'PARTICULAR' | 'CONVENIO';
  nomeResponsavel: string;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
};

type CadastroPacienteProps = {
  onCadastrar?: (
    paciente: CadastroPacienteData
  ) => void | Promise<void>;
};

const initialForm: CadastroPacienteData = {
  nome: '',
  dataNascimento: '',
  vinculo: 'PARTICULAR',
  nomeResponsavel: '',
  telefone: '',
  cep: '',
  estado: '',
  cidade: '',
  bairro: '',
  rua: '',
  numero: 0,
};

export default function CadastroPaciente({
  onCadastrar,
}: CadastroPacienteProps) {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<CadastroPacienteData>(initialForm);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function atualizarCampo(
    campo: keyof CadastroPacienteData,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: campo === 'numero' ? Number(valor) : valor,
    }));

    setErro('');
    setSucesso(false);
  }

  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);

    if (numeros.length <= 2) {
      return numeros.length ? `(${numeros}` : '';
    }

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  function formatarCep(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);

    if (numeros.length > 5) {
      return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    }

    return numeros;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setSucesso(false);

    if (form.telefone.replace(/\D/g, '').length < 10) {
      setErro('Informe um telefone válido com DDD.');
      return;
    }

    if (form.cep.replace(/\D/g, '').length !== 8) {
      setErro('Informe um CEP válido com 8 dígitos.');
      return;
    }

    if (form.numero < 1) {
      setErro('Informe um número de endereço válido.');
      return;
    }

    if (!onCadastrar) {
      setErro(
        'O formulário está pronto, mas ainda precisa ser conectado à API de cadastro.'
      );
      return;
    }

    try {
      setSalvando(true);

      await onCadastrar({
        ...form,
        nome: form.nome.trim(),
        nomeResponsavel: form.nomeResponsavel.trim(),
        telefone: form.telefone,
        cep: form.cep,
        estado: form.estado.trim().toUpperCase(),
        cidade: form.cidade.trim(),
        bairro: form.bairro.trim(),
        rua: form.rua.trim(),
        numero: Number(form.numero),
      });

      setSucesso(true);
      setForm(initialForm);
    } catch {
      setErro(
        'Não foi possível cadastrar o paciente. Verifique os dados e tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ModuleLayout
      title="Cadastrar paciente"
      subtitle="Preencha os dados para adicionar um novo paciente à clínica."
      eyebrow="GESTÃO DE PACIENTES"
    >
      <div className="cadastro-paciente">
        <div className="cadastro-intro">
          <div className="cadastro-intro-icon" aria-hidden="true">
            ♙
          </div>

          <div>
            <h2>Novo paciente</h2>
            <p>
              Os campos marcados com <span>*</span> são obrigatórios.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="cadastro-card">
            <div className="cadastro-section-heading">
              <div className="cadastro-section-icon">01</div>
              <div>
                <h3>Dados pessoais</h3>
                <p>Informações de identificação e contato.</p>
              </div>
            </div>

            <div className="cadastro-form-grid">
              <div className="cadastro-field field-full">
                <label htmlFor="nome">
                  Nome completo <span>*</span>
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Ex.: Amanda Queiroz"
                  value={form.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="dataNascimento">
                  Data de nascimento <span>*</span>
                </label>
                <input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) =>
                    atualizarCampo('dataNascimento', e.target.value)
                  }
                  autoComplete="bday"
                  required
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="vinculo">
                  Tipo de vínculo <span>*</span>
                </label>
                <select
                  id="vinculo"
                  name="vinculo"
                  value={form.vinculo}
                  onChange={(e) =>
                    atualizarCampo('vinculo', e.target.value)
                  }
                  required
                >
                  <option value="PARTICULAR">Particular</option>
                  <option value="CONVENIO">Convênio</option>
                </select>
              </div>

              <div className="cadastro-field">
                <label htmlFor="nomeResponsavel">
                  Nome do responsável
                </label>
                <input
                  id="nomeResponsavel"
                  name="nomeResponsavel"
                  type="text"
                  placeholder="Nome do responsável legal"
                  value={form.nomeResponsavel}
                  onChange={(e) =>
                    atualizarCampo('nomeResponsavel', e.target.value)
                  }
                  autoComplete="off"
                />
                <small>Preencha quando aplicável.</small>
              </div>

              <div className="cadastro-field">
                <label htmlFor="telefone">
                  Telefone <span>*</span>
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  placeholder="(83) 91234-5678"
                  value={form.telefone}
                  onChange={(e) =>
                    atualizarCampo(
                      'telefone',
                      formatarTelefone(e.target.value)
                    )
                  }
                  autoComplete="tel"
                  maxLength={15}
                  required
                />
              </div>
            </div>
          </section>

          <section className="cadastro-card">
            <div className="cadastro-section-heading">
              <div className="cadastro-section-icon">02</div>
              <div>
                <h3>Endereço</h3>
                <p>Informe onde o paciente reside.</p>
              </div>
            </div>

            <div className="cadastro-form-grid">
              <div className="cadastro-field">
                <label htmlFor="cep">
                  CEP <span>*</span>
                </label>
                <input
                  id="cep"
                  name="cep"
                  type="text"
                  placeholder="12345-123"
                  value={form.cep}
                  onChange={(e) =>
                    atualizarCampo('cep', formatarCep(e.target.value))
                  }
                  autoComplete="postal-code"
                  maxLength={9}
                  required
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="estado">
                  Estado (UF) <span>*</span>
                </label>
                <input
                  id="estado"
                  name="estado"
                  type="text"
                  placeholder="PB"
                  value={form.estado}
                  onChange={(e) =>
                    atualizarCampo(
                      'estado',
                      e.target.value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase()
                    )
                  }
                  autoComplete="address-level1"
                  maxLength={2}
                  required
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="cidade">
                  Cidade <span>*</span>
                </label>
                <input
                  id="cidade"
                  name="cidade"
                  type="text"
                  placeholder="Nome da cidade"
                  value={form.cidade}
                  onChange={(e) => atualizarCampo('cidade', e.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="bairro">
                  Bairro <span>*</span>
                </label>
                <input
                  id="bairro"
                  name="bairro"
                  type="text"
                  placeholder="Nome do bairro"
                  value={form.bairro}
                  onChange={(e) => atualizarCampo('bairro', e.target.value)}
                  autoComplete="address-level3"
                  required
                />
              </div>

              <div className="cadastro-field field-full">
                <label htmlFor="rua">
                  Rua / Logradouro <span>*</span>
                </label>
                <input
                  id="rua"
                  name="rua"
                  type="text"
                  placeholder="Nome da rua ou avenida"
                  value={form.rua}
                  onChange={(e) => atualizarCampo('rua', e.target.value)}
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="cadastro-field">
                <label htmlFor="numero">
                  Número <span>*</span>
                </label>
                <input
                  id="numero"
                  name="numero"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="123"
                  value={form.numero || ''}
                  onChange={(e) => atualizarCampo('numero', e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          {erro && (
            <div className="cadastro-message error" role="alert">
              <span aria-hidden="true">!</span>
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="cadastro-message success" role="status">
              <span aria-hidden="true">✓</span>
              Paciente cadastrado com sucesso!
            </div>
          )}

          <div className="cadastro-actions">
            <button
              type="button"
              className="cadastro-button secondary"
              onClick={() => navigate('/paciente')}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="cadastro-button primary"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Cadastrar paciente'}
              {!salvando && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
