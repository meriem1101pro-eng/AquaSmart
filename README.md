# 💧 AquaSmart – Smart Agriculture & Intelligent Water Management

> **Slogan :** *Every Drop Counts — كل قطرة ماء بحسابها*  
> **Marché cible :** Royaume du Maroc 🇲🇦 (Souss-Massa, Haouz, Saïss, Gharb, Tadla, Moulouya)

AquaSmart est une plateforme SaaS complète, moderne et commercialisable dédiée à la gestion intelligente et à l'optimisation des ressources en eau dans le secteur agricole marocain.

---

## 🚀 Accès Rapide & Démonstration

L'application est **actuellement lancée et opérationnelle** sur votre machine :
- **Application Web (Frontend React) :** [http://localhost:5173](http://localhost:5173)
- **API REST (Backend Laravel) :** [http://localhost:8000/api](http://localhost:8000/api)

### 🔑 Comptes de Démonstration Pré-configurés
Des boutons d'accès rapide en un clic sont intégrés sur la page de connexion :

| Rôle | Adresse e-mail | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **Agriculteur** | `agriculteur@aquasmart.ma` | `Farmer@1234` | Formule **PRO** • Domaine Souss-Massa (5 parcelles, oliviers, agrumes...) |
| **Gestionnaire** | `gestionnaire@aquasmart.ma` | `Manager@1234` | Formule **BUSINESS** • Domaine Saïss Meknès (28.5 ha) |
| **Administrateur** | `admin@aquasmart.ma` | `Admin@1234` | Super-admin • Gestion des utilisateurs, des offres et statistiques nationales |

---

## 🛠️ Architecture & Technologies

```
appDURABLE/
├── backend/                  # API RESTful Laravel 11 / PHP 8.5
│   ├── app/
│   │   ├── Http/Controllers/ # Auth, Farm, Parcel, SmartIrrigation, AI, IoT, Weather, Finance, Reports, Admin
│   │   ├── Models/           # User, Farm, Parcel, Sensor, Irrigation, Alert, FinancialRecord, AiConversation...
│   │   └── Services/
│   │       ├── SmartIrrigationService.php # Moteur agronomique FAO-56 Penman-Monteith & RAW
│   │       └── AquaSmartAiService.php     # Moteur IA expert en agronomie marocaine (FR / AR / Darija)
│   ├── database/
│   │   ├── migrations/       # Schéma relationnel MySQL complet
│   │   └── seeders/          # Données réelles marocaines (Souss, Saïss, oliviers, agrumes, tomates...)
│   └── routes/api.php        # Routes d'API sécurisées par Laravel Sanctum
│
├── frontend/                 # Application React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── InteractiveParcelMap.jsx # Carte cadastrale interactive des parcelles
│   │   │   ├── Navbar.jsx               # Barre supérieure avec alertes et switcher FR/AR/Darija
│   │   │   ├── Sidebar.jsx              # Navigation latérale responsive
│   │   │   └── AppLayout.jsx
│   │   ├── context/          # AuthContext, ThemeContext (Dark/Light), LanguageContext (RTL/LTR)
│   │   ├── locales/          # Dictionnaire trilingue (Français, Arabe standard, Darija marocaine)
│   │   └── pages/            # 12 modules complets et fonctionnels
│   └── tailwind.config.js
└── start.sh                  # Script de démarrage automatisé
```

---

## ✨ Fonctionnalités Clés Implémentées

### 1. 🌾 Cartographie Interactive des Parcelles (Inspirée du Mockup)
- Visualisation graphique des parcelles agricoles avec formes organiques de parcelles.
- Indicateurs temps réel : Humidité volumique du sol, Température, pH de la terre, Système d'irrigation.
- Filtres rapides : *Toutes, Besoin d'eau, Humidité optimale, Récolte proche*.

### 2. 💧 Moteur Smart Irrigation (FAO-56 Penman-Monteith)
- Calcul de l'évapotranspiration potentielle ($ET_0$) et culturale ($ET_c = ET_0 \times K_c$).
- Détection du stress hydrique selon la réserve facilement utilisable (RFU) du sol.
- Recommandation quotidienne : Volume en $m^3$ et L/ha, heure optimale (06:00 - 07:30) pour éviter l'évaporation diurne, durée en minutes.
- Bouton **"Valider et exécuter l'irrigation"** : Met à jour la base de données en temps réel, augmente le niveau d'humidité et calcule les litres et Dirhams (MAD) économisés.
- Saisie manuelle pour les exploitants qui notent les compteurs physiques.

### 3. 🤖 AquaSmart AI – Assistant Agronome Digital
- Assistant interactif disponible en **Français**, **العربية** et **الدارجة المغربية**.
- Analyse les données réelles des parcelles de l'agriculteur (humidité actuelle, cultures, alertes).
- Réponses ciblées sans hallucination avec prise en compte du contexte marocain (ONCA, INRA, FDA).
- Suggestions rapides de questions et bouton d'entrée vocale.

### 4. 📡 Capteurs IoT & Passerelle ESP32 / MQTT
- Dashboard des sondes connectées : Humidité racine, Température sol, Hygrométrie serre, Débitmètre rampe, Jauge puits.
- Statuts en direct : *En ligne, Attention, Déconnecté*.
- Badge officiel **"Données Simulées"** et mode test pour fonctionner même sans matériel physique.
- Endpoint d'ingestion prêt pour l'embarqué :
  ```http
  POST /api/sensors/ingest
  Headers: X-Sensor-Key: <SEN_API_KEY>
  Content-Type: application/json

  { "value": 38.5, "battery_level": 94 }
  ```

### 5. ⛅ Météo Agricole Prédictive (Open-Meteo Live)
- Données météorologiques en direct pour les villes agricoles marocaines (Agadir, Marrakech, Fès, Meknès, Kénitra, Larache, Béni Mellal, Berkane).
- Prévisions sur 7 jours avec probabilité de précipitations pour suspendre l'arrosage en cas de pluie.

### 6. 🌿 Impact Écologique & Économies d'Eau
- Compteur de litres d'eau économisés par rapport à la submersion non régulée (-34.8%).
- Kilowattheures électriques évités et réduction de l'empreinte carbone ($kg\ CO_2$).
- Grade *Agri-Durable* et indicateur aligné sur la stratégie nationale *Génération Green 2020-2030*.

### 7. 💰 Gestion Financière & Tarifs en Dirhams (MAD)
- Suivi des coûts d'eau et d'électricité de pompage (tarif ONEE agricole).
- Suivi du budget mensuel et calcul du retour sur investissement.
- Exportation de rapports au format **PDF** et **CSV** en un clic.

### 8. 💼 Modèle Économique SaaS (Pricing)
- **FREE :** 0 MAD / mois (1 exploitation, saisie manuelle, stats de base).
- **PRO :** 299 MAD / mois (Parcelles illimitées, AquaSmart AI, rapports PDF, alertes intelligentes).
- **BUSINESS :** 799 MAD / mois (Multi-exploitations, multi-utilisateurs, intégration IoT, support prioritaire).
- Activation instantanée en mode test.

### 9. 🛡️ Interface Administrateur
- Statistiques de la plateforme à l'échelle nationale.
- Gestion des utilisateurs (suspension, réactivation, changement de rôle).
- Annuaire des exploitations connectées.

---

## 🏃 Comment relancer les services manuellement

Si vous souhaitez redémarrer l'ensemble des services ultérieurement :
```bash
cd /home/meriem/Desktop/appDURABLE
./start.sh
```

Ou séparément :
```bash
# Backend
cd /home/meriem/Desktop/appDURABLE/backend
php artisan serve --port=8000

# Frontend
cd /home/meriem/Desktop/appDURABLE/frontend
npm run dev
```
