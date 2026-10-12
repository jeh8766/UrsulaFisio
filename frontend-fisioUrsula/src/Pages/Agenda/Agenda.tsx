import { useState } from 'react';
import ModuleLayout from "../ModuleLayout/ModuleLayout";
import './Agenda.css';

type Appointment = { id: number; time: string; name: string; type: string; duration: string; status: 'Confirmada' | 'Aguardando' | 'Concluída' | 'Cancelada'; initials: string };
const initialAppointments: Appointment[] = [
  { id: 1, time: '08:00', name: 'Mariana Costa', type: 'Avaliação fisioterapêutica', duration: '50 min', status: 'Confirmada', initials: 'MC' },
  { id: 2, time: '09:00', name: 'Rafael Oliveira', type: 'Reabilitação de joelho', duration: '45 min', status: 'Confirmada', initials: 'RO' },
  { id: 3, time: '10:00', name: 'Camila Ferreira', type: 'Terapia manual', duration: '40 min', status: 'Aguardando', initials: 'CF' },
  { id: 4, time: '11:00', name: 'Beatriz Almeida', type: 'Fisioterapia preventiva', duration: '45 min', status: 'Confirmada', initials: 'BA' },
  { id: 5, time: '14:00', name: 'João Pedro Santos', type: 'Sessão de acompanhamento', duration: '50 min', status: 'Concluída', initials: 'JS' },
];
const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function Agenda() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedDay, setSelectedDay] = useState(12);
  const [view, setView] = useState<'Dia' | 'Semana'>('Dia');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [time, setTime] = useState('15:00');
  const [type, setType] = useState('Sessão de fisioterapia');
  const [notice, setNotice] = useState('');
  function addAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!name.trim()) return;
    const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    
const newAppointment: Appointment = {
  id: Date.now(),
  time,
  name: name.trim(),
  type,
  duration: '50 min',
  status: 'Aguardando',
  initials,
};

setAppointments(current =>
  [...current, newAppointment].sort((a, b) =>
    a.time.localeCompare(b.time)
  )
)
    setName(''); setShowForm(false); setNotice('Agendamento adicionado à agenda desta sessão.');
  }
  function updateStatus(id: number, status: Appointment['status']) { setAppointments(current => current.map(item => item.id === id ? { ...item, status } : item)); }
  return <ModuleLayout title="Agenda" subtitle="Visualize os atendimentos e organize os horários da sua rotina." eyebrow="ORGANIZAÇÃO DE ATENDIMENTOS">
    <div className="agenda-summary"><div><span className="agenda-summary-icon">▦</span><div><small>Atendimentos do dia</small><strong>{appointments.filter(a => a.status !== 'Cancelada').length}</strong></div></div><div><span className="agenda-summary-icon mint">✓</span><div><small>Confirmados</small><strong>{appointments.filter(a => a.status === 'Confirmada').length}</strong></div></div><div><span className="agenda-summary-icon peach">◷</span><div><small>Aguardando</small><strong>{appointments.filter(a => a.status === 'Aguardando').length}</strong></div></div><button className="agenda-primary-button" onClick={() => { setShowForm(v => !v); setNotice(''); }}>{showForm ? 'Cancelar' : '+ Novo agendamento'}</button></div>
    {notice && <p className="agenda-notice" role="status">{notice}</p>}
    {showForm && <form className="agenda-add-form" onSubmit={addAppointment}><label>Nome do paciente<input value={name} onChange={e => setName(e.target.value)} required placeholder="Digite o nome" /></label><label>Horário<input type="time" value={time} onChange={e => setTime(e.target.value)} required /></label><label>Tipo de atendimento<select value={type} onChange={e => setType(e.target.value)}><option>Avaliação fisioterapêutica</option><option>Sessão de fisioterapia</option><option>Terapia manual</option><option>Reavaliação</option></select></label><button className="agenda-primary-button" type="submit">Salvar horário</button></form>}
    <section className="agenda-calendar-panel"><div className="agenda-calendar-heading"><div><h2>Outubro de 2026</h2><p>Segunda-feira, 12 de outubro</p></div><div className="agenda-view-switch"><button className={view === 'Dia' ? 'selected' : ''} onClick={() => setView('Dia')}>Dia</button><button className={view === 'Semana' ? 'selected' : ''} onClick={() => setView('Semana')}>Semana</button></div></div>
      <div className="agenda-week-strip">{weekdays.map((day, index) => { const number = index + 12; return <button key={day} className={`agenda-day ${selectedDay === number ? 'selected' : ''}`} onClick={() => setSelectedDay(number)}><span>{day}</span><strong>{number > 31 ? number - 31 : number}</strong><i className={index < 5 ? 'has-events' : ''} /></button>; })}</div>
      <div className="agenda-list-heading"><h3>{view === 'Dia' ? `Atendimentos do dia ${selectedDay > 31 ? selectedDay - 31 : selectedDay}` : 'Atendimentos da semana'}</h3><span>{appointments.length} horários na lista</span></div>
      <div className="agenda-timeline">{appointments.map(item => <article className="agenda-appointment" key={item.id}><div className="agenda-time"><strong>{item.time}</strong><span>{item.duration}</span></div><div className="agenda-time-line"><i /></div><div className="agenda-appointment-card"><div className="agenda-person-avatar">{item.initials}</div><div className="agenda-appointment-info"><strong>{item.name}</strong><span>{item.type}</span></div><span className={`agenda-status ${item.status.toLowerCase()}`}>{item.status}</span><select aria-label={`Alterar status de ${item.name}`} value={item.status} onChange={e => updateStatus(item.id, e.target.value as Appointment['status'])}><option>Confirmada</option><option>Aguardando</option><option>Concluída</option><option>Cancelada</option></select></div></article>)}</div>
      {appointments.length === 0 && <p className="agenda-empty">Nenhum atendimento cadastrado.</p>}
    </section>
    <p className="agenda-demo-note">Os horários exibidos são exemplos para visualização. Os agendamentos ainda não são salvos em um banco de dados.</p>
  </ModuleLayout>;
}
