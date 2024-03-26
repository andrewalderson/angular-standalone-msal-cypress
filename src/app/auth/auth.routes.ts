import { Route } from '@angular/router';
import { MsalRedirectComponent } from '@azure/msal-angular';

// Routes specific to the Msal library
export const authRoutes: Route[] = [
  { path: '_signin-callback', component: MsalRedirectComponent },
  {
    path: '_login-failed',
    loadComponent: async () =>
      (await import('./pages/login-failed/login-failed.page')).LoginFailedPage,
  },
  {
    path: '_signed-out',
    loadComponent: async () =>
      (await import('./pages/signed-out/signed-out.page')).SignedOutPage,
  },
];
