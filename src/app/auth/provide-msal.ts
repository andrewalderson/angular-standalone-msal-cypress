import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  EnvironmentProviders,
  InjectionToken,
  Provider,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { Configuration, PublicClientApplication } from '@azure/msal-browser';

export enum MsalFeatureKind {
  Interceptor,
  Guard,
}

export interface MsalFeature<KindT extends MsalFeatureKind> {
  ɵkind: KindT;
  ɵproviders: Provider[];
}

function makeMsalFeature<KindT extends MsalFeatureKind>(
  kind: KindT,
  providers: Provider[]
): MsalFeature<KindT> {
  return {
    ɵkind: kind,
    ɵproviders: providers,
  };
}

export function provideMsal(
  configuration: Configuration,
  ...features: MsalFeature<MsalFeatureKind>[]
): EnvironmentProviders;
export function provideMsal(
  configuration: InjectionToken<Configuration>,
  ...features: MsalFeature<MsalFeatureKind>[]
): EnvironmentProviders;
export function provideMsal(
  configuration: Configuration | InjectionToken<Configuration>,
  ...features: MsalFeature<MsalFeatureKind>[]
): EnvironmentProviders {
  const providers: Provider[] = [
    MsalBroadcastService,
    MsalService,
    {
      provide: MSAL_INSTANCE,
      useFactory: () => {
        if (configuration instanceof InjectionToken) {
          configuration = inject(configuration);
        }
        return new PublicClientApplication(configuration);
      },
    },
  ];

  for (const feature of features) {
    providers.push(...feature.ɵproviders);
  }

  return makeEnvironmentProviders(providers);
}

export function withInterceptor(
  configuration: MsalInterceptorConfiguration
): MsalFeature<MsalFeatureKind.Interceptor>;
export function withInterceptor(
  configuration: InjectionToken<MsalInterceptorConfiguration>
): MsalFeature<MsalFeatureKind.Interceptor>;
export function withInterceptor(
  configuration:
    | MsalInterceptorConfiguration
    | InjectionToken<MsalInterceptorConfiguration>
): MsalFeature<MsalFeatureKind.Interceptor> {
  return makeMsalFeature(MsalFeatureKind.Interceptor, [
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: () => {
        if (configuration instanceof InjectionToken) {
          configuration = inject(configuration);
        }
        return configuration;
      },
    },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
  ]);
}

export function withGuard(
  configuration: MsalGuardConfiguration
): MsalFeature<MsalFeatureKind.Guard>;
export function withGuard(
  configuration: InjectionToken<MsalGuardConfiguration>
): MsalFeature<MsalFeatureKind.Guard>;
export function withGuard(
  configuration: MsalGuardConfiguration | InjectionToken<MsalGuardConfiguration>
): MsalFeature<MsalFeatureKind.Guard> {
  return makeMsalFeature(MsalFeatureKind.Guard, [
    MsalGuard,
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: () => {
        if (configuration instanceof InjectionToken) {
          configuration = inject(configuration);
        }
        return configuration;
      },
    },
  ]);
}
