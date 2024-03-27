/// <reference types="cypress" />

import { MsalLoginOptions } from './commands/msal-login';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable {
      login(options?: Partial<MsalLoginOptions>): Chainable<Element>;
    }
  }
}
//
// -- This is a parent command --
Cypress.Commands.add('login', (options: Partial<MsalLoginOptions> = {}) => {
  return cy.msalLogin({ ...Cypress.env('msal'), ...options });
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
