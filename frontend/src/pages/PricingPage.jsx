import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function PricingPage() {
  const { user, refreshUser } = useAuth();

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get('/subscriptions/plans')
      .then(res => {
        setPlans(res.plans || []);
        setCurrentPlan(res.current_plan || 'free');
      })
      .catch(e => console.error(e));
  }, []);

  const handleSubscribe = async (planId) => {
    setLoading(true);
    try {
      const res = await api.post('/subscriptions/subscribe', { plan: planId });
      setCurrentPlan(planId);
      setSuccessMsg(res.message);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      await refreshUser();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-4">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
          Formules SaaS AquaSmart 🇲🇦
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Tarification Simple et Évolutive en Dirham Marocain (MAD)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Rentabilisez votre abonnement dès le premier mois grâce aux économies d'eau et de pompage électrique réalisées.
        </p>
      </div>

      {successMsg && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-md">
          <span className="font-bold">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((p) => {
          const isCurrent = currentPlan?.toLowerCase() === p.id.toLowerCase();
          return (
            <div
              key={p.id}
              className={`p-8 bg-white dark:bg-slate-900 rounded-3xl border flex flex-col justify-between transition-all relative ${
                p.popular
                  ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Recommandé Agriculteurs
                </span>
              )}

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {p.id === 'free' ? 'Formule Découverte' : p.id === 'pro' ? 'Formule Pro' : 'Entreprise & Domaines'}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {p.name}
                </h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {p.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {p.price_mad}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {p.id === 'free' ? 'MAD (Gratuit à vie)' : 'MAD / mois'}
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-6"></div>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  {p.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                {isCurrent ? (
                  <div className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs text-center border border-slate-200 dark:border-slate-700">
                    Formule Actuelle ✅
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(p.id)}
                    disabled={loading}
                    className={`w-full py-3 rounded-2xl font-bold text-xs transition shadow-md disabled:opacity-50 ${
                      p.popular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    {loading ? 'Activation en cours...' : `Passer à ${p.name} (Mode Test)`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Morocco Payment Gateways Notice */}
      <div className="max-w-3xl mx-auto p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 text-center">
        <span className="font-bold text-slate-900 dark:text-white block">
          Paiement sécurisé et conformité marocaine (Mode Test Actif)
        </span>
        <p className="leading-relaxed">
          La plateforme est prête pour l'intégration des passerelles bancaires marocaines (CMI, PayZone, Virement bancaire ou prélèvement). Actuellement en mode simulation test sécurisé sans débit bancaire réel.
        </p>
      </div>

    </div>
  );
}
