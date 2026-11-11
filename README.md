# AquaSmart 🌱💧

## ✨ Fonctionnalités Clés Implémentées

### 1. 🌾 Cartographie Interactive des Parcelles
- Visualisation graphique des parcelles agricoles avec formes organiques.
- Indicateurs : humidité du sol, température, pH et système d'irrigation.
- Filtres : Toutes, Besoin d'eau, Humidité optimale, Récolte proche.

### 2. 💧 Moteur Smart Irrigation (FAO-56 Penman-Monteith)
- Calcul de l'évapotranspiration potentielle (ET₀) et culturale (ETc = ET₀ × Kc).
- Détection du stress hydrique selon la réserve facilement utilisable (RFU).
- Recommandations : volume d'eau en m³ et L/ha, heure optimale et durée.
- Validation de l'irrigation et suivi de la consommation d'eau et des économies.
- Saisie manuelle des relevés des compteurs physiques.

### 3. 🤖 AquaSmart AI – Assistant Agronome Digital
- Assistant en français, arabe et darija marocaine.
- Analyse des données des parcelles agricoles.
- Suggestions de questions et interface de saisie vocale.

### 4. 📡 Capteurs IoT & Passerelle ESP32 / MQTT
- Suivi des capteurs : humidité du sol, température, hygrométrie, débitmètre et niveau du puits.
- Statuts : En ligne, Attention, Déconnecté.
- Mode test avec données simulées.
- Endpoint d'ingestion : `POST /api/sensors/ingest`.

### 5. ⛅ Météo Agricole Prédictive
- Données météorologiques via Open-Meteo.
- Villes agricoles marocaines : Agadir, Marrakech, Fès, Meknès, Kénitra, Larache, Béni Mellal et Berkane.
- Prévisions sur 7 jours et prise en compte des précipitations.

### 6. 🌿 Impact Écologique & Économies d'Eau
- Suivi des économies d'eau.
- Estimation de l'électricité économisée et de l'empreinte carbone.
- Indicateurs liés à la stratégie Génération Green 2020-2030.

### 7. 💰 Gestion Financière
- Suivi des coûts d'eau et d'électricité.
- Gestion du budget et calcul du retour sur investissement.
- Exportation des rapports PDF et CSV.

### 8. 💼 Modèle Économique SaaS
- **FREE :** 0 MAD / mois.
- **PRO :** 299 MAD / mois.
- **BUSINESS :** 799 MAD / mois.
- Activation des abonnements en mode test.

### 9. 🛡️ Interface Administrateur
- Statistiques de la plateforme.
- Gestion des utilisateurs et des rôles.
- Annuaire des exploitations agricoles.

---

## 🏃 Lancer le projet

```bash
cd /home/meriem/Desktop/appDURABLE
./start.sh
```

### Backend

```bash
cd /home/meriem/Desktop/appDURABLE/backend
php artisan serve --port=8000
```

### Frontend

```bash
cd /home/meriem/Desktop/appDURABLE/frontend
npm run dev
```
