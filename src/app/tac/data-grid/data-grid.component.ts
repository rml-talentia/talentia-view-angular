import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentRef, ContentChild, Input, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AllModules, ColGroupDef, GridApi, GridOptions, ICellEditorParams, Module, SideBarDef } from '@ag-grid-enterprise/all-modules';
import { TacModule } from '../tac.module';
import { HttpClient } from '@angular/common/http';
import { map, toArray } from 'rxjs/operators';
import { AgGridAngular, AgGridColumn } from '@ag-grid-community/angular';
import { AppService } from 'src/app/service/AppService';
import { EditableCallbackParams, ValueFormatterParams } from 'ag-grid-community';
import { CompilerService } from 'src/app/service/CompilerService';
import { TransactionService } from 'src/app/service/TransactionService';
import { ViewService } from 'src/app/service/ViewService';
import { CellEditorComponent } from '../cell-editor/cell-editor.component';
import { ColumnService } from 'src/app/service/ColumnService';
import { TFDateTimeService, TFNumberService } from '@talentia/components';
import { concat } from 'rxjs';
import { CellRendererComponent } from '../cell-renderer/cell-renderer.component';
import { FormatService } from 'src/app/service/FormatService';



@Component({
  selector: 'tac-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  providers: [ 
    ColumnService
  ]
})
export class DataGridComponent implements OnInit, AfterViewInit, AfterContentInit {

  @Input()
  component: any | null = null;
  @Input()
  rowHeight: number = 40;
  @ViewChild('agGrid')
  agGrid!: AgGridAngular;


  @ViewChild('myCellRenderer', { static: true, read: TemplateRef })
  myCellRendererRef!: TemplateRef<any>;

  sideBar!: SideBarDef;
  gridOptions!: GridOptions;

  modules: Module[] = AllModules;
  frameworkComponents: any = { 
    defaultCellEditor: CellEditorComponent,
    defaultCellRenderer: CellRendererComponent
  };


  constructor(
    private http: HttpClient,
    private transactionService: TransactionService,
    private appService: AppService,
    private compilerService: CompilerService,
    private viewService: ViewService,
    private ngZone: NgZone,
    private columnService: ColumnService,
    private formatService: FormatService) { }


  ngOnInit(): void {

    this.frameworkComponents = { 
      defaultCellEditor: CellEditorComponent ,
      defaultCellRenderer: CellRendererComponent
    };

    concat(
      this
        .compilerService
        .getColumnFactories({
          columns: this
            .component
            .columns
            .map((column: any) => ({
              data: column,
              template: this // TODO: duplicate code
                .viewService
                .createTemplate({
                  components: column.components,
                  cellEditor: true
                })
            }))
        }),
        this
          .compilerService
          .getColumnFactories({
            columns: this
              .component
              .columns
              .map((column: any) => ({
                data: column,
                template: this // TODO: duplicate code
                  .viewService
                  .createTemplate({
                    components: column.components,
                    cellRenderer: true
                  })
              }))
          }))
      .pipe(toArray())
      .pipe(map(factories => ({
        editorFactrories: factories[0],
        rendererFactories: factories[1]
      })))
      .subscribe({
        next: (factories: any) => {
          this
              .component
              .columns
              .forEach((column: any, index: number) => {
                this.columnService.columns[column.field] = { 
                  editorFactory: factories.editorFactrories[index],
                  rendererFactory: factories.rendererFactories[index], 
                  data: column, 
                  editorTemplate: this // TODO: duplicate code
                    .viewService
                    .createTemplate({
                      components: column.components,
                      cellEditor: true
                    }),
                  rendererTemplate: this // TODO: duplicate code
                    .viewService
                    .createTemplate({
                      components: column.components,
                      cellRenderer: true
                    }),
                  index: index 
                };
              });          
            setTimeout(() => {
              this.initializeDataGrid();
            });
        }
      });

    // this
    //   .compilerService
    //   .getColumnFactories({
    //     columns: this
    //       .data
    //       .columns
    //       .map((column: any) => ({
    //         data: column,
    //         template: this // TODO: duplicate code, but the template is not needed here
    //           .viewService
    //           .createTemplate({
    //             components: column.components,
    //             cellEditor: true
    //           })
    //       }))
    //   })
    //   .subscribe({
    //     next: (factories: any) => {
    //       this
    //         .data
    //         .columns
    //         .forEach((column: any, index: number) => {
    //           this.columnService.columns[column.field] = { 
    //             componentFactory: factories[index], 
    //             data: column, 
    //             template: this // TODO: duplicate code
    //               .viewService
    //               .createTemplate({
    //                 components: column.components,
    //                 cellEditor: true
    //               }),
    //             index: index 
    //           };
    //         });          
    //       setTimeout(() => {
    //         this.initializeDataGrid();
    //       });
    //     }
    //   });
  }


