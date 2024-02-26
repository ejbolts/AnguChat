describe('User Profile and Actions', () => {
  beforeEach(() => {
    cy.intercept('GET', 'http://localhost:3000/api/get-csrf-token').as(
      'getCsrfToken'
    );

    cy.intercept('GET', 'http://localhost:3000/api/group').as('getGroups');

    cy.intercept('GET', 'http://localhost:3000/api/group/*/channels').as(
      'getChannelsForGroup'
    );
    cy.intercept('GET', 'http://localhost:3000/api/group/*/Users').as(
      'getGroupUsers'
    );
    cy.intercept('GET', 'http://localhost:3000/socket.io/*').as('socketIo');

    cy.intercept('POST', 'http://localhost:3000/api/authentication/logout').as(
      'logout'
    );

    cy.loginAsGuestUser();
    cy.wait('@getCsrfToken');
    cy.wait('@getGroups');
    cy.wait('@getChannelsForGroup');
    cy.wait('@getGroupUsers');
    cy.wait('@socketIo');
  });

  it('should allow a guest user to access and display all the correct UI', () => {
    cy.url().should('include', '/chat');
    cy.get('.container').should('be.visible');
    cy.get('.Profile-picture').should('be.visible');
    cy.get('#adminDashboard').should('not.exist');

    cy.get('#UsersGroupDiv').should('be.visible');
    cy.get('h3').should('contain.text', 'Guest');
    //cy.fixture('default-profile-pic.png', 'base64').then((fileContent) => {
    cy.get('.list-group-item').each(($el, index, $list) => {
      // cy.get('.d-none').attachFile({
      //   fileContent,
      //   fileName: 'default-profile-pic.png',
      //   mimeType: 'image/png',
      //   encoding: 'base64',
      // });

      // cy.wrap($el).find('canvas').should('exist');
      // cy.wrap($el)
      //   .find('canvas')
      //   .should('contain', 'default-profile-pic.png');

      // Continue with other checks
      cy.wrap($el).find('button.btn-outline-danger').should('be.disabled');
      cy.wrap($el).find('#systemMessage').should('be.visible');
      cy.wrap($el).find('#messageTimestamp').should('be.visible');
      cy.wrap($el).find('#messageUsername').should('be.visible');
      cy.wrap($el).find('#messageContent').should('be.visible');
    });
  });
  //});

  it('logs out the user when the logout button is clicked', () => {
    cy.get('button').contains('Delete Account').should('be.disabled');
    cy.get('button').contains('Logout').click();
    cy.wait('@logout');
    cy.url().should('include', 'http://localhost:4200/login');
  });
});
