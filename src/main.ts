import { bootstrapApplication } from '@angular/platform-browser';
import { MsalRedirectComponent } from '@azure/msal-angular';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapMsalProviders } from './app/auth/bootstrap';

/**
 * We need to load the msal config and set the _MSAL_CONFIG provider
 * here because the router has 'withEnabledBlockingInitialNavigation' set.
 * This prevents APP_INITIALIZER's from resolving until after the initial route
 * navigation. Since we have an MsalGuard on the root route we need the msal config
 * before the app is initialized. These means we can't use a APP_INITIALIZER to fetch it.
 * We will use app.config.ts for configuring the app and simple
 * fetch the config here before bootstrapping and create an InjectionToken with the config
 * The bonus in this is that the redirect for the authentication will happen
 * before the app is bootstrapped
 */
bootstrapMsalProviders('./assets/msal.config.json').then((msalProviders) =>
  bootstrapApplication(AppComponent, {
    providers: [appConfig.providers, msalProviders],
  })
    .then((ref) => ref.bootstrap(MsalRedirectComponent)) // this needs to be done because the MsalRedirectComponent is added to the index.html page
    .catch((err) => console.error(err))
);
