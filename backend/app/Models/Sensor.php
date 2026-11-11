<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $fillable = [
        'parcel_id',
        'sensor_code',
        'name',
        'type',
        'status',
        'battery_level',
        'last_value',
        'unit',
        'is_simulated',
        'api_key',
        'last_ping_at',
    ];

    protected $casts = [
        'battery_level' => 'integer',
        'last_value' => 'float',
        'is_simulated' => 'boolean',
        'last_ping_at' => 'datetime',
    ];

    public function parcel()
    {
        return $this->belongsTo(Parcel::class);
    }

    public function telemetries()
    {
        return $this->hasMany(SensorTelemetry::class);
    }
}
