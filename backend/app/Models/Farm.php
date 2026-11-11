<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'region',
        'city',
        'latitude',
        'longitude',
        'total_area_ha',
        'water_source',
        'water_cost_per_m3',
        'kwh_cost_mad',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'total_area_ha' => 'float',
        'water_cost_per_m3' => 'float',
        'kwh_cost_mad' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parcels()
    {
        return $this->hasMany(Parcel::class);
    }

    public function financialRecords()
    {
        return $this->hasMany(FinancialRecord::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }
}
