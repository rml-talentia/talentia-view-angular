import { Injectable } from "@angular/core";
import { TransactionService } from "./TransactionService";



@Injectable()
export class ActionService {

    constructor(private transactionService: TransactionService) {}

    submit(action: any): void {
        console.log('[ActionService] submit(action:', action, ')');
        const data = {
            sessionId: this.transactionService.sessionId,
            [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue,
            [action.name]: !action.title ? '' : action.title.text,
            ... this.asFormData(action.form.data)
        };
        window.TalentiaViewBridge.submitObject(action.form.action, data);
    } 


    private asFormData(data: any) {
        for (const field in (data = { ... data })) {
            let value = data[field];
            if ('boolean' === typeof value) {
              value = value ? 'on' : 'off';
            }
            data[field] = value;
        }
        return data;
    }
}