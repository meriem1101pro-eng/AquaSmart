<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Parcel;
use Illuminate\Http\Request;

class ParcelController extends Controller
{
    /**
     * List parcels
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Parcel::with(['farm', 'sensors']);

        if ($request->has('farm_id')) {
            $farm = Farm::findOrFail($request->farm_id);
            if ($user->role !== 'admin' && $farm->user_id !== $user->id) {
                return response()->json(['message' => 'Accès non autorisé.'], 403);
            }
            $query->where('farm_id', $request->farm_id);
        } else if ($user->role !== 'admin') {
            $farmIds = Farm::where('user_id', $user->id)->pluck('id');
            $query->whereIn('farm_id', $farmIds);
        }

        return response()->json($query->get());
    }

    /**
     * Store a new parcel
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'farm_id' => 'required|exists:farms,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:parcels,code',
            'area_ha' => 'required|numeric|min:0.05',
            'crop_type' => 'required|string|max:100',
            'crop_variety' => 'nullable|string|max:100',
            'planting_date' => 'nullable|date',
            'soil_type' => 'required|string|max:100',
            'irrigation_method' => 'required|string|max:100',
            'target_moisture_min' => 'nullable|numeric|min:10|max:80',
            'target_moisture_max' => 'nullable|numeric|min:20|max:95',
            'current_moisture' => 'nullable|numeric|min:0|max:100',
            'current_temperature' => 'nullable|numeric',
            'soil_ph' => 'nullable|numeric|min:3|max:10',
            'status' => 'nullable|string',
            'boundary_geojson' => 'nullable|array',
        ]);

        $farm = Farm::findOrFail($validated['farm_id']);
        if ($user->role !== 'admin' && $farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        // Generate unique code if omitted
        if (empty($validated['code'])) {
            $prefix = strtoupper(substr($validated['crop_type'], 0, 3));
            $validated['code'] = "PRC-{$prefix}-" . rand(1000, 9999);
        }

        // Set default realistic initial moisture and temp
        if (!isset($validated['current_moisture'])) {
            $validated['current_moisture'] = rand(38, 55);
        }
        if (!isset($validated['current_temperature'])) {
            $validated['current_temperature'] = rand(21, 26);
        }

        $parcel = Parcel::create($validated);

        return response()->json([
            'message' => 'Parcelle créée avec succès.',
            'parcel' => $parcel->load(['farm', 'sensors']),
        ], 201);
    }

    /**
     * Show parcel
     */
    public function show(Request $request, $id)
    {
        $parcel = Parcel::with(['farm', 'sensors', 'irrigations' => function($q) {
            $q->latest()->take(10);
        }, 'recommendations' => function($q) {
            $q->latest()->take(5);
        }])->findOrFail($id);

        $user = $request->user();
        if ($user->role !== 'admin' && $parcel->farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json($parcel);
    }

    /**
     * Update parcel
     */
    public function update(Request $request, $id)
    {
        $parcel = Parcel::with('farm')->findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'admin' && $parcel->farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'area_ha' => 'required|numeric|min:0.05',
            'crop_type' => 'required|string|max:100',
            'crop_variety' => 'nullable|string|max:100',
            'planting_date' => 'nullable|date',
            'soil_type' => 'required|string|max:100',
            'irrigation_method' => 'required|string|max:100',
            'target_moisture_min' => 'nullable|numeric',
            'target_moisture_max' => 'nullable|numeric',
            'current_moisture' => 'nullable|numeric',
            'current_temperature' => 'nullable|numeric',
            'soil_ph' => 'nullable|numeric',
            'status' => 'nullable|string',
            'boundary_geojson' => 'nullable|array',
        ]);

        $parcel->update($validated);

        return response()->json([
            'message' => 'Parcelle mise à jour.',
            'parcel' => $parcel->fresh(['farm', 'sensors']),
        ]);
    }

    /**
     * Delete parcel
     */
    public function destroy(Request $request, $id)
    {
        $parcel = Parcel::with('farm')->findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'admin' && $parcel->farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $parcel->delete();

        return response()->json([
            'message' => 'Parcelle supprimée avec succès.'
        ]);
    }
}
