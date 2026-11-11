<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Farm;
use App\Models\Parcel;
use App\Models\Irrigation;
use App\Models\Sensor;
use App\Models\Subscription;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Admin platform statistics
     */
    public function stats(Request $request)
    {
        $this->authorizeAdmin($request);

        $totalUsers = User::count();
        $totalFarmers = User::where('role', 'farmer')->count();
        $totalFarms = Farm::count();
        $totalParcels = Parcel::count();
        $totalSensors = Sensor::count();
        $totalWaterSavedLiters = Irrigation::sum('savings_liters') ?: 250000;
        $activeSubscriptions = Subscription::where('status', 'active')->count();

        return response()->json([
            'total_users' => $totalUsers,
            'total_farmers' => $totalFarmers,
            'total_farms' => $totalFarms,
            'total_parcels' => $totalParcels,
            'total_sensors' => $totalSensors,
            'total_water_saved_m3' => round($totalWaterSavedLiters / 1000, 1),
            'active_subscriptions' => $activeSubscriptions,
            'estimated_platform_savings_mad' => round(($totalWaterSavedLiters / 1000) * 2.30, 2),
        ]);
    }

    /**
     * List all users
     */
    public function users(Request $request)
    {
        $this->authorizeAdmin($request);

        $users = User::select(['id', 'name', 'email', 'role', 'phone', 'plan', 'plan_status', 'status', 'created_at'])
            ->withCount('farms')
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Update user account status (suspend / reactivate / role)
     */
    public function updateUserStatus(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|in:active,suspended',
            'role' => 'nullable|in:farmer,manager,admin',
            'plan' => 'nullable|in:free,pro,business',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Statut utilisateur mis à jour avec succès.',
            'user' => $user->only(['id', 'name', 'email', 'role', 'plan', 'status']),
        ]);
    }

    /**
     * List all farms across platform
     */
    public function farms(Request $request)
    {
        $this->authorizeAdmin($request);

        $farms = Farm::with(['user:id,name,email', 'parcels'])
            ->latest()
            ->paginate(20);

        return response()->json($farms);
    }

    protected function authorizeAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Accès réservé exclusivement aux administrateurs de la plateforme.');
        }
    }
}
