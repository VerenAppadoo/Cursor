# Purchase Orders App

Application Odin pour la gestion des commandes d'achat utilisant Angular 18 et IDS Enterprise NG.

## 🚀 Démarrage rapide

### Prérequis
- Node.js >= 18.0.0
- npm >= 8.0.0
- CLI Odin installée globalement

### Installation

1. **Cloner le projet** (déjà fait)

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer M3**
   - Editer `odin.json`
   - Remplacer `YOUR_TENANT` par votre tenant Infor Cloud Suite

4. **Lancer l'application**
   ```bash
   npm start
   # ou
   odin serve --multi-tenant
   ```

5. **Accéder à l'application**
   - URL: `http://localhost:4200`
   - La page Purchase Orders s'ouvrira automatiquement

## 📁 Structure du projet

```
purchase-orders-app/
├── src/app/
│   ├── features/purchase-orders/          # Feature complète
│   │   ├── components/                    # Composants UI
│   │   │   ├── purchase-orders.component.*        # Page principale
│   │   │   └── purchase-order-modal.component.*   # Modal création/édition
│   │   ├── services/                      # Services API M3
│   │   ├── models/                        # Interfaces TypeScript
│   │   └── README.md                      # Documentation détaillée
│   ├── app.component.*                    # Composant racine
│   └── app.routes.ts                      # Configuration routing
├── odin.json                              # Configuration Odin/proxy
├── package.json                           # Dépendances
└── angular.json                           # Configuration Angular
```

## 🎯 Fonctionnalités

### Page principale
- **DataGrid** avec liste des commandes d'achat
- **Recherche** temps réel par N° commande, fournisseur, statut
- **Toolbar** avec bouton "Nouvelle Commande"
- **Navigation** : clic sur une ligne pour modifier

### Modal de création/modification
- **Dropdown Fournisseur** : chargement dynamique depuis M3
- **DatePicker** : sélection de date avec format automatique
- **Dropdown Statut** : statuts prédéfinis des commandes
- **TextArea Notes** : saisie libre avec compteur de caractères

## 🔧 Configuration M3

### APIs utilisées
- **PPS200MI/LstPurOrder** : Lecture des commandes d'achat
- **PPS200MI/AddPurOrder** : Création de nouvelles commandes  
- **CRS620MI/LstSupplier** : Liste des fournisseurs

### Configuration du proxy
Modifier `odin.json` :
```json
{
   "projectName": "purchase-orders-app",
   "proxy": {
      "/m3api-rest": {
         "target": "https://mingle-ionapi.eu1.inforcloudsuite.com/YOUR_TENANT",
         "secure": false,
         "changeOrigin": true,
         "logLevel": "debug"
      }
   }
}
```

## 🎨 Composants IDS utilisés

- **SohoToolbarFlex** : Barre d'outils
- **SohoDataGrid** : Grille de données
- **SohoSearchField** : Champ de recherche
- **SohoModalDialog** : Boîtes de dialogue
- **SohoDropDown** : Listes déroulantes
- **SohoDatePicker** : Sélecteur de date
- **SohoTextArea** : Zone de texte
- **SohoBusyIndicator** : Indicateurs de chargement

## 📊 Modèle de données

```typescript
interface PurchaseOrder {
  readonly PUNO: string;  // N° Commande (auto-généré)
  SUNO: string;          // N° Fournisseur
  ORDT: string;          // Date commande (YYYYMMDD)
  PUSL: string;          // Statut (10=Créé, 20=Approuvé, etc.)
  NTXT: string;          // Notes
}
```

## 🛠️ Développement

### Scripts disponibles
```bash
npm start          # Lancer en mode développement
npm run build      # Build production
npm run lint       # Linting du code
```

### Bonnes pratiques
- **TypeScript strict** : Pas d'`any`, interfaces typées
- **Composants standalone** : Architecture moderne Angular
- **Change Detection OnPush** : Performance optimisée
- **Unsubscribe pattern** : Gestion mémoire correcte

## 🐛 Dépannage

### Erreur "Could not find an Odin configuration file"
→ Vérifiez que `odin.json` existe à la racine du projet

### Erreur de proxy M3
→ Vérifiez la configuration du tenant dans `odin.json`

### Composants IDS ne s'affichent pas
→ Vérifiez que les assets IDS sont bien copiés (voir `angular.json`)

## 📋 TODO / Améliorations futures

- [ ] Ajout de traductions (Transloco)
- [ ] Gestion des erreurs avec SohoToast
- [ ] Store global pour la gestion d'état
- [ ] Tests unitaires
- [ ] Mode hors ligne
- [ ] Export Excel des commandes
- [ ] Filtres avancés

## 🤝 Support

Pour toute question ou problème :
1. Consulter la documentation IDS Enterprise NG
2. Vérifier les logs dans la console du navigateur
3. Consulter les exemples dans `/Projects Examples/`

---

**Version**: 1.0.0  
**Framework**: Odin (Angular 18)  
**UI Library**: IDS Enterprise NG 18.2.4