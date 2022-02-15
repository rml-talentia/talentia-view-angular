import { HttpClient } from "@angular/common/http";
import { ChangeDetectorRef, Injectable } from "@angular/core";
import { map, tap } from "rxjs/operators";
import { TransactionService } from "./TransactionService";
import { Bindable } from "./types";


export interface GetPageOptions {

    model: Bindable;
    search: string;
    page: number;
    pageSize: number;

}


@Injectable()
export class ChosenService {

    constructor(
        private http: HttpClient,
        private transactionService: TransactionService) {}


    getPage(options: GetPageOptions) {

        const model = options.model.toObject();
        const key = model.criterias[0].name;

        return this.http.post(
            `${this.transactionService.contextPath}/services/private/api/chosen/${options.model.componentType}/getPage?sessionId=${this.transactionService.sessionId}`,
            {
                page: options.page,
                pageSize: options.pageSize,
                search: options.search,
                model: model
            }, 
            {
                headers: {
                    [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
                }
            });
            // .pipe(tap((response: any) => {
            //    // this.totalCount = response.total;
            // }))
            // .pipe(map((response: any) => { 
            //     return response
            //     .rows
            //     .map((row: any, index: number) => <any> {
            //         id:  row[key],
            //         text: row[key],
            //         cells: model.criterias.map((criteria: any) => criteria.name).map((column:any) => row[column])
            //     });
            // }))
            // .subscribe({
            //     next: (items: any[]) => {

            //         if (0 === options.page) {
            //             this.items = [{
            //             id: '',
            //             text: '<Aucune sélection>',
            //             cells: ['<Aucune sélection>', '', '', '']
            //             }];
            //         }

            //         this.items = this.items.concat(items);

            //         // if (0 === page) {
            //         //   this.items = items;
            //         // } else {
            //         //   this.items = this.items.concat(items);
            //         // //  this.chosen.refresh();
            //         // }           
            //         this.changeDetectorRef.markForCheck();
            //     }
            // })
            // .add(() => this.itemsSubscription = null);
    }

}