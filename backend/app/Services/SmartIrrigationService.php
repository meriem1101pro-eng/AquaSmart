<?php

namespace App\Services;

use App\Models\Parcel;

class SmartIrrigationService
{
    /**
     * Standard crop coefficients (Kc) per Moroccan crop type
     */
    protected static array $cropKc = [
        'olivier' => ['init' => 0.50, 'mid' => 0.65, 'end' => 0.70, 'name' => 'Oliviers'],
        'agrume' => ['init' => 0.65, 'mid' => 0.70, 'end' => 0.70, 'name' => 'Agrumes'],
        'tomate' => ['init' => 0.60, 'mid' => 1.15, 'end' => 0.80, 'name' => 'Tomates'],
        'pomme_de_terre' => ['init' => 0.50, 'mid' => 1.05, 'end' => 0.75, 'name' => 'Pommes de terre'],
        'ble' => ['init' => 0.40, 'mid' => 1.15, 'end' => 0.40, 'name' => 'Blé dur/tendre'],
        'fraise' => ['init' => 0.50, 'mid' => 0.85, 'end' => 0.75, 'name' => 'Fraises'],
        'autre' => ['init' => 0.50, 'mid' => 0.80, 'end' => 0.60, 'name' => 'Culture générale'],
    ];

    /**
     * Soil water retention factor (Readily Available Water RAW factor in mm/m)
     */
    protected static array $soilProperties = [
        'sableux' => ['field_capacity' => 12.0, 'wilting_point' => 4.0, 'infiltration_rate' => 30.0],
        'sablo_limoneux' => ['field_capacity' => 18.0, 'wilting_point' => 7.0, 'infiltration_rate' => 20.0],
        'limoneux' => ['field_capacity' => 28.0, 'wilting_point' => 12.0, 'infiltration_rate' => 15.0],
        'argilo_limoneux' => ['field_capacity' => 32.0, 'wilting_point' => 16.0, 'infiltration_rate' => 10.0],
        'argileux' => ['field_capacity' => 40.0, 'wilting_point' => 22.0, 'infiltration_rate' => 5.0],
    ];

    /**
     * Calculate smart irrigation recommendation for a given parcel
     */
    public function calculateRecommendation(Parcel $parcel, array $weather = []): array
    {
        $temp = $weather['temperature'] ?? $parcel->current_temperature ?? 24.0;
        $humidity = $weather['humidity'] ?? 50.0;
        $rainForecast = $weather['rain_mm'] ?? 0.0;
        $windSpeed = $weather['wind_kmh'] ?? 12.0;

        // 1. Calculate Reference Evapotranspiration (ETo) using modified Hargreaves/FAO estimate
        $eto = round(0.0023 * ($temp + 17.8) * sqrt(max(6, $temp * 0.45)) * (1.0 - ($humidity / 250.0)), 2);
        $eto = max(2.5, min(8.5, $eto));

        // 2. Crop Kc factor
        $cropKey = strtolower($parcel->crop_type);
        $kcInfo = self::$cropKc[$cropKey] ?? self::$cropKc['autre'];
        $kc = $kcInfo['mid'];

        // 3. Crop Evapotranspiration ETc = ETo * Kc (in mm/day)
        $etc = round($eto * $kc, 2);

        // 4. Soil water deficit based on current moisture vs target
        $currentMoist = $parcel->current_moisture;
        $targetMoist = ($parcel->target_moisture_min + $parcel->target_moisture_max) / 2.0;
        $deficitPercent = max(0, $targetMoist - $currentMoist);

        // 5. Net water requirement (mm)
        // 1 mm of water over 1 hectare = 10 m³
        $netWaterMm = max(0, ($etc * 1.1) + ($deficitPercent * 0.25) - $rainForecast);

        // If rain > 7mm expected, recommend skipping or delaying
        $skipIrrigation = false;
        $recommendationReason = "";

        if ($rainForecast >= 8.0) {
            $skipIrrigation = true;
            $recommendedVolumeM3 = 0;
            $durationMinutes = 0;
            $recommendationReason = "Précipitations prévues de {$rainForecast} mm. Il est recommandé de suspendre l'irrigation pour économiser l'eau.";
        } elseif ($currentMoist >= $parcel->target_moisture_max) {
            $skipIrrigation = true;
            $recommendedVolumeM3 = 0;
            $durationMinutes = 0;
            $recommendationReason = "Humidité actuelle optimale ({$currentMoist}%). Aucun apport d'eau requis aujourd'hui.";
        } else {
            // Volume in m³ = mm * 10 * area_ha / efficiency
            $efficiency = match($parcel->irrigation_method) {
                'goutte_a_goutte' => 0.90,
                'aspersion' => 0.75,
                'pivot' => 0.80,
                'gravitaire' => 0.55,
                default => 0.85
            };

            $recommendedVolumeM3 = round(($netWaterMm * 10.0 * $parcel->area_ha) / $efficiency, 1);
            
            // Standard system flow rate ~ 35 m³/ha/hour for drip or sprinkler
            $systemFlowPerHour = max(10.0, $parcel->area_ha * 22.0);
            $durationMinutes = min(240, max(20, round(($recommendedVolumeM3 / $systemFlowPerHour) * 60)));

            // Recommended time: early morning or evening
            $isSummer = ($temp > 28);
            $bestTime = $isSummer ? '06:00:00' : '07:30:00';

            $recommendationReason = "Besoin hydrique estimé à {$etc} mm/j (Kc={$kc}). Sol {$parcel->soil_type} avec déficit de " . round($deficitPercent, 1) . "%. Apport recommandé à {$bestTime} pour minimiser l'évaporation.";
        }

        // Traditional vs optimized savings
        $traditionalVolumeM3 = $recommendedVolumeM3 > 0 ? round($recommendedVolumeM3 * 1.35, 1) : 0;
        $savedLiters = max(0, ($traditionalVolumeM3 - $recommendedVolumeM3) * 1000);

        return [
            'parcel_id' => $parcel->id,
            'parcel_name' => $parcel->name,
            'crop_name' => $kcInfo['name'],
            'eto_mm' => $eto,
            'etc_mm' => $etc,
            'rain_forecast_mm' => $rainForecast,
            'current_moisture' => $currentMoist,
            'recommended_volume_m3' => $recommendedVolumeM3,
            'duration_minutes' => $durationMinutes,
            'recommended_start_time' => '06:30:00',
            'skip_irrigation' => $skipIrrigation,
            'reason' => $recommendationReason,
            'estimated_savings_liters' => $savedLiters,
            'confidence_score' => 95,
        ];
    }
}
