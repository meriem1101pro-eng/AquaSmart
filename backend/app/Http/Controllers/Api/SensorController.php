<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Parcel;
use App\Models\Sensor;
use App\Models\SensorTelemetry;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SensorController extends Controller
{
    /**
     * List all sensors
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $farmIds = Farm::where('user_id', $user->id)->pluck('id');
        $parcelIds = Parcel::whereIn('farm_id', $farmIds)->pluck('id');

        $query = Sensor::whereIn('parcel_id', $parcelIds)->with('parcel.farm');

        if ($request->has('parcel_id')) {
            $query->where('parcel_id', $request->parcel_id);
        }

        return response()->json($query->get());
    }

    /**
     * Store new sensor
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'parcel_id' => 'required|exists:parcels,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:soil_moisture,soil_temperature,ambient_temperature,air_humidity,water_flow,water_level',
            'unit' => 'nullable|string|max:20',
            'is_simulated' => 'nullable|boolean',
        ]);

        $parcel = Parcel::with('farm')->findOrFail($validated['parcel_id']);
        if ($parcel->farm->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $typeUnits = [
            'soil_moisture' => '%',
            'soil_temperature' => '°C',
            'ambient_temperature' => '°C',
            'air_humidity' => '%',
            'water_flow' => 'L/min',
            'water_level' => '%',
        ];

        $code = 'AQ-' . strtoupper(substr($validated['type'], 0, 3)) . '-' . rand(1000, 9999);
        $apiKey = 'sen_' . Str::random(32);

        $initialVal = match($validated['type']) {
            'soil_moisture' => rand(35, 55),
            'soil_temperature', 'ambient_temperature' => rand(20, 27),
            'air_humidity' => rand(45, 70),
            'water_flow' => rand(25, 45),
            'water_level' => rand(70, 95),
            default => 50,
        };

        $sensor = Sensor::create([
            'parcel_id' => $parcel->id,
            'sensor_code' => $code,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'unit' => $validated['unit'] ?? ($typeUnits[$validated['type']] ?? '%'),
            'status' => 'online',
            'battery_level' => rand(88, 100),
            'last_value' => $initialVal,
            'is_simulated' => $validated['is_simulated'] ?? false,
            'api_key' => $apiKey,
            'last_ping_at' => Carbon::now(),
        ]);

        // Create initial telemetry reading
        SensorTelemetry::create([
            'sensor_id' => $sensor->id,
            'value' => $initialVal,
            'recorded_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Capteur ajouté avec succès.',
            'sensor' => $sensor->load('parcel'),
            'integration_help' => [
                'api_endpoint' => url('/api/sensors/ingest'),
                'auth_header' => "X-Sensor-Key: {$apiKey}",
                'mqtt_topic' => "aquasmart/sensors/{$sensor->sensor_code}/telemetry",
            ]
        ], 201);
    }

    /**
     * Ingestion endpoint for ESP32 / microcontrollers or MQTT bridges
     */
    public function ingest(Request $request)
    {
        $apiKey = $request->header('X-Sensor-Key') ?: $request->input('api_key');
        if (!$apiKey) {
            return response()->json(['message' => 'Clé d\'authentification capteur manquante.'], 401);
        }

        $sensor = Sensor::where('api_key', $apiKey)->first();
        if (!$sensor) {
            return response()->json(['message' => 'Capteur inconnu ou clé invalide.'], 404);
        }

        $validated = $request->validate([
            'value' => 'required|numeric',
            'battery_level' => 'nullable|integer|min:0|max:100',
            'secondary_value' => 'nullable|numeric',
        ]);

        $sensor->last_value = $validated['value'];
        $sensor->status = 'online';
        $sensor->last_ping_at = Carbon::now();
        if (isset($validated['battery_level'])) {
            $sensor->battery_level = $validated['battery_level'];
        }
        $sensor->save();

        SensorTelemetry::create([
            'sensor_id' => $sensor->id,
            'value' => $validated['value'],
            'secondary_value' => $validated['secondary_value'] ?? null,
            'recorded_at' => Carbon::now(),
        ]);

        // Check if value is abnormal and trigger alert
        if ($sensor->type === 'soil_moisture') {
            $parcel = $sensor->parcel;
            if ($parcel) {
                $parcel->update(['current_moisture' => $validated['value']]);
                if ($validated['value'] < $parcel->target_moisture_min) {
                    Alert::create([
                        'user_id' => $parcel->farm->user_id,
                        'farm_id' => $parcel->farm_id,
                        'parcel_id' => $parcel->id,
                        'type' => 'moisture_low',
                        'severity' => 'critical',
                        'title' => "Humidité critique sur {$parcel->name}",
                        'message' => "Le capteur {$sensor->name} indique {$validated['value']}%, sous le seuil minimum de {$parcel->target_moisture_min}%.",
                    ]);
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'sensor_id' => $sensor->id,
            'recorded_at' => Carbon::now()->toIso8601String(),
        ]);
    }

    /**
     * Simulate a sensor reading (Demo Mode)
     */
    public function simulate(Request $request, $id)
    {
        $sensor = Sensor::with('parcel.farm')->findOrFail($id);
        
        // Random natural fluctuation
        $delta = (rand(-20, 20) / 10.0);
        $newVal = max(5.0, min(95.0, round($sensor->last_value + $delta, 1)));
        
        $sensor->update([
            'last_value' => $newVal,
            'status' => 'online',
            'last_ping_at' => Carbon::now(),
            'is_simulated' => true,
        ]);

        SensorTelemetry::create([
            'sensor_id' => $sensor->id,
            'value' => $newVal,
            'recorded_at' => Carbon::now(),
        ]);

        if ($sensor->type === 'soil_moisture' && $sensor->parcel) {
            $sensor->parcel->update(['current_moisture' => $newVal]);
        }

        return response()->json([
            'message' => 'Télémétrie simulée générée avec succès.',
            'sensor' => $sensor,
            'value' => $newVal,
        ]);
    }

    /**
     * Get historical telemetries for charts
     */
    public function telemetry(Request $request, $id)
    {
        $sensor = Sensor::findOrFail($id);
        $readings = SensorTelemetry::where('sensor_id', $sensor->id)
            ->orderBy('recorded_at', 'desc')
            ->take(30)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'sensor' => $sensor,
            'telemetries' => $readings,
        ]);
    }

    /**
     * Delete sensor
     */
    public function destroy(Request $request, $id)
    {
        $sensor = Sensor::with('parcel.farm')->findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'admin' && $sensor->parcel->farm->user_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $sensor->delete();

        return response()->json(['message' => 'Capteur supprimé.']);
    }
}
