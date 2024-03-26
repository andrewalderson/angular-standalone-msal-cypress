// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';
import './commands/msal-login';

const msalConfig = Cypress.env('msal');

// Need to ensure that the tokens in the msal cache
// match the autority and client we use for the tests
// if not the msal http interceptor will attempt to get another access token
// we don't want any calls to b2c to happen because they are either redirects
// or happen in iframes which don't play nice with Cypress
// besides we shouldn't be testing that part of the app because it is not our code
beforeEach(() => {
  cy.intercept('GET', '**/msal.config**', (req) => {
    delete req.headers['if-none-match']; // prevents 304 responses

    req.continue((res) => {
      // if you change the structure of the 'msal-config.json file you need to
      // update the path to 'clientId' and 'authority' here
      res.body.auth.clientId = msalConfig.clientId;
      res.body.auth.authority = msalConfig.authority;
    });
  }).as('getMsalConfig');
});
