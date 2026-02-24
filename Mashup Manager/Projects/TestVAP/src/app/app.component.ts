import { Component, OnInit, ViewChild } from '@angular/core';
import { SohoDataGridComponent } from 'ids-enterprise-ng';

import { ItemService, IItem } from './services/item.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild(SohoDataGridComponent) datagrid?: SohoDataGridComponent;

  isBusy = false;
  dataset: IItem[] = [];

  columns: SohoDataGridColumn[] = [
    { id: 'ITNO', name: 'Item Number', field: 'ITNO', sortable: true, filterType: 'text', width: 150 },
    { id: 'ITDS', name: 'Description', field: 'ITDS', sortable: true, filterType: 'text', width: 250 },
    { id: 'ITGR', name: 'Item Group', field: 'ITGR', sortable: true, filterType: 'text', width: 120 },
    { id: 'STAT', name: 'Status', field: 'STAT', sortable: true, filterType: 'text', width: 80 },
    { id: 'ITTY', name: 'Item Type', field: 'ITTY', sortable: true, filterType: 'text', width: 100 },
    { id: 'UNMS', name: 'Unit of Measure', field: 'UNMS', sortable: true, filterType: 'text', width: 120 },
    { id: 'RESP', name: 'Responsible', field: 'RESP', sortable: true, filterType: 'text', width: 120 }
  ];

  emptyMessage: SohoEmptyMessageOptions = {
    title: 'No data available',
    info: 'Click "Search Values" to load items',
    icon: 'icon-empty-no-data'
  };

  constructor(private readonly itemService: ItemService) {}

  ngOnInit(): void {}

  onSearchValues(): void {
    this.setBusy(true);

    this.itemService.listItemsByItemGroup('ZZZZZZZZ').subscribe({
      next: (items) => {
        this.dataset = items;
        console.log('Items loaded:', this.dataset.length);
        this.setBusy(false);
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.dataset = [];
        this.setBusy(false);
      }
    });
  }

  onRowActivated(event: SohoDataGridRowActivated): void {
    if (event && event.item) {
      console.log('Row activated:', event.item);
    }
  }

  private setBusy(isBusy: boolean): void {
    this.isBusy = isBusy;
  }
}
