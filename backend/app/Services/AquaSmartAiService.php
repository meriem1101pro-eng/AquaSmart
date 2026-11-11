<?php

namespace App\Services;

use App\Models\User;
use App\Models\Farm;
use App\Models\Parcel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AquaSmartAiService
{
    /**
     * Answer agricultural questions based on actual user farm data
     */
    public function ask(User $user, string $prompt, ?string $sessionId = null): string
    {
        // 1. Gather actual user farm context
        $farms = Farm::where('user_id', $user->id)->with(['parcels.sensors'])->get();
        
        $totalParcels = 0;
        $parcelsSummary = [];
        $lowMoistureParcels = [];
        
        foreach ($farms as $farm) {
            foreach ($farm->parcels as $p) {
                $totalParcels++;
                $parcelsSummary[] = "{$p->name} ({$p->crop_type}, {$p->area_ha} ha, humidité: {$p->current_moisture}%, sol: {$p->soil_type})";
                if ($p->current_moisture < $p->target_moisture_min) {
                    $lowMoistureParcels[] = $p->name;
                }
            }
        }

        $contextText = "Exploitations: " . $farms->pluck('name')->implode(', ') . "\n";
        $contextText .= "Parcelles: " . implode(' | ', $parcelsSummary) . "\n";
        if (!empty($lowMoistureParcels)) {
            $contextText .= "Alerte humidité faible sur: " . implode(', ', $lowMoistureParcels) . "\n";
        }

        // 2. Check if Gemini API key is configured
        $geminiKey = env('GEMINI_API_KEY');
        if ($geminiKey && !str_starts_with($geminiKey, 'YOUR_')) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$geminiKey}", [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                [
                                    'text' => "Tu es AquaSmart AI, un ingénieur agronome expert en gestion rationnelle de l'eau agricole au Maroc. Tu aides les agriculteurs marocains avec bienveillance, précision et pragmatisme. Réponds dans la langue du prompt (Français, Arabe ou Darija marocaine). Contexte réel de l'exploitation de l'agriculteur:\n{$contextText}\n\nQuestion de l'agriculteur:\n{$prompt}"
                                ]
                            ]
                        ]
                    ]
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if ($text) {
                        return trim($text);
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Gemini AI API fallback: " . $e->getMessage());
            }
        }

        // 3. Built-in Moroccan Agronomic Expert Engine (High Quality & Tailored)
        return $this->generateLocalAgronomicResponse($prompt, $farms, $lowMoistureParcels);
    }

    /**
     * Local Moroccan agronomy expert knowledge engine
     */
    protected function generateLocalAgronomicResponse(string $prompt, $farms, array $lowMoistureParcels): string
    {
        $lower = mb_strtolower($prompt);

        // Water quantity today
        if (str_contains($lower, 'quantité') || str_contains($lower, 'combien') || str_contains($lower, 'شحال') || str_contains($lower, 'كمية الماء')) {
            $response = "💧 **Recommandation d'apport hydrique pour aujourd'hui :**\n\n";
            if ($farms->isEmpty() || $farms->first()->parcels->isEmpty()) {
                return "Vous n'avez pas encore configuré de parcelle. Rendez-vous dans la section **Parcelles** pour ajouter votre première culture et obtenir des recommandations personnalisées au litre près.";
            }

            foreach ($farms as $farm) {
                foreach ($farm->parcels as $p) {
                    $crop = ucfirst($p->crop_type);
                    $moist = $p->current_moisture;
                    if ($moist < $p->target_moisture_min) {
                        $recVol = round($p->area_ha * 24.5, 1);
                        $dur = round(($recVol / ($p->area_ha * 20)) * 60);
                        $response .= "• **{$p->name} ({$crop}, {$p->area_ha} ha)** : Humidité basse à {$moist}%. Apport conseillé de **{$recVol} m³** (durée : ~{$dur} min), de préférence à l'aube entre 06:00 et 07:30.\n";
                    } elseif ($moist > $p->target_moisture_max) {
                        $response .= "• **{$p->name} ({$crop})** : Humidité optimale ({$moist}%). **Pas d'irrigation nécessaire** aujourd'hui, vous économisez l'eau et prévenez l'asphyxie racinaire.\n";
                    } else {
                        $recVol = round($p->area_ha * 15.0, 1);
                        $response .= "• **{$p->name} ({$crop})** : Humidité équilibrée ({$moist}%). Apport de maintien léger : **{$recVol} m³**.\n";
                    }
                }
            }
            $response .= "\n💡 *Astuce AquaSmart : Irriguer tôt le matin permet d'éviter jusqu'à 25% de pertes par évaporation sous le climat marocain.*";
            return $response;
        }

        // Why water consumption increased
        if (str_contains($lower, 'pourquoi') || str_contains($lower, 'augmenté') || str_contains($lower, 'hausse') || str_contains($lower, 'علاش تزاد') || str_contains($lower, 'زيادة الاستهلاك')) {
            return "📈 **Analyse des causes potentielles de la hausse de consommation :**\n\n"
                . "1. **Conditions météorologiques (ET₀ élevée) :** Une hausse des températures au Maroc accompagnée de vents chauds (Chergui) augmente fortement l'évapotranspiration.\n"
                . "2. **Stade phénologique de la culture :** Durant la floraison et le grossissement des fruits (ex. agrumes ou tomates), le coefficient cultural ($K_c$) passe de 0.65 à plus de 1.10.\n"
                . "3. **Vérification d'éventuelles fuites :** Inspectez les raccords de goutte-à-goutte et les vannes principales. Une baisse anormale de pression indique souvent une fuite.\n"
                . "4. **Heures d'arrosage :** Si les irrigations ont eu lieu aux heures chaudes (11h-16h), l'eau s'évapore avant d'atteindre le système racinaire.\n\n"
                . "🔧 *Action conseillée : Lancez un diagnostic d'étanchéité via l'onglet IoT et calibrez vos débits.*";
        }

        // How to save more water
        if (str_contains($lower, 'économiser') || str_contains($lower, 'economie') || str_contains($lower, 'نقص الماء') || str_contains($lower, 'توفير الماء')) {
            return "🌿 **Guide d'optimisation hydrique AquaSmart pour le Maroc :**\n\n"
                . "1. **Goutte-à-goutte de précision :** Privilégiez les goutteurs autorégulants (2L/h ou 4L/h) pour une distribution uniforme même avec du dénivelé.\n"
                . "2. **Paillage du sol (Mulching) :** Couvrir les lignes de culture réduit l'évaporation directe du sol de 30 à 45%.\n"
                . "3. **Pilotage par tensiomètres ou sondes capacitives :** N'arrosez que lorsque la réserve facilement utilisable (RFU) du sol atteint le seuil critique (environ 35-40% d'humidité volumique).\n"
                . "4. **Irrigation nocturne ou matinale :** Profitez du tarif heures creuses ONEE et d'une évaporation quasi-nulle.\n"
                . "5. **Fractionnement des apports :** Sur sols sableux, mieux vaut deux cycles courts de 40 min qu'un seul cycle de 80 min qui percole en profondeur hors des racines.";
        }

        // Oliviers irrigation
        if (str_contains($lower, 'olivier') || str_contains($lower, 'زيتون') || str_contains($lower, 'zitoun')) {
            return "🫒 **Recommandations agronomiques pour les Oliviers au Maroc :**\n\n"
                . "• **Périodes critiques en eau :**\n"
                . "  - Mars - Avril : Débourrement et induction florale.\n"
                . "  - Juin - Juillet : Nouaison et durcissement du noyau.\n"
                . "  - Septembre : Grossissement final de l'olive et synthèse d'huile.\n"
                . "• **Déficit hydrique contrôlé (RDI) :** L'olivier tolère un léger stress hydrique en juillet/août sans baisse de rendement, permettant d'économiser jusqu'à 30% d'eau.\n"
                . "• **Volume moyen :** Comptez entre 2 500 et 3 800 m³/ha/an selon la région (ex. Marrakech-Haouz vs Meknès-Saïss) en système goutte-à-goutte.";
        }

        // Soil moisture interpretation
        if (str_contains($lower, 'humidité') || str_contains($lower, 'sol') || str_contains($lower, 'capteur') || str_contains($lower, 'رطوبة')) {
            return "🌱 **Comment interpréter les niveaux d'humidité du sol :**\n\n"
                . "• **> 65% (Zone bleue) :** Sol saturé. Risque d'asphyxie racinaire et de développement de champignons (Phytophthora). Ne pas irriguer.\n"
                . "• **45% - 65% (Zone verte) :** Humidité idéale (Capacité au champ). Les racines absorbent facilement l'eau et les nutriments. Maintenez ce niveau.\n"
                . "• **30% - 44% (Zone orange) :** Seuil de réapprovisionnement. Planifiez un cycle d'irrigation dans les 12 à 24 heures.\n"
                . "• **< 30% (Zone rouge) :** Stress hydrique sévère (Point de flétrissement proche). Irrigation urgente recommandée pour éviter la chute des fleurs ou le blocage végétatif.";
        }

        // Cost reduction
        if (str_contains($lower, 'dépense') || str_contains($lower, 'cout') || str_contains($lower, 'facture') || str_contains($lower, 'flous') || str_contains($lower, 'تقليل التكاليف')) {
            return "💰 **Stratégie de réduction des coûts d'irrigation (Eau & Énergie) :**\n\n"
                . "1. **Pompage solaire agricole :** L'amortissement d'un kit solaire avec subvention FDA (Fonds de Développement Agricole) est de 2 à 3 ans au Maroc.\n"
                . "2. **Optimisation des tranches tarifaires ONEE :** Pompez en heures creuses (22h00 - 07h00) avec un tarif au kWh réduit d'environ 40%.\n"
                . "3. **Entretien des filtres (bacs à sable et à disques) :** Un filtre colmaté augmente la contre-pression de 1 à 2 bars et fait grimper la consommation électrique de la motopompe de 15%.\n"
                . "4. **Économies projetées AquaSmart :** Une économie moyenne de 28% sur le volume d'eau pompé représente entre 1 500 et 4 500 MAD d'électricité économisés par hectare et par an.";
        }

        // General friendly agricultural advice
        return "👋 **AquaSmart AI à votre écoute !**\n\n"
            . "En tant que conseiller agronome pour votre exploitation, je suis connecté à vos parcelles et à vos capteurs.\n\n"
            . (!empty($lowMoistureParcels) ? "⚠️ *Attention : les parcelles suivantes requièrent votre vigilance : " . implode(', ', $lowMoistureParcels) . ".*\n\n" : "✅ *Toutes vos parcelles affichent actuellement un niveau d'humidité satisfaisant.*\n\n")
            . "Vous pouvez me demander :\n"
            . "• *\"Quelle quantité d'eau irriguer aujourd'hui ?\"*\n"
            . "• *\"Comment régler l'irrigation de mes tomates ou agrumes ?\"*\n"
            . "• *\"Quelle stratégie pour réduire ma facture d'électricité de pompage ?\"*\n"
            . "• *\"Comment paramétrer mes seuils d'alerte météo ?\"*";
    }
}
