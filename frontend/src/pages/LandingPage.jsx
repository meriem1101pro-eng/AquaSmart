import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Leaf, 
  Bot, 
  Cpu, 
  CloudSun, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  MapPin,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    try {
      if (role === 'farmer') {
        await login('agriculteur@aquasmart.ma', 'Farmer@1234');
      } else if (role === 'admin') {
        await login('admin@aquasmart.ma', 'Admin@1234');
      } else {
        await login('gestionnaire@aquasmart.ma', 'Manager@1234');
      }
      navigate('/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-24 py-8">
      
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Plateforme SaaS Agricole Dédiée au Royaume du Maroc 🇲🇦</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          L'agriculture intelligente au service de l'eau :{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:to-sky-400 bg-clip-text text-transparent">
            Every Drop Counts
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AquaSmart aide les agriculteurs, coopératives et grands domaines marocains à économiser jusqu'à <span className="font-bold text-emerald-600 dark:text-emerald-400">40% d'eau</span>, réduire les coûts d'électricité de pompage et booster leurs rendements grâce à l'IA et aux capteurs IoT.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center gap-2 group"
            >
              <span>Accéder à mon tableau de bord</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <button
                onClick={() => handleQuickDemo('farmer')}
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center gap-2 group"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Tester la démo (Agriculteur)</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => handleQuickDemo('admin')}
                className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-sm shadow-md transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Espace Administrateur</span>
              </button>

              <Link
                to="/login"
                className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>

        {/* Highlight Stats Banner */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-3 text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block">-35%</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Eau consommée</span>
          </div>
          <div className="p-3 text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 block">FAO-56</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Norme agronomique</span>
          </div>
          <div className="p-3 text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 block">MAD</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Économies de pompage</span>
          </div>
          <div className="p-3 text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block">100%</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">FR • AR • الدارجة</span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Une suite complète conçue pour l'agriculteur moderne
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
            De la détection par capteur IoT jusqu'au calcul d'évapotranspiration, AquaSmart digitalise chaque étape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Irrigation FAO-56</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calcul précis de l'évapotranspiration potentielle ($ET_0$) et des coefficients culturaux ($K_c$) adaptés aux oliviers, agrumes, tomates et cultures marocaines.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AquaSmart AI (Conseiller Agronome)</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Assistant interactif intelligent répondant en Français, Arabe et Darija marocaine. Posez vos questions sur vos parcelles et recevez des réponses basées sur vos données réelles.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Capteurs IoT & ESP32 Connectés</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sondes d'humidité du sol à plusieurs profondeurs, température, niveau de puits et débitmètres. Ingestion REST/MQTT et mode démonstration simulé.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Météo Agricole Prédictive</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Intégration de prévisions météorologiques locales en direct. Alertes intelligentes pour suspendre l'irrigation en cas de pluie imminente.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Impact Écologique & Bilan RSE</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Comptabilisation des millions de litres d'eau économisés et réduction de l'empreinte carbone liée au pompage électrique.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gestion Financière & Rapports PDF</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Suivi des dépenses en Dirhams (MAD), calcul du ROI de modernisation et génération de rapports d'audit PDF exportables en un clic.
            </p>
          </div>

        </div>
      </section>

      {/* Target Regions in Morocco */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 py-16 rounded-3xl max-w-6xl mx-auto px-6 border border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
            <MapPin className="w-4 h-4" />
            <span>Déployable partout au Maroc</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Adapté aux bassins agricoles hydrauliques du Royaume
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs font-bold">
          {['Souss-Massa (Agadir, Taroudant)', 'Haouz & Tensift (Marrakech)', 'Saïss (Fès, Meknès)', 'Gharb & Loukkos (Kénitra, Larache)', 'Tadla (Béni Mellal)', 'Moulouya (Berkane, Nador)'].map((region, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200">
              {region}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Des formules adaptées à chaque taille d'exploitation
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
          Tarifs transparents en Dirham marocain (MAD). Pas de frais cachés.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* FREE */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Découverte</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">FREE</h3>
              <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
                0 <span className="text-sm font-medium text-slate-400">MAD / mois</span>
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 exploitation agricole</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Saisie manuelle des arrosages</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Statistiques de base</li>
              </ul>
            </div>
            <button 
              onClick={() => handleQuickDemo('farmer')}
              className="w-full mt-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-xs text-slate-800 dark:text-white transition"
            >
              Commencer gratuitement
            </button>
          </div>

          {/* PRO */}
          <div className="p-8 bg-gradient-to-b from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
              Recommandé Agriculteurs
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Performance</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">PRO</h3>
              <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
                299 <span className="text-sm font-medium text-slate-400">MAD / mois</span>
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Parcelles illimitées</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Assistant AquaSmart AI illimité</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Rapports PDF d'audit exportables</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Alertes météo et humidité intelligentes</li>
              </ul>
            </div>
            <button 
              onClick={() => handleQuickDemo('farmer')}
              className="w-full mt-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-md shadow-emerald-600/20 transition"
            >
              Choisir PRO
            </button>
          </div>

          {/* BUSINESS */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Domaines & Coopératives</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">BUSINESS</h3>
              <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
                799 <span className="text-sm font-medium text-slate-400">MAD / mois</span>
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Plusieurs exploitations multi-sites</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Intégration capteurs IoT en temps réel</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gestion multi-comptes et techniciens</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Support agronome prioritaire</li>
              </ul>
            </div>
            <button 
              onClick={() => handleQuickDemo('manager')}
              className="w-full mt-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs transition"
            >
              Contacter pour BUSINESS
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 pb-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold mb-2">
          <Droplets className="w-5 h-5" />
          <span className="text-base text-slate-900 dark:text-white">AquaSmart</span>
        </div>
        <p>© 2026 AquaSmart Maroc – Plateforme SaaS d'irrigation intelligente. Tous droits réservés.</p>
        <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-400">Every Drop Counts • كل قطرة ماء بحسابها</p>
      </footer>

    </div>
  );
}