  ngAfterContentInit(): void {
    //
    //
    // Side bar.
    this.sideBar = <SideBarDef> {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressColumnFilter: false,
            suppressColumnSelectAll: true,
            suppressColumnExpandAll: true
          }
        }
        // {
        //   id: 'filters',
        //   labelDefault: 'Filters',
        //   labelKey: 'filters',
        //   iconKey: 'filter',
        //   toolPanel: 'agFiltersToolPanel'
        // }
      ]
    };

    this.gridOptions = <GridOptions> { 
      headerHeight: 40,
      ... this.getContextMenu()
    };

  }


  ngAfterViewInit(): void {
    //this.initializeDataGrid();
  }

  initializeDataGrid(): void {
    const self = this;       
    self
      .agGrid
      .api
      .setColumnDefs(this.getColumnDefs());
    switch(this.component.model.modelType) {
      case 'FinanceListDataGridModel':
        const query = {
          model: this.component.model,
          page: 0,
          pageSize: 25
        };
        this.http
          .post(
            `${this.transactionService.contextPath}/services/private/datagrid/read?__lookup2=true&sessionId=${this.transactionService.sessionId}`, 
            query, {
              headers: {
                // CSRF
                [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
              }
            })
            .pipe(map((payload: any) => {
              return payload.rows;
            }))
            .subscribe({
              next(rowData: Array<Object>) {
                console.log('rowData:', rowData);
                self
                  .agGrid
                  .api
                  .setRowData(rowData);
                self
                  .agGrid
                  .api
                  .sizeColumnsToFit();
              }
            });
        break;
      case 'FinanceTableDataGridModel':
        const payload = {
          "collectionName": "com.lswe.generale.gene.ecritureComptableTravailList",
          "filterable": "false",
          "isort": [],
          "page": 1,
          "pageSize": 5000,
          "session": this.transactionService.sessionId,
          "skip": 0,
          "take": 5000};

        this.http
          .post(
            `${this.transactionService.contextPath}/services/private/api/custom/cgsee/read?sessionId=${this.transactionService.sessionId}`, 
            payload, {
              responseType: 'text',
              headers: {
                // CSRF
                [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
              }
            })
            .pipe(map((payload: any) => {
                const response = window.eval('var val = ' + payload + '; val;');

                

                var result = {
                  data: <any[]>[], 
                  total: response.total};
                
                // Store relation between modelId (server side entity id).
                // With viewId (id generated for clientside purposes)
                //self._businessIds = [];
                var columns = response.data.columns;
                var editableColumns = response.data.editableColumns;
                var rows = response.data.rows;
                var rowCount = rows.length / columns.length;
                for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                  let row: any = {};
                  result.data.push(row);
                  for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
                    var field = columns[columnIndex];
                    var value = rows[rowIndex * columns.length + columnIndex];
                    value = undefined !== value ? value : null;
                    switch (field) {
                      case 'tsweRowInfo':
                        row[field] = {
                          businessId:     value[0],
                          gridId:         value[1],
                          lastUpdate:     value[2],
                          lastValidation: value[3],
                          status:         value[4],
                          statusMessage:  value[5],
                          // UI50-670
                          accesses:       value[6].map(function(value: any) { return 'number' === typeof value ? !!value : null; }).reduce(function (obj: any, value: any, columnIndex: number) { obj[editableColumns[columnIndex]] = value; return obj; }, {}),
                          disableds:      value[7].map(function(value: any) { return 'number' === typeof value ? !!value : null; }).reduce(function (obj: any, value: any, columnIndex: number) { obj[editableColumns[columnIndex]] = value; return obj; }, {}),
                          accessRules:    value[8].reduce(function (obj: any, value: any, columnIndex: number) { obj[editableColumns[columnIndex]] = value; return obj; }, {})
                        };
                        break;
                      default:
                        row[field] = value;
                        break;
                    }
                  }
                }
                console.log('result:', result);


                return result.data;
            }))
            .subscribe({
              next(rowData: Array<Object>) {
                self
                  .agGrid
                  .api
                  .setRowData(rowData);
              }
            });
    }
  }

  getColumnDefs(): AgGridColumn[] {
    const self = this;
    return self
      .component
      .columns  
      .map((column: any) => (<AgGridColumn> {          
          headerName: column.title.text,
          field: column.field,
          resizable: true,
          hide: !column.visible,
          cellStyle: (params: any) => ({ 
            'text-align': column.alignment.toLowerCase() 
          }),
          // Formatting related options.
          headerClass: (params: any) => [
            `${column.alignment.toLowerCase()}-alignment`
          ],
          cellClass: (params: any) => { 
            return `text-${column.alignment.toLowerCase()}`;
          },            
          valueFormatter: (params: ValueFormatterParams) => {
            return !column.format ? params.value : this.formatService.toString(params.value, column.format);
          },
          // Editor related options.
          editable: (params: EditableCallbackParams) => {
            return true;//!!column.editor;
          },
          cellEditor: !column.components.length ? null : 'defaultCellEditor',
          cellRenderer: !column.components.length ? null : 'defaultCellRenderer',
          singleClickEdit: true
      }));
  }
  
  getContextMenu(): GridOptions {
    const self = this;
    const loadingMenuItems = [
      {
        name: 'Loading...'
      }
    ];
    let menuItems = loadingMenuItems;
    return <GridOptions> { 

      onCellContextMenu(params) {

        const query = {
          model: self.component.model,
          menu: self.component.menu,
          rowIndex: params.rowIndex
        };

        self
          .http
          .post(`${self.transactionService.contextPath}/services/private/datagrid/menu?__lookup2=true&sessionId=${self.transactionService.sessionId}`, 
            query, 
            {
              headers: {
                // CSRF
                [self.transactionService.csrfTokenName]: self.transactionService.csrfTokenValue
              }
            })
            .pipe(map((menu: any) => {
              return menu
                .components
                .map((menuItem: any) => ({
                  name: menuItem.label.text,
                  action: () => {
                    self.appService.open({
                      legacy: {
                        src: `${self.transactionService.contextPath}${menuItem.action.url}`
                      }
                    })
                  }
                }));
            }))
            .subscribe({
              next(newMenuItems: any) {
                menuItems = newMenuItems;
                (params.api as any)
                  .contextMenuFactory
                  .showMenu(params.node, params.column, params.value, params.event);
                menuItems = loadingMenuItems;
              }
            });
      },

      getContextMenuItems(params) {
        return menuItems;
      }

    };
  }

  doAction(action: any): void {

    this.appService.openLegacy(action.url);

  }


}
