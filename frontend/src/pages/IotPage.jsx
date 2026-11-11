import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Plus, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Droplet, 
  Thermometer, 
  Wind, 
  Gauge, 
  Battery, 
  Code2, 
  Copy, 
  Check, 
  Sparkles,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export default function IotPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [sensors, setSensors] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [telemetryData, setTelemetryData] = useState([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Add Sensor Form
  const [sensorForm, setSensorForm] = useState({
    parcel_id: '',
    name: '',
    type: 'soil_moisture',
    is_simulated: false,
  });

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    setLoading(true);
    try {
      const [sensorsRes, parcelsRes] = await Promise.all([
        api.get('/sensors'),
        api.get('/parcels'),
      ]);
      const sList = Array.isArray(sensorsRes) ? sensorsRes : [];
      setSensors(sList);
      const pList = Array.isArray(parcelsRes) ? parcelsRes : [];
      setParcels(pList);
      if (pList.length > 0) {
        setSensorForm(prev => ({ ...prev, parcel_id: pList[0].id }));
      }
      if (sList.length > 0 && !selectedSensor) {
        inspectSensor(sList[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const inspectSensor = async (sensor) => {
    setSelectedSensor(sensor);
    try {
      const res = await api.get(`/sensors/${sensor.id}/telemetry`);
      setTelemetryData(res.telemetries || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateReading = async (sensorId) => {
    setSimulationLoading(sensorId);
    try {
      const res = await api.post(`/sensors/${sensorId}/simulate`, {});
      setSuccessMsg(res.message);
      // Refresh sensors list and inspected telemetry
      loadSensors();
      if (selectedSensor?.id === sensorId) {
        inspectSensor({ ...selectedSensor, last_value: res.value, is_simulated: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulationLoading(null);
    }
  };

  const handleAddSensor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sensors', sensorForm);
      setShowAddModal(false);
      setSuccessMsg('Capteur connecté avec succès.');
      loadSensors();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-8 h-8 text-emerald-600" />
            <span>Capteurs IoT & Télémétrie Agricole</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Surveillance en temps réel de l'humidité du sol, de la température et des débits par passerelle ESP32 & MQTT
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('iot.addSensor')}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span className="font-semibold">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* IoT Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            onClick={() => inspectSensor(sensor)}
            className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border cursor-pointer transition-all ${
              selectedSensor?.id === sensor.id
                ? 'border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {sensor.sensor_code}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                  {sensor.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {sensor.parcel?.name || 'Parcelle non définie'}
                </p>
              </div>

              {/* Status & Simulated Badge */}
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  sensor.status === 'online'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : sensor.status === 'warning'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sensor.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {sensor.status === 'online' ? t('iot.online') : sensor.status === 'warning' ? t('iot.warning') : t('iot.offline')}
                </span>

                {sensor.is_simulated ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-400/30">
                    🔬 {t('iot.simulatedBadge')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    📡 {t('iot.liveBadge')}
                  </span>
                )}
              </div>
            </div>

            {/* Reading value display */}
            <div className="mt-5 flex items-baseline justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Dernière mesure
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                  {sensor.last_value} <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{sensor.unit}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <Battery className="w-4 h-4 text-emerald-500" />
                <span>{sensor.battery_level}%</span>
              </div>
            </div>

            {/* Simulation button (as requested in Section 8) */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Ping: {sensor.last_ping_at ? new Date(sensor.last_ping_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Récent'}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateReading(sensor.id);
                }}
                disabled={simulationLoading === sensor.id}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                title="Générer une variation test"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>{simulationLoading === sensor.id ? 'Simulation...' : 'Tester mesure'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspected Sensor Telemetry Chart */}
      {selectedSensor && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Télémétrie en temps réel : {selectedSensor.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedSensor.sensor_code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Évolution temporelle des mesures ({selectedSensor.unit})
              </p>
            </div>

            <button
              onClick={() => inspectSensor(selectedSensor)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 text-xs flex items-center gap-1.5 self-start"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rafraîchir courbe</span>
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="recorded_at" 
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  labelFormatter={(val) => new Date(val).toLocaleString('fr-FR')}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={`Mesure (${selectedSensor.unit})`} 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#10b981' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ESP32 / MQTT Developer Architecture Box */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">
              Guide d'intégration IoT : ESP32 & Passerelle MQTT
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
            API Ingestion Ready
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Pour connecter vos microcontrôleurs ESP32, sondes RS485 Modbus ou vannes motorisées à AquaSmart, envoyez un payload JSON périodique en HTTP POST ou via MQTT :
        </p>

        <div className="p-3 bg-black/60 rounded-2xl font-mono text-[11px] text-emerald-400 overflow-x-auto flex items-center justify-between gap-4">
          <code>
            POST /api/sensors/ingest<br/>
            Headers: X-Sensor-Key: {selectedSensor?.api_key || 'sen_live_souss_p1_mst30'}<br/>
            Body: &#123; "value": 42.5, "battery_level": 94 &#125;
          </code>
          <button
            onClick={() => copyToClipboard(selectedSensor?.api_key || 'sen_live_souss_p1_mst30')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition"
            title="Copier la clé API du capteur"
          >
            {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Modal: Ajouter un capteur */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Ajouter un Capteur IoT
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddSensor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parcelle d'implantation
                </label>
                <select
                  required
                  value={sensorForm.parcel_id}
                  onChange={(e) => setSensorForm({ ...sensorForm, parcel_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {parcels.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.crop_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom du capteur
                </label>
                <input
                  type="text"
                  required
                  value={sensorForm.name}
                  onChange={(e) => setSensorForm({ ...sensorForm, name: e.target.value })}
                  placeholder="Ex. Sonde Humidité Racine 40cm"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type de mesure
                </label>
                <select
                  value={sensorForm.type}
                  onChange={(e) => setSensorForm({ ...sensorForm, type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="soil_moisture">Humidité du sol (%)</option>
                  <option value="soil_temperature">Température du sol (°C)</option>
                  <option value="ambient_temperature">Température ambiante (°C)</option>
                  <option value="air_humidity">Humidité de l'air (%)</option>
                  <option value="water_flow">Débit d'eau (L/min)</option>
                  <option value="water_level">Niveau de réserve / puits (%)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="simulatedCheck"
                  checked={sensorForm.is_simulated}
                  onChange={(e) => setSensorForm({ ...sensorForm, is_simulated: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="simulatedCheck" className="text-slate-600 dark:text-slate-300 cursor-pointer">
                  Activer en mode démonstration simulé
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Connecter le capteur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
