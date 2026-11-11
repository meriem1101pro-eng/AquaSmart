import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  TrendingDown, 
  Leaf, 
  Trees, 
  Cpu, 
  Coins, 
  Activity, 
  Plus, 
  Bot, 
  CloudSun, 
  FileDown, 
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import InteractiveParcelMap from '../components/InteractiveParcelMap';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [weather, setWeather] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('daily'); // daily, weekly, monthly
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes, parcelsRes, weatherRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts'),
        api.get('/parcels'),
        api.get('/weather?lat=30.4278&lon=-9.5981'), // Souss-Massa default
      ]);

      setStats(statsRes);
      setCharts(chartsRes);
      setParcels(Array.isArray(parcelsRes) ? parcelsRes : []);
      setWeather(weatherRes);
      if (Array.isArray(parcelsRes) && parcelsRes.length > 0) {
        setSelectedParcelId(parcelsRes[0].id);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = charts ? charts[chartPeriod] : [];

  return (
    <div className="space-y-8">
      
      {/* Header with Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('dashboard.title')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Direct Maroc
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Bienvenue, <span className="font-bold text-slate-700 dark:text-slate-200">{user?.name}</span> • {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <Link
            to="/irrigation"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <Droplets className="w-4 h-4" />
            <span>{t('dashboard.newIrrigation')}</span>
          </Link>

          <Link
            to="/ai"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs shadow-sm transition flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>{t('dashboard.launchAi')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Eau économisée */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.waterSaved')}</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.metrics?.total_water_saved_liters?.toLocaleString() || '26,700'}{' '}
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Litres</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-34.8% vs gravitaire traditionnel</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* KPI 2: Consommation totale */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.waterConsumed')}</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.metrics?.total_water_consumed_m3 || '92.5'}{' '}
              <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">m³</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Sur {stats?.metrics?.parcels_count || parcels.length || 5} parcelles agricoles
            </p>
          </div>
        </div>

        {/* KPI 3: Économies financières (MAD) */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.financialSavings')}</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.metrics?.financial_savings_mad || '614.20'}{' '}
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">MAD</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Pertes et pompage électrique évités
            </p>
          </div>
        </div>

        {/* KPI 4: Capteurs connectés & santé */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('dashboard.activeSensors')}</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.metrics?.online_sensors_count || 5} / {stats?.metrics?.sensors_count || 6}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Télémétrie sol active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Map Visualizer (Matching User's Mockup Design) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-600" />
              <span>Cartographie Interactive des Parcelles</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vue en temps réel des zones d'humidité, des types de sols et des alertes de stress hydrique
            </p>
          </div>
          <Link
            to="/farms"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Gérer toutes les parcelles</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <InteractiveParcelMap 
          parcels={parcels}
          selectedParcelId={selectedParcelId}
          onSelectParcel={(id) => setSelectedParcelId(id)}
        />
      </section>

      {/* Consumption Charts & Weather row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dynamic Recharts (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('dashboard.realVsRecommended')}
              </h3>
              <p className="text-xs text-slate-400">
                Comparatif de la consommation mesurée vs recommandations FAO-56
              </p>
            </div>

            {/* Daily / Weekly / Monthly Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartPeriod('daily')}
                className={`px-3 py-1.5 rounded-lg transition ${chartPeriod === 'daily' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
              >
                {t('dashboard.chartDaily')}
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-3 py-1.5 rounded-lg transition ${chartPeriod === 'weekly' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
              >
                {t('dashboard.chartWeekly')}
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg transition ${chartPeriod === 'monthly' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
              >
                {t('dashboard.chartMonthly')}
              </button>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey={chartPeriod === 'daily' ? 'day' : chartPeriod === 'weekly' ? 'week' : 'month'} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '16px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="reel" name="Consommation réelle (m³)" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReel)" />
                <Area type="monotone" dataKey="recommande" name="Besoin hydrique optimal (m³)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Weather Card */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200">
                Météo Agricole Souss-Massa
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                {weather?.is_live ? 'En direct' : 'Station locale'}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  {weather?.current?.temperature || 24}°C
                </span>
                <p className="text-xs text-emerald-100 mt-1 capitalize">
                  {weather?.current?.condition || 'Ciel dégagé, ensoleillé'}
                </p>
              </div>
              <CloudSun className="w-16 h-16 text-amber-300 drop-shadow-md" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs">
              <div>
                <span className="text-emerald-200 text-[10px] block">Humidité relative</span>
                <span className="font-bold text-sm">{weather?.current?.humidity || 52}%</span>
              </div>
              <div>
                <span className="text-emerald-200 text-[10px] block">Vitesse du vent</span>
                <span className="font-bold text-sm">{weather?.current?.wind_speed_kmh || 12} km/h</span>
              </div>
              <div>
                <span className="text-emerald-200 text-[10px] block">Pluie prévue (48h)</span>
                <span className="font-bold text-sm">{weather?.current?.precipitation_mm || 0} mm</span>
              </div>
              <div>
                <span className="text-emerald-200 text-[10px] block">Évapotranspiration (ETo)</span>
                <span className="font-bold text-sm">~4.2 mm/jour</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-emerald-100 font-medium">Fenêtre d'arrosage :</span>
            <span className="font-bold bg-white text-emerald-800 px-3 py-1 rounded-xl shadow-sm">
              06:00 - 07:30
            </span>
          </div>

          <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('dashboard.recentActivity')}
            </h3>
            <p className="text-xs text-slate-400">
              Historique des derniers arrosages exécutés sur la plateforme
            </p>
          </div>
          <Link
            to="/irrigation"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Voir tout l'historique
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="pb-3 font-semibold">Parcelle</th>
                <th className="pb-3 font-semibold">Volume (m³)</th>
                <th className="pb-3 font-semibold">Durée</th>
                <th className="pb-3 font-semibold">Mode</th>
                <th className="pb-3 font-semibold">Coût estimé</th>
                <th className="pb-3 font-semibold">Eau économisée</th>
                <th className="pb-3 font-semibold text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {(stats?.recent_activity || []).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.mode === 'smart_recommended' ? '🤖 Recommandé IA' : 'Manuel'}
                    </span>
                  </td>
                  <td className="py-3 font-bold">
                    {item.cost_mad} MAD
                  </td>
                  <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    +{item.savings_liters?.toLocaleString()} L
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      Terminé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
