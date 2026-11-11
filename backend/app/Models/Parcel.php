<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parcel extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'name',
        'code',
        'area_ha',
        'crop_type',
        'crop_variety',
        'planting_date',
        'soil_type',
        'irrigation_method',
        'target_moisture_min',
        'target_moisture_max',
        'current_moisture',
        'current_temperature',
        'soil_ph',
        'status',
        'boundary_geojson',
    ];

    protected $casts = [
        'area_ha' => 'float',
        'target_moisture_min' => 'float',
        'target_moisture_max' => 'float',
        'current_moisture' => 'float',
        'current_temperature' => 'float',
        'soil_ph' => 'float',
        'boundary_geojson' => 'array',
        'planting_date' => 'date',
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    public function sensors()
    {
        return $this->hasMany(Sensor::class);
    }

    public function irrigations()
    {
        return $this->hasMany(Irrigation::class);
    }

    public function recommendations()
    {
        return $this->hasMany(Recommendation::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }
}
