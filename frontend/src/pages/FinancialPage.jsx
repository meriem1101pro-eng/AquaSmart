import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingDown, 
  FileDown, 
  Zap, 
  Droplet, 
  Wrench, 
  PieChart as PieIcon, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { api } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FinancialPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/financial/summary')
      .then(res => setData(res))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text("AquaSmart Maroc – Rapport Financier d'Irrigation", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Every Drop Counts – Optimisation des coûts hydriques et énergétiques", 14, 26);
    doc.text(`Date d'édition : ${new Date().toLocaleDateString('fr-FR')} | Devise : Dirham marocain (MAD)`, 14, 32);

    autoTable(doc, {
      startY: 40,
      head: [['Poste de dépense', 'Montant (MAD)', 'Part (%)']],
      body: [
        ['Eau d\'irrigation (puits / réseau)', `${data?.current_period?.water_cost_mad || 1450} MAD`, '57.3%'],
        ['Électricité de pompage (ONEE)', `${data?.current_period?.electricity_cost_mad || 820} MAD`, '32.4%'],
        ['Maintenance & filtres à disques', `${data?.current_period?.maintenance_cost_mad || 250} MAD`, '9.9%'],
        ['TOTAL MENSUEL DÉPENSÉ', `${data?.current_period?.total_spent_mad || 2520} MAD`, '100%'],
        ['BUDGET ALLOUÉ', `${data?.current_period?.budget_mad || 3200} MAD`, '—'],
        ['ÉCONOMIES RÉALISÉES VIA AQUASMART', `+${data?.current_period?.financial_savings_mad || 614.20} MAD`, '—'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save(`AquaSmart_Bilan_Financier_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const period = data?.current_period;
  const trends = data?.monthly_trends || [];

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-8 h-8 text-amber-500" />
            <span>Gestion Financière de l'Irrigation (MAD)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Optimisation des factures d'eau et de consommation électrique de pompage agricole
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          <span>Exporter le rapport financier PDF</span>
        </button>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coût Eau d'irrigation</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {period?.water_cost_mad?.toLocaleString() || 1420} <span className="text-xs font-semibold text-slate-500">MAD</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Volume pompé ou facturé</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Électricité de pompage</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {period?.electricity_cost_mad?.toLocaleString() || 790} <span className="text-xs font-semibold text-slate-500">MAD</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Facture estimée ONEE</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total dépensé ce mois</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {period?.total_spent_mad?.toLocaleString() || 2420} <span className="text-xs font-semibold text-slate-500">MAD</span>
          </span>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Sur budget de {period?.budget_mad || 3000} MAD ({period?.budget_usage_percent || 78}%)
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Économies nettes générées</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            +{period?.financial_savings_mad || 614.20} <span className="text-xs font-semibold">MAD</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Gaspillage et surpompage évités</p>
        </div>

      </div>

      {/* Monthly Trends Recharts */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Évolution des Dépenses d'Irrigation (MAD) sur l'Année
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '11px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="eau" name="Coût Eau (MAD)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="electricite" name="Électricité Pompage (MAD)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="budget" name="Budget Limite (MAD)" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
