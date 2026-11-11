import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Tooltip as LeafletTooltip, 
  Popup,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Droplet, 
  Thermometer, 
  Activity, 
  Sprout, 
  Layers, 
  Sparkles, 
  MapPin, 
  Satellite, 
  Map as MapIcon, 
  LocateFixed, 
  AlertTriangle 
} from 'lucide-react';

// Fix Leaflet marker icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to dynamically recenter map
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveParcelMap({ parcels = [], onSelectParcel, selectedParcelId }) {
  const [filter, setFilter] = useState('all');
  const [mapLayer, setMapLayer] = useState('satellite'); // satellite, hybrid, osm
  const [activeTab, setActiveTab] = useState('overview');

  // Moroccan agricultural default center (Oulad Teima / Souss-Massa)
  const defaultCenter = [30.4045, -9.2270];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(15);

  const selectedParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0] || null;

  // Filter parcels
  const filteredParcels = parcels.filter(p => {
    if (filter === 'needs_watering') return p.status === 'needs_watering';
    if (filter === 'optimal') return p.status === 'optimal';
    if (filter === 'harvest_soon') return p.status === 'harvest_soon';
    return true;
  });

  // Color according to moisture status
  const getParcelStyle = (parcel) => {
    const isSelected = selectedParcel?.id === parcel.id;
    if (parcel.status === 'needs_watering') {
      return {
        fillColor: '#f59e0b',
        fillOpacity: isSelected ? 0.70 : 0.50,
        color: isSelected ? '#ffffff' : '#f59e0b',
        weight: isSelected ? 3.5 : 2,
        dashArray: isSelected ? '' : '4, 4',
      };
    }
    if (parcel.status === 'harvest_soon') {
      return {
        fillColor: '#0ea5e9',
        fillOpacity: isSelected ? 0.70 : 0.50,
        color: isSelected ? '#ffffff' : '#0284c7',
        weight: isSelected ? 3.5 : 2,
      };
    }
    return {
      fillColor: '#10b981',
      fillOpacity: isSelected ? 0.70 : 0.50,
      color: isSelected ? '#ffffff' : '#059669',
      weight: isSelected ? 3.5 : 2,
    };
  };

  // Quick regions in Morocco
  const regions = [
    { name: 'Souss-Massa (Oulad Teima)', center: [30.4045, -9.2270], zoom: 15 },
    { name: 'Marrakech (Haouz)', center: [31.6295, -7.9811], zoom: 13 },
    { name: 'Meknès (Saïss)', center: [33.8938, -5.5547], zoom: 13 },
    { name: 'Kénitra (Gharb)', center: [34.2610, -6.5802], zoom: 13 },
    { name: 'Berkane (Moulouya)', center: [34.9200, -2.3200], zoom: 13 },
  ];

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapZoom(16);
        },
        () => {
          setMapCenter(defaultCenter);
        }
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col xl:flex-row">
      
      {/* Real Map Canvas Section */}
      <div className="flex-1 relative min-h-[520px] flex flex-col">
        
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-white/10 pointer-events-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Toutes ({parcels.length})
            </button>
            <button
              onClick={() => setFilter('needs_watering')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${filter === 'needs_watering' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:text-amber-400'}`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Besoin d'eau
            </button>
            <button
              onClick={() => setFilter('optimal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filter === 'optimal' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-emerald-400'}`}
            >
              Optimal
            </button>
            <button
              onClick={() => setFilter('harvest_soon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filter === 'harvest_soon' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:text-sky-400'}`}
            >
              Récolte proche
            </button>
          </div>

          {/* Layer switcher (Satellite HD, Hybrid, Street) */}
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-white/10 pointer-events-auto">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${mapLayer === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
              title="Image satellite haute résolution réelle (Esri World Imagery)"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite HD</span>
            </button>
            <button
              onClick={() => setMapLayer('hybrid')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${mapLayer === 'hybrid' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
              title="Satellite avec routes et localités"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hybride</span>
            </button>
            <button
              onClick={() => setMapLayer('osm')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${mapLayer === 'osm' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'}`}
              title="Carte routière et topographique OpenStreetMap"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Topographique</span>
            </button>
          </div>

        </div>

        {/* Floating Moroccan Region Jumper */}
        <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-white/10 text-xs text-white max-w-[85vw] overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 shrink-0 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Régions Maroc :</span>
          </span>
          {regions.map((reg, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMapCenter(reg.center);
                setMapZoom(reg.zoom);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-emerald-600/80 text-[11px] font-semibold transition shrink-0"
            >
              {reg.name}
            </button>
          ))}
          <button
            onClick={handleLocateMe}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-emerald-600 text-emerald-300 hover:text-white transition shrink-0"
            title="Localiser ma position GPS"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real Leaflet Map */}
        <MapContainer
          center={defaultCenter}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full min-h-[520px] z-0"
        >
          <MapRecenter center={mapCenter} zoom={mapZoom} />

          {/* Real Satellite Tiles Layer (Esri World Imagery) */}
          {mapLayer === 'satellite' && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri World Imagery</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}

          {/* Hybrid: Satellite + Boundaries and Place names */}
          {mapLayer === 'hybrid' && (
            <>
              <TileLayer
                attribution='&copy; Esri World Imagery'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </>
          )}

          {/* Topographic / OpenStreetMap Layer */}
          {mapLayer === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* Real Farmland Polygons */}
          {filteredParcels.map((parcel) => {
            const positions = parcel.boundary_geojson || [
              [30.4040, -9.2310],
              [30.4070, -9.2300],
              [30.4065, -9.2265],
              [30.4035, -9.2275]
            ];

            const style = getParcelStyle(parcel);

            return (
              <Polygon
                key={parcel.id}
                positions={positions}
                pathOptions={style}
                eventHandlers={{
                  click: () => {
                    if (onSelectParcel) onSelectParcel(parcel.id);
                  },
                }}
              >
                <LeafletTooltip direction="center" permanent className="bg-slate-900/90 text-white font-bold text-xs border-none rounded-xl px-2.5 py-1 shadow-md">
                  <div className="text-center">
                    <span className="block text-[11px] font-black">{parcel.name}</span>
                    <span className="block text-[10px] text-emerald-400 font-semibold">{parcel.area_ha} ha • {parcel.current_moisture}%</span>
                  </div>
                </LeafletTooltip>

                <Popup className="rounded-2xl shadow-xl">
                  <div className="p-2 text-xs text-slate-800">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 block">{parcel.code}</span>
                    <h4 className="font-extrabold text-sm text-slate-900">{parcel.name}</h4>
                    <p className="text-slate-500 mt-0.5">{parcel.crop_variety || parcel.crop_type} ({parcel.area_ha} ha)</p>
                    <div className="mt-2 grid grid-cols-2 gap-1.5 p-2 bg-slate-100 rounded-xl text-[11px]">
                      <div><strong>Humidité :</strong> {parcel.current_moisture}%</div>
                      <div><strong>Temp. sol :</strong> {parcel.current_temperature || 24}°C</div>
                      <div><strong>pH :</strong> {parcel.soil_ph || 6.8}</div>
                      <div><strong>Statut :</strong> {parcel.status === 'needs_watering' ? "⚠️ Déficit" : "Optimal"}</div>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}
        </MapContainer>

      </div>

      {/* Field Detail Side Card (Inspired by user's mockup) */}
      <div className="w-full xl:w-96 bg-white dark:bg-slate-900 p-6 border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        
        {selectedParcel ? (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                  {selectedParcel.code || 'PRC-01'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedParcel.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedParcel.crop_variety || selectedParcel.crop_type} • {selectedParcel.area_ha} ha
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                selectedParcel.status === 'needs_watering' 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' 
                  : selectedParcel.status === 'harvest_soon'
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}>
                {selectedParcel.status === 'needs_watering' ? "Besoin d'eau" : selectedParcel.status === 'harvest_soon' ? "Récolte proche" : "Optimal"}
              </span>
            </div>

            {/* Navigation Tabs (Aperçu, Analyse, Planning) */}
            <div className="flex items-center gap-2 mt-5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1.5 rounded-xl transition ${activeTab === 'overview' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Aperçu
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-1.5 rounded-xl transition ${activeTab === 'analysis' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Analyse
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 py-1.5 rounded-xl transition ${activeTab === 'schedule' ? 'bg-emerald-800 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Planning
              </button>
            </div>

            {/* 4 Sensor Metric Pills */}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Humidité sol</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Droplet className={`w-4 h-4 ${selectedParcel.current_moisture < 35 ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedParcel.current_moisture}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Temp. Sol</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedParcel.current_temperature || 24.5}°C
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acidité Sol</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    pH {selectedParcel.soil_ph || 6.8}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Système</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Sprout className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate">
                    {selectedParcel.irrigation_method?.replace(/_/g, ' ') || 'Goutte-à-goutte'}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth Rate / Health Bar */}
            <div className="mt-5 p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-300">Dynamique de croissance</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  +2.5 cm/semaine ↑
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2.5">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(25, selectedParcel.current_moisture))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Coordonnées GPS réelles : <span className="font-mono text-slate-700 dark:text-slate-300">30.404° N, -9.231° W (Oulad Teima)</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Sélectionnez une parcelle sur la carte satellite.
          </div>
        )}

        {/* Action Button */}
        {selectedParcel && (
          <div className="mt-6">
            <button 
              onClick={() => {
                if (selectedParcel.boundary_geojson && selectedParcel.boundary_geojson[0]) {
                  setMapCenter(selectedParcel.boundary_geojson[0]);
                  setMapZoom(16);
                }
              }}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Centrer sur cette parcelle en Satellite HD</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
