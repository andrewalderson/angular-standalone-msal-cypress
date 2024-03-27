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
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import { Configuration, LogLevel } from '@azure/msal-browser';
import { appRoutes } from './app.routes';
import { provideMsal, withGuard, withInterceptor } from './auth/provide-msal';

export function loggerCallback(
  logLevel: LogLevel,
  message: string,
  containsPii: boolean
) {
  if (containsPii) {
    return;
  }
  switch (logLevel) {
    case LogLevel.Error:
      console.error(message);
      break;
    case LogLevel.Info:
      // eslint-disable-next-line no-restricted-syntax
      console.info(message);
      break;
    case LogLevel.Verbose:
      // eslint-disable-next-line no-restricted-syntax
      console.debug(message);
      break;
    case LogLevel.Warning:
      console.warn(message);
      break;
    case LogLevel.Trace:
      console.trace(message);
      break;
  }
}

type MsalConfig = Configuration & {
  guard: MsalGuardConfiguration;
} & {
  interceptor: MsalInterceptorConfiguration;
};

// IMPORTANT careful what you name these tokens so they don't conflict with the tokens defined by Msal
const _MSAL_CONFIG = new InjectionToken<MsalConfig>('MSAL_CONFIG');
const _MSAL_INSTANCE_CONFIG = new InjectionToken<Configuration>(
  '_MSAL_INSTANCE_CONFIG',
  {
    providedIn: 'root',
    factory: () => {
      const configuration = inject(_MSAL_CONFIG);
      return {
        auth: configuration.auth,
        cache: configuration.cache,
        system: {
          ...configuration.system,
          loggerOptions: {
            ...configuration.system?.loggerOptions,
            loggerCallback: loggerCallback,
          },
        },
      };
    },
  }
);
// MSAL already has a token called 'MSAL_GUARD_CONFIG' so don't use that
const _MSAL_GUARD_CONFIG = new InjectionToken<MsalGuardConfiguration>(
  '_MSAL_GUARD_CONFIG',
  {
    providedIn: 'root',
    factory: () => inject(_MSAL_CONFIG).guard,
  }
);

const _MSAL_INTERCEPTOR_CONFIG = new InjectionToken<MsalGuardConfiguration>(
  '_MSAL_INTERCEPTOR_CONFIG',
  {
    providedIn: 'root',
    factory: () => {
      const configuration = inject(_MSAL_CONFIG).interceptor;
      return {
        interactionType: configuration.interactionType,
        protectedResourceMap: new Map(configuration.protectedResourceMap),
      };
    },
  }
);

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
