import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslocoDirective } from '@jsverse/transloco';

import { IMIRequest, MIRecord } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';

import {
  SohoToolbarFlexModule,
  SohoSearchFieldModule,
  SohoButtonModule,
  SohoDataGridModule,
  SohoDataGridComponent,
  SohoDataGridColumn,
  SohoDataGridRowActivatedEvent,
  SohoBusyIndicatorModule,
  SohoModalDialogRef,
  SohoModalDialogService,
  SohoModalButton,
  SohoIconModule,
} from 'ids-enterprise-ng';

import { PurchaseOrder } from '../models/purchase-order.model';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { PurchaseOrderModalComponent } from './purchase-order-modal.component';

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    NgFor, NgIf,
    FormsModule,
    SohoToolbarFlexModule,
    SohoSearchFieldModule,
    SohoButtonModule,
    SohoDataGridModule,
    SohoBusyIndicatorModule,
    SohoIconModule,
  ],
})
export class PurchaseOrdersComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild(SohoDataGridComponent) datagrid!: SohoDataGridComponent;
  @ViewChild('modalContainer', { read: ViewContainerRef, static: true }) modalContainer?: ViewContainerRef;

  // État du composant
  isLoading = false;
  searchTerm = '';
  purchaseOrders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];

  // Configuration du DataGrid
  columns: SohoDataGridColumn[] = [
    { 
      id: 'PUNO', 
      name: 'N° Commande', 
      field: 'PUNO', 
      sortable: true,
      width: 120
    },
    { 
      id: 'SUNO', 
      name: 'Fournisseur', 
      field: 'SUNO', 
      sortable: true,
      width: 120
    },
    { 
      id: 'ORDT', 
      name: 'Date Commande', 
      field: 'ORDT', 
      sortable: true,
      width: 140,
      formatter: this.dateFormatter
    },
    { 
      id: 'PUSL', 
      name: 'Statut', 
      field: 'PUSL', 
      sortable: true,
      width: 100
    },
  ];

  private modal?: SohoModalDialogRef<PurchaseOrderModalComponent>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly modalService: SohoModalDialogService,
    private readonly miService: MIService
  ) {}

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.modal) {
      this.modal.close();
      this.modal.destroy();
    }
  }

  /**
   * Formateur pour les dates dans le DataGrid
   */
  private dateFormatter(row: number, cell: number, value: any): string {
    if (!value || value.length < 8) return value;
    // Format YYYYMMDD -> DD/MM/YYYY
    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    const day = value.substring(6, 8);
    return `${day}/${month}/${year}`;
  }

  /**
   * Charge la liste des commandes d'achat
   */
  async loadPurchaseOrders(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      this.purchaseOrders = await this.purchaseOrderService.getPurchaseOrders();
      this.filteredOrders = [...this.purchaseOrders];
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      this.purchaseOrders = [];
      this.filteredOrders = [];
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Gestion de la recherche
   */
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.purchaseOrders];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredOrders = this.purchaseOrders.filter(order =>
        order.PUNO.toLowerCase().includes(term) ||
        order.SUNO.toLowerCase().includes(term) ||
        order.PUSL.toLowerCase().includes(term)
      );
    }
    this.cdr.markForCheck();
  }

  /**
   * Efface la recherche
   */
  onSearchClear(): void {
    this.searchTerm = '';
    this.filteredOrders = [...this.purchaseOrders];
    this.cdr.markForCheck();
  }

  /**
   * Ouvre le modal pour créer une nouvelle commande
   */
  onNewOrder(): void {
    this.openModal();
  }

  /**
   * Gestion du clic sur une ligne du DataGrid
   */
  onRowActivated(event: SohoDataGridRowActivatedEvent): void {
    const selectedOrder = this.filteredOrders[event.row];
    if (selectedOrder) {
      this.openModal(selectedOrder);
    }
  }

  /**
   * Ouvre le modal de commande d'achat
   */
  private openModal(purchaseOrder?: PurchaseOrder): void {
    const title = purchaseOrder ? `Commande ${purchaseOrder.PUNO}` : 'Nouvelle Commande';
    
    const buttons: SohoModalButton[] = [
      {
        id: 'save',
        text: 'Sauvegarder',
        click: (e: any, modal: any) => this.onSave(),
        isDefault: true
      },
      {
        id: 'cancel',
        text: 'Annuler',
        click: (e: any, modal: any) => this.onCancel()
      }
    ];

    if (this.modal) {
      this.modal.close();
      this.modal.destroy();
    }

    setTimeout(() => {
      this.modal = this.modalService
        .modal(PurchaseOrderModalComponent, this.modalContainer)
        .title(title)
        .buttons(buttons)
        .afterClose((result?: PurchaseOrder) => {
          if (result) {
            this.loadPurchaseOrders();
          }
        });

      this.modal
        .apply((component: PurchaseOrderModalComponent) => {
          component.purchaseOrder = purchaseOrder;
          component.modal = this.modal!;
        })
        .open();
    });
  }

  /**
   * Sauvegarde la commande
   */
  private async onSave(): Promise<void> {
    if (this.modal && this.modal.componentRef) {
      const component = this.modal.componentRef.instance;
      await component.save();
    }
  }

  /**
   * Annule la modification
   */
  private onCancel(): void {
    if (this.modal) {
      this.modal.close();
    }
  }

  /**
   * TrackBy function pour optimiser le ngFor
   */
  trackByPuno(index: number, item: PurchaseOrder): string {
    return item.PUNO;
  }
}