<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'plan',
        'plan_status',
        'status',
        'preferred_language',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function farms()
    {
        return $this->hasMany(Farm::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function aiConversations()
    {
        return $this->hasMany(AiConversation::class);
    }
}
