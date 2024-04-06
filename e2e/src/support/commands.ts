/// <reference types="cypress" />

import { MsalLoginRopcOptions } from './commands/msal-login-ropc';

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
      login(options?: Partial<MsalLoginRopcOptions>): Chainable<Element>;
    }
  }
}
//
// -- This is a parent command --
Cypress.Commands.add('login', (options: Partial<MsalLoginRopcOptions> = {}) => {
  return cy.msalLoginRopc({ ...Cypress.env('msal'), ...options });
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
