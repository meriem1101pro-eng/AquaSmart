<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    /**
     * Get available SaaS plans & user's current subscription
     */
    public function plans(Request $request)
    {
        $user = $request->user();

        $plans = [
            [
                'id' => 'free',
                'name' => 'FREE',
                'price_mad' => 0,
                'period' => 'Gratuit à vie',
                'description' => 'Idéal pour démarrer la gestion rationnelle de l\'eau sur une petite exploitation.',
                'features' => [
                    'Gestion d\'une exploitation agricole',
                    'Saisie manuelle des irrigations',
                    'Statistiques et graphiques de base',
                    'Accès limité aux recommandations agronomiques',
                    'Météo locale standard',
                ],
                'popular' => false,
            ],
            [
                'id' => 'pro',
                'name' => 'PRO',
                'price_mad' => 299,
                'period' => 'MAD / mois',
                'description' => 'Pour les agriculteurs engagés souhaitant maximiser leurs économies d\'eau grâce à l\'IA.',
                'features' => [
                    'Gestion de plusieurs parcelles sans limite',
                    'Assistant agronome AquaSmart AI illimité',
                    'Rapports d\'audit et bilans PDF professionnels',
                    'Statistiques avancées & graphiques comparatifs',
                    'Alertes intelligentes en temps réel',
                    'Historique complet des irrigations',
                ],
                'popular' => true,
            ],
            [
                'id' => 'business',
                'name' => 'BUSINESS',
                'price_mad' => 799,
                'period' => 'MAD / mois',
                'description' => 'Pour les grandes exploitations, domaines et coopératives agricoles connectées.',
                'features' => [
                    'Plusieurs exploitations agricoles multi-sites',
                    'Gestion multi-utilisateurs et rôles d\'équipe',
                    'Intégration complète des capteurs IoT (Sondes sol, débit, ESP32)',
                    'Recommandations FAO-56 haute précision',
                    'Rapports avancés exportables (PDF, CSV, Excel)',
                    'Support prioritaire par ingénieurs agronomes',
                ],
                'popular' => false,
            ]
        ];

        return response()->json([
            'plans' => $plans,
            'current_plan' => $user->plan,
            'plan_status' => $user->plan_status,
        ]);
    }

    /**
     * Subscribe or upgrade plan (Test Mode Gateway)
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan' => 'required|in:free,pro,business',
            'billing_cycle' => 'nullable|in:monthly,yearly',
        ]);

        $user = $request->user();
        $plan = $validated['plan'];

        $amounts = [
            'free' => 0,
            'pro' => 299,
            'business' => 799,
        ];

        $sub = Subscription::create([
            'user_id' => $user->id,
            'plan_name' => strtoupper($plan),
            'amount_mad' => $amounts[$plan],
            'billing_cycle' => $validated['billing_cycle'] ?? 'monthly',
            'payment_method' => 'test_mode_simulation',
            'status' => 'active',
            'starts_at' => Carbon::now(),
            'ends_at' => Carbon::now()->addMonth(),
        ]);

        $user->plan = $plan;
        $user->plan_status = 'active';
        $user->save();

        return response()->json([
            'message' => "Félicitations ! Votre abonnement à l'offre {$sub->plan_name} a été activé en mode test.",
            'user' => $user,
            'subscription' => $sub,
        ]);
    }
}
