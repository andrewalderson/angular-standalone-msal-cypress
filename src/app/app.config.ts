import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  ApplicationInitStatus,
  InjectionToken,
  Provider,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  _MSAL_CONFIG,
  _MSAL_GUARD_CONFIG,
  _MSAL_INSTANCE_CONFIG,
  _MSAL_INTERCEPTOR_CONFIG,
} from './auth/msal.tokens';
import { provideMsal, withGuard, withInterceptor } from './auth/provide-msal';

/**
 * Providers cannot be asynchronous so we can't wait for the fetch of
 * the msal cconfig to resolve.
 * We get around that by using APP_INITIALIZER to reolve the Promise
 */
function provideSafeAsync<T>(
  token: T | InjectionToken<T>,
  initializer: () => Promise<T>
): Provider[] {
  const container: { value?: T } = { value: undefined };
  return [
    {
      provide: APP_INITIALIZER,
      useValue: async () => {
        container.value = await initializer();
      },
      multi: true,
    },
    {
      provide: token,
      useFactory: () => {
        if (!inject(ApplicationInitStatus).done) {
          throw new Error(
            `Cannot inject ${token} until bootstrap is complete.`
          );
        }
        return container.value;
      },
    },
  ];
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideSafeAsync(_MSAL_CONFIG, () =>
      fetch('./assets/msal.config.json').then((response) => response.json())
    ),
    provideRouter(appRoutes),
    provideMsal(
      _MSAL_INSTANCE_CONFIG,
      withGuard(_MSAL_GUARD_CONFIG),
      withInterceptor(_MSAL_INTERCEPTOR_CONFIG)
    ),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
};
