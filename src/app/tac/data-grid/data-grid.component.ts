import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, Input, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AllModules, GridOptions, IViewportDatasource, IViewportDatasourceParams, Module, SideBarDef } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { map, toArray } from 'rxjs/operators';
import { AgGridAngular, AgGridColumn } from '@ag-grid-community/angular';
import { AppService } from 'src/app/service/AppService';
import { EditableCallbackParams, NewValueParams, ValueFormatterParams } from 'ag-grid-community';
import { CompilerService } from 'src/app/service/CompilerService';
import { TransactionService } from 'src/app/service/TransactionService';
import { TemplateService } from 'src/app/service/TemplateService';
import { CellEditorComponent } from '../cell-editor/cell-editor.component';
import { ColumnService } from 'src/app/service/ColumnService';
import { concat, Observable } from 'rxjs';
import { CellRendererComponent } from '../cell-renderer/cell-renderer.component';
import { FormatService } from 'src/app/service/FormatService';
import { DataGridService } from 'src/app/service/DataGridService';
import { EventService } from 'src/app/service/EventService';
import { AjaxService } from 'src/app/service/AjaxService';
import { BaseComponent } from '../base/component-base.component';






@Component({
  selector: 'tac-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  providers: [ 
    ColumnService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {

 
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
    private dataGridService: DataGridService,
    private appService: AppService,
    private compilerService: CompilerService,
    private viewService: TemplateService,
    private ngZone: NgZone,
    private columnService: ColumnService,
    private formatService: FormatService,
    private eventService: EventService,
    private ajaxService: AjaxService) { 
      super();
  }

  getActions() {
    return this.component.components.filter((component: any /* Component */) => component.componentType === 'DataGridColumn');
  }

  getColumns() {
    return this.component.components.filter((component: any /* Component */) => component.componentType === 'DataGridColumn');
  }

  ngOnInit(): void {

    console.log('[DataGrid] component:', this.component);

    this.frameworkComponents = { 
      defaultCellEditor: CellEditorComponent,
      defaultCellRenderer: CellRendererComponent
    };

 

    concat(
      this
        .compilerService
        .getColumnFactories({
          columns: this
            .component
            .components
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
              .components
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
              .components
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
      rowModelType: 'viewport',
      ... this.getContextMenu()
    };

  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.dataGridService.destroyDataSource(this);
  }

  private initializeDataGrid(): void {
    const self = this;
    self
      .agGrid
      .api
      .setColumnDefs(this.getColumnDefs());
    this
      .agGrid
      .api
      .setViewportDatasource(this.dataGridService.createDataSource(this));
  }

  private getColumnDefs(): AgGridColumn[] {
    const self = this;
    console.log(self.component);
    return self
      .component
      .components  
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
          singleClickEdit: true,
          onCellValueChanged: (params: NewValueParams) => {
            console.log('[DataGridComponent] onCellValueChanged(params:', params, ')');
            this.eventService.doEvent(column.components[0], 'Change');
          }
      }));
  }

  private compileColumns() {

  }
  
  private getContextMenu(): GridOptions {
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
          model: self.component.model.toObject(),
          rowIndex: params.rowIndex
        };

        self
          .http
          .post(
            //`${self.transactionService.contextPath}/services/private/datagrid/menu?__lookup2=true&sessionId=${self.transactionService.sessionId}`, 
            `${self.transactionService.contextPath}/services/private/api/dataGrid/${self.component.model.componentType}/getMenu?__lookup2=true&sessionId=${self.transactionService.sessionId}`, 
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
    console.log('[DataGridComponent] doAction(action:', action, ')');

    if (!!action.behavior) {
      switch (action.behavior.componentType) {
        case 'TableCreate':
        case 'TableDelete':
        case 'TableUpdate':
        default:
          this.ajaxService.doTableAjax(this.component, action.behavior);
          break;
      }
      return;
    }

    this.appService.openLegacy(action.url);

  }



}
