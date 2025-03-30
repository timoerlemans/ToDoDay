// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Cypress Types
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createTask(title: string, description?: string): Chainable<void>;
    }
  }
}

// -- Custom Commands --

/**
 * Custom command to log into the application
 * @example cy.login('test@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('include', '/tasks');
});

/**
 * Custom command to log out of the application
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click();
  cy.get('[data-cy=logout-button]').click();
  cy.url().should('include', '/auth/login');
});

/**
 * Custom command to create a new task
 * @example cy.createTask('Test Title', 'Test Description')
 */
Cypress.Commands.add('createTask', (title, description = '') => {
  cy.get('[data-cy=add-task-button]').click();
  cy.get('[data-cy=task-title-input]').type(title);
  if (description) {
    cy.get('[data-cy=task-description-input]').type(description);
  }
  cy.get('[data-cy=save-task-button]').click();
  cy.contains(title).should('exist');
});
