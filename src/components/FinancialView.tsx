import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Receipt, Plus, Search, Filter, 
  Trash2, Eye, Printer, ShieldCheck, FileText, Download, CheckCircle, 
  Clock, AlertCircle, PlusCircle, ArrowUpRight, ArrowDownRight, Calendar,
  Sparkles, Mail, User, BookOpen, Stamp, Percent, Calculator, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  subscribeTransactions, 
  addTransaction, 
  deleteTransaction, 
  updateTransaction,
  subscribeReceipts, 
  addReceipt, 
  deleteReceipt,
  updateReceipt
} from '../dbService';
import { Patient, FinancialTransaction, HealthReceipt, Psychologist } from '../types';

interface FinancialViewProps {
  patients: Patient[];
  currentUser: { id: string; email: string };
  profile: Psychologist | null;
}

export default function FinancialView({ patients, currentUser, profile }: FinancialViewProps) {
  const [activeSubtab, setActiveSubtab] = useState<'fluxo' | 'documentos' | 'irpf'>('fluxo');
  const [irpfYear, setIrpfYear] = useState<number>(new Date().getFullYear());
  const [irpfMonth, setIrpfMonth] = useState<number>(new Date().getMonth() + 1);
  const [copiedCpfId, setCopiedCpfId] = useState<string | null>(null);
  
  // Real-time collections state
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [receipts, setReceipts] = useState<HealthReceipt[]>([]);
  
  // Search & filter states
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const [docSearch, setDocSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'payment_receipt' | 'health_report' | 'therapeutic_prescription'>('all');

  // Modal active states
  const [showTxModal, setShowTxModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<HealthReceipt | null>(null);

  // Form states - Transactions
  const [txForm, setTxForm] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Sessão Individual',
    description: '',
    paymentMethod: 'pix' as any,
    status: 'paid' as 'paid' | 'pending',
    patientId: ''
  });

  // Form states - Documents
  const [docForm, setDocForm] = useState({
    patientId: '',
    type: 'payment_receipt' as any,
    value: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    customTitle: ''
  });

  // Load real-time data
  useEffect(() => {
    const unsubTx = subscribeTransactions(currentUser.id, (data) => {
      // Sort newest dates first
      const sorted = [...data].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sorted);
    });

    const unsubDocs = subscribeReceipts(currentUser.id, (data) => {
      const sorted = [...data].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReceipts(sorted);
    });

    return () => {
      unsubTx();
      unsubDocs();
    };
  }, [currentUser]);

  // Handle auto-template fillings based on Document/Receipt Selection
  useEffect(() => {
    if (!docForm.patientId) return;
    const selectedPatient = patients.find(p => p.id === docForm.patientId);
    if (!selectedPatient) return;

    let text = '';
    const nameStr = selectedPatient.name;
    const cpfStr = selectedPatient.cpf ? `CPF nº ${selectedPatient.cpf}` : '(Preencha o CPF do paciente)';
    const dateFormatted = new Date(docForm.date).toLocaleDateString('pt-BR');

    if (docForm.type === 'payment_receipt') {
      const valueNum = parseFloat(docForm.value) || 0;
      text = `Recebi de ${nameStr}, ${cpfStr}, o valor de R$ ${valueNum.toFixed(2).replace('.', ',')} referente aos honorários de sessão de consulta psicológica clínica individual realizada no dia ${dateFormatted}. Por ser verdade, firmo o presente para fins de prestação de contas / reembolso de plano de saúde.`;
    } else if (docForm.type === 'health_report') {
      text = `Atesto para os devidos fins de integralidade que o(a) paciente ${nameStr}, inscrito(a) sob o ${cpfStr}, encontra-se sob acompanhamento psicoterapêutico clínico neste consultório em sessões periódicas. Apresenta evolução satisfatória consoante às diretrizes do plano de tratamento estabelecido.`;
    } else if (docForm.type === 'therapeutic_prescription') {
      text = `ORIENTAÇÃO TERAPÊUTICA (Receituário Clínico):\nPara: ${nameStr}\n\n1. Atividade de autoexposição controlada: Praticar respiração diafragmática pausada (técnica 4-2-4) diariamente por 5 minutos;\n2. Registro de Pensamentos Disfuncionais (RPD): Preencher planilha clínica NexPsi sobre gatilhos ansiogênicos detectados;\n3. Leitura do capítulo complementar de manejo cognitivo.`;
    }

    setDocForm(prev => ({ ...prev, description: text }));
  }, [docForm.patientId, docForm.type, docForm.value, docForm.date, patients]);

  // Calculate Metrics
  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const totalIncomesPaid = incomes.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const totalIncomesPending = incomes.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
  const totalExpensesPaid = expenses.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const totalExpensesPending = expenses.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncomesPaid - totalExpensesPaid;
  const projectableBalance = (totalIncomesPaid + totalIncomesPending) - (totalExpensesPaid + totalExpensesPending);

  // Carnê-Leão / IRPF Calculations
  const monthlyTransactions = transactions.filter(t => {
    if (!t.date) return false;
    try {
      const parts = t.date.split('-');
      if (parts.length < 2) return false;
      return parseInt(parts[0], 10) === irpfYear && parseInt(parts[1], 10) === irpfMonth;
    } catch {
      return false;
    }
  });

  const irpfIncomes = monthlyTransactions.filter(t => t.type === 'income' && t.status === 'paid');
  const irpfExpenses = monthlyTransactions.filter(t => t.type === 'expense' && t.status === 'paid');

  const grossIncome = irpfIncomes.reduce((acc, t) => acc + t.amount, 0);
  const totalLivroCaixa = irpfExpenses.reduce((acc, t) => acc + t.amount, 0);
  const taxableBase = Math.max(0, grossIncome - totalLivroCaixa);

  const calculateIrpfDetails = (base: number) => {
    let rate = 0;
    let deduction = 0;
    if (base <= 2259.20) {
      rate = 0; deduction = 0;
    } else if (base <= 2826.65) {
      rate = 7.5; deduction = 169.44;
    } else if (base <= 3751.05) {
      rate = 15; deduction = 381.44;
    } else if (base <= 4664.68) {
      rate = 22.5; deduction = 662.77;
    } else {
      rate = 27.5; deduction = 896.00;
    }

    const taxDue = Math.max(0, (base * (rate / 100)) - deduction);
    const baseWithSimplifiedDiscount = Math.max(0, base - 564.80);
    
    let simpRate = 0;
    let simpDeduction = 0;
    if (baseWithSimplifiedDiscount <= 2259.20) {
      simpRate = 0; simpDeduction = 0;
    } else if (baseWithSimplifiedDiscount <= 2826.65) {
      simpRate = 7.5; simpDeduction = 169.44;
    } else if (baseWithSimplifiedDiscount <= 3751.05) {
      simpRate = 15; simpDeduction = 381.44;
    } else if (baseWithSimplifiedDiscount <= 4664.68) {
      simpRate = 22.5; simpDeduction = 662.77;
    } else {
      simpRate = 27.5; simpDeduction = 896.00;
    }

    const simplifiedTaxDue = Math.max(0, (baseWithSimplifiedDiscount * (simpRate / 100)) - simpDeduction);
    const bestOption = taxDue <= simplifiedTaxDue || totalLivroCaixa > 564.80 ? 'complete' : 'simplified';
    const finalTax = Math.min(taxDue, simplifiedTaxDue);

    return {
      rate,
      deduction,
      taxDue,
      simplifiedBase: baseWithSimplifiedDiscount,
      simplifiedTaxDue,
      bestOption,
      finalTax,
      effectiveRate: base > 0 ? (finalTax / base) * 100 : 0
    };
  };

  const irpfResult = calculateIrpfDetails(taxableBase);

  // Group incomes by Patient CPF/Name for escrituração
  const patientMap: Record<string, { patientId?: string; name: string; cpf: string; total: number; count: number }> = {};
  irpfIncomes.forEach(t => {
    const key = t.patientId || `avulso_${t.patientName || 'sem_nome'}`;
    const patientObj = t.patientId ? patients.find(p => p.id === t.patientId) : null;
    const cpf = patientObj?.cpf || 'Não Cadastrado';
    const name = t.patientName || t.description || 'Lançamento Avulso';

    if (!patientMap[key]) {
      patientMap[key] = {
        patientId: t.patientId,
        name,
        cpf,
        total: 0,
        count: 0
      };
    }
    patientMap[key].total += t.amount;
    patientMap[key].count += 1;
  });

  const groupedPatients = Object.values(patientMap).sort((a,b) => b.total - a.total);

  const handleCopyCPF = (cpf: string, key: string) => {
    if (cpf === 'Não Cadastrado' || !cpf) return;
    const cleaned = cpf.replace(/[^\d.-]/g, '');
    navigator.clipboard.writeText(cleaned);
    setCopiedCpfId(key);
    setTimeout(() => {
      setCopiedCpfId(null);
    }, 2000);
  };

  // Chart data calculation (last 5 months representation via custom responsive canvas/SVGs)
  const getMonthlyAggregateData = () => {
    const monthlyMap: { [key: string]: { income: number; expense: number } } = {};
    const monthsLocale = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Default mock baseline to make graph look complete
    const currentMonthIndex = new Date().getMonth();
    for (let i = 4; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      monthlyMap[monthsLocale[idx]] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      try {
        const d = new Date(t.date);
        const mLabel = monthsLocale[d.getMonth()];
        if (monthlyMap[mLabel] !== undefined) {
          if (t.type === 'income' && t.status === 'paid') monthlyMap[mLabel].income += t.amount;
          if (t.type === 'expense' && t.status === 'paid') monthlyMap[mLabel].expense += t.amount;
        }
      } catch(e) {}
    });

    return Object.keys(monthlyMap).map(m => ({
      month: m,
      income: monthlyMap[m].income,
      expense: monthlyMap[m].expense,
    }));
  };

  const chartData = getMonthlyAggregateData();
  const maxValForChart = Math.max(...chartData.map(d => Math.max(d.income, d.expense, 500)));

  // Save Transaction
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txForm.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return alert('Por favor, informe um valor correto.');

    let linkedName = '';
    if (txForm.patientId) {
      const pat = patients.find(p => p.id === txForm.patientId);
      if (pat) linkedName = pat.name;
    }

    const tData: Omit<FinancialTransaction, 'id'> = {
      psychologistId: currentUser.id,
      patientId: txForm.patientId || undefined,
      patientName: linkedName || undefined,
      type: txForm.type,
      amount: parsedAmount,
      date: txForm.date,
      category: txForm.category,
      description: txForm.description || undefined,
      paymentMethod: txForm.type === 'income' ? txForm.paymentMethod : undefined,
      status: txForm.status,
      createdAt: new Date().toISOString()
    };

    await addTransaction(tData);
    setShowTxModal(false);
    // Reset form
    setTxForm({
      type: 'income',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Sessão Individual',
      description: '',
      paymentMethod: 'pix',
      status: 'paid',
      patientId: ''
    });
  };

  // Create document / health prescription (receita de saude / recibo de honorarios)
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.patientId) return alert('Selecione o paciente titular para o documento clínico.');
    if (!docForm.description) return alert('Escreva ou edite o corpo do documento.');

    const targetPatient = patients.find(p => p.id === docForm.patientId);
    if (!targetPatient) return;

    const receiptVal = parseFloat(docForm.value) || 0;

    const rData: Omit<HealthReceipt, 'id'> = {
      psychologistId: currentUser.id,
      patientId: docForm.patientId,
      patientName: targetPatient.name,
      patientCpf: targetPatient.cpf || 'Não Informado',
      patientEmail: targetPatient.email || undefined,
      date: docForm.date,
      type: docForm.type,
      value: docForm.type === 'payment_receipt' ? receiptVal : 0,
      description: docForm.description,
      signatureLocked: false,
      createdAt: new Date().toISOString()
    };

    await addReceipt(rData);
    setShowDocModal(false);
    // Reset
    setDocForm({
      patientId: '',
      type: 'payment_receipt',
      value: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      customTitle: ''
    });
  };

  // Quick Action: Link a paid session transaction to generate a legal receipt with 1-click
  const handleConvertTransactionToReceipt = async (tx: FinancialTransaction) => {
    if (!tx.patientId) {
      alert('Esta transação não está vinculada a nenhum paciente cadastrado.');
      return;
    }
    const targetPatient = patients.find(p => p.id === tx.patientId);
    if (!targetPatient) {
      alert('Paciente correspondente não foi localizado no cadastro.');
      return;
    }

    const dateFormatted = new Date(tx.date).toLocaleDateString('pt-BR');
    const cpfStr = targetPatient.cpf ? `inscrito sob o CPF nº ${targetPatient.cpf}` : '(CPF não cadastrado)';

    const description = `Recibo de honorários profissionais referente a 1 (uma) sessão de consulta psicológica clínica individual realizada de forma ${tx.paymentMethod ? 'digital via ' + tx.paymentMethod.toUpperCase() : 'presencial'} no dia ${dateFormatted}. Recebi de ${targetPatient.name}, ${cpfStr}, o valor de R$ ${tx.amount.toFixed(2).replace('.', ',')}.`;

    const rData: Omit<HealthReceipt, 'id'> = {
      psychologistId: currentUser.id,
      patientId: tx.patientId,
      patientName: targetPatient.name,
      patientCpf: targetPatient.cpf || 'Não Informado',
      patientEmail: targetPatient.email || undefined,
      date: tx.date,
      type: 'payment_receipt',
      value: tx.amount,
      description,
      signatureLocked: true, // Auto locked because it comes from a completed financial statement!
      createdAt: new Date().toISOString()
    };

    await addReceipt(rData);
    setActiveSubtab('documentos');
    alert(`Sucesso! Recibo de Saúde para o paciente "${targetPatient.name}" foi gerado e está pronto para impressão.`);
  };

  const handleDeleteTx = async (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento financeiro?')) {
      await deleteTransaction(id);
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (confirm('Deseja realmente arquivar/deletar este documento clínico?')) {
      await deleteReceipt(id);
    }
  };

  const handleToggleSignature = async (item: HealthReceipt) => {
    await updateReceipt(item.id, { signatureLocked: !item.signatureLocked });
    setSelectedReceipt(prev => prev && prev.id === item.id ? { ...prev, signatureLocked: !prev.signatureLocked } : prev);
  };

  // Filter lists
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(txSearch.toLowerCase()) || 
                          t.patientName?.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.category.toLowerCase().includes(txSearch.toLowerCase());
    const matchesType = txTypeFilter === 'all' || t.type === txTypeFilter;
    const matchesStatus = txStatusFilter === 'all' || t.status === txStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredDocs = receipts.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(docSearch.toLowerCase()) || 
                          r.description.toLowerCase().includes(docSearch.toLowerCase());
    const matchesType = docTypeFilter === 'all' || r.type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  // Get name of document types in Portuguese
  const getDocTypeBadge = (type: string) => {
    switch(type) {
      case 'payment_receipt':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg">🧾 Recibo de Saúde</span>;
      case 'health_report':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black bg-blue-50 text-blue-800 border border-blue-100 rounded-lg">📄 Atestado / Declaração</span>;
      case 'therapeutic_prescription':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-lg">🎙️ Receita Saúde / Orientação</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-indigo-650 bg-indigo-50 p-1 rounded-xl shadow-xs" /> Finanças & Receituário Clínico
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Gestão de fluxo de caixa, pagamentos de planos de saúde, atestados e recibos timbrados com CRP.
          </p>
        </div>
        
        {/* Toggle between cash flow ledger, receipt documents and Carnê-Leão / IRPF */}
        <div className="bg-slate-100/80 p-0.75 rounded-2xl border border-slate-200/50 flex flex-wrap gap-1 sm:flex-nowrap self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => { setActiveSubtab('fluxo'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'fluxo' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Fluxo de Caixa Geral
          </button>
          <button
            onClick={() => { setActiveSubtab('documentos'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'documentos' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" /> Receita Saúde & Recibos
          </button>
          <button
            onClick={() => { setActiveSubtab('irpf'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'irpf' 
                ? 'bg-white text-indigo-700 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-550" /> Carnê-Leão / IRPF
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: FLUXO DE CAIXA GERAL */}
      {activeSubtab === 'fluxo' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Receita Realizada</span>
                <h3 className="text-lg font-black text-slate-800 leading-tight">R$ {totalIncomesPaid.toFixed(2).replace('.', ',')}</h3>
                <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Dinheiro em caixa</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">A Receber / Pendente</span>
                <h3 className="text-lg font-black text-slate-800 leading-tight">R$ {totalIncomesPending.toFixed(2).replace('.', ',')}</h3>
                <span className="text-[9px] text-orange-600 font-bold block mt-0.5">Sessões a faturar</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Despesas Clínicas</span>
                <h3 className="text-lg font-black text-slate-800 leading-tight">R$ {totalExpensesPaid.toFixed(2).replace('.', ',')}</h3>
                <span className="text-[9px] text-rose-600 font-bold block mt-0.5">Rentabilidade operacional</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-5 rounded-3xl text-white shadow-md flex items-center gap-4">
              <div className="p-3 bg-white/15 text-white rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-indigo-200 uppercase">Saldo Líquido</span>
                <h3 className="text-lg font-black leading-tight">R$ {netBalance.toFixed(2).replace('.', ',')}</h3>
                <span className="text-[9px] text-indigo-200 font-medium block mt-0.5">Resultante líquido real</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual Analytics Canvas (Visualizing past months data with tailored elegant SVG graphics) */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Histórico Financeiro Mensal
                  </h3>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-md">Realizado</span>
                </div>

                {/* SVG Column Chart */}
                <div className="relative mt-2 p-2">
                  <div className="flex justify-between items-end h-32 gap-3.5 pt-4">
                    {chartData.map((d, i) => {
                      const incHeight = maxValForChart ? (d.income / maxValForChart) * 100 : 0;
                      const expHeight = maxValForChart ? (d.expense / maxValForChart) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex justify-center items-end h-24 gap-1 border-b border-slate-100 pb-1">
                            {/* Income Bar */}
                            <div 
                              style={{ height: `${Math.max(incHeight, 3)}%` }}
                              title={`Receitas: R$ ${d.income}`}
                              className="w-2.5 bg-emerald-500 rounded-t-xs hover:bg-emerald-650 transition-all duration-300"
                            />
                            {/* Expense Bar */}
                            <div 
                              style={{ height: `${Math.max(expHeight, 3)}%` }}
                              title={`Despesa: R$ ${d.expense}`}
                              className="w-2.5 bg-rose-400 rounded-t-xs hover:bg-rose-550 transition-all duration-300"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 mt-2">{d.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500 mt-4 border-t border-slate-50 pt-3">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" /> Receitas</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-400 rounded-full inline-block" /> Despesas</span>
                </div>
              </div>

              {/* Quick actions box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 mt-4">
                <h4 className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Acelerar Faturamento
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Clique para cadastrar entradas e saídas rápidas. O sistema monitora mensalmente seus impostos e auxilia na Carne-Leão.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTxForm(prev => ({ ...prev, type: 'income', category: 'Sessão Individual' }));
                      setShowTxModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Entrada
                  </button>
                  <button
                    onClick={() => {
                      setTxForm(prev => ({ ...prev, type: 'expense', category: 'Aluguel de Consultório' }));
                      setShowTxModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[11px] rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Despesa
                  </button>
                </div>
              </div>

            </div>

            {/* List Table of Transactions */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar por paciente, categoria ou notas..."
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={txTypeFilter}
                      onChange={(e) => setTxTypeFilter(e.target.value as any)}
                      className="border border-slate-200 rounded-xl py-1.5 px-3 text-xs bg-white font-bold text-slate-600 focus:outline-hidden"
                    >
                      <option value="all">Filtro de Lançamento</option>
                      <option value="income">Apenas Entradas (+)</option>
                      <option value="expense">Apenas Saídas (-)</option>
                    </select>

                    <select
                      value={txStatusFilter}
                      onChange={(e) => setTxStatusFilter(e.target.value as any)}
                      className="border border-slate-200 rounded-xl py-1.5 px-3 text-xs bg-white font-bold text-slate-600 focus:outline-hidden"
                    >
                      <option value="all">Sitação de Caixa</option>
                      <option value="paid">Pago / Compensado</option>
                      <option value="pending">Pendente / Agendado</option>
                    </select>
                  </div>
                </div>

                {/* Table Layout */}
                {filteredTxs.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200/50 border-dotted my-2">
                    <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">Nenhum lançamento corresponde ao filtro informado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black tracking-wider uppercase">
                          <th className="py-2.5">Data & Doc</th>
                          <th className="py-2.5">Descrição / Categoria</th>
                          <th className="py-2.5">Forma</th>
                          <th className="py-2.5">Situação</th>
                          <th className="py-2.5 text-right">Valor</th>
                          <th className="py-2.5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {filteredTxs.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3">
                              <span className="font-mono text-[10.5px] text-slate-500 block">
                                {new Date(tx.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                              </span>
                              {tx.patientId && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-indigo-600 bg-indigo-50/60 pl-1 pr-1.5 py-0.5 rounded-sm mt-0.5">
                                  <User className="w-2.5 h-2.5" /> Vinculado
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              <div className="font-bold text-slate-800">
                                {tx.patientName || tx.description || 'Lançamento diverso'}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                {tx.category} {tx.description && tx.patientName && ` - ${tx.description}`}
                              </div>
                            </td>
                            <td className="py-3 capitalize font-semibold text-[10.5px] text-slate-600">
                              {tx.paymentMethod || '-'}
                            </td>
                            <td className="py-3">
                              {tx.status === 'paid' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                  <CheckCircle className="w-3.5 h-3.5" /> Pago
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 animate-pulse">
                                  <Clock className="w-3.5 h-3.5" /> Pendente
                                </span>
                              )}
                            </td>
                            <td className={`py-3 text-right font-black text-sm ${
                              tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                {tx.type === 'income' && tx.status === 'paid' && (
                                  <button
                                    onClick={() => handleConvertTransactionToReceipt(tx)}
                                    title="Gerar Recibo de Saúde para Reembolso/Imposto"
                                    className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-750 border border-slate-100 text-slate-550 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteTx(tx.id)}
                                  title="Excluir Lançamento"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

              {/* Bottom legal notice */}
              <div className="border-t border-slate-50 mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 leading-relaxed gap-2">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Os registros financeiros cumprem com a ética do sigilo psicólogo-paciente.
                </span>
                <span className="font-mono text-[9px] uppercase">NexPsi Leger v2.0</span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* RENDER TAB 2: RECEITÚARIO E RECIBOS DE SAÚDE */}
      {activeSubtab === 'documentos' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick Notice Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-indigo-950 text-white p-5 rounded-3xl relative overflow-hidden shadow-xs">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
              <Receipt className="w-28 h-28 text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/10 text-emerald-200 border border-white/10">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Declaração de Rendimentos & Prescrições
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Emita Recibos Legais de Saúde e Orientações Terapêuticas! 
                </h3>
                <p className="text-xs text-indigo-100 leading-relaxed font-semibold">
                  Adicione e controle os recibos de reembolso de plano de saúde fornecendo CPF do paciente e data. Você também pode redigir atestados de presença clínicos ou registrar receitas com metas / atividades comportamentais para o paciente. Tudo timbrado e assinado digitalmente com seu CRP!
                </p>
              </div>
              <button
                onClick={() => {
                  if (patients.length === 0) return alert('Por favor, cadastre ao menos um paciente para emitir documentos clínicos.');
                  setDocForm(prev => ({ ...prev, patientId: patients[0].id, type: 'payment_receipt' }));
                  setShowDocModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-emerald-500 hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                Novas Receitas / Recibos
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por paciente ou histórico..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value as any)}
                  className="border border-slate-200 rounded-xl py-1.5 px-3 text-xs bg-white font-bold text-slate-600 focus:outline-hidden"
                >
                  <option value="all">Filtro de Documento</option>
                  <option value="payment_receipt">Apenas Recibos de Consulta</option>
                  <option value="health_report">Apenas Laudos / Atestados</option>
                  <option value="therapeutic_prescription">Apenas Receitas de Tarefas</option>
                </select>
              </div>
            </div>

            {/* List Table of Documents */}
            {filteredDocs.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dotted border-slate-200/50 my-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">Nenhum documento médico emitido sob esta sessão.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black tracking-wider uppercase">
                      <th className="py-2.5">Emissão</th>
                      <th className="py-2.5">Paciente Titular</th>
                      <th className="py-2.5">Tipo do Documento</th>
                      <th className="py-2.5">Selo CRP</th>
                      <th className="py-2.5 text-right">Faturamento</th>
                      <th className="py-2.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono text-[10.5px] text-slate-500">
                          {new Date(doc.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-800">{doc.patientName}</div>
                          <div className="text-[10px] font-medium text-slate-400">CPF: {doc.patientCpf || 'Não informado'}</div>
                        </td>
                        <td className="py-3">
                          {getDocTypeBadge(doc.type)}
                        </td>
                        <td className="py-3">
                          {doc.signatureLocked ? (
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full">
                              <Stamp className="w-3 h-3 text-indigo-600" /> Assinado & Selado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                              Não Assinado
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-black text-slate-700 text-sm">
                          {doc.type === 'payment_receipt' ? `R$ ${doc.value?.toFixed(2).replace('.', ',')}` : <span className="text-slate-350">-</span>}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedReceipt(doc)}
                              title="Visualizar / Imprimir Timbrado"
                              className="p-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleSignature(doc)}
                              title={doc.signatureLocked ? "Remover Assinatura" : "Assinar com seu CRP"}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                doc.signatureLocked 
                                  ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              <Stamp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReceipt(doc.id)}
                              title="Arquivar"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* RENDER TAB 3: CARNÊ-LEÃO / IRPF */}
      {activeSubtab === 'irpf' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Information Notice Banner */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Percent className="w-3.5 h-3.5" /> Carnê-Leão / Tributação de Pessoa Física
              </span>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                Simulador de Imposto Mensal de Renda e Escrituração
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Como psicólogo(a) autônomo(a) (Pessoa Física), você deve recolher o Carnê-Leão mensalmente. O NexPsi ajuda a escriturar seu Livro Caixa reunindo rendimentos identificados por CPFs e deduzindo despesas operacionais da clínica.
              </p>
            </div>

            {/* Selectors for Month and Year */}
            <div className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs self-start md:self-auto uppercase tracking-wide text-[11px] font-black">
              <span className="text-slate-400">Competência:</span>
              <select
                value={irpfMonth}
                onChange={(e) => setIrpfMonth(parseInt(e.target.value, 10))}
                className="border-none bg-transparent font-black text-indigo-750 focus:outline-hidden text-xs py-1 cursor-pointer"
              >
                <option value={1}>Janeiro</option>
                <option value={2}>Fevereiro</option>
                <option value={3}>Março</option>
                <option value={4}>Abril</option>
                <option value={5}>Maio</option>
                <option value={6}>Junho</option>
                <option value={7}>Julho</option>
                <option value={8}>Agosto</option>
                <option value={9}>Setembro</option>
                <option value={10}>Outubro</option>
                <option value={11}>Novembro</option>
                <option value={12}>Dezembro</option>
              </select>

              <select
                value={irpfYear}
                onChange={(e) => setIrpfYear(parseInt(e.target.value, 10))}
                className="border-none bg-transparent font-black text-indigo-750 focus:outline-hidden text-xs py-1 border-l border-slate-200 pl-2 cursor-pointer"
              >
                <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics of Calculation Base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">Rendimentos Clínicos (A)</span>
              <span className="text-xs text-slate-400 font-bold block mb-1">Recebido por Pacientes (PF)</span>
              <h3 className="text-xl font-black text-emerald-600 leading-tight">R$ {grossIncome.toFixed(2).replace('.', ',')}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 border-t border-slate-50 pt-1.5 flex justify-between">
                <span>Lançamentos liquidados:</span>
                <span className="font-mono text-slate-600">{irpfIncomes.length} recebidos</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">Deduções Livro Caixa (B)</span>
              <span className="text-xs text-slate-400 font-bold block mb-1">Custeio Operacional Dedutível</span>
              <h3 className="text-xl font-black text-rose-600 leading-tight">R$ {totalLivroCaixa.toFixed(2).replace('.', ',')}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 border-t border-slate-50 pt-1.5 flex justify-between">
                <span>Despesas legítimas:</span>
                <span className="font-mono text-slate-600">{irpfExpenses.length} registradas</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-sm">
              <span className="text-[10px] font-black tracking-wider text-indigo-200 uppercase block">Base de Cálculo Estimável (A - B)</span>
              <span className="text-xs text-indigo-300 font-mono block mb-1">Rendimento líquido mensal</span>
              <h3 className="text-xl font-black leading-tight">R$ {taxableBase.toFixed(2).replace('.', ',')}</h3>
              <div className="text-[10px] text-indigo-250 font-bold mt-2 border-t border-white/10 pt-1.5 flex justify-between">
                <span>Simulação IRPF ativa:</span>
                <span className="font-semibold px-1.5 py-0.2 bg-white/10 rounded-sm">Tabela 2026</span>
              </div>
            </div>
          </div>

          {/* IRPF CALCULATOR ESTIMATOR PANEL */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Calculator className="w-5 h-5 text-indigo-600 font-bold" /> Demonstrativo de Alíquotas e Estimativa de Imposto
              </h3>
              <p className="text-[11px] text-slate-550 font-medium">As alíquotas do imposto são progressivas, variando do Isento (0%) até 27,5% de acordo com a base tributada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Simulator Options Column */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-700 tracking-wider uppercase border-b border-slate-50 pb-1.5">Sistemas de Escrituração</h4>
                
                {/* Mode A: Livro Caixa Completo */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  irpfResult.bestOption === 'complete' 
                    ? 'border-indigo-150 bg-indigo-55/15 shadow-2xs' 
                    : 'border-slate-100 bg-slate-50/50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">Dedução pelo Livro Caixa (Completo)</span>
                        {irpfResult.bestOption === 'complete' && (
                          <span className="text-[9.5px] font-black text-emerald-800 bg-emerald-100 border border-emerald-150 rounded-md px-1.5 py-0.2">Indicado ⭐</span>
                        )}
                      </div>
                      <p className="text-[10.5px]/relaxed text-slate-500 font-semibold mt-0.5">Tributação devida calculado após a escrituração de despesas comprovadas do consultório.</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center border-t border-slate-150/45 pt-3">
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Base</span>
                      <span className="text-xs font-black text-slate-700 font-mono">R$ {taxableBase.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Alíquota</span>
                      <span className="text-xs font-black text-slate-700">{irpfResult.rate > 0 ? `${irpfResult.rate}%` : 'Isento'}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Imposto Estimado</span>
                      <span className="text-xs font-black text-indigo-750">R$ {irpfResult.taxDue.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                {/* Mode B: Desconto Simplificado */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  irpfResult.bestOption === 'simplified' 
                    ? 'border-indigo-150 bg-indigo-55/15 shadow-2xs' 
                    : 'border-slate-100 bg-slate-50/50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">Desconto Simplificado Geral</span>
                        {irpfResult.bestOption === 'simplified' && (
                          <span className="text-[9.5px] font-black text-emerald-800 bg-emerald-100 border border-emerald-150 rounded-md px-1.5 py-0.2">Indicado ⭐</span>
                        )}
                      </div>
                      <p className="text-[10.5px]/relaxed text-slate-500 font-semibold mt-0.5">Desconto simplificado mensal fixo de R$ 564,80 para isentar rendimentos tributáveis de até R$ 2.824,00.</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center border-t border-slate-150/45 pt-3">
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Base Simplificada</span>
                      <span className="text-xs font-black text-slate-700 font-mono">R$ {irpfResult.simplifiedBase.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Desconto Fixo</span>
                      <span className="text-xs font-black text-slate-700">R$ 564,80</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Imposto Estimado</span>
                      <span className="text-xs font-black text-indigo-750">R$ {irpfResult.simplifiedTaxDue.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytical Tax Summary Column */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest block border-b border-slate-200/50 pb-2">Resultado da Auditoria IRPF</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-550 border-b border-slate-100 pb-1.5 font-bold">
                      <span>Rendimento Bruto de PF:</span>
                      <span className="font-mono text-slate-800">R$ {grossIncome.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-slate-550 border-b border-slate-100 pb-1.5 font-bold">
                      <span>Dedução de Maior Economia:</span>
                      <span className="font-mono text-slate-800">
                        {irpfResult.bestOption === 'complete' 
                          ? `R$ ${totalLivroCaixa.toFixed(2).replace('.', ',')} (Livro Caixa)` 
                          : 'R$ 564,80 (Desconto Padrão)'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-550 border-b border-slate-100 pb-1.5 font-bold">
                      <span>Alíquota Nominal Média:</span>
                      <span className="font-mono text-slate-800">{irpfResult.effectiveRate.toFixed(2)} %</span>
                    </div>
                    <div className="flex justify-between text-slate-900 pt-1.5 font-black text-sm">
                      <span>Imposto Mensal Estimado:</span>
                      <span className="text-indigo-750 font-mono">
                        {irpfResult.finalTax > 0 
                          ? `R$ ${irpfResult.finalTax.toFixed(2).replace('.', ',')}` 
                          : 'ISENTO NESTE MÊS'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-[10.5px]/relaxed text-indigo-950 font-semibold space-y-1">
                  <span className="flex items-center gap-1.5 font-black text-indigo-700">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Conselho Tributário do NexPsi:
                  </span>
                  <span>
                    {irpfResult.finalTax === 0 ? (
                      "Seus rendimentos líquidos operacionais nesta competência estão abaixo da faixa mínima tributável da Receita Federal. Você está ISENTO de pagar imposto mensal do Carnê-Leão nesta competência!"
                    ) : irpfResult.bestOption === 'complete' ? (
                      `Suas despesas do Livro Caixa justificadas superam o benefício simplificado fixo. Declarar pelo modelo de Escrituração Completa gerará uma economia direta de R$ ${(irpfResult.simplifiedTaxDue - irpfResult.finalTax).toFixed(2).replace('.', ',')} em relação ao simplificado!`
                    ) : (
                      `Como suas deduções operacionais do consultório foram baixas este mês, o Desconto Simplificado oferecido pela Receita Federal é mais vantajoso, reduzindo seu imposto final de R$ ${irpfResult.taxDue.toFixed(2).replace('.', ',')} para R$ ${irpfResult.simplifiedTaxDue.toFixed(2).replace('.', ',')}!`
                    )}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* TWO COLUMNS WRITING SUPPORT TABLES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CPF INCOME LIST FOR COPY AND INPUT */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" /> Rendimentos Clínicos Recebidos (por Paciente/CPF)
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold">Use esta especificação para preencher a ficha de Rendimentos de Trabalho do Carnê-Leão.</p>
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-400 font-black px-2 py-0.5 rounded-md font-mono uppercase">PASSO 1: Faturamento Geral</span>
              </div>

              {groupedPatients.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dotted border-slate-200">
                  <User className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 font-bold">Nenhum faturamento de paciente nesta competência.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {groupedPatients.map((item, i) => {
                    const uniqueKey = `p_${item.patientId || 'avulso'}_${i}`;
                    const hasCpf = item.cpf && item.cpf !== 'Não Cadastrado';
                    const isCopied = copiedCpfId === uniqueKey;
                    return (
                      <div key={uniqueKey} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-150 hover:bg-slate-50 transition-colors">
                        <div>
                          <span className="text-xs font-black text-slate-800 block truncate max-w-xs">{item.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                            <span className="font-semibold text-slate-400 font-mono">CPF: {item.cpf}</span>
                            {hasCpf && (
                              <button
                                onClick={() => handleCopyCPF(item.cpf, uniqueKey)}
                                className={`text-[9.5px] font-black cursor-pointer px-1.5 py-0.2 rounded-sm transition-all flex items-center gap-0.5 border ${
                                  isCopied 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 border-slate-200/80 shadow-3xs'
                                }`}
                              >
                                {isCopied ? <>✓ Copiado</> : <><Copy className="w-2.5 h-2.5" /> Copiar CPF</>}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 block">R$ {item.total.toFixed(2).replace('.', ',')}</span>
                          <span className="text-[9px] text-slate-450 font-bold block">{item.count} {item.count === 1 ? 'consulta' : 'consultas'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DEDUCTIBLE LIVRO CAIXA EXPENSES COLUMN */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-indigo-650" /> Despesas de Escrituração do Livro Caixa
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold">Consumos operacionais dedutíveis cadastrados neste período fiscal.</p>
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-400 font-black px-2 py-0.5 rounded-md font-mono uppercase">PASSO 2: Livro Caixa</span>
              </div>

              {irpfExpenses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dotted border-slate-200">
                  <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 font-bold">Nenhuma despesa dedutível registrada para essa competência.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {irpfExpenses.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-150">
                      <div>
                        <span className="text-xs font-black text-slate-850 block">{item.description || 'Despesa Administrativa'}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-450 font-bold mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="font-mono">{new Date(item.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-rose-500 block">R$ {item.amount.toFixed(2).replace('.', ',')}</span>
                        <span className="text-[9px] text-indigo-700 font-black bg-indigo-55/15 pl-1.5 pr-1.5 py-0.2 rounded-sm uppercase tracking-wide">DEDUTÍVEL</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* MODAL: NOVO LANÇAMENTO FINANCEIRO */}
      {showTxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="bg-indigo-900 text-white p-5">
              <h3 className="font-black text-base flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-indigo-300 bg-white/10 p-0.5 rounded-lg" /> Adicionar Lançamento Financeiro
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5 font-medium">Controle de caixa instantâneo unificado do NexPsi.</p>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              
              {/* Type Switcher */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Tipo de Movimentação</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTxForm(prev => ({ ...prev, type: 'income' }))}
                    className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                      txForm.type === 'income' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm(prev => ({ ...prev, type: 'expense' }))}
                    className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                      txForm.type === 'expense' 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Despesa (-)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    value={txForm.amount}
                    onChange={(e) => setTxForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-black text-slate-800"
                  />
                </div>
              </div>

              {/* Linked Patient Selection (Optional, only show if appropriate or available) */}
              {txForm.type === 'income' && (
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">
                    Vincular a Paciente (Opcional)
                  </label>
                  <select
                    value={txForm.patientId}
                    onChange={(e) => setTxForm(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold bg-white text-slate-700"
                  >
                    <option value="">Lançamento Avulso (Sem Vínculo)</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Category select */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Categoria</label>
                  {txForm.type === 'income' ? (
                    <select
                      value={txForm.category}
                      onChange={(e) => setTxForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden bg-white text-slate-700 font-bold"
                    >
                      <option value="Sessão Individual">Sessão Individual</option>
                      <option value="Sessão de Casal">Sessão de Casal</option>
                      <option value="Supervisão Clínica">Supervisão Clínica</option>
                      <option value="Laudo / Parecer Psicológico">Laudo / Parecer</option>
                      <option value="Palestra / Workshop">Palestra / Workshop</option>
                      <option value="Outros">Outras Receitas</option>
                    </select>
                  ) : (
                    <select
                      value={txForm.category}
                      onChange={(e) => setTxForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden bg-white text-slate-700 font-bold"
                    >
                      <option value="Aluguel de Consultório">Aluguel de Consultório</option>
                      <option value="Plataforma / Outros">Plataforma / TI</option>
                      <option value="Impostos / CRP">Impostos / CRP</option>
                      <option value="Materiais / Livros">Materiais / Livros</option>
                      <option value="Marketing / Divulgação">Marketing</option>
                      <option value="Outros">Outras Despesas</option>
                    </select>
                  )}
                </div>

                {/* Payment Method / status */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Meio de Transação</label>
                  <select
                    value={txForm.paymentMethod}
                    onChange={(e) => setTxForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden bg-white text-slate-700 font-bold"
                  >
                    <option value="pix">PIX</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="bank_slip">Boleto Bancário</option>
                    <option value="cash">Dinheiro em Espécie</option>
                    <option value="transfer">Transferência Bancária</option>
                    <option value="other">Outra Forma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Status de Liquidação</label>
                <div className="flex gap-4 mt-1 font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={txForm.status === 'paid'}
                      onChange={() => setTxForm(prev => ({ ...prev, status: 'paid' }))}
                      className="accent-indigo-650"
                    /> Recebido / Pago
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={txForm.status === 'pending'}
                      onChange={() => setTxForm(prev => ({ ...prev, status: 'pending' }))}
                      className="accent-indigo-650"
                    /> Pendente de Liquidação
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Notas Opcionais</label>
                <input
                  type="text"
                  placeholder="Ex: Sala 4 sublocação, parcelado em 2x..."
                  value={txForm.description}
                  onChange={(e) => setTxForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Salvar Lançamento
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: NOVO DOCUMENTO / RECEITA DE SAÚDE */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="bg-emerald-950 text-white p-5">
              <h3 className="font-black text-base flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-emerald-400 bg-white/10 p-0.5 rounded-lg" /> Emitir Receita Clínica / Recibo de Saúde
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5 font-medium">Os documentos gerados são preenchidos e timbrados automaticamente com seu CRP.</p>
            </div>

            <form onSubmit={handleSaveDocument} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Document Type */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Modelo de Documento</label>
                  <select
                    value={docForm.type}
                    onChange={(e) => setDocForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden bg-white text-slate-700 font-bold"
                  >
                    <option value="payment_receipt">🧾 Recibo de Honorários (Tax/Reembolso)</option>
                    <option value="health_report">📄 Atestado / Declaração Clínica</option>
                    <option value="therapeutic_prescription">🎙️ Receita Saúde / Orientações Terapêuticas</option>
                  </select>
                </div>

                {/* Patient selection */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Paciente Titular</label>
                  <select
                    value={docForm.patientId}
                    required
                    onChange={(e) => setDocForm(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden bg-white text-slate-700 font-bold"
                  >
                    <option value="">Selecione o paciente...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.cpf ? `(${p.cpf})` : '(Sem CPF)'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Date */}
                <div className="col-span-1">
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={docForm.date}
                    onChange={(e) => setDocForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {/* Value (Only enable for payment receipt) */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1 block">
                    Valor Cobrado (Apenas Recibos)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    disabled={docForm.type !== 'payment_receipt'}
                    value={docForm.value}
                    onChange={(e) => setDocForm(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-black disabled:bg-slate-50 disabled:text-slate-300"
                  />
                </div>
              </div>

              {/* Document Text Area with Auto generation templates */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-black uppercase text-slate-400">Conteúdo do Documento</label>
                  <span className="text-[9.5px] text-indigo-600 bg-indigo-50/60 px-1.5 py-0.5 rounded-sm">Template Inteligente Ativo 🤖</span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={docForm.description}
                  onChange={(e) => setDocForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escreva as diretrizes clínicas de sua consulta psicológica..."
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-xs font-semibold leading-relaxed text-slate-700 bg-slate-50/50"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-750 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Confirmar Emissão
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* DRAWER / VIEW DIALOG: PREVIEW TIMBRADO PARA IMPRESSÃO (IMPRIMIR RECITA SAÚDE) */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
          >
            {/* Header controller */}
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-black tracking-wider uppercase">Visualização Timbrada - Registro de Saúde</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleSignature(selectedReceipt)}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg flex items-center gap-1 leading-none ${
                    selectedReceipt.signatureLocked 
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/35'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/35'
                  }`}
                >
                  <Stamp className="w-3.5 h-3.5" />
                  {selectedReceipt.signatureLocked ? "Remover CRP" : "Assinar CRP"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white text-[11px] font-black rounded-lg flex items-center gap-1 leading-none"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Printable Sandbox Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              
              {/* TIMBRADO DESIGN (Standards for professional print out) */}
              <div 
                id="printable-health-document"
                className="bg-white p-10 max-w-(--breakpoint-md) mx-auto shadow-sm border border-slate-200 rounded-xs min-h-[550px] flex flex-col justify-between relative overflow-hidden text-slate-800 selection:bg-slate-100"
              >
                {/* Absolute secure stamp watermark if locked */}
                {selectedReceipt.signatureLocked && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-3 select-none pointer-events-none rotate-12 scale-120">
                    <ShieldCheck className="w-80 h-80 text-indigo-900" />
                  </div>
                )}

                {/* Clean Timbrado Header */}
                <div className="border-b-2 border-slate-150 pb-5 mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                      {profile?.name || "Dr(a). Flávia Barros"}
                    </h2>
                    <p className="text-xs text-indigo-700 font-bold tracking-wide mt-0.5">
                      {profile?.crp || "CRP 04/194852-MG"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold max-w-sm mt-1 leading-tight">
                      {profile?.specialties || "Psicologia Clínica Integrada"}
                    </p>
                  </div>

                  {/* Stamp Graphic */}
                  <div className="border-2 border-dashed border-indigo-700 rounded-xl p-2.5 text-center flex flex-col items-center select-none bg-indigo-50/30 w-32 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-indigo-700" />
                    <span className="text-[8px] font-black uppercase text-indigo-800 tracking-wider mt-1 block">NexPsi</span>
                    <span className="text-[7.5px] font-bold text-slate-500 leading-none">PRONTUÁRIO SEGURO</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-6">
                  
                  {/* Title of document */}
                  <div className="text-center font-black text-sm tracking-widest text-slate-900 border-b border-dashed border-slate-100 pb-2 uppercase">
                    {selectedReceipt.type === 'payment_receipt' && "Recibo Clínico de Saúde"}
                    {selectedReceipt.type === 'health_report' && "Laudo / Atestado de Presença"}
                    {selectedReceipt.type === 'therapeutic_prescription' && "Receita & Guia Terapêutico"}
                  </div>

                  {/* Document Information / date */}
                  <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-500 font-mono">
                    <span>Documento ID: {selectedReceipt.id.toUpperCase().split('_')[1] || selectedReceipt.id}</span>
                    <span>Emissão: {new Date(selectedReceipt.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                  </div>

                  {/* Main text formatted elegantly with double padding */}
                  <div className="text-xs leading-relaxed text-slate-700 text-justify font-medium py-3 px-1 whitespace-pre-wrap">
                    {selectedReceipt.description}
                  </div>

                  {/* Value Summary Box if payment receipt */}
                  {selectedReceipt.type === 'payment_receipt' && (
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex justify-between items-center font-mono text-xs">
                      <span className="font-bold text-slate-500 text-[10px] uppercase">VALOR TOTAL DE HONORÁRIOS:</span>
                      <span className="font-black text-slate-950 text-sm">R$ {selectedReceipt.value?.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                </div>

                {/* Timbrado Signature Footer */}
                <div className="mt-14 pt-6 border-t border-slate-100 flex flex-col items-center text-center">
                  
                  {selectedReceipt.signatureLocked ? (
                    <div className="space-y-1 relative select-none">
                      {/* Signature graphic placeholder */}
                      <span className="inline-block text-[11px] font-black text-indigo-800 tracking-widest bg-indigo-50/70 border border-indigo-200 px-5 py-1 rounded-full uppercase scale-110 mb-1 leading-none shadow-xs">
                        ✓ ASSINADO DIGITALMENTE VIA CRP REGISTRO
                      </span>
                      <p className="text-xs font-black text-slate-900">{profile?.name || "Dr(a). Flávia Barros"}</p>
                      <p className="text-[10px] font-extrabold text-indigo-650 tracking-wider font-mono">{profile?.crp || "CRP 04/194852-MG"}</p>
                      <p className="text-[8px] text-slate-400 font-medium">Validado eletronicamente em conformidade com as exigências do Cons. Fed. de Psicologia</p>
                    </div>
                  ) : (
                    <div className="w-48 border-b-2 border-slate-200 pb-2 select-none">
                      <p className="text-slate-350 text-[10.5px] font-bold">Assinatura do Profissional</p>
                    </div>
                  )}

                  {/* Clinique Address footer */}
                  <div className="text-[9.5px] text-slate-400 font-semibold tracking-wide leading-normal mt-8 max-w-sm">
                    NexPsi Consultas e Evolução Integrada de Pacientes.<br />
                    Proteção de dados em conformidade com a LGPD e resoluções do CFP.
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
