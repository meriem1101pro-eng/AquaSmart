<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Parcel;
use App\Models\Irrigation;
use App\Models\Recommendation;
use App\Models\Alert;
use App\Services\SmartIrrigationService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SmartIrrigationController extends Controller
{
    protected SmartIrrigationService $irrigationService;

    public function __construct(SmartIrrigationService $irrigationService)
    {
        $this->irrigationService = $irrigationService;
    }

    /**
     * Get or compute smart irrigation recommendations
     */
    public function getRecommendations(Request $request)
    {
        $user = $request->user();
        $farmIds = Farm::where('user_id', $user->id)->pluck('id');
        $parcels = Parcel::whereIn('farm_id', $farmIds)->with('farm')->get();

        $recommendations = [];
        foreach ($parcels as $parcel) {
            $recData = $this->irrigationService->calculateRecommendation($parcel);
            
            // Check if there's an existing pending record or create one
            $rec = Recommendation::updateOrCreate(
                [
                    'parcel_id' => $parcel->id,
                    'recommended_date' => Carbon::today()->toDateString(),
                    'status' => 'pending',
                ],
                [
                    'recommended_start_time' => $recData['recommended_start_time'],
                    'recommended_volume_m3' => $recData['recommended_volume_m3'],
                    'duration_minutes' => $recData['duration_minutes'],
                    'reason' => $recData['reason'],
                    'soil_moisture_current' => $recData['current_moisture'],
                    'eto_mm' => $recData['eto_mm'],
                    'rain_forecast_mm' => $recData['rain_forecast_mm'],
                    'confidence_score' => $recData['confidence_score'],
                ]
            );

            $recommendations[] = [
                'id' => $rec->id,
                'parcel_id' => $parcel->id,
                'parcel_name' => $parcel->name,
                'farm_name' => $parcel->farm->name,
                'crop_type' => $parcel->crop_type,
                'area_ha' => $parcel->area_ha,
                'current_moisture' => $parcel->current_moisture,
                'recommended_volume_m3' => $recData['recommended_volume_m3'],
                'duration_minutes' => $recData['duration_minutes'],
                'recommended_start_time' => $recData['recommended_start_time'],
                'skip_irrigation' => $recData['skip_irrigation'],
                'reason' => $recData['reason'],
                'estimated_savings_liters' => $recData['estimated_savings_liters'],
                'confidence_score' => $recData['confidence_score'],
                'status' => $rec->status,
                'disclaimer' => 'Recommandation agronomique indicative basée sur les paramètres FAO-56. L\'agriculteur valide les apports selon les observations de terrain.',
            ];
        }

        return response()->json($recommendations);
    }

    /**
     * Apply and execute a recommendation
     */
    public function applyRecommendation(Request $request, $id)
    {
        $user = $request->user();
        $recommendation = Recommendation::with('parcel.farm')->findOrFail($id);

        if ($recommendation->parcel->farm->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $parcel = $recommendation->parcel;
        $volumeM3 = $recommendation->recommended_volume_m3;
        $duration = $recommendation->duration_minutes;

        // Calculate costs in MAD & water savings
        $waterRate = $parcel->farm->water_cost_per_m3 ?? 1.80;
        $kwhRate = $parcel->farm->kwh_cost_mad ?? 1.10;
        // Pumping 1 m³ typically consumes ~0.45 kWh
        $kwhUsed = round($volumeM3 * 0.45, 1);
        $costMad = round(($volumeM3 * $waterRate) + ($kwhUsed * $kwhRate), 2);
        
        // Estimated savings vs non-optimized flood
        $savingsLiters = round($volumeM3 * 0.35 * 1000);

        // Record completed irrigation
        $irrigation = Irrigation::create([
            'parcel_id' => $parcel->id,
            'scheduled_at' => Carbon::now(),
            'started_at' => Carbon::now(),
            'ended_at' => Carbon::now()->addMinutes($duration),
            'duration_minutes' => $duration,
            'water_volume_m3' => $volumeM3,
            'liters_per_ha' => $parcel->area_ha > 0 ? round(($volumeM3 * 1000) / $parcel->area_ha) : 0,
            'status' => 'completed',
            'mode' => 'smart_recommended',
            'weather_conditions' => 'Optimisé tôt le matin, évaporation minimale',
            'cost_mad' => $costMad,
            'energy_kwh' => $kwhUsed,
            'savings_liters' => $savingsLiters,
            'notes' => 'Irrigation validée via AquaSmart Smart Irrigation AI.',
        ]);

        // Update parcel moisture to optimal
        $newMoisture = min($parcel->target_moisture_max, $parcel->current_moisture + 18.0);
        $parcel->update([
            'current_moisture' => $newMoisture,
            'status' => 'optimal',
        ]);

        $recommendation->update(['status' => 'applied']);

        return response()->json([
            'message' => "Cycle d'irrigation validé et exécuté avec succès pour {$parcel->name}.",
            'irrigation' => $irrigation,
            'new_moisture' => $newMoisture,
            'savings_liters' => $savingsLiters,
            'cost_mad' => $costMad,
        ]);
    }

    /**
     * Log manual irrigation entry
     */
    public function logIrrigation(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'parcel_id' => 'required|exists:parcels,id',
            'duration_minutes' => 'required|integer|min:5|max:600',
            'water_volume_m3' => 'required|numeric|min:0.5',
            'scheduled_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $parcel = Parcel::with('farm')->findOrFail($validated['parcel_id']);
        if ($parcel->farm->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $volumeM3 = $validated['water_volume_m3'];
        $waterRate = $parcel->farm->water_cost_per_m3 ?? 1.80;
        $kwhRate = $parcel->farm->kwh_cost_mad ?? 1.10;
        $kwhUsed = round($volumeM3 * 0.45, 1);
        $costMad = round(($volumeM3 * $waterRate) + ($kwhUsed * $kwhRate), 2);

        $irrigation = Irrigation::create([
            'parcel_id' => $parcel->id,
            'scheduled_at' => $validated['scheduled_at'] ?? Carbon::now(),
            'started_at' => Carbon::now(),
            'ended_at' => Carbon::now()->addMinutes($validated['duration_minutes']),
            'duration_minutes' => $validated['duration_minutes'],
            'water_volume_m3' => $volumeM3,
            'liters_per_ha' => $parcel->area_ha > 0 ? round(($volumeM3 * 1000) / $parcel->area_ha) : 0,
            'status' => 'completed',
            'mode' => 'manual',
            'cost_mad' => $costMad,
            'energy_kwh' => $kwhUsed,
            'savings_liters' => round($volumeM3 * 0.20 * 1000),
            'notes' => $validated['notes'] ?? 'Saisie manuelle',
        ]);

        // Increase parcel moisture
        $newMoisture = min(85.0, $parcel->current_moisture + 15.0);
        $parcel->update([
            'current_moisture' => $newMoisture,
            'status' => 'optimal',
        ]);

        return response()->json([
            'message' => 'Irrigation enregistrée avec succès dans la base de données.',
            'irrigation' => $irrigation,
        ], 201);
    }

    /**
     * History of irrigation logs
     */
    public function history(Request $request)
    {
        $user = $request->user();
        $farmIds = Farm::where('user_id', $user->id)->pluck('id');
        $parcelIds = Parcel::whereIn('farm_id', $farmIds)->pluck('id');

        $query = Irrigation::whereIn('parcel_id', $parcelIds)->with('parcel.farm')->latest();

        if ($request->has('parcel_id')) {
            $query->where('parcel_id', $request->parcel_id);
        }

        return response()->json($query->paginate(25));
    }
}
