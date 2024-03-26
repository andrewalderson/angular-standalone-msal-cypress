import { Route } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { authRoutes } from './auth/auth.routes';

export const appRoutes: Route[] = [
  ...authRoutes,
  {
    path: '',
    canActivate: [MsalGuard],
    loadComponent: async () =>
      (await import('./nx-welcome.component')).NxWelcomeComponent,
  },
];
