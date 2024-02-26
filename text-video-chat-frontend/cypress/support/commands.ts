/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('loginAsSuperAdmin', () => {
  const superAdmin = {
    _id: 'superAdminId',
    username: 'Admin',
    role: 'superAdmin',
    profilePic: null,
    groups: [],
    isOnline: true,
  };

  cy.window().then((win) => {
    win.sessionStorage.setItem('currentUser', JSON.stringify(superAdmin));
  });
});

Cypress.Commands.add('loginAsGuestUser', () => {
  const guestUser = {
    _id: '65bcc4ecfd6567b3a70f5746',
    username: 'Guest',
    role: 'user',
    profilePic: null,
    groups: [],
    isOnline: false,
  };

  cy.window().then((win) => {
    win.sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
  });

  cy.visit('http://localhost:4200/chat');
});

declare namespace Cypress {
  interface Chainable {
    loginAsSuperAdmin(): Chainable<void>;

    loginAsGuestUser(): Chainable<void>;
  }
}
