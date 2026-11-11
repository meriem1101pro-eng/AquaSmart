<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SensorTelemetry extends Model
{
    use HasFactory;

    protected $fillable = [
        'sensor_id',
        'value',
        'secondary_value',
        'recorded_at',
    ];

    protected $casts = [
        'value' => 'float',
        'secondary_value' => 'float',
        'recorded_at' => 'datetime',
    ];

    public function sensor()
    {
        return $this->belongsTo(Sensor::class);
    }
}
