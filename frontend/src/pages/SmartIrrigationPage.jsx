import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Plus, 
  Calendar, 
  TrendingDown, 
  RefreshCw,
  Coins,
  History,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function SmartIrrigationPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Manual irrigation form modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    parcel_id: '',
    water_volume_m3: 25,
    duration_minutes: 45,
    notes: 'Saisie manuelle agriculteur',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, histRes, parcelsRes] = await Promise.all([
        api.get('/irrigation/recommendations'),
        api.get('/irrigation/history'),
        api.get('/parcels'),
      ]);

      setRecommendations(Array.isArray(recRes) ? recRes : []);
      const histData = histRes.data || histRes;
      setHistory(Array.isArray(histData) ? histData : []);
      const pList = Array.isArray(parcelsRes) ? parcelsRes : [];
      setParcels(pList);
      if (pList.length > 0) {
        setManualForm(prev => ({ ...prev, parcel_id: pList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = async (rec) => {
    setActionLoading(rec.id);
    setErrorMsg('');
    try {
      const res = await api.post(`/irrigation/recommendations/${rec.id}/apply`, {});
      setSuccessMsg(res.message);
      
      // Fire celebration confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      // Reload updated recommendations and history
      loadData();
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'application de l'irrigation.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/irrigation/log', manualForm);
      setShowManualModal(false);
      setSuccessMsg('Irrigation manuelle enregistrée dans la base de données.');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-8 h-8 text-emerald-600" />
            <span>Smart Irrigation – Pilotage Intelligent</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calcul agronomique précis basé sur l'évapotranspiration FAO-56 Penman-Monteith et les réserves utiles du sol marocain
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
            title="Recalculer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Saisie manuelle</span>
          </button>
        </div>
      </div>

      {/* Agronomic Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Estimation agronomique indicative :</span> Les volumes et créneaux sont calculés à partir des modèles FAO-56 et des mesures météo/sol disponibles. L'agriculteur valide les apports selon l'état réel de la végétation et les spécificités de son matériel d'irrigation.
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span className="font-semibold">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Recommandations d'irrigation du jour ({recommendations.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border shadow-sm flex flex-col justify-between transition-all ${
                rec.skip_irrigation 
                  ? 'border-slate-200 dark:border-slate-800 opacity-90' 
                  : rec.current_moisture < 35
                  ? 'border-amber-400/80 dark:border-amber-500/60 shadow-amber-500/5'
                  : 'border-emerald-500/30 dark:border-emerald-500/20'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {rec.crop_type} • {rec.area_ha} ha
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {rec.parcel_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {rec.farm_name}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    rec.skip_irrigation 
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      : rec.current_moisture < 35
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {rec.skip_irrigation ? "Irrigation inutile" : "Apport recommandé"}
                  </span>
                </div>

                {/* Quantitative Badges */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volume calculé</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                      {rec.recommended_volume_m3} <span className="text-xs font-semibold text-slate-500">m³</span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Créneau optimal</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {rec.recommended_start_time.substring(0, 5)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Durée estimée</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
                      {rec.duration_minutes} min
                    </span>
                  </div>
                </div>

                {/* Reason Explanation */}
                <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Analyse agronomique :</span>
                  {rec.reason}
                </div>

                {/* Water savings note */}
                {rec.estimated_savings_liters > 0 && (
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Économie estimée : ~{rec.estimated_savings_liters.toLocaleString()} litres d'eau préservés</span>
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Indice de confiance : <span className="font-bold text-slate-700 dark:text-slate-200">{rec.confidence_score}%</span>
                </span>

                {rec.skip_irrigation ? (
                  <span className="text-xs text-slate-400 font-semibold italic">
                    Aucune action requise
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyRecommendation(rec)}
                    disabled={actionLoading === rec.id}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === rec.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Valider et exécuter l'irrigation</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complete Irrigation Logs Table */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Historique complet des irrigations exécutées
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {history.length} cycles enregistrés
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="pb-3 font-semibold">Date & Heure</th>
                <th className="pb-3 font-semibold">Parcelle</th>
                <th className="pb-3 font-semibold">Volume (m³)</th>
                <th className="pb-3 font-semibold">Durée</th>
                <th className="pb-3 font-semibold">Mode</th>
                <th className="pb-3 font-semibold">Énergie (kWh)</th>
                <th className="pb-3 font-semibold">Coût total (MAD)</th>
                <th className="pb-3 font-semibold">Économie (Litres)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 font-medium">
                    {new Date(item.scheduled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {item.parcel?.name || 'Parcelle'}
                  </td>
                  <td className="py-3 font-semibold text-sky-600 dark:text-sky-400">
                    {item.water_volume_m3} m³
                  </td>
                  <td className="py-3">
                    {item.duration_minutes} min
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                      {item.mode === 'smart_recommended' ? '🤖 Recommandation IA' : 'Manuel'}
                    </span>
                  </td>
                  <td className="py-3">
                    {item.energy_kwh || '—'} kWh
                  </td>
                  <td className="py-3 font-bold">
                    {item.cost_mad} MAD
                  </td>
                  <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    +{item.savings_liters?.toLocaleString() || 0} L
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Manual Irrigation Entry */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Enregistrer une irrigation manuelle
              </h3>
              <button onClick={() => setShowManualModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parcelle irriguée
                </label>
                <select
                  required
                  value={manualForm.parcel_id}
                  onChange={(e) => setManualForm({ ...manualForm, parcel_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {parcels.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.crop_type})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Volume d'eau (m³)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={manualForm.water_volume_m3}
                    onChange={(e) => setManualForm({ ...manualForm, water_volume_m3: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Durée d'arrosage (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={manualForm.duration_minutes}
                    onChange={(e) => setManualForm({ ...manualForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remarques / Observations
                </label>
                <textarea
                  rows="2"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="Ex. Relevé compteur débitmètre, apport en engrais NPK..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
