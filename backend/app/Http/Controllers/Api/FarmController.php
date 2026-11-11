<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use Illuminate\Http\Request;

class FarmController extends Controller
{
    /**
     * List farms belonging to the user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Farm::with(['parcels.sensors']);

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get());
    }

    /**
     * Store a new farm
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Enforce SaaS plan limitations
        $farmCount = Farm::where('user_id', $user->id)->count();
        if ($user->plan === 'free' && $farmCount >= 1) {
            return response()->json([
                'message' => 'La formule FREE est limitée à 1 exploitation agricole. Veuillez passer à PRO ou BUSINESS pour en ajouter davantage.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'region' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'total_area_ha' => 'required|numeric|min:0.1',
            'water_source' => 'required|string|max:255',
            'water_cost_per_m3' => 'nullable|numeric|min:0',
            'kwh_cost_mad' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $user->id;
        $farm = Farm::create($validated);

        return response()->json([
            'message' => 'Exploitation créée avec succès.',
            'farm' => $farm->load('parcels'),
        ], 201);
    }

    /**
     * Show single farm with parcels and sensors
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $farm = Farm::with(['parcels.sensors', 'financialRecords'])->findOrFail($id);

        if ($user->role !== 'admin' && $farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json($farm);
    }

    /**
     * Update farm
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $farm = Farm::findOrFail($id);

        if ($user->role !== 'admin' && $farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'region' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'total_area_ha' => 'required|numeric|min:0.1',
            'water_source' => 'required|string|max:255',
            'water_cost_per_m3' => 'nullable|numeric|min:0',
            'kwh_cost_mad' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $farm->update($validated);

        return response()->json([
            'message' => 'Exploitation mise à jour.',
            'farm' => $farm->fresh(['parcels']),
        ]);
    }

    /**
     * Delete farm
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $farm = Farm::findOrFail($id);

        if ($user->role !== 'admin' && $farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $farm->delete();

        return response()->json([
            'message' => 'Exploitation supprimée avec succès.'
        ]);
    }
}
