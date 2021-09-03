import { HttpClient } from "@angular/common/http";
import { ElementRef, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";


@Injectable()
export class MenuService {

    constructor(private http: HttpClient) {

    }

    private _getSessionId(): string {
        return window.location.href.replace(/.*sessionId=/, '');
    }

    getMenu(): Observable<any> {
       const sessionId = this._getSessionId();
       return this.http
        .get(`/accounting/services/private/menu/menuNodes?sessionId=${sessionId}`)
        .pipe(map((data: any) => {
            return {
                isSearchable: true,
                items: (<any[]>[])
                    .concat([
                        {
                            title: 'CGSEA',
                            uri: '/function/CGSEA',
                            data: { option: 'CGSEA' }
                        },
                        {
                            title: 'CGCCG',
                            uri: '/function/CGCCG',
                            data: { option: 'CGCCG' }
                        },
                        {
                            title: 'CGCBL',
                            uri: '/function/CGCBL',
                            data: { option: 'CGCBL' }
                        },
                        {
                            title: 'CGMEC',
                            uri: '/function/CGMEC',
                            data: { option: 'CGMEC' }
                        }
                    ])
                    .concat(data.map(function m(option: any) {
                        const item: any = {
                            title: `${option.title}`,
                            uri: `/function/${option.id}`,
                            data: { option: option.id }                  
                        };
                        if (!!option.options && !!option.options.length) {
                            item.items = option.options.map(m);
                        } else {
                            item.title = `${option.title} (${option.id})`;
                        }
                        return item;
                    }))
            };
        }));
    }

    openOption(iframeRef: ElementRef<any>, option: string): void {
        const sessionId = this._getSessionId();
        iframeRef
            .nativeElement
            .src = `/accounting/dashboardFunction.action?function=${option}&sessionId=${sessionId}`;
    }

}