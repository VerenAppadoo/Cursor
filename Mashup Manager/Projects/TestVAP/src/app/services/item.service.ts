import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IMIRequest, Log } from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';

export interface IItem {
  ITNO: string;
  ITDS: string;
  ITGR: string;
  STAT: string;
  ITTY: string;
  UNMS: string;
  RESP: string;
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private readonly miService: MIService) {}

  listItemsByItemGroup(itemGroup: string) {
    const record = {
      ITGR: itemGroup,
    };

    const request: IMIRequest = {
      program: 'MMS200MI',
      transaction: 'LstItmByItmGr',
      record,
      maxReturnedRecords: 100,
      typedOutput: true,
      includeMetadata: true,
    };

    return this.miService.execute(request).pipe(
      map((response) => {
        if (response.hasError()) {
          throw new Error('Failed to list items by item group');
        }
        if (response.items) {
          return response.items as IItem[];
        } else {
          return [];
        }
      }),
      catchError((error) => {
        Log.error(`ItemService.listItemsByItemGroup: ${JSON.stringify(error)}`);
        return throwError(() => error);
      })
    );
  }
}
