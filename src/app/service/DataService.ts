import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TFDropdownItem } from "@talentia/components";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ViewService } from "../view/view.component";


@Injectable()
export class DataService {

    constructor(
        private http: HttpClient,
        private viewService: ViewService) {}

    data: {[key: string]: Observable<any>} = {};
    value: {[key: string]: Observable<any>} = {};

    valueOf(component: any): Observable<any> {
        if (this.value[component.name]) {
            return this.value[component.name];
        }
        return this.value[component.name] = this
            .dataOf(component)
            .pipe(map((items: any) => {
                const item = items.find((item: any) => item.name === component.value.value);
                console.log('item:', item);
                return !!item ? item.name : null; 
            }));
    }

    dataOf(component: any): Observable<any> {
       

        if (this.data[component.name]) {
            return this.data[component.name];
        }
        console.log('dataOf(component:', component, ')');
        const payload = component.model.payload;
        payload.search = '*';
        payload.pageSize = 30;
       // payload.excludedKeys = null;
        
        return this.data[component.name] = this
            .http
            .post(
                `${this.viewService.contextPath}/services/private/api/consultation/all?sessionId=${this.viewService.sessionId}`,
                payload, 
                {
                    headers: {
                    // CSRF
                    [this.viewService.csrfTokenName]: this.viewService.csrfTokenValue
                    }
                })
            .pipe(map((response: any) => { 
                const items = response
                    .rows
                    .map((row: any, index: number) => (<TFDropdownItem> {
                        name:  row.key,
                        label: row.value
                    }));
                    console.log('items:', items);
                return items;
            }));

        // return new Observable(subscriber => {
        //     subscriber.next(<TFDropdownItem[]> [
        //         {
        //             name: 'first',
        //             label: 'First option',
        //             disabled: true
        //         },
        //         {
        //             name: 'second',
        //             label: 'Second option'
        //         },
        //         {
        //             name: 'third',
        //             label: 'Third option'
        //         }
        //     ])
        // });
    }

}