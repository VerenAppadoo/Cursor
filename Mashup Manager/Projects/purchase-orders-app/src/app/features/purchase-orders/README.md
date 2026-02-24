# Feature Purchase Orders

## Description
Cette feature permet la gestion des commandes d'achat avec les fonctionnalités suivantes :
- Affichage des commandes existantes dans un DataGrid
- Recherche par numéro de commande, fournisseur ou statut
- Création de nouvelles commandes via un modal
- Modification des commandes existantes

## Structure des fichiers

```
purchase-orders/
├── components/
│   ├── purchase-orders.component.ts          # Composant principal
│   ├── purchase-orders.component.html        # Template principal
│   ├── purchase-orders.component.scss        # Styles principaux
│   ├── purchase-order-modal.component.ts     # Modal de création/édition
│   ├── purchase-order-modal.component.html   # Template du modal
│   ├── purchase-order-modal.component.scss   # Styles du modal
│   └── index.ts                              # Exports des composants
├── services/
│   ├── purchase-order.service.ts             # Service pour les API M3
│   └── index.ts                              # Exports des services
├── models/
│   ├── purchase-order.model.ts               # Interfaces TypeScript
│   └── index.ts                              # Exports des modèles
├── purchase-orders.routes.ts                 # Configuration des routes
├── index.ts                                  # Export principal de la feature
└── README.md                                 # Cette documentation
```

## Composants IDS utilisés

### Page principale (PurchaseOrdersComponent)
- **SohoToolbarFlex** : Barre d'outils avec titre et boutons
- **SohoSearchField** : Champ de recherche
- **SohoButton** : Bouton "Nouvelle Commande"
- **SohoDataGrid** : Grille de données avec les colonnes :
  - N° Commande (PUNO)
  - Fournisseur (SUNO) 
  - Date Commande (ORDT)
  - Statut (PUSL)
- **SohoBusyIndicator** : Indicateur de chargement

### Modal (PurchaseOrderModalComponent)
- **SohoModalDialog** : Conteneur modal
- **SohoDropDown** : Sélection fournisseur et statut
- **SohoDatePicker** : Sélection de date
- **SohoTextArea** : Saisie des notes
- **SohoLabel** : Libellés des champs

## API M3 utilisées

### Programme PPS200MI
- **Transaction LstPurOrder** : Liste les commandes d'achat
  - Input : SUNO (optionnel)
  - Output : PUNO, SUNO, ORDT, PUSL

- **Transaction AddPurOrder** : Crée une nouvelle commande
  - Input : SUNO, ORDT, PUSL, NTXT

### Programme CRS620MI
- **Transaction LstSupplier** : Liste les fournisseurs
  - Output : SUNO, SUNM

## Modèle de données

```typescript
interface PurchaseOrder {
  readonly PUNO: string;  // Numéro de commande
  SUNO: string;          // Numéro fournisseur
  ORDT: string;          // Date commande (YYYYMMDD)
  PUSL: string;          // Statut
  NTXT: string;          // Notes
}

interface SupplierOption {
  readonly SUNO: string;  // Numéro fournisseur
  readonly SUNM: string;  // Nom fournisseur
}
```

## Statuts des commandes
- **10** : Créé
- **20** : Approuvé  
- **30** : Envoyé
- **40** : Reçu
- **90** : Fermé

## Fonctionnalités

### Recherche
- Recherche en temps réel dans les colonnes PUNO, SUNO et PUSL
- Bouton de remise à zéro pour effacer la recherche
- Filtrage côté client pour les performances

### Création/Modification
- Modal réutilisable pour la création et modification
- Validation des champs obligatoires
- Chargement dynamique des fournisseurs
- Format de date automatique (DD/MM/YYYY vers YYYYMMDD)

### Navigation
- Clic sur une ligne pour ouvrir en modification  
- Sélection simple dans le DataGrid
- Fermeture automatique du modal après sauvegarde

## Intégration dans l'application

### Dans le routing principal :
```typescript
{
  path: 'purchase-orders',
  loadChildren: () => import('./features/purchase-orders').then(m => m.PURCHASE_ORDERS_ROUTES)
}
```

### Dans un menu :
```html
<a routerLink="/purchase-orders">Commandes d'Achat</a>
```