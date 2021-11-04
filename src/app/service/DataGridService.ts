import { IViewportDatasource, IViewportDatasourceParams } from "@ag-grid-community/all-modules";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DataGridComponent } from "../tac/data-grid/data-grid.component";
import { TransactionService } from "./TransactionService";
import { Component } from "./types";

type QueryOptions = {
    page: number,
    pageSize: number,
    first?: boolean
};
  
type QueryResponse = {
    total: number,
    rows: any[]
};
  

class DataGridDatasource implements IViewportDatasource {

    private params!: IViewportDatasourceParams;

    private firstRow: number = -1;
    private lastRow: number = -1;
    private rows: any[] = [];
  
    constructor(
      private dataGrid: DataGridComponent, 
      private http: HttpClient,
      private transactionService: TransactionService) {
    }
  
    init(params: IViewportDatasourceParams): void {
      this.params = params;
      this
        .doQuery({ 
          page: 0, 
          pageSize: 25
        })
        .subscribe({
          next: (response: QueryResponse) => {

            this.firstRow = 0;
            this.lastRow = 25;
            this.rows = response.rows;
  
            this.dataGrid.component.viewport = {
              firstRow: 0,
              lastRow: 25,
              rows: response.rows
            };
  
            // First response , initialize row count.
            params.setRowCount(response.total, false);
            params.setRowData(response.rows);
            // And fit columns.
            this
              .dataGrid
              .agGrid
              .api
              .sizeColumnsToFit();
          }
        });
    }
  
    setViewportRange(firstRow: number, lastRow: number): void {
      this
        .doQuery({ 
          page: firstRow, 
          pageSize: lastRow - firstRow
        })
        .subscribe({
          next: (response: QueryResponse) => {
  
            this.firstRow = firstRow;
            this.lastRow = lastRow;
            this.rows = response.rows;

            this.dataGrid.component.viewport = {
              firstRow: firstRow,
              lastRow: lastRow,
              rows: response.rows
            };
  
            this.params.setRowData(response.rows);
  
            // setInterval(() => {
            //   this.dataGrid.agGrid.api.refreshCells({ force: true });
            // }, 1000);
  
          }
        });
    }
  
    private doQuery(options: QueryOptions): Observable<QueryResponse> {
      const query = {
        model: this.dataGrid.component.model.toObject(),
        page: options.page,
        pageSize: options.pageSize
      };
      return <Observable<QueryResponse>> this
        .http
        .post(
          `${this.transactionService.contextPath}/services/private/api/dataGrid/${this.dataGrid.component.model.componentType}/getPage?__lookup2=true&sessionId=${this.transactionService.sessionId}`, 
          query, {
            headers: {
              // CSRF
              [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
            }
          });
    }

    getRowByIndex(index: number) {
        return this.rows[index - this.firstRow] || null;
    }
  
    setRowByIndex(index: number, row: any) {
        console.log('[DataGridDatasource] setRowByIndex(index:', index, ', row:', row, ')');
        this.rows[index - this.firstRow] = row;
        this.params.setRowData(this.rows);
        this.dataGrid.agGrid.api.refreshCells({ force: true });
    }
}

@Injectable()
export class DataGridService {

    private dataSources: { [key: string]: DataGridDatasource } = {};

    constructor(private http: HttpClient,
        private transactionService: TransactionService) {}


    createDataSource(dataGrid: DataGridComponent) {
        return this.dataSources[dataGrid.component.name] = new DataGridDatasource(dataGrid, this.http, this.transactionService);
    }

    destroyDataSource(dataGrid: DataGridComponent) {
        delete this.dataSources[dataGrid.component.name];
    }

    getRowByIndex(dataGrid: Component, index: number) {
        const dataSource = this.dataSources[dataGrid.name];
        if (!dataSource) {
            return null;
        }
        return dataSource.getRowByIndex(index);
    }

    setRowByIndex(dataGrid: Component, index: number, row: any) {
        const dataSource = this.dataSources[dataGrid.name];
        if (!dataSource) {
            return;
        }
        dataSource.setRowByIndex(index, row);
    }

    setValue(dataGrid: Component, rowIndex: number, field: string, value: any) {
        const dataSource = this.dataSources[dataGrid.name];
        if (!dataSource) {
            return;
        }
        const row = dataSource.getRowByIndex(rowIndex);
        row[field] = value;
    }
}