import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withDisabledInitialNavigation,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { BrowserUtils } from '@azure/msal-browser';
import { appRoutes } from './app.routes';
import {
  _MSAL_GUARD_CONFIG,
  _MSAL_INSTANCE_CONFIG,
  _MSAL_INTERCEPTOR_CONFIG,
} from './auth/msal.tokens';
import { provideMsal, withGuard, withInterceptor } from './auth/provide-msal';

declare global {
  interface Window {
    Cypress: unknown;
  }
}

const disableInitialNavigation =
  (BrowserUtils.isInIframe() && !window.Cypress) || BrowserUtils.isInPopup();

const withInitialNavigation = () =>
  disableInitialNavigation
    ? withDisabledInitialNavigation()
    : withEnabledBlockingInitialNavigation();

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withInitialNavigation()),
    provideMsal(
      _MSAL_INSTANCE_CONFIG,
      withGuard(_MSAL_GUARD_CONFIG),
      withInterceptor(_MSAL_INTERCEPTOR_CONFIG)
    ),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
};
