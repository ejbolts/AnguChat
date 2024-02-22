describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:3000/api/get-csrf-token', {
      statusCode: 200,
      body: { csrfToken: 'fake_csrf_token' },
    }).as('getCsrfToken');
    cy.visit('http://localhost:4200/');
    cy.wait('@getCsrfToken');
  });

  it('successfully loads and fetches CSRF token', () => {
    cy.get('@getCsrfToken').its('response.statusCode').should('eq', 200);
  });

  it('Should load the login page correctly', () => {
    cy.get('.login-container').should('be.visible');
    cy.get('.login-title').should('contain', 'Welcome to AnguChat!');
  });

  it('Should display all required fields', () => {
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('shows an error message for wrong credentials', () => {
    cy.intercept('POST', 'http://localhost:3000/api/authentication/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginAttempt');

    cy.get('#username').type('wrongUser');
    cy.get('#password').type('wrongPass');
    cy.get('.login-form').submit();
    cy.wait('@loginAttempt');
    cy.get('.alert-danger').should('contain', 'Invalid credentials!');
  });

  it('Should navigate to the dashboard on successful login', () => {
    cy.intercept('POST', 'http://localhost:3000/api/authentication/login', {
      statusCode: 200,
      body: { message: 'Logged in successfully!', user: {} },
    }).as('loginAttempt');

    cy.get('#username').type('Guest');
    cy.get('#password').type('Guest');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginAttempt');

    cy.url().should('include', 'http://localhost:4200/chat');
  });

  it('Should allow guest login', () => {
    cy.intercept('POST', 'http://localhost:3000/api/authentication/login', {
      statusCode: 200,
      body: { message: 'Logged in successfully!', user: {} },
    }).as('loginAttempt');
    cy.get('button').contains('Login as Guest').click();
    cy.wait('@loginAttempt');
    cy.url().should('include', 'http://localhost:4200/chat');
  });
});
