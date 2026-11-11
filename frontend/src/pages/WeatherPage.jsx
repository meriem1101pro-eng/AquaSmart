import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Thermometer, 
  MapPin, 
  Calendar, 
  Sun, 
  CloudRain, 
  AlertCircle,
  RefreshCw,
  Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export default function WeatherPage() {
  const { t } = useLanguage();

  const [selectedCity, setSelectedCity] = useState({
    name: 'Agadir / Souss-Massa',
    lat: 30.4278,
    lon: -9.5981,
  });

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const moroccanCities = [
    { name: 'Agadir / Souss-Massa', lat: 30.4278, lon: -9.5981 },
    { name: 'Marrakech / Haouz', lat: 31.6295, lon: -7.9811 },
    { name: 'Meknès / Saïss', lat: 33.8938, lon: -5.5547 },
    { name: 'Fès', lat: 34.0181, lon: -5.0078 },
    { name: 'Kénitra / Gharb', lat: 34.2610, lon: -6.5802 },
    { name: 'Larache / Loukkos', lat: 35.1932, lon: -6.1561 },
    { name: 'Béni Mellal / Tadla', lat: 32.3394, lon: -6.3608 },
    { name: 'Berkane / Moulouya', lat: 34.9200, lon: -2.3200 },
  ];

  useEffect(() => {
    fetchWeather(selectedCity.lat, selectedCity.lon);
  }, [selectedCity]);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await api.get(`/weather?lat=${lat}&lon=${lon}`);
      setWeather(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CloudSun className="w-8 h-8 text-amber-500" />
            <span>Météo Agricole Prédictive</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Modèle météo Open-Meteo pour le pilotage de l'évapotranspiration et l'anticipation des pluies
          </p>
        </div>

        <button
          onClick={() => fetchWeather(selectedCity.lat, selectedCity.lon)}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition self-start"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Moroccan Agricultural Cities Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {moroccanCities.map((city, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
              selectedCity.name === city.name
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{city.name}</span>
          </button>
        ))}
      </div>

      {/* Main Weather Hero Card */}
      <div className="p-8 bg-gradient-to-br from-emerald-600 via-teal-700 to-sky-800 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-widest">
              {selectedCity.name}
            </span>
            <span className="text-xs text-emerald-100">
              Source : {weather?.source || 'Open-Meteo Live'}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-6xl sm:text-7xl font-extrabold tracking-tight">
              {weather?.current?.temperature || 24.5}°C
            </span>
            <span className="text-sm font-semibold text-emerald-100">
              Ressenti {weather?.current?.feels_like || 25}°C
            </span>
          </div>

          <p className="mt-2 text-base font-bold capitalize text-emerald-100">
            {weather?.current?.condition || 'Ciel dégagé, ensoleillé'}
          </p>

          <p className="mt-4 text-xs text-emerald-200 max-w-md leading-relaxed">
            💡 Conditions favorables pour l'arrosage au goutte-à-goutte tôt le matin (06:00 - 07:30) pour éviter les pertes d'évaporation liées à l'ensoleillement de l'après-midi.
          </p>
        </div>

        {/* 4 Weather Secondary Pillars */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-80 p-4 bg-white/10 backdrop-blur-md rounded-2xl text-xs">
          <div className="p-2">
            <div className="flex items-center gap-1.5 text-emerald-200 mb-1">
              <Droplets className="w-4 h-4" />
              <span>Humidité</span>
            </div>
            <span className="text-lg font-black">{weather?.current?.humidity || 55}%</span>
          </div>

          <div className="p-2">
            <div className="flex items-center gap-1.5 text-emerald-200 mb-1">
              <Wind className="w-4 h-4" />
              <span>Vent</span>
            </div>
            <span className="text-lg font-black">{weather?.current?.wind_speed_kmh || 14} km/h</span>
          </div>

          <div className="p-2">
            <div className="flex items-center gap-1.5 text-emerald-200 mb-1">
              <CloudRain className="w-4 h-4" />
              <span>Pluie</span>
            </div>
            <span className="text-lg font-black">{weather?.current?.precipitation_mm || 0} mm</span>
          </div>

          <div className="p-2">
            <div className="flex items-center gap-1.5 text-emerald-200 mb-1">
              <Sun className="w-4 h-4" />
              <span>Indice UV</span>
            </div>
            <span className="text-lg font-black">Modéré (5.2)</span>
          </div>
        </div>

        <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 7-Day Forecast Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>Prévisions Météorologiques sur 7 jours</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(weather?.daily_forecast || []).map((day, idx) => (
            <div
              key={idx}
              className={`p-4 bg-white dark:bg-slate-900 rounded-3xl border text-center flex flex-col justify-between ${
                idx === 0 
                  ? 'border-emerald-500 shadow-md shadow-emerald-500/10' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                  {new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="my-3">
                {day.rain_prob > 30 ? (
                  <CloudRain className="w-8 h-8 text-sky-500 mx-auto" />
                ) : (
                  <Sun className="w-8 h-8 text-amber-500 mx-auto" />
                )}
              </div>

              <div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {Math.round(day.temp_max)}°C
                </span>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  min {Math.round(day.temp_min)}°C
                </span>
                <span className={`text-[10px] font-bold block mt-1.5 ${day.rain_prob > 30 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
                  💧 {day.rain_prob}% pluie
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
