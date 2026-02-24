import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/purchase-orders',
    pathMatch: 'full'
  },
  {
    path: 'purchase-orders',
    loadChildren: () => import('./features/purchase-orders').then(m => m.PURCHASE_ORDERS_ROUTES),
    title: 'Commandes d\'Achat'
  },
  {
    path: '**',
    redirectTo: '/purchase-orders'
  }
];