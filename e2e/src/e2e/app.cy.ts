import { getGreeting } from '../support/app.po';

describe('e2e', () => {
  beforeEach(() => cy.login().visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains(/Welcome/);
  });

  /**
   * Sample of testing that the MsalInterceptor is added and configured
   * so that Authorization headers are added for the protected resources
   * At test like this should just confirm that any requests to
   * a protected resources include the access token
   */
  describe('get resource', () => {
    beforeEach(() => {
      // for this demo, the welcome component does a GET request to '/resource'
      cy.intercept('GET', '/resource', { statusCode: 200, body: [] }).as(
        'getResource'
      );

      cy.login().visit('/');
    });
    it('should provide the access token in the Authorization header', () => {
      cy.wait('@getResource').then(({ request }) => {
        const header = request.headers['authorization']; // The header properties are all lower case
        expect(header).to.exist;
        // we don't test the actual token here
        // becuase we have to expect the Msal library to work correctly
        // we are only testing that the interceptor is configured
        // with the protected resources
        expect(header).to.match(/^Bearer .*$/);
      });
    });
  });
});
