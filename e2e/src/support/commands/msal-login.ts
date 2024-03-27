import {
  ExternalTokenResponse,
  PublicClientApplication,
} from '@azure/msal-browser';
import { TimeUtils } from '@azure/msal-common';

const commandName = 'msalLogin';

// This cache exists for the duration of the test run
// We cache the token responses by the scopes they were requested with
// we also cache the expiry time so we know when to login again
const tokenResponseCache = new Map<
  string[],
  { tokenResponse: ExternalTokenResponse; ttl: number }
>();

export type MsalLoginOptions = {
  authority: string;
  clientId: string;
  username: string;
  password: string;
  scopes: string[];
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable {
      [commandName]: (options: MsalLoginOptions) => Chainable<Element>;
    }
  }
}

/*
      This command is used to log into Azure AD or Azure AD B2C using Resource Owner Password Credential Flow
      It is used to get tokens from Azure and cache the tokens so that the MSAL library will find them
      and not attempt to do a redirect or popup login.
      This command should be called before visiting any page in the app protected by MSAL.
    
      NOTE: An ROPC flow needs to be created in AD or AD B2C for this command to work.
*/

Cypress.Commands.add('msalLogin', (options: MsalLoginOptions) => {
  let chainable: Cypress.Chainable;

  // only scopes for api calls should be passed in
  // if no scopes are passed in we need to send the client id as a scope
  // as either an api scope or the client id is required
  if (!options.scopes?.length) {
    options.scopes = [options.clientId];
  }

  const currentTimeInSeconds = TimeUtils.nowSeconds();
  const cachedTokenExpiresOnBufferInScondes = 300;
  const cachedTokenResponse = tokenResponseCache.get(options.scopes);

  if (
    cachedTokenResponse &&
    cachedTokenResponse.ttl <
      currentTimeInSeconds - cachedTokenExpiresOnBufferInScondes
  ) {
    chainable = cy.then(() => cachedTokenResponse);
  } else {
    chainable = cy
      .request({
        url: `${options.authority}/oauth2/v2.0/token`,
        method: 'POST',
        body: {
          grant_type: 'password',
          client_id: options.clientId,
          scope: `openid offline_access ${options.scopes.join(' ')}`,
          response_type: 'token id_token',
          username: options.username,
          password: options.password,
          client_info: 1, // this is undocumented but needs to be set to return client_info in the ExternalTokenResponse when caching the tokens
        },
        form: true,
      })
      .then((response: { body: ExternalTokenResponse }) => {
        const tokenResponse = response.body;

        const expiresIn = tokenResponse.expires_in || 0;
        const ttl = currentTimeInSeconds + expiresIn;

        tokenResponseCache.set(options.scopes, {
          tokenResponse,
          ttl,
        });

        return response.body;
      });
  }

  return chainable.then((tokenResponse: ExternalTokenResponse) => {
    const pca = new PublicClientApplication({
      auth: { clientId: options.clientId, authority: options.authority },
    });
    pca
      .getTokenCache()
      .loadExternalTokens(
        { authority: options.authority, scopes: options.scopes },
        tokenResponse,
        {
          extendedExpiresOn: tokenResponse.expires_in,
        }
      );
  });
});
