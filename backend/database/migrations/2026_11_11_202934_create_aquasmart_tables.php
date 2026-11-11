<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add fields to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('farmer')->after('email'); // farmer, manager, admin
            $table->string('phone')->nullable()->after('role');
            $table->string('avatar')->nullable()->after('phone');
            $table->string('plan')->default('free')->after('avatar'); // free, pro, business
            $table->string('plan_status')->default('active')->after('plan');
            $table->string('status')->default('active')->after('plan_status'); // active, suspended
            $table->string('preferred_language')->default('fr')->after('status'); // fr, ar, dar
        });

        // Farms (Exploitations)
        Schema::create('farms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('region')->default('Souss-Massa'); // Souss-Massa, Gharb, Saïss, Haouz, Tadla, etc.
            $table->string('city')->nullable();
            $table->decimal('latitude', 10, 7)->default(30.4278);
            $table->decimal('longitude', 10, 7)->default(-9.5981);
            $table->decimal('total_area_ha', 8, 2)->default(10.0);
            $table->string('water_source')->default('Puits / Nappe phréatique');
            $table->decimal('water_cost_per_m3', 8, 2)->default(1.80); // in MAD
            $table->decimal('kwh_cost_mad', 8, 2)->default(1.10); // in MAD
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Parcels (Parcelles)
        Schema::create('parcels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('area_ha', 8, 2)->default(2.5);
            $table->string('crop_type'); // olivier, agrume, tomate, pomme_de_terre, ble, fraise, custom
            $table->string('crop_variety')->nullable();
            $table->date('planting_date')->nullable();
            $table->string('soil_type')->default('argilo_limoneux'); // argileux, sableux, limoneux, argilo_limoneux, etc.
            $table->string('irrigation_method')->default('goutte_a_goutte'); // goutte_a_goutte, aspersion, pivot, gravitaire
            $table->float('target_moisture_min')->default(35.0); // %
            $table->float('target_moisture_max')->default(65.0); // %
            $table->float('current_moisture')->default(42.0); // %
            $table->float('current_temperature')->default(24.5); // °C
            $table->float('soil_ph')->default(6.8);
            $table->string('status')->default('optimal'); // optimal, needs_watering, watering_now, harvest_soon
            $table->json('boundary_geojson')->nullable(); // Polygon coordinates for map
            $table->timestamps();
        });

        // Sensors (Capteurs IoT)
        Schema::create('sensors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->constrained()->cascadeOnDelete();
            $table->string('sensor_code')->unique();
            $table->string('name');
            $table->string('type'); // soil_moisture, soil_temperature, ambient_temperature, air_humidity, water_flow, water_level
            $table->string('status')->default('online'); // online, offline, warning
            $table->integer('battery_level')->default(95); // %
            $table->float('last_value')->default(45.0);
            $table->string('unit')->default('%');
            $table->boolean('is_simulated')->default(false);
            $table->string('api_key')->unique();
            $table->timestamp('last_ping_at')->nullable();
            $table->timestamps();
        });

        // Sensor Telemetries
        Schema::create('sensor_telemetries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained()->cascadeOnDelete();
            $table->float('value');
            $table->float('secondary_value')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
            $table->index(['sensor_id', 'recorded_at']);
        });

        // Irrigations (Cycles & Logs)
        Schema::create('irrigations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->constrained()->cascadeOnDelete();
            $table->timestamp('scheduled_at');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_minutes')->default(45);
            $table->decimal('water_volume_m3', 10, 2)->default(25.0);
            $table->decimal('liters_per_ha', 10, 2)->default(10000.0);
            $table->string('status')->default('completed'); // scheduled, in_progress, completed, cancelled
            $table->string('mode')->default('smart_recommended'); // smart_recommended, manual
            $table->string('weather_conditions')->nullable();
            $table->decimal('cost_mad', 10, 2)->default(45.0);
            $table->decimal('energy_kwh', 10, 2)->default(18.5);
            $table->decimal('savings_liters', 12, 2)->default(4500.0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Smart Recommendations
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcel_id')->constrained()->cascadeOnDelete();
            $table->date('recommended_date');
            $table->time('recommended_start_time')->default('06:00:00');
            $table->decimal('recommended_volume_m3', 8, 2);
            $table->integer('duration_minutes')->default(60);
            $table->text('reason');
            $table->float('soil_moisture_current')->default(38.0);
            $table->float('eto_mm')->default(4.2);
            $table->float('rain_forecast_mm')->default(0.0);
            $table->string('status')->default('pending'); // pending, applied, dismissed
            $table->integer('confidence_score')->default(94); // %
            $table->timestamps();
        });

        // Alerts & Notifications
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('farm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('parcel_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // moisture_low, water_waste_risk, abnormal_consumption, rain_forecast, sensor_offline, irrigation_due, budget_exceeded
            $table->string('severity')->default('info'); // info, warning, critical
            $table->string('title');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // Financial Records (Monthly / Yearly Expenses)
        Schema::create('financial_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->decimal('water_cost_mad', 10, 2)->default(0);
            $table->decimal('electricity_cost_mad', 10, 2)->default(0);
            $table->decimal('maintenance_cost_mad', 10, 2)->default(0);
            $table->decimal('budget_mad', 10, 2)->default(0);
            $table->decimal('water_consumed_m3', 10, 2)->default(0);
            $table->decimal('water_saved_m3', 10, 2)->default(0);
            $table->timestamps();
            $table->unique(['farm_id', 'year', 'month']);
        });

        // AI Chat Conversations
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('session_id')->index();
            $table->string('role'); // user, assistant
            $table->text('content');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Subscriptions
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan_name'); // FREE, PRO, BUSINESS
            $table->decimal('amount_mad', 8, 2)->default(0);
            $table->string('billing_cycle')->default('monthly'); // monthly, yearly
            $table->string('payment_method')->default('test_mode');
            $table->string('status')->default('active'); // active, cancelled, expired
            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('financial_records');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('recommendations');
        Schema::dropIfExists('irrigations');
        Schema::dropIfExists('sensor_telemetries');
        Schema::dropIfExists('sensors');
        Schema::dropIfExists('parcels');
        Schema::dropIfExists('farms');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'avatar', 'plan', 'plan_status', 'status', 'preferred_language']);
        });
    }
};
