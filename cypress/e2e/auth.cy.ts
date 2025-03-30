describe('Authentication', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/auth/login');
  });

  it('should display the login page', () => {
    cy.get('[data-cy=login-form]').should('exist');
    cy.contains('Log In').should('exist');
  });

  it('should navigate to signup page', () => {
    cy.contains('Sign Up').click();
    cy.url().should('include', '/auth/signup');
    cy.contains('Create an account').should('exist');
  });

  it('should show error with invalid credentials', () => {
    cy.get('[data-cy=email-input]').type('invalid@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();

    // Verify error message is displayed
    cy.get('[data-cy=auth-error]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    // Note: This test requires either a test user in your database
    // or mocking the authentication response
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      body: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user: {
          id: 'test-user-id',
          email: testEmail,
        },
      },
    }).as('loginRequest');

    cy.get('[data-cy=email-input]').type(testEmail);
    cy.get('[data-cy=password-input]').type(testPassword);
    cy.get('[data-cy=login-button]').click();

    cy.wait('@loginRequest');

    // Verify redirect to tasks page after successful login
    cy.url().should('include', '/tasks');
  });
});
