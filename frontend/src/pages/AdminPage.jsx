import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Trees, 
  Cpu, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  Ban, 
  AlertCircle,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, farmsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/farms'),
      ]);
      setStats(statsRes);
      setUsers(usersRes.data || usersRes || []);
      setFarms(farmsRes.data || farmsRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/admin/users/${targetUser.id}`, { status: newStatus });
      setSuccessMsg(`Statut du compte ${targetUser.email} changé à ${newStatus}.`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeRole = async (targetUserId, newRole) => {
    try {
      await api.put(`/admin/users/${targetUserId}`, { role: newRole });
      setSuccessMsg(`Rôle mis à jour.`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-xs text-rose-500 font-bold">
        Accès restreint aux administrateurs de la plateforme AquaSmart.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <span>Administration Centrale de la Plateforme</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervision globale du parc d'agriculteurs, des abonnements SaaS et des exploitations connectées
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Global SaaS Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Utilisateurs</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {stats?.total_users || 3}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.total_farmers || 2} agriculteurs actifs</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exploitations gérées</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {stats?.total_farms || 2}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.total_parcels || 5} parcelles en production</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eau économisée Maroc</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats?.total_water_saved_m3 || 250} <span className="text-xs font-semibold">m³</span>
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Impact hydrique national cumulé</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Abonnements SaaS</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            {stats?.active_subscriptions || 2}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Offres PRO & BUSINESS actives</p>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Gestion des Comptes Utilisateurs</span>
          </h2>
          <span className="text-xs text-slate-400">{users.length} comptes inscrits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="pb-3 font-semibold">Nom & E-mail</th>
                <th className="pb-3 font-semibold">Téléphone</th>
                <th className="pb-3 font-semibold">Rôle</th>
                <th className="pb-3 font-semibold">Formule SaaS</th>
                <th className="pb-3 font-semibold">Statut</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {u.phone || 'Non renseigné'}
                  </td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white"
                    >
                      <option value="farmer">Agriculteur</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {u.status === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        u.status === 'active'
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspendre' : 'Réactiver'}
                    </button>
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
