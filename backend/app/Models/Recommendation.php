<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'parcel_id',
        'recommended_date',
        'recommended_start_time',
        'recommended_volume_m3',
        'duration_minutes',
        'reason',
        'soil_moisture_current',
        'eto_mm',
        'rain_forecast_mm',
        'status',
        'confidence_score',
    ];

    protected $casts = [
        'recommended_date' => 'date',
        'recommended_volume_m3' => 'float',
        'duration_minutes' => 'integer',
        'soil_moisture_current' => 'float',
        'eto_mm' => 'float',
        'rain_forecast_mm' => 'float',
        'confidence_score' => 'integer',
    ];

    public function parcel()
    {
        return $this->belongsTo(Parcel::class);
    }
}
