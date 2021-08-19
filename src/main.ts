import { LicenseManager } from '@ag-grid-enterprise/all-modules';
import { enableProdMode, NgModuleRef, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { __exportStar } from 'tslib';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { TacModule } from './app/tac/tac.module';

declare global {
  interface Window { 
    TalentiaViewBridge: any; 
  }
}

//import {LicenseManager} from "ag-grid-enterprise";
//LicenseManager.setLicenseKey("Talentia_Software_France__MultiApp_3Devs26_February_2020__MTU4MjY3NTIwMDAwMA==8bdec09d8414cc8e31681070b440ace4");


// if (environment.production) {
//   enableProdMode();
// }

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));

  const platform: any = platformBrowserDynamic();

  const _export: any = {
    injector: null
  };

  export default _export;
  
  platform
    .bootstrapModule(AppModule)
    .then(function(module: NgModuleRef<any>) {
      const zone = module.injector.get(NgZone);
      window.TalentiaViewBridge._zone = zone;
     // platform._injector = module.injector;
      _export.injector = platform.injector;
      console.log(zone);
      console.log(platform);
      // platform._bootstrapModuleWithZone(AppModule1, [], zone);
      // platform._bootstrapModuleWithZone(AppModule2, [], zone);
     // platform._bootstrapModuleWithZone(TacModule, [], zone);
    })
    .catch((err:any) => console.error(err));