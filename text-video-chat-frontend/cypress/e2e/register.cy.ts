describe('Registration Flow', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:3000/api/get-csrf-token', {
      statusCode: 200,
      body: { csrfToken: 'fake_csrf_token' },
    }).as('getCsrfToken');
    cy.visit('http://localhost:4200/register');
    cy.wait('@getCsrfToken');
  });

  it('loads the registration page correctly', () => {
    cy.get('.register-container').should('be.visible');
    cy.get('.register-title').should('contain', 'Register');
  });

  it('allows input in the username and password fields', () => {
    cy.get('#username').type('newUser').should('have.value', 'newUser');
    cy.get('#password').type('password123').should('have.value', 'password123');
  });

  it('handles file selection for profile picture', () => {
    const fileName = 'default-profile-pic.png';
    cy.fixture(fileName).then((fileContent) => {
      cy.get('#profilePic').attachFile({
        fileContent,
        fileName,
        mimeType: 'image/png',
      });
    });
    cy.get('#file-chosen').should('contain', fileName);
  });

  it('submits the form and registers a new user', () => {
    cy.intercept('POST', 'http://localhost:3000/api/authentication', {
      statusCode: 200,
      body: { message: 'User registered!', _id: 'newUserId' },
    }).as('registerUser');

    cy.get('#username').type('newUser');
    cy.get('#password').type('password123');
    // Steps to handle file upload if necessary
    cy.get('.register-form').submit();
    cy.wait('@registerUser');
    cy.url().should('include', 'http://localhost:4200/login');
  });

  it('displays an error message for registration failure', () => {
    cy.intercept('POST', 'http://localhost:3000/api/authentication', {
      statusCode: 400,
      body: { message: 'Username already exists.' },
    }).as('registerFail');

    cy.get('#username').type('Guest');
    cy.get('#password').type('password123');
    cy.get('.register-form').submit();
    cy.wait('@registerFail');
    cy.get('.alert-danger').should('contain', 'Username already exists.');
  });

  it('navigates to the login page when clicking "Login Here"', () => {
    cy.get('button').contains('Login Here').click();
    cy.url().should('include', 'http://localhost:4200/login');
  });
});
