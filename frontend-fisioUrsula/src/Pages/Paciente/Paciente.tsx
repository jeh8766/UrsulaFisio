
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../ModuleLayout/ModuleLayout';
import '../Paciente/Paciente.css';

type Patient = {
  id: number;
  name: string;
  initials: string;
  condition: string;
  phone: string;
  lastVisit: string;
  status: 'Ativo' | 'Inativo';
  color: string;
};

const initialPatients: Patient[] = [
  {
    id: 1,
    name: 'Mariana Costa',
    initials: 'MC',
    condition: 'Lombalgia',
    phone: '(83) 98812-4530',
    lastVisit: '10 out, 2026',
    status: 'Ativo',
    color: 'sage',
  },
  {
    id: 2,
    name: 'Rafael Oliveira',
    initials: 'RO',
    condition: 'Reabilitação de joelho',
    phone: '(83) 99124-6781',
    lastVisit: '09 out, 2026',
    status: 'Ativo',
    color: 'blue',
  },
  {
    id: 3,
    name: 'Camila Ferreira',
    initials: 'CF',
    condition: 'Cervicalgia',
    phone: '(83) 98765-1023',
    lastVisit: '08 out, 2026',
    status: 'Ativo',
    color: 'rose',
  },
  {
    id: 4,
    name: 'João Pedro Santos',
    initials: 'JS',
    condition: 'Pós-operatório',
    phone: '(83) 99632-4410',
    lastVisit: '02 out, 2026',
    status: 'Inativo',
    color: 'sand',
  },
  {
    id: 5,
    name: 'Beatriz Almeida',
    initials: 'BA',
    condition: 'Fisioterapia preventiva',
    phone: '(83) 98221-3354',
    lastVisit: '30 set, 2026',
    status: 'Ativo',
    color: 'lavender',
  },
];

export default function Pacientes() {
  const navigate = useNavigate();

  const [patients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<
    'Todos' | 'Ativo' | 'Inativo'
  >('Todos');

  const filtered = useMemo(
    () =>
      patients.filter(
        (patient) =>
          (
            patient.name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            patient.condition
              .toLowerCase()
              .includes(search.toLowerCase())
          ) &&
          (filter === 'Todos' || patient.status === filter)
      ),
    [patients, search, filter]
  );

  return (
    <ModuleLayout
      title="Pacientes"
      subtitle="Organize os cadastros e acompanhe as informações dos seus pacientes."
      eyebrow="GESTÃO DE PACIENTES"
    >
      <div className="patients-stats">
        <article className="patient-stat-card">
          <span className="patient-stat-icon green">♙</span>
          <div>
            <small>Total de pacientes</small>
            <strong>{patients.length}</strong>
            <span>Cadastros na lista</span>
          </div>
        </article>

        <article className="patient-stat-card">
          <span className="patient-stat-icon mint">✓</span>
          <div>
            <small>Pacientes ativos</small>
            <strong>
              {patients.filter((p) => p.status === 'Ativo').length}
            </strong>
            <span>Em acompanhamento</span>
          </div>
        </article>

        <article className="patient-stat-card">
          <span className="patient-stat-icon peach">▦</span>
          <div>
            <small>Inativos</small>
            <strong>
              {patients.filter((p) => p.status === 'Inativo').length}
            </strong>
            <span>Sem acompanhamento atual</span>
          </div>
        </article>
      </div>

      <section className="patients-panel">
        <div className="patients-panel-heading">
          <div>
            <h2>Lista de pacientes</h2>
            <p>Consulte e gerencie os cadastros registrados.</p>
          </div>

          <button
            type="button"
            className="patients-primary-button"
            onClick={() => navigate('/cadastro-paciente')}
          >
            + Novo paciente
          </button>
        </div>

        <div className="patients-toolbar">
          <label className="patient-search">
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou queixa..."
            />
          </label>

          <div
            className="patient-filters"
            aria-label="Filtrar pacientes"
          >
            {(['Todos', 'Ativo', 'Inativo'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'selected' : ''}
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="patients-table-wrap">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Queixa principal</th>
                <th>Telefone</th>
                <th>Última consulta</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-person">
                      <span
                        className={`patient-avatar ${patient.color}`}
                      >
                        {patient.initials}
                      </span>
                      <strong>{patient.name}</strong>
                    </div>
                  </td>

                  <td>{patient.condition}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.lastVisit}</td>

                  <td>
                    <span
                      className={`patient-status ${
                        patient.status === 'Ativo'
                          ? 'active'
                          : 'inactive'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="patients-empty">
              Nenhum paciente encontrado para esta busca.
            </div>
          )}
        </div>

        <div className="patients-table-footer">
          Exibindo <strong>{filtered.length}</strong> de{' '}
          <strong>{patients.length}</strong> pacientes
          <span>Os dados são demonstrativos e locais.</span>
        </div>
      </section>
    </ModuleLayout>
  );
}
