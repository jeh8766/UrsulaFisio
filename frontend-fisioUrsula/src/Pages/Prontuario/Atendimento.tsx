
import { useState, type FormEvent } from 'react';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import './Atendimento.css';

type TipoAtendimento = 'PARTICULAR' | 'CLINICA';

type AgendamentoOpcao = {
  id: number;
  pacienteId: number;
  paciente: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: 'AVALIACAO' | 'ATENDIMENTO';
};

const agendamentosExemplo: AgendamentoOpcao[] = [
  {
    id: 1,
    pacienteId: 1,
    paciente: 'Mariana Costa',
    data: '2026-10-17',
    horaInicio: '08:00',
    horaFim: '08:50',
    tipo: 'ATENDIMENTO',
  },
  {
    id: 2,
    pacienteId: 2,
    paciente: 'Rafael Oliveira',
    data: '2026-10-17',
    horaInicio: '09:00',
    horaFim: '09:45',
    tipo: 'ATENDIMENTO',
  },
  {
    id: 3,
    pacienteId: 3,
    paciente: 'Camila Ferreira',
    data: '2026-10-17',
    horaInicio: '10:00',
    horaFim: '10:40',
    tipo: 'AVALIACAO',
  },
];

function formatarData(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

export default function Atendimento() {
  const [agendamentoId, setAgendamentoId] = useState('');
  const [tipoAtendimento, setTipoAtendimento] =
    useState<TipoAtendimento>('PARTICULAR');

  const [valor, setValor] = useState('');
  const [taxaDeslocamento, setTaxaDeslocamento] = useState('0');

  const [statusAtendimento, setStatusAtendimento] = useState('PENDENTE');
  const [statusPagamento, setStatusPagamento] = useState('PENDENTE');

  const [pressaoArterial, setPressaoArterial] = useState('');
  const [saturacao, setSaturacao] = useState('');
  const [frequenciaCardiaca, setFrequenciaCardiaca] = useState('');
  const [frequenciaRespiratoria, setFrequenciaRespiratoria] = useState('');

  const [intercorrencia, setIntercorrencia] = useState('');
  const [evolucao, setEvolucao] = useState('');
  const [notice, setNotice] = useState('');

  const agendamentoSelecionado = agendamentosExemplo.find(
    (item) => String(item.id) === agendamentoId,
  );

  function salvarAtendimento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!agendamentoSelecionado) {
      setNotice('Selecione um agendamento antes de continuar.');
      return;
    }

    setNotice(
      'Demonstração: formulário preenchido. Nenhum dado foi enviado ou salvo.',
    );
  }

  function limparFormulario() {
    setAgendamentoId('');
    setTipoAtendimento('PARTICULAR');
    setValor('');
    setTaxaDeslocamento('0');
    setStatusAtendimento('PENDENTE');
    setStatusPagamento('PENDENTE');
    setPressaoArterial('');
    setSaturacao('');
    setFrequenciaCardiaca('');
    setFrequenciaRespiratoria('');
    setIntercorrencia('');
    setEvolucao('');
    setNotice('');
  }

  return (
    <ModuleLayout
      title="Atendimento"
      subtitle="Registre os dados clínicos e acompanhe a evolução do paciente."
      eyebrow="REGISTRO DE SESSÃO"
    >
      <form className="atendimento-page" onSubmit={salvarAtendimento}>
        {notice && (
          <div className="atendimento-notice" role="status">
            {notice}
          </div>
        )}

        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">▦</div>
            <div>
              <h2>Agendamento</h2>
              <p>Selecione o horário relacionado a este atendimento.</p>
            </div>
          </div>

          <div className="atendimento-grid">
            <label className="atendimento-field atendimento-field-full">
              Agendamento
              <select
                value={agendamentoId}
                onChange={(evento) => {
                  setAgendamentoId(evento.target.value);
                  setNotice('');
                }}
                required
              >
                <option value="">Selecione um agendamento</option>
                {agendamentosExemplo.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} — {item.paciente} — {formatarData(item.data)} —{' '}
                    {item.horaInicio} às {item.horaFim}
                  </option>
                ))}
              </select>
            </label>

            {agendamentoSelecionado ? (
              <>
                <div className="atendimento-info-card">
                  <span>Paciente</span>
                  <strong>{agendamentoSelecionado.paciente}</strong>
                  <small>ID #{agendamentoSelecionado.pacienteId}</small>
                </div>

                <div className="atendimento-info-card">
                  <span>Data e horário</span>
                  <strong>{formatarData(agendamentoSelecionado.data)}</strong>
                  <small>
                    {agendamentoSelecionado.horaInicio} às{' '}
                    {agendamentoSelecionado.horaFim}
                  </small>
                </div>

                <div className="atendimento-info-card">
                  <span>Tipo de agendamento</span>
                  <strong>
                    {agendamentoSelecionado.tipo === 'AVALIACAO'
                      ? 'Avaliação'
                      : 'Atendimento'}
                  </strong>
                  <small>Informação demonstrativa</small>
                </div>
              </>
            ) : (
              <p className="atendimento-helper atendimento-field-full">
                Ao selecionar um agendamento, os dados do paciente aparecerão
                aqui.
              </p>
            )}
          </div>
        </section>

        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">R$</div>
            <div>
              <h2>Dados do atendimento</h2>
              <p>Informe a modalidade, os valores e os status.</p>
            </div>
          </div>

          <div className="atendimento-grid">
            <label className="atendimento-field">
              Tipo de atendimento
              <select
                value={tipoAtendimento}
                onChange={(evento) =>
                  setTipoAtendimento(
                    evento.target.value as TipoAtendimento,
                  )
                }
              >
                <option value="PARTICULAR">Particular</option>
                <option value="CLINICA">Clínica</option>
              </select>
            </label>

            <label className="atendimento-field">
              Valor do atendimento (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
                placeholder="0,00"
                required
              />
            </label>

            <label className="atendimento-field">
              Taxa de deslocamento (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxaDeslocamento}
                onChange={(evento) =>
                  setTaxaDeslocamento(evento.target.value)
                }
                placeholder="0,00"
                required
              />
            </label>

            <label className="atendimento-field">
              Status do atendimento
              <select
                value={statusAtendimento}
                onChange={(evento) =>
                  setStatusAtendimento(evento.target.value)
                }
              >
                <option value="AGENDADO">Agendado</option>
                <option value="ATENDIDO">Atendido</option>
                <option value="CANCELADO_PACIENTE">Cancelado pelo paciente</option>
                <option value="CANCELADO_FISIOTERAPEUTA">Cancelado pelo fisioterapeuta</option>
                <option value="REAGENDADO">Reagendado</option>
              </select>
            </label>  

            <label className="atendimento-field">
              Status do pagamento
              <select
                value={statusPagamento}
                onChange={(evento) => setStatusPagamento(evento.target.value)}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </label>

            <div className="atendimento-total">
              <span>Valor total previsto</span>
              <strong>
                {(
                  (Number(valor) || 0) +
                  (Number(taxaDeslocamento) || 0)
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
              <small>Atendimento + deslocamento</small>
            </div>
          </div>
        </section>

        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">♡</div>
            <div>
              <h2>Sinais vitais</h2>
              <p>Registre os sinais vitais observados durante a sessão.</p>
            </div>
          </div>

          <div className="atendimento-grid">
            <label className="atendimento-field">
              Pressão arterial
              <input
                value={pressaoArterial}
                onChange={(evento) =>
                  setPressaoArterial(evento.target.value)
                }
                placeholder="Ex.: 120/80 mmHg"
                maxLength={15}
                required
              />
              <small>Exemplo de formato: 120/80 mmHg</small>
            </label>

            <label className="atendimento-field">
              Saturação de oxigênio (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={saturacao}
                onChange={(evento) => setSaturacao(evento.target.value)}
                placeholder="Ex.: 98"
                required
              />
            </label>

            <label className="atendimento-field">
              Frequência cardíaca (bpm)
              <input
                type="number"
                min="1"
                step="1"
                value={frequenciaCardiaca}
                onChange={(evento) =>
                  setFrequenciaCardiaca(evento.target.value)
                }
                placeholder="Ex.: 72"
                required
              />
            </label>

            <label className="atendimento-field">
              Frequência respiratória (irpm)
              <input
                type="number"
                min="1"
                step="1"
                value={frequenciaRespiratoria}
                onChange={(evento) =>
                  setFrequenciaRespiratoria(evento.target.value)
                }
                placeholder="Ex.: 16"
                required
              />
            </label>
          </div>

          <p className="atendimento-helper">
            Os campos são para registro profissional. Os valores devem
            corresponder às medições reais do paciente.
          </p>
        </section>

        <section className="atendimento-panel">
          <div className="atendimento-section-heading">
            <div className="atendimento-section-icon">✎</div>
            <div>
              <h2>Registro clínico</h2>
              <p>Documente intercorrências e a evolução do paciente.</p>
            </div>
          </div>

          <div className="atendimento-grid">
            <label className="atendimento-field atendimento-field-full">
              Intercorrências
              <textarea
                value={intercorrencia}
                onChange={(evento) => setIntercorrencia(evento.target.value)}
                maxLength={250}
                rows={3}
                placeholder="Registre ocorrências relevantes durante o atendimento..."
              />
              <small>{intercorrencia.length}/250 caracteres</small>
            </label>

            <label className="atendimento-field atendimento-field-full">
              Evolução do paciente
              <textarea
                value={evolucao}
                onChange={(evento) => setEvolucao(evento.target.value)}
                maxLength={250}
                rows={4}
                placeholder="Descreva a evolução, os procedimentos realizados e a resposta do paciente..."
              />
              <small>{evolucao.length}/250 caracteres</small>
            </label>
          </div>
        </section>

        <div className="atendimento-actions">
          <button
            type="button"
            className="atendimento-button-secondary"
            onClick={limparFormulario}
          >
            Limpar formulário
          </button>

          <button type="submit" className="atendimento-button-primary">
            Finalizar registro visual
          </button>
        </div>

        <p className="atendimento-demo-note">
          Modo de demonstração: os dados são mantidos apenas no estado desta
          página. Nenhuma informação clínica ou financeira é salva no banco.
        </p>
      </form>
    </ModuleLayout>
  );
}
