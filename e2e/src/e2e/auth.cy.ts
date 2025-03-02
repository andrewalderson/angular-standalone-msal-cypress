/**
 * These tests are sanity checks to ensure the routes needed for MSAL to function
 * have been defined in the app.
 */
describe('Auth', () => {
  beforeEach(() => {
    // We are logging in so that we don't get redirected to the AD B2C login page
    // when we attempt to go back to the home route. This will happen if there is an MSALGuard on the home route
    // we also need to visit the home page to trigger the fetch of the msl configuration
    cy.login().visit('/');
  });

  it('should be able to route to the sign in redirect page', () => {
    cy.wait('@getMsalConfig')
      .its('response.body.auth.redirectUri')
      .then((route) => {
        cy.visit(route);
        cy.get('app-signin-callback').should('exist');
      });
  });
  it('should be able to route to the login failed page', () => {
    cy.wait('@getMsalConfig')
      .its('response.body.guard.loginFailedRoute')
      .then((route) => {
        cy.visit(route);
        cy.get('app-login-failed').should('exist');
      });
  });

  it('should be able to route to the signed out page', () => {
    cy.wait('@getMsalConfig')
      .its('response.body.auth.postLogoutRedirectUri')
      .then((route) => {
        cy.visit(route);
        cy.get('app-signed-out').should('exist');
      });
  });
});
