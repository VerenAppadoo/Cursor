/**
 * Purchase Order model interface
 */
export interface PurchaseOrder {
  /** Order Number */
  readonly PUNO: string;
  /** Supplier Number */
  SUNO: string;
  /** Order Date */
  ORDT: string;
  /** Status */
  PUSL: string;
  /** Notes Text */
  NTXT: string;
}

/**
 * Supplier option for dropdown
 */
export interface SupplierOption {
  readonly SUNO: string;
  readonly SUNM: string;
}