import { Route } from '@angular/router';
import { MsalRedirectComponent } from '@azure/msal-angular';

// Routes specific to the Msal library
export const authRoutes: Route[] = [
  { path: '_signin-callback', component: MsalRedirectComponent },
];
