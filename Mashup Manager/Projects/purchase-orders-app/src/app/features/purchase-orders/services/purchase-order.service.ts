import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IMIRequest, MIRecord } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { PurchaseOrder, SupplierOption } from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(private readonly miService: MIService) {}

  /**
   * Récupère la liste des commandes d'achat depuis M3
   * @param supplierNumber Numéro fournisseur optionnel pour filtrer
   * @returns Promise<PurchaseOrder[]>
   */
  async getPurchaseOrders(supplierNumber?: string): Promise<PurchaseOrder[]> {
    const request: IMIRequest = {
      program: 'PPS200MI',
      transaction: 'LstPurOrder',
      record: {
        SUNO: supplierNumber || '',
      },
      maxReturnedRecords: 100,
      typedOutput: true,
      includeMetadata: true,
    };

    const response = await firstValueFrom(this.miService.execute(request))
      .catch((error) => {
        console.error('[PurchaseOrderService] Erreur lors du chargement des commandes:', error);
        return undefined;
      });

    if (response && response.items && !response.hasError()) {
      return response.items.map((item: any) => ({
        PUNO: item.PUNO || '',
        SUNO: item.SUNO || '',
        ORDT: item.ORDT || '',
        PUSL: item.PUSL || '',
        NTXT: item.NTXT || '',
      }));
    }
    
    return [];
  }

  /**
   * Récupère la liste des fournisseurs pour le dropdown
   * @returns Promise<SupplierOption[]>
   */
  async getSuppliers(): Promise<SupplierOption[]> {
    const request: IMIRequest = {
      program: 'CRS620MI',
      transaction: 'LstSupplier',
      record: {},
      maxReturnedRecords: 999,
      typedOutput: true,
      includeMetadata: true,
    };

    const response = await firstValueFrom(this.miService.execute(request))
      .catch((error) => {
        console.error('[PurchaseOrderService] Erreur lors du chargement des fournisseurs:', error);
        return undefined;
      });

    if (response && response.items && !response.hasError()) {
      return response.items.map((item: any) => ({
        SUNO: item.SUNO || '',
        SUNM: item.SUNM || '',
      }));
    }
    
    return [];
  }

  /**
   * Sauvegarde une nouvelle commande d'achat
   * @param purchaseOrder Données de la commande d'achat
   * @returns Promise<boolean>
   */
  async savePurchaseOrder(purchaseOrder: Omit<PurchaseOrder, 'PUNO'>): Promise<boolean> {
    const request: IMIRequest = {
      program: 'PPS200MI',
      transaction: 'AddPurOrder',
      record: {
        SUNO: purchaseOrder.SUNO,
        ORDT: purchaseOrder.ORDT,
        PUSL: purchaseOrder.PUSL,
        NTXT: purchaseOrder.NTXT,
      },
      maxReturnedRecords: 1,
      typedOutput: true,
      includeMetadata: true,
    };

    const response = await firstValueFrom(this.miService.execute(request))
      .catch((error) => {
        console.error('[PurchaseOrderService] Erreur lors de la sauvegarde:', error);
        return undefined;
      });

    return response ? !response.hasError() : false;
  }
}