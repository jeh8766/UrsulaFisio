import { useMemo, useState } from 'react';
import ModuleLayout from "../ModuleLayout/ModuleLayout";
import './Prontuario.css';


type RecordItem = { id: number; name: string; initials: string; date: string; type: string; summary: string; professional: string; status: 'Finalizado' | 'Em andamento' };
const initialRecords: RecordItem[] = [
  { id: 1, name: 'Mariana Costa', initials: 'MC', date: '10 out, 2026', type: 'Evolução de sessão', summary: 'Relata redução da dor lombar após os exercícios de mobilidade.', professional: 'Fisioterapeuta', status: 'Finalizado' },
  { id: 2, name: 'Rafael Oliveira', initials: 'RO', date: '09 out, 2026', type: 'Avaliação inicial', summary: 'Avaliação funcional do joelho e definição de objetivos terapêuticos.', professional: 'Fisioterapeuta', status: 'Finalizado' },
  { id: 3, name: 'Camila Ferreira', initials: 'CF', date: '08 out, 2026', type: 'Evolução de sessão', summary: 'Realizados exercícios de alongamento cervical e orientação postural.', professional: 'Fisioterapeuta', status: 'Em andamento' },
  { id: 4, name: 'Beatriz Almeida', initials: 'BA', date: '07 out, 2026', type: 'Plano terapêutico', summary: 'Plano preventivo com exercícios domiciliares e acompanhamento periódico.', professional: 'Fisioterapeuta', status: 'Finalizado' },
];
export default function Prontuarios() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('Todos os tipos');
  const [showForm, setShowForm] = useState(false);
  const [patient, setPatient] = useState(''); const [recordType, setRecordType] = useState('Evolução de sessão'); const [summary, setSummary] = useState(''); const [notice, setNotice] = useState('');
  const filtered = useMemo(() => records.filter(r => (r.name.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase())) && (kind === 'Todos os tipos' || r.type === kind)), [records, search, kind]);
  function saveRecord(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); if (!patient.trim() || !summary.trim()) return; const initials = patient.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase(); setRecords(current => [{ id: Date.now(), name: patient.trim(), initials, date: 'Hoje', type: recordType, summary: summary.trim(), professional: 'Fisioterapeuta', status: 'Em andamento' }, ...current]); setPatient(''); setSummary(''); setShowForm(false); setNotice('Registro adicionado à lista desta sessão.'); }
  return <ModuleLayout title="Prontuários" subtitle="Registre avaliações, evoluções e planos de tratamento com organização." eyebrow="ACOMPANHAMENTO CLÍNICO">
    <div className="records-info-banner"><span className="records-info-symbol">✳</span><div><strong>Histórico clínico organizado</strong><p>Reúna os registros de cada atendimento para acompanhar a evolução dos pacientes.</p></div><span className="records-banner-lock">▣ Dados sensíveis</span></div>
    <div className="records-stat-row"><article><small>Registros na lista</small><strong>{records.length}</strong><span>Históricos demonstrativos</span></article><article><small>Finalizados</small><strong>{records.filter(r => r.status === 'Finalizado').length}</strong><span>Registros concluídos</span></article><article><small>Em andamento</small><strong>{records.filter(r => r.status === 'Em andamento').length}</strong><span>Precisam de acompanhamento</span></article></div>
    <section className="records-panel"><div className="records-panel-heading"><div><h2>Registros clínicos</h2><p>Pesquise e consulte as anotações registradas.</p></div><button className="records-primary" onClick={() => { setShowForm(v => !v); setNotice(''); }}>{showForm ? 'Cancelar' : '+ Novo registro'}</button></div>
      {notice && <p className="records-notice" role="status">{notice}</p>}
      {showForm && <form className="records-form" onSubmit={saveRecord}><label>Nome do paciente<input value={patient} onChange={e => setPatient(e.target.value)} required placeholder="Nome completo" /></label><label>Tipo de registro<select value={recordType} onChange={e => setRecordType(e.target.value)}><option>Evolução de sessão</option><option>Avaliação inicial</option><option>Plano terapêutico</option></select></label><label className="records-summary-field">Anotações clínicas<textarea value={summary} onChange={e => setSummary(e.target.value)} required rows={3} placeholder="Descreva a evolução, observações e condutas..." /></label><button className="records-primary" type="submit">Salvar registro</button></form>}
      <div className="records-toolbar"><label className="records-search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente ou conteúdo..." /></label><select value={kind} onChange={e => setKind(e.target.value)} aria-label="Filtrar por tipo"><option>Todos os tipos</option><option>Evolução de sessão</option><option>Avaliação inicial</option><option>Plano terapêutico</option></select></div>
      <div className="records-list">{filtered.map(record => <article className="record-card" key={record.id}><div className="record-avatar">{record.initials}</div><div className="record-main"><div className="record-meta"><span>{record.type}</span><i>•</i><time>{record.date}</time></div><h3>{record.name}</h3><p>{record.summary}</p><div className="record-bottom"><span>Responsável: {record.professional}</span><span className={`record-status ${record.status === 'Finalizado' ? 'done' : 'progress'}`}>{record.status}</span></div></div><button className="record-more" title="Detalhes do registro" aria-label={`Detalhes de ${record.name}`} onClick={() => setNotice(`Registro de ${record.name}: ${record.summary}`)}>···</button></article>)}{filtered.length === 0 && <div className="records-empty">Nenhum registro encontrado.</div>}</div>
    </section>
    <p className="records-disclaimer">Demonstração de interface. Não utilize estes dados de exemplo para decisões clínicas. Os registros ainda não são persistidos em banco de dados.</p>
  </ModuleLayout>;
}
