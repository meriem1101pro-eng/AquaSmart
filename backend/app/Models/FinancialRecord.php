<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'year',
        'month',
        'water_cost_mad',
        'electricity_cost_mad',
        'maintenance_cost_mad',
        'budget_mad',
        'water_consumed_m3',
        'water_saved_m3',
    ];

    protected $casts = [
        'water_cost_mad' => 'float',
        'electricity_cost_mad' => 'float',
        'maintenance_cost_mad' => 'float',
        'budget_mad' => 'float',
        'water_consumed_m3' => 'float',
        'water_saved_m3' => 'float',
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }
}
