import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  SohoDropDownComponent,
  SohoDropDownModule,
  SohoDatePickerModule,
  SohoDatePickerComponent,
  SohoTextAreaModule,
  SohoLabelModule,
  SohoModalDialogRef,
  SohoBusyIndicatorModule,
} from 'ids-enterprise-ng';

import { PurchaseOrder, SupplierOption } from '../models/purchase-order.model';
import { PurchaseOrderService } from '../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-modal',
  templateUrl: './purchase-order-modal.component.html',
  styleUrls: ['./purchase-order-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    NgFor, NgIf,
    FormsModule,
    SohoDropDownModule,
    SohoDatePickerModule,
    SohoTextAreaModule,
    SohoLabelModule,
    SohoBusyIndicatorModule,
  ],
})
export class PurchaseOrderModalComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('supplierDropdown') supplierDropdown!: SohoDropDownComponent;
  @ViewChild('orderDatePicker') orderDatePicker!: SohoDatePickerComponent;

  // État du composant
  isLoading = false;
  isSaving = false;
  purchaseOrder?: PurchaseOrder;
  modal?: SohoModalDialogRef<PurchaseOrderModalComponent>;

  // Données du formulaire
  formData = {
    SUNO: '',
    ORDT: '',
    PUSL: '10', // Statut par défaut
    NTXT: ''
  };

  // Options pour les dropdowns
  suppliers: SupplierOption[] = [];
  statusOptions = [
    { value: '10', text: 'Créé' },
    { value: '20', text: 'Approuvé' },
    { value: '30', text: 'Envoyé' },
    { value: '40', text: 'Reçu' },
    { value: '90', text: 'Fermé' }
  ];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly purchaseOrderService: PurchaseOrderService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSuppliers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise le formulaire avec les données existantes si disponibles
   */
  private initializeForm(): void {
    if (this.purchaseOrder) {
      this.formData = {
        SUNO: this.purchaseOrder.SUNO,
        ORDT: this.purchaseOrder.ORDT,
        PUSL: this.purchaseOrder.PUSL,
        NTXT: this.purchaseOrder.NTXT
      };
    } else {
      // Nouvelle commande - date du jour par défaut
      const today = new Date();
      const dateStr = today.getFullYear().toString() + 
                     (today.getMonth() + 1).toString().padStart(2, '0') + 
                     today.getDate().toString().padStart(2, '0');
      this.formData.ORDT = dateStr;
    }
    this.cdr.markForCheck();
  }

  /**
   * Charge la liste des fournisseurs
   */
  async loadSuppliers(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      this.suppliers = await this.purchaseOrderService.getSuppliers();
      
      // Mettre à jour le dropdown après chargement
      setTimeout(() => {
        if (this.supplierDropdown) {
          this.supplierDropdown.updated();
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      this.suppliers = [];
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Sauvegarde la commande d'achat
   */
  async save(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    try {
      const success = await this.purchaseOrderService.savePurchaseOrder(this.formData);
      
      if (success) {
        // Fermer le modal avec les données sauvegardées
        if (this.modal) {
          this.modal.close({
            ...this.formData,
            PUNO: 'AUTO' // Le numéro sera généré par M3
          });
        }
      } else {
        console.error('Erreur lors de la sauvegarde');
        // Ici on pourrait afficher un message d'erreur à l'utilisateur
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Valide le formulaire
   */
  private isFormValid(): boolean {
    return !!(this.formData.SUNO && this.formData.ORDT && this.formData.PUSL);
  }

  /**
   * Gestion du changement de fournisseur
   */
  onSupplierChange(event: any): void {
    this.formData.SUNO = event.target.value;
    this.cdr.markForCheck();
  }

  /**
   * Gestion du changement de date
   */
  onDateChange(event: any): void {
    // Format de date IDS vers format M3 (YYYYMMDD)
    const dateValue = event.target.value;
    if (dateValue) {
      // Supposons que la date est au format DD/MM/YYYY
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        this.formData.ORDT = parts[2] + parts[1] + parts[0];
      }
    }
    this.cdr.markForCheck();
  }

  /**
   * Gestion du changement de statut
   */
  onStatusChange(event: any): void {
    this.formData.PUSL = event.target.value;
    this.cdr.markForCheck();
  }

  /**
   * Gestion du changement des notes
   */
  onNotesChange(event: any): void {
    this.formData.NTXT = event.target.value;
    this.cdr.markForCheck();
  }

  /**
   * Obtient le nom du fournisseur sélectionné
   */
  getSelectedSupplierName(): string {
    const supplier = this.suppliers.find(s => s.SUNO === this.formData.SUNO);
    return supplier ? supplier.SUNM : '';
  }

  /**
   * Obtient le texte du statut sélectionné
   */
  getSelectedStatusText(): string {
    const status = this.statusOptions.find(s => s.value === this.formData.PUSL);
    return status ? status.text : '';
  }

  /**
   * TrackBy function pour les fournisseurs
   */
  trackBySupplierSUNO(index: number, supplier: SupplierOption): string {
    return supplier.SUNO;
  }

  /**
   * TrackBy function pour les statuts
   */
  trackByStatusValue(index: number, status: { value: string; text: string }): string {
    return status.value;
  }
}