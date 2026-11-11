<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Farm;
use App\Models\Parcel;
use App\Models\Sensor;
use App\Models\SensorTelemetry;
use App\Models\Irrigation;
use App\Models\Recommendation;
use App\Models\Alert;
use App\Models\FinancialRecord;
use App\Models\AiConversation;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic Moroccan agricultural data.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@aquasmart.ma'],
            [
                'name' => 'Directeur AquaSmart (Admin)',
                'password' => Hash::make('Admin@1234'),
                'role' => 'admin',
                'phone' => '+212 6 61 00 11 22',
                'plan' => 'business',
                'plan_status' => 'active',
                'status' => 'active',
                'preferred_language' => 'fr',
            ]
        );

        // 2. Farmer User
        $farmer = User::firstOrCreate(
            ['email' => 'agriculteur@aquasmart.ma'],
            [
                'name' => 'Hassan El Amrani',
                'password' => Hash::make('Farmer@1234'),
                'role' => 'farmer',
                'phone' => '+212 6 72 34 56 78',
                'plan' => 'pro',
                'plan_status' => 'active',
                'status' => 'active',
                'preferred_language' => 'fr',
            ]
        );

        // 3. Manager User
        $manager = User::firstOrCreate(
            ['email' => 'gestionnaire@aquasmart.ma'],
            [
                'name' => 'Yassine Bennani',
                'password' => Hash::make('Manager@1234'),
                'role' => 'manager',
                'phone' => '+212 6 63 98 76 54',
                'plan' => 'business',
                'plan_status' => 'active',
                'status' => 'active',
                'preferred_language' => 'ar',
            ]
        );

        // 4. Create Farm 1 for Hassan (Souss-Massa)
        $farm1 = Farm::create([
            'user_id' => $farmer->id,
            'name' => 'Domaine Souss-Massa El Baraka',
            'region' => 'Souss-Massa',
            'city' => 'Oulad Teima / Taroudant',
            'latitude' => 30.4040,
            'longitude' => -9.2310,
            'total_area_ha' => 14.0,
            'water_source' => 'Puits / Forage nappe phréatique (profondeur 95m)',
            'water_cost_per_m3' => 1.95,
            'kwh_cost_mad' => 1.12,
            'notes' => 'Exploitation certifiée GlobalGAP spécialisée dans les agrumes, oliviers et maraîchage de primeur sous goutte-à-goutte.',
        ]);

        // Farm 2 for Manager (Meknès)
        $farm2 = Farm::create([
            'user_id' => $manager->id,
            'name' => 'Domaine Saïss Oulja',
            'region' => 'Fès-Meknès',
            'city' => 'Meknès',
            'latitude' => 33.8938,
            'longitude' => -5.5547,
            'total_area_ha' => 28.5,
            'water_source' => 'Bassin de stockage + Réseau d\'irrigation collectif',
            'water_cost_per_m3' => 1.65,
            'kwh_cost_mad' => 1.08,
            'notes' => 'Grande oliveraie et céréaliculture intensive.',
        ]);

        // 5. Parcelles for Farm 1 with Real Geographic GPS Coordinates in Souss-Massa
        $parcelsData = [
            [
                'farm_id' => $farm1->id,
                'name' => 'Oliveraie Picholine Marocaine',
                'code' => 'PRC-OLI-01',
                'area_ha' => 4.5,
                'crop_type' => 'olivier',
                'crop_variety' => 'Picholine marocaine (AOP)',
                'planting_date' => '2019-02-15',
                'soil_type' => 'argilo_limoneux',
                'irrigation_method' => 'goutte_a_goutte',
                'target_moisture_min' => 32.0,
                'target_moisture_max' => 60.0,
                'current_moisture' => 43.5,
                'current_temperature' => 23.4,
                'soil_ph' => 7.2,
                'status' => 'optimal',
                'boundary_geojson' => [
                    [30.4040, -9.2310],
                    [30.4070, -9.2300],
                    [30.4065, -9.2265],
                    [30.4035, -9.2275]
                ],
            ],
            [
                'farm_id' => $farm1->id,
                'name' => 'Verger Clémentiniers Nules',
                'code' => 'PRC-AGR-02',
                'area_ha' => 3.2,
                'crop_type' => 'agrume',
                'crop_variety' => 'Clémentine Nules',
                'planting_date' => '2020-04-10',
                'soil_type' => 'sablo_limoneux',
                'irrigation_method' => 'goutte_a_goutte',
                'target_moisture_min' => 40.0,
                'target_moisture_max' => 70.0,
                'current_moisture' => 28.5, // needs watering
                'current_temperature' => 25.1,
                'soil_ph' => 6.9,
                'status' => 'needs_watering',
                'boundary_geojson' => [
                    [30.4070, -9.2300],
                    [30.4095, -9.2290],
                    [30.4090, -9.2260],
                    [30.4065, -9.2265]
                ],
            ],
            [
                'farm_id' => $farm1->id,
                'name' => 'Serres Tomates Rondes Export',
                'code' => 'PRC-TOM-03',
                'area_ha' => 2.0,
                'crop_type' => 'tomate',
                'crop_variety' => 'Caniles F1 sous serre canarienne',
                'planting_date' => '2026-09-01',
                'soil_type' => 'sableux',
                'irrigation_method' => 'goutte_a_goutte',
                'target_moisture_min' => 45.0,
                'target_moisture_max' => 75.0,
                'current_moisture' => 58.0,
                'current_temperature' => 26.8,
                'soil_ph' => 6.4,
                'status' => 'optimal',
                'boundary_geojson' => [
                    [30.4040, -9.2260],
                    [30.4065, -9.2265],
                    [30.4090, -9.2260],
                    [30.4070, -9.2230],
                    [30.4040, -9.2235]
                ],
            ],
            [
                'farm_id' => $farm1->id,
                'name' => 'Parcelle Pommes de terre Spunta',
                'code' => 'PRC-POT-04',
                'area_ha' => 2.8,
                'crop_type' => 'pomme_de_terre',
                'crop_variety' => 'Spunta Classe A',
                'planting_date' => '2026-10-12',
                'soil_type' => 'limoneux',
                'irrigation_method' => 'aspersion',
                'target_moisture_min' => 38.0,
                'target_moisture_max' => 68.0,
                'current_moisture' => 65.0,
                'current_temperature' => 22.0,
                'soil_ph' => 6.7,
                'status' => 'harvest_soon',
                'boundary_geojson' => [
                    [30.4010, -9.2310],
                    [30.4040, -9.2310],
                    [30.4035, -9.2275],
                    [30.4005, -9.2280]
                ],
            ],
            [
                'farm_id' => $farm1->id,
                'name' => 'Planches Fraises Fortuna',
                'code' => 'PRC-FRA-05',
                'area_ha' => 1.5,
                'crop_type' => 'fraise',
                'crop_variety' => 'Fortuna primeur',
                'planting_date' => '2026-09-20',
                'soil_type' => 'sableux',
                'irrigation_method' => 'goutte_a_goutte',
                'target_moisture_min' => 42.0,
                'target_moisture_max' => 70.0,
                'current_moisture' => 49.0,
                'current_temperature' => 24.0,
                'soil_ph' => 6.2,
                'status' => 'optimal',
                'boundary_geojson' => [
                    [30.4035, -9.2275],
                    [30.4040, -9.2260],
                    [30.4020, -9.2240],
                    [30.4010, -9.2265]
                ],
            ],
        ];

        $parcels = [];
        foreach ($parcelsData as $p) {
            $parcels[] = Parcel::create($p);
        }

        // 6. IoT Sensors for Parcels
        $p1 = $parcels[0]; // Oliviers
        $p2 = $parcels[1]; // Agrumes
        $p3 = $parcels[2]; // Tomates

        $sensors = [
            [
                'parcel_id' => $p1->id,
                'sensor_code' => 'AQ-MST-101',
                'name' => 'Sonde Humidité Racine 30cm',
                'type' => 'soil_moisture',
                'status' => 'online',
                'battery_level' => 96,
                'last_value' => 43.5,
                'unit' => '%',
                'is_simulated' => false,
                'api_key' => 'sen_live_souss_p1_mst30',
                'last_ping_at' => Carbon::now()->subMinutes(8),
            ],
            [
                'parcel_id' => $p1->id,
                'sensor_code' => 'AQ-TMP-102',
                'name' => 'Sonde Température Sol',
                'type' => 'soil_temperature',
                'status' => 'online',
                'battery_level' => 92,
                'last_value' => 23.4,
                'unit' => '°C',
                'is_simulated' => false,
                'api_key' => 'sen_live_souss_p1_tmp',
                'last_ping_at' => Carbon::now()->subMinutes(12),
            ],
            [
                'parcel_id' => $p2->id,
                'sensor_code' => 'AQ-MST-201',
                'name' => 'Sonde Humidité Horizon 40cm',
                'type' => 'soil_moisture',
                'status' => 'warning',
                'battery_level' => 84,
                'last_value' => 28.5, // low moisture
                'unit' => '%',
                'is_simulated' => false,
                'api_key' => 'sen_live_souss_p2_mst',
                'last_ping_at' => Carbon::now()->subMinutes(4),
            ],
            [
                'parcel_id' => $p2->id,
                'sensor_code' => 'AQ-FLW-202',
                'name' => 'Débitmètre Rampe Nord Goutteurs',
                'type' => 'water_flow',
                'status' => 'online',
                'battery_level' => 98,
                'last_value' => 38.2,
                'unit' => 'L/min',
                'is_simulated' => false,
                'api_key' => 'sen_live_souss_p2_flw',
                'last_ping_at' => Carbon::now()->subMinutes(15),
            ],
            [
                'parcel_id' => $p3->id,
                'sensor_code' => 'AQ-HUM-301',
                'name' => 'Capteur Hygrométrie Serre',
                'type' => 'air_humidity',
                'status' => 'online',
                'battery_level' => 89,
                'last_value' => 64.0,
                'unit' => '%',
                'is_simulated' => false,
                'api_key' => 'sen_live_souss_p3_hum',
                'last_ping_at' => Carbon::now()->subMinutes(5),
            ],
            [
                'parcel_id' => $p1->id,
                'sensor_code' => 'AQ-WLV-001',
                'name' => 'Jauge Niveau Réserve Puits 95m',
                'type' => 'water_level',
                'status' => 'online',
                'battery_level' => 95,
                'last_value' => 82.0,
                'unit' => '%',
                'is_simulated' => true,
                'api_key' => 'sen_live_souss_wlv',
                'last_ping_at' => Carbon::now()->subMinutes(2),
            ],
        ];

        foreach ($sensors as $sData) {
            $createdSensor = Sensor::create($sData);
            // Create 10 historical telemetries for chart display
            for ($i = 9; $i >= 0; $i--) {
                SensorTelemetry::create([
                    'sensor_id' => $createdSensor->id,
                    'value' => round($sData['last_value'] + (rand(-15, 15) / 10.0), 1),
                    'recorded_at' => Carbon::now()->subHours($i * 2),
                ]);
            }
        }

        // 7. Completed Irrigations for Farm 1
        $irrigationLogs = [
            [
                'parcel_id' => $p1->id,
                'scheduled_at' => Carbon::now()->subDays(1)->setTime(6, 0),
                'started_at' => Carbon::now()->subDays(1)->setTime(6, 0),
                'ended_at' => Carbon::now()->subDays(1)->setTime(7, 15),
                'duration_minutes' => 75,
                'water_volume_m3' => 38.5,
                'liters_per_ha' => 8555,
                'status' => 'completed',
                'mode' => 'smart_recommended',
                'cost_mad' => 92.40,
                'energy_kwh' => 17.3,
                'savings_liters' => 12500,
                'notes' => 'Irrigation programmée matinale. Réduction d\'évaporation estimée à 22%.',
            ],
            [
                'parcel_id' => $p3->id,
                'scheduled_at' => Carbon::now()->subDays(2)->setTime(6, 30),
                'started_at' => Carbon::now()->subDays(2)->setTime(6, 30),
                'ended_at' => Carbon::now()->subDays(2)->setTime(7, 10),
                'duration_minutes' => 40,
                'water_volume_m3' => 18.0,
                'liters_per_ha' => 9000,
                'status' => 'completed',
                'mode' => 'smart_recommended',
                'cost_mad' => 43.20,
                'energy_kwh' => 8.1,
                'savings_liters' => 6200,
                'notes' => 'Cycle de goutte-à-goutte fertilisant (fertigation) sous serre.',
            ],
            [
                'parcel_id' => $p1->id,
                'scheduled_at' => Carbon::now()->subDays(4)->setTime(5, 45),
                'started_at' => Carbon::now()->subDays(4)->setTime(5, 45),
                'ended_at' => Carbon::now()->subDays(4)->setTime(7, 0),
                'duration_minutes' => 75,
                'water_volume_m3' => 36.0,
                'liters_per_ha' => 8000,
                'status' => 'completed',
                'mode' => 'manual',
                'cost_mad' => 86.40,
                'energy_kwh' => 16.2,
                'savings_liters' => 8000,
                'notes' => 'Apport complémentaire après épisode de vent d\'est.',
            ],
        ];

        foreach ($irrigationLogs as $irr) {
            Irrigation::create($irr);
        }

        // 8. Pending Smart Recommendation for the low moisture Agrumes parcel (P2)
        Recommendation::create([
            'parcel_id' => $p2->id,
            'recommended_date' => Carbon::today()->toDateString(),
            'recommended_start_time' => '06:30:00',
            'recommended_volume_m3' => 42.0,
            'duration_minutes' => 65,
            'reason' => 'Humidité du sol à 28.5% sous le seuil d\'alerte (40%). Température prévue 25°C. Apport recommandé à l\'aube pour préserver la floraison.',
            'soil_moisture_current' => 28.5,
            'eto_mm' => 4.3,
            'rain_forecast_mm' => 0.0,
            'status' => 'pending',
            'confidence_score' => 96,
        ]);

        // 9. Alerts
        Alert::create([
            'user_id' => $farmer->id,
            'farm_id' => $farm1->id,
            'parcel_id' => $p2->id,
            'type' => 'moisture_low',
            'severity' => 'warning',
            'title' => 'Déficit hydrique détecté : Verger Clémentiniers',
            'message' => 'L\'humidité de la parcelle PRC-AGR-02 est descendue à 28.5% (seuil min : 40%). Une irrigation de 42 m³ est recommandée.',
            'is_read' => false,
        ]);

        Alert::create([
            'user_id' => $farmer->id,
            'farm_id' => $farm1->id,
            'parcel_id' => null,
            'type' => 'irrigation_due',
            'severity' => 'info',
            'title' => 'Créneau d\'irrigation favorable demain à 06:30',
            'message' => 'Température douce (16°C à l\'aube), vent faible (8 km/h). Moment parfait pour minimiser l\'évapotranspiration.',
            'is_read' => false,
        ]);

        Alert::create([
            'user_id' => $farmer->id,
            'farm_id' => $farm1->id,
            'parcel_id' => null,
            'type' => 'water_waste_risk',
            'severity' => 'info',
            'title' => 'Économie d\'eau réalisée ce mois-ci',
            'message' => 'Félicitations Hassan ! Votre pilotage intelligent AquaSmart a déjà permis d\'économiser 68 500 litres d\'eau.',
            'is_read' => true,
        ]);

        // 10. Financial Records for Farm 1
        FinancialRecord::create([
            'farm_id' => $farm1->id,
            'year' => (int)date('Y'),
            'month' => (int)date('m'),
            'water_cost_mad' => 1420.00,
            'electricity_cost_mad' => 790.00,
            'maintenance_cost_mad' => 210.00,
            'budget_mad' => 3000.00,
            'water_consumed_m3' => 450.0,
            'water_saved_m3' => 215.0,
        ]);

        // 11. Initial AI Chat message
        AiConversation::create([
            'user_id' => $farmer->id,
            'session_id' => 'initial-session-farmer',
            'role' => 'assistant',
            'content' => "Marhaban Hassan ! Bienvenue sur **AquaSmart AI**. J'ai analysé l'état de vos 5 parcelles sur le Domaine Souss-Massa. La parcelle de clémentiniers (PRC-AGR-02) requiert un apport de 42 m³ aujourd'hui. Comment puis-je vous aider ?",
        ]);

        // 12. Active Subscription
        Subscription::create([
            'user_id' => $farmer->id,
            'plan_name' => 'PRO',
            'amount_mad' => 299.00,
            'billing_cycle' => 'monthly',
            'payment_method' => 'test_mode',
            'status' => 'active',
            'starts_at' => Carbon::now()->subDays(10),
            'ends_at' => Carbon::now()->addDays(20),
        ]);
    }
}
