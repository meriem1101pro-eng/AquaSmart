<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FarmController;
use App\Http\Controllers\Api\ParcelController;
use App\Http\Controllers\Api\SmartIrrigationController;
use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\FinancialController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public weather & plans
Route::get('/weather', [WeatherController::class, 'getWeather']);
Route::get('/public-plans', [SubscriptionController::class, 'plans']);

// IoT Ingestion (ESP32 / MQTT Bridge)
Route::post('/sensors/ingest', [SensorController::class, 'ingest']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/charts', [DashboardController::class, 'consumptionCharts']);

    // Farms (Exploitations)
    Route::apiResource('farms', FarmController::class);

    // Parcels (Parcelles)
    Route::apiResource('parcels', ParcelController::class);

    // Smart Irrigation Engine
    Route::get('/irrigation/recommendations', [SmartIrrigationController::class, 'getRecommendations']);
    Route::post('/irrigation/recommendations/{id}/apply', [SmartIrrigationController::class, 'applyRecommendation']);
    Route::post('/irrigation/log', [SmartIrrigationController::class, 'logIrrigation']);
    Route::get('/irrigation/history', [SmartIrrigationController::class, 'history']);

    // AquaSmart AI
    Route::post('/ai/chat', [AiChatController::class, 'sendMessage']);
    Route::get('/ai/history', [AiChatController::class, 'getHistory']);
    Route::delete('/ai/history', [AiChatController::class, 'clearHistory']);

    // IoT Sensors
    Route::apiResource('sensors', SensorController::class)->except(['create', 'edit']);
    Route::post('/sensors/{id}/simulate', [SensorController::class, 'simulate']);
    Route::get('/sensors/{id}/telemetry', [SensorController::class, 'telemetry']);

    // Alerts
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::put('/alerts/{id}/read', [AlertController::class, 'markAsRead']);
    Route::post('/alerts/mark-all-read', [AlertController::class, 'markAllAsRead']);
    Route::delete('/alerts/{id}', [AlertController::class, 'destroy']);

    // Financial Management
    Route::get('/financial/summary', [FinancialController::class, 'summary']);

    // SaaS Subscriptions & Pricing
    Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe']);

    // Admin Panel (Protected by role check in controller)
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}', [AdminController::class, 'updateUserStatus']);
        Route::get('/farms', [AdminController::class, 'farms']);
    });
});
