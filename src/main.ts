import { bootstrapApplication } from '@angular/platform-browser';
import { MsalRedirectComponent } from '@azure/msal-angular';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then((ref) => ref.bootstrap(MsalRedirectComponent)) // this needs to be done because the MsalRedirectComponent is added to the index.html page and needs to be bootstrapped
  .catch((err) => console.error(err));
