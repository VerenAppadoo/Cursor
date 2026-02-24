import { Routes } from '@angular/router';

export const PURCHASE_ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/purchase-orders.component').then(m => m.PurchaseOrdersComponent),
    title: 'Commandes d\'Achat'
  }
];