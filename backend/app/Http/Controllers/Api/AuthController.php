<?php

namespace App\Services;

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Farm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * User registration
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'nullable|string|in:farmer,manager,admin',
            'phone' => 'nullable|string|max:30',
            'preferred_language' => 'nullable|string|in:fr,ar,dar',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'farmer',
            'phone' => $request->phone,
            'plan' => 'free',
            'plan_status' => 'active',
            'status' => 'active',
            'preferred_language' => $request->preferred_language ?? 'fr',
        ]);

        // Automatically create a default farm for a new farmer to make onboarding seamless
        $farm = Farm::create([
            'user_id' => $user->id,
            'name' => 'Exploitation Principale - ' . $user->name,
            'region' => 'Souss-Massa',
            'city' => 'Agadir',
            'latitude' => 30.4278,
            'longitude' => -9.5981,
            'total_area_ha' => 12.5,
            'water_source' => 'Puits / Forage nappe phréatique',
            'water_cost_per_m3' => 1.80,
            'kwh_cost_mad' => 1.15,
            'notes' => 'Créé automatiquement à l\'inscription.',
        ]);

        $token = $user->createToken('aquasmart-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie avec succès.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * User login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et mot de passe.'
            ], 401);
        }

        if ($user->status === 'suspended') {
            return response()->json([
                'message' => 'Votre compte a été suspendu par l\'administrateur. Veuillez contacter le support.'
            ], 403);
        }

        // Revoke previous tokens
        $user->tokens()->delete();
        $token = $user->createToken('aquasmart-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * User logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ]);
    }

    /**
     * Current authenticated user profile
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('farms.parcels');

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'preferred_language' => 'nullable|string|in:fr,ar,dar',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $user->name = $request->name;
        $user->phone = $request->phone;
        if ($request->preferred_language) {
            $user->preferred_language = $request->preferred_language;
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Request password reset link (mock simulation for security & testing)
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Si cette adresse e-mail existe, un lien de réinitialisation vous a été envoyé.'
            ]);
        }

        // Mock token for demo
        $resetToken = bin2hex(random_bytes(16));

        return response()->json([
            'message' => 'Un lien de réinitialisation sécurisé a été généré.',
            'reset_token' => $resetToken,
            'reset_url' => url("/reset-password?token={$resetToken}&email=" . urlencode($user->email)),
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Votre mot de passe a été réinitialisé avec succès.'
        ]);
    }
}
