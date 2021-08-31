import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, ComponentRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AllModules, GridApi, GridOptions, ICellEditorParams, Module, SideBarDef } from '@ag-grid-enterprise/all-modules';
import { TacModule } from '../tac.module';
import { HttpClient } from '@angular/common/http';
import { ViewService } from 'src/app/view/view.component';
import { map } from 'rxjs/operators';
import { AgGridAngular, AgGridColumn } from '@ag-grid-community/angular';
import { AppService } from 'src/app/service/AppService';
import { EditableCallbackParams } from 'ag-grid-community';
import { TFTextComponent } from '@talentia/components';


@Component({
  selector: 'tac-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit, AfterViewInit, AfterContentInit {

  @Input()
  data: any | null = null;
  @Input()
  rowHeight: number = 40;
  @ViewChild('agGrid')
  agGrid!: AgGridAngular;

  sideBar!: SideBarDef;
  gridOptions!: GridOptions;

  public modules: Module[] = AllModules;
  public frameworkComponents = TacModule.AG_GRID_FRAMEWORK_COMPONENTS;

  // @ViewChild('customEditor', { read: TemplateRef, static: true })
  // customEditor!: TemplateRef<any>;

  constructor(
    private http: HttpClient,
    private viewService: ViewService,
    private appService: AppService) { }


  ngOnInit(): void {
  }


  ngAfterContentInit(): void {
 
    const self = this;

  //  console.log('customEditor:', self.customEditor);
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


    //
    //
    // Context menu.
    const loadingMenuItems = [
      {
        name: 'Loading...'
      }
    ];
    let menuItems = loadingMenuItems;

    self.gridOptions = <GridOptions> { 

      onCellContextMenu(params) {

        const query = {
          model: self.data.model,
          menu: self.data.menu,
          rowIndex: params.rowIndex
        };

        self
          .http
          .post(`${self.viewService.contextPath}/services/private/datagrid/menu?__lookup2=true&sessionId=${self.viewService.sessionId}`, 
            query, 
            {
              headers: {
                // CSRF
                [self.viewService.csrfTokenName]: self.viewService.csrfTokenValue
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
                        src: `${self.viewService.contextPath}${menuItem.action.url}`
                      }
                    })
                  }
                }));
            }))
            .subscribe({
              next(newMenuItems: any) {
                console.log('newMenuItems:', newMenuItems);
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

  ngAfterViewInit(): void {
    
    const self = this;       

    
    self
      .agGrid
      .api
      .setColumnDefs(self
        .data
        .columns  
        .map((column: any) => (<AgGridColumn> {          
            headerName: column.title.text,
            field: column.field,
            //editable: false,
            resizable: true,
            hide: !column.visible,
            cellStyle: (params: any) => ({ 
              'text-align': column.alignment.toLowerCase() 
            }),
            headerClass: (params: any) => [
              `${column.alignment.toLowerCase()}-alignment`
            ],            
            editable: (params: EditableCallbackParams) => {
              return !!column.editor;
            },
            // cellEditorSelector: (params: ICellEditorParams) => {
            //   return 'inputEditor';
            // },
            cellEditor: (params: ICellEditorParams) => {
              return TFTextComponent;
              //return self.customEditor.createEmbeddedView(params.);
            }
        })));

    // `${this.viewService.contextPath}/services/private/api/listviews?sessionId=${this.viewService.sessionId}`

    //       .pipe(map((result: any) => {
   //   console.log('result:', result);
   //   return result.data;
   // }))
    // const payload = {
    //   "componentId": "sousFichiersValue", 
    //   "sessionId": this.viewService.sessionId, 
    //   "sessionList":false,
    //   "collectionName":"CGCCGListeSousFichiers3IHM3",
    //   "filterable":"true","isort":[{"dir":"asc","field":"compte"}],
    //   "formatters":[],
    //   "take":"25",
    //   "skip":0,
    //   "page":1,
    //   "pageSize":"25",
    //   "defaultLoading":"ALL",
    //   "visibleColumns":["compte","libelle","totalDebit","totalCredit","solde"]
    // };


    switch(this.data.model.modelType) {
      case 'FinanceListDataGridModel':
        const query = {
          model: this.data.model,
          page: 0,
          pageSize: 25
        };
        this.http
          .post(
            `${this.viewService.contextPath}/services/private/datagrid/read?__lookup2=true&sessionId=${this.viewService.sessionId}`, 
            query, {
              headers: {
                // CSRF
                [this.viewService.csrfTokenName]: this.viewService.csrfTokenValue
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
          "session": this.viewService.sessionId,
          "skip": 0,
          "take": 5000};

        this.http
          .post(
            `${this.viewService.contextPath}/services/private/api/custom/cgsee/read?sessionId=${this.viewService.sessionId}`, 
            payload, {
              responseType: 'text',
              headers: {
                // CSRF
                [this.viewService.csrfTokenName]: this.viewService.csrfTokenValue
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

  doAction(action: any): void {

    this.appService.openLegacy(action.url);

  }


}
