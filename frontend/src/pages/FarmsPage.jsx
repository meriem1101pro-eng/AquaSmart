import React, { useState, useEffect } from 'react';
import { 
  Trees, 
  Plus, 
  MapPin, 
  Droplet, 
  Thermometer, 
  Layers, 
  Edit3, 
  Trash2, 
  Activity, 
  AlertCircle,
  X,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import InteractiveParcelMap from '../components/InteractiveParcelMap';

export default function FarmsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, map

  // Modals state
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddParcelModal, setShowAddParcelModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New Farm Form
  const [newFarm, setNewFarm] = useState({
    name: '',
    region: 'Souss-Massa',
    city: 'Agadir',
    total_area_ha: 10,
    water_source: 'Puits / Nappe phréatique',
    water_cost_per_m3: 1.80,
    kwh_cost_mad: 1.10,
    notes: '',
  });

  // New Parcel Form
  const [newParcel, setNewParcel] = useState({
    farm_id: '',
    name: '',
    area_ha: 2.5,
    crop_type: 'olivier',
    crop_variety: 'Picholine marocaine',
    soil_type: 'argilo_limoneux',
    irrigation_method: 'goutte_a_goutte',
    target_moisture_min: 35,
    target_moisture_max: 65,
    current_moisture: 45,
    current_temperature: 24,
    soil_ph: 6.8,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const farmsRes = await api.get('/farms');
      const list = Array.isArray(farmsRes) ? farmsRes : [];
      setFarms(list);
      if (list.length > 0) {
        setSelectedFarm(list[0]);
        setParcels(list[0].parcels || []);
        setNewParcel(prev => ({ ...prev, farm_id: list[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFarm = (farm) => {
    setSelectedFarm(farm);
    setParcels(farm.parcels || []);
    setNewParcel(prev => ({ ...prev, farm_id: farm.id }));
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.post('/farms', newFarm);
      setShowAddFarmModal(false);
      setSuccessMsg('Exploitation créée avec succès !');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la création');
    }
  };

  const handleCreateParcel = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/parcels', newParcel);
      setShowAddParcelModal(false);
      setSuccessMsg('Parcelle ajoutée avec succès !');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de l\'ajout de la parcelle');
    }
  };

  const handleDeleteParcel = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette parcelle ?')) return;
    try {
      await api.delete(`/parcels/${id}`);
      setSuccessMsg('Parcelle supprimée.');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Trees className="w-8 h-8 text-emerald-600" />
            <span>Gestion des Exploitations & Parcelles</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastre digital, pédologie des sols marocains et découpage parcellaire
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddParcelModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une parcelle</span>
          </button>
          
          <button
            onClick={() => setShowAddFarmModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle exploitation</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Farms selector pill tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {farms.map((farm) => (
          <button
            key={farm.id}
            onClick={() => handleSelectFarm(farm)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
              selectedFarm?.id === farm.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{farm.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20">
              {farm.parcels?.length || 0} parcelles
            </span>
          </button>
        ))}
      </div>

      {/* Current Farm Detailed Information Card */}
      {selectedFarm && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Localisation</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {selectedFarm.city || selectedFarm.region}, Maroc
            </span>
            <span className="text-slate-500 text-[11px]">Région {selectedFarm.region}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Superficie totale</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {selectedFarm.total_area_ha} hectares
            </span>
            <span className="text-slate-500 text-[11px]">{parcels.length} parcelles actives</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Source hydrique</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block truncate">
              {selectedFarm.water_source}
            </span>
            <span className="text-slate-500 text-[11px]">Tarif: {selectedFarm.water_cost_per_m3} MAD/m³</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Énergie pompage</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
              {selectedFarm.kwh_cost_mad} MAD / kWh
            </span>
            <span className="text-slate-500 text-[11px]">Tarification ONEE agricole</span>
          </div>
        </div>
      )}

      {/* View Switcher: Interactive Map vs Grid Cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Parcelles du domaine ({parcels.length})
        </h2>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
          >
            Vue Cartes
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
          >
            Vue Cadastre (Carte)
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <InteractiveParcelMap parcels={parcels} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcels.map((parcel) => (
            <div
              key={parcel.id}
              className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {parcel.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      {parcel.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {parcel.crop_variety || parcel.crop_type} • {parcel.area_ha} ha
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                    parcel.status === 'needs_watering'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : parcel.status === 'harvest_soon'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {parcel.status === 'needs_watering' ? "Besoin d'eau" : parcel.status === 'harvest_soon' ? "Récolte proche" : "Optimal"}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-5 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Humidité sol</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 block">
                      {parcel.current_moisture}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Type de sol</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize truncate mt-0.5 block">
                      {parcel.soil_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Irrigation</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize truncate mt-0.5 block">
                      {parcel.irrigation_method?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">pH du sol</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                      {parcel.soil_ph || 6.8}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {parcel.sensors?.length || 0} capteurs associés
                </span>
                <button
                  onClick={() => handleDeleteParcel(parcel.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                  title="Supprimer la parcelle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Ajouter une exploitation */}
      {showAddFarmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Nouvelle Exploitation Agricole
              </h3>
              <button onClick={() => setShowAddFarmModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateFarm} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom de l'exploitation</label>
                <input
                  type="text"
                  required
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                  placeholder="Ex. Domaine El Baraka"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Région agricole</label>
                  <select
                    value={newFarm.region}
                    onChange={(e) => setNewFarm({ ...newFarm, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Souss-Massa">Souss-Massa (Agadir)</option>
                    <option value="Fès-Meknès">Saïss (Fès-Meknès)</option>
                    <option value="Marrakech-Safi">Haouz (Marrakech-Safi)</option>
                    <option value="Rabat-Salé-Kénitra">Gharb (Kénitra / Larache)</option>
                    <option value="Béni Mellal-Khénifra">Tadla (Béni Mellal)</option>
                    <option value="Oriental">Moulouya (Berkane)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Superficie (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newFarm.total_area_ha}
                    onChange={(e) => setNewFarm({ ...newFarm, total_area_ha: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Source d'eau principale</label>
                <select
                  value={newFarm.water_source}
                  onChange={(e) => setNewFarm({ ...newFarm, water_source: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Puits / Nappe phréatique">Puits / Forage nappe phréatique</option>
                  <option value="Barrage / Réseau collectif">Barrage / Réseau collectif ORMVA</option>
                  <option value="Bassin de stockage">Bassin de stockage privé</option>
                  <option value="Station de dessalement">Eau dessalée (Chtouka)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddFarmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Créer l'exploitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajouter une parcelle */}
      {showAddParcelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Ajouter une Parcelle Agricole
              </h3>
              <button onClick={() => setShowAddParcelModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateParcel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom de la parcelle</label>
                <input
                  type="text"
                  required
                  value={newParcel.name}
                  onChange={(e) => setNewParcel({ ...newParcel, name: e.target.value })}
                  placeholder="Ex. Verger Clémentiniers Nord"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Culture</label>
                  <select
                    value={newParcel.crop_type}
                    onChange={(e) => setNewParcel({ ...newParcel, crop_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="olivier">Oliviers</option>
                    <option value="agrume">Agrumes (Clémentines, Oranges)</option>
                    <option value="tomate">Tomates de primeur</option>
                    <option value="pomme_de_terre">Pommes de terre</option>
                    <option value="ble">Blé dur / tendre</option>
                    <option value="fraise">Fraises</option>
                    <option value="autre">Autre culture personnalisée</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Superficie (ha)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newParcel.area_ha}
                    onChange={(e) => setNewParcel({ ...newParcel, area_ha: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pédologie du sol</label>
                  <select
                    value={newParcel.soil_type}
                    onChange={(e) => setNewParcel({ ...newParcel, soil_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="argilo_limoneux">Argilo-limoneux (Très courant)</option>
                    <option value="sableux">Sableux (Souss / Littoral)</option>
                    <option value="sablo_limoneux">Sablo-limoneux</option>
                    <option value="limoneux">Limoneux</option>
                    <option value="argileux">Argileux (Lourd, rétention forte)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Méthode d'irrigation</label>
                  <select
                    value={newParcel.irrigation_method}
                    onChange={(e) => setNewParcel({ ...newParcel, irrigation_method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="goutte_a_goutte">Goutte-à-goutte (Localisé)</option>
                    <option value="aspersion">Aspersion</option>
                    <option value="pivot">Pivot automatique</option>
                    <option value="gravitaire">Gravitaire (Submersion)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddParcelModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Enregistrer la parcelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
