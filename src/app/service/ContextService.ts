import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TFUserInfo } from "@talentia/components/shell";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";


@Injectable()
export class ContextService {

    constructor(private http: HttpClient) {

    }

    private _userInfo!: Observable<TFUserInfo>;

    getContextPath(): string {
        const i = window.location.pathname
            .indexOf('/', 1);
        return i < 0 
            ? window.location.pathname 
            : window.location.pathname.substr(0, i);
    }

    getSessionId(): string {
        return window.location.href
            .replace(/.*sessionId=/, '')
            .replace(/&.*/, '');
    }

    getUserInfo(): Observable<TFUserInfo> {
        if (!!this._userInfo) {
            return this._userInfo;
        }
        return this._userInfo = this
            ._getContext()
            .pipe(map((data: any) => {
                const userInfo = new TFUserInfo();
                userInfo.title = data.user.name;
                userInfo.descriptions = [
                    {
                        label: data.user.id,
                        description: data.user.mail
                    },
                    {
                        label: data.user.appContextInfo,
                        description: data.user.appContextInfo
                    }
                ];
                return userInfo;
            }));
    }

    private _context!: Observable<any>;

    private _getContext(): Observable<any> {
        if (!!this._context) {
            return this._context;
        }
        const contextPath = this.getContextPath();
        const sessionId = this.getSessionId();
        return this._context = this.http
            .get(`${contextPath}/services/private/portal/context?sessionId=${sessionId}`);
    }

}