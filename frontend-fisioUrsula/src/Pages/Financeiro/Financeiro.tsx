import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from "../ModuleLayout/ModuleLayout";
import './Financeiro.css';

type Transaction = { id: number; description: string; patient: string; date: string; method: string; amount: number; status: 'Recebido' | 'Pendente' | 'Atrasado'; kind: 'Entrada' | 'Saída' };
const initialTransactions: Transaction[] = [
  { id: 1, description: 'Sessão de fisioterapia', patient: 'Mariana Costa', date: '12/10/2026', method: 'Pix', amount: 150, status: 'Recebido', kind: 'Entrada' },
  { id: 2, description: 'Pacote de 5 sessões', patient: 'Rafael Oliveira', date: '12/10/2026', method: 'Cartão', amount: 650, status: 'Pendente', kind: 'Entrada' },
  { id: 3, description: 'Avaliação inicial', patient: 'Camila Ferreira', date: '10/10/2026', method: 'Pix', amount: 180, status: 'Recebido', kind: 'Entrada' },
  { id: 4, description: 'Materiais de atendimento', patient: 'Despesa da clínica', date: '09/10/2026', method: 'Transferência', amount: 95, status: 'Recebido', kind: 'Saída' },
  { id: 5, description: 'Sessão de acompanhamento', patient: 'João Pedro Santos', date: '05/10/2026', method: 'Dinheiro', amount: 140, status: 'Atrasado', kind: 'Entrada' },
];
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Financeiro() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState(''); 
  const [filter, setFilter] = useState('Todos'); 
  const [showForm, setShowForm] = useState(false); 
  const [description, setDescription] = useState(''); 
  const [patient, setPatient] = useState(''); 
  const [amount, setAmount] = useState(''); 
  const [kind, setKind] = useState<'Entrada' | 'Saída'>('Entrada'); 
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => transactions.filter(t => (t.description.toLowerCase().includes(search.toLowerCase()) || t.patient.toLowerCase().includes(search.toLowerCase())) && (filter === 'Todos' || t.status === filter || t.kind === filter)), [transactions, search, filter]);
  const received = transactions.filter(t => t.kind === 'Entrada' && t.status === 'Recebido').reduce((sum, t) => sum + t.amount, 0);
  const pending = transactions.filter(t => t.kind === 'Entrada' && t.status === 'Pendente').reduce((sum, t) => sum + t.amount, 0);
  const overdue = transactions.filter(t => t.kind === 'Entrada' && t.status === 'Atrasado').reduce((sum, t) => sum + t.amount, 0);

  function saveTransaction(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault(); 
    const numericAmount = Number(amount.replace(',', '.')); 
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return; 
    setTransactions(current => [{ id: Date.now(), description: description.trim(), patient: patient.trim() || 'Não informado', date: '12/10/2026', method: 'Não informado', amount: numericAmount, status: 'Pendente', kind }, ...current]); 
    setDescription(''); 
    setPatient(''); 
    setAmount(''); 
    setShowForm(false); 
    setNotice('Lançamento adicionado à lista desta sessão.'); 
  }

  function changeStatus(id: number, status: Transaction['status']) { 
    setTransactions(current => current.map(t => t.id === id ? { ...t, status } : t)); 
  }

  return <ModuleLayout title="Financeiro" subtitle="Acompanhe recebimentos, pendências e movimentações da clínica." eyebrow="CONTROLE FINANCEIRO">
    <div className="finance-summary"><article><div className="finance-card-top"><span>Recebido neste exemplo</span><span className="finance-icon received">↙</span></div><strong>{money(received)}</strong><small>Entradas com status recebido</small><div className="finance-progress"><i style={{ width: '76%' }} /></div></article><article><div className="finance-card-top"><span>Valores pendentes</span><span className="finance-icon pending">◷</span></div><strong>{money(pending)}</strong><small>Precisam de confirmação</small><div className="finance-progress amber"><i style={{ width: '44%' }} /></div></article><article><div className="finance-card-top"><span>Valores em atraso</span><span className="finance-icon overdue">!</span></div><strong>{money(overdue)}</strong><small>Verifique os recebimentos</small><div className="finance-progress rose"><i style={{ width: '28%' }} /></div></article></div>
    
    <section className="finance-panel">
      <div className="finance-panel-heading">
        <div>
          <h2>Movimentações</h2>
          <p>Consulte e atualize os lançamentos financeiros.</p>
        </div>
        {/* Alterado o onClick para redirecionar para /despesas */}
        <button className="finance-primary" onClick={() => navigate('/despesas')}>
          + Novo lançamento
        </button>
      </div>

      {notice && <p className="finance-notice" role="status">{notice}</p>}
      
      {showForm && <form className="finance-form" onSubmit={saveTransaction}><label>Descrição<input value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ex.: Sessão de fisioterapia" /></label><label>Paciente / origem<input value={patient} onChange={e => setPatient(e.target.value)} placeholder="Nome ou descrição" /></label><label>Valor (R$)<input value={amount} onChange={e => setAmount(e.target.value)} required inputMode="decimal" placeholder="150,00" /></label><label>Tipo<select value={kind} onChange={e => setKind(e.target.value as 'Entrada' | 'Saída')}><option>Entrada</option><option>Saída</option></select></label><button className="finance-primary" type="submit">Salvar lançamento</button></form>}
      
      <div className="finance-toolbar"><label className="finance-search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar movimentação..." /></label><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filtrar movimentações"><option>Todos</option><option>Recebido</option><option>Pendente</option><option>Atrasado</option><option>Entrada</option><option>Saída</option></select></div>
      
      <div className="finance-table-wrap"><table className="finance-table"><thead><tr><th>Descrição</th><th>Data</th><th>Forma</th><th>Valor</th><th>Status</th><th>Ação</th></tr></thead><tbody>{filtered.map(t => <tr key={t.id}><td><div className="finance-description"><span className={`finance-kind ${t.kind === 'Entrada' ? 'in' : 'out'}`}>{t.kind === 'Entrada' ? '↙' : '↗'}</span><div><strong>{t.description}</strong><small>{t.patient}</small></div></div></td><td>{t.date}</td><td>{t.method}</td><td><strong className={t.kind === 'Entrada' ? 'finance-amount-in' : 'finance-amount-out'}>{t.kind === 'Entrada' ? '+' : '−'} {money(t.amount)}</strong></td><td><span className={`finance-status ${t.status.toLowerCase()}`}>{t.status}</span></td><td><select className="finance-status-select" aria-label={`Atualizar status de ${t.description}`} value={t.status} onChange={e => changeStatus(t.id, e.target.value as Transaction['status'])}><option>Recebido</option><option>Pendente</option><option>Atrasado</option></select></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="finance-empty">Nenhuma movimentação encontrada.</div>}</div>
      
      <div className="finance-table-footer">{filtered.length} lançamentos exibidos <span>Valores demonstrativos em reais.</span></div>
    </section>
    
    <p className="finance-disclaimer">Os dados são fictícios e ficam apenas no estado da página. Não representam saldos reais e não são salvos após atualizar o navegador.</p>
  </ModuleLayout>;
}