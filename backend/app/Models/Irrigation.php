<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Irrigation extends Model
{
    use HasFactory;

    protected $fillable = [
        'parcel_id',
        'scheduled_at',
        'started_at',
        'ended_at',
        'duration_minutes',
        'water_volume_m3',
        'liters_per_ha',
        'status',
        'mode',
        'weather_conditions',
        'cost_mad',
        'energy_kwh',
        'savings_liters',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_minutes' => 'integer',
        'water_volume_m3' => 'float',
        'liters_per_ha' => 'float',
        'cost_mad' => 'float',
        'energy_kwh' => 'float',
        'savings_liters' => 'float',
    ];

    public function parcel()
    {
        return $this->belongsTo(Parcel::class);
    }
}
