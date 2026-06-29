import { Users, Calendar, FileCheck, FileClock } from 'lucide-react';
import { motion } from 'motion/react';
import { Patient, Appointment, MedicalRecord } from '../types';

interface DashboardStatsProps {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  onSelectTab: (tab: string) => void;
}

export default function DashboardStats({ patients, appointments, records, onSelectTab }: DashboardStatsProps) {
  const activePatients = patients.filter(p => p.status === 'active').length;
  const pendingAppointments = appointments.filter(a => a.status === 'scheduled').length;
  const lockedRecordsCount = records.filter(r => r.isLocked).length;
  const draftRecordsCount = records.filter(r => !r.isLocked).length;

  const cards = [
    {
      title: 'Pacientes Ativos',
      value: activePatients,
      description: `${patients.length - activePatients} inativos ou arquivados`,
      icon: Users,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      tab: 'pacientes'
    },
    {
      title: 'Sessões Agendadas',
      value: pendingAppointments,
      description: 'Consultas ativas adicionadas',
      icon: Calendar,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      tab: 'consultas'
    },
    {
      title: 'Prontuários Assinados',
      value: lockedRecordsCount,
      description: 'Assinados digitalmente & bloqueados',
      icon: FileCheck,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      tab: 'prontuarios'
    },
    {
      title: 'Evoluções em Rascunho',
      value: draftRecordsCount,
      description: 'Notas sob edição clínica',
      icon: FileClock,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
      tab: 'prontuarios'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            onClick={() => onSelectTab(card.tab)}
            id={`stat-card-${idx}`}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </dt>
                <dd className="text-3xl font-extrabold text-slate-800 mt-1">
                  {card.value}
                </dd>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor} transition-colors`}>
                <Icon className="w-6 h-6 shrink-0" />
              </div>
            </div>
            <div className="mt-4 border-t border-slate-50 pt-3">
              <span className="text-xs text-slate-400 font-medium">
                {card.description}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
