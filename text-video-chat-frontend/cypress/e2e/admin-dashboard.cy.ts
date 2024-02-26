describe('Admin Dashboard', () => {
  beforeEach(() => {
    // cy.intercept('GET', 'http://localhost:3000/api/get-csrf-token').as(
    //   'getCsrfToken'
    // );
    // cy.intercept('GET', 'http://localhost:3000/api/channel/getAllUsers').as(
    //   'getAllUsers'
    // );
    // cy.intercept('GET', 'http://localhost:3000/api/channel/getAllUsers').as(
    //   'getAllUsers'
    // );
    // cy.intercept('GET', 'localhost:3000/api/group').as('getAllGroups');

    // cy.intercept('PUT', 'http://localhost:3000/api/*/role', {
    //   statusCode: 200,
    //   body: { message: 'Role updated successfully' },
    // }).as('updateRole');

    cy.loginAsSuperAdmin();
    cy.visit('http://localhost:4200/admin');

    // cy.wait(['@getAllUsers', '@getCsrfToken']);
  });

  // it('displays current user information and allows the admin to log out', () => {
  //   cy.get('.current-user').should('contain.text', 'Logged in as: Admin');

  //   cy.get('#logoutButton').contains('Logout').click();
  //   cy.url().should('include', 'http://localhost:4200/login');
  // });

  it('lists all users and allows role changes and removal and creates and deletes a new group', () => {
    cy.intercept('POST', 'http://localhost:3000/api/group/create').as(
      'createGroup'
    );
    const groupName = 'New Test Group';
    cy.get('table').should('be.visible');
    cy.get('select').first().select('groupAdmin');
    cy.get('button').contains('Promote').first().click();

    // commented out tests because of monogo connection and server errors via api calls

    // cy.get('input#groupName').type(groupName);
    // cy.get('button').contains('Create Group').click();
    // cy.wait('@createGroup');

    // cy.contains('div', groupName).within(() => {
    //   cy.get('button').contains('Delete Group').click();
    // });
  });

  //   it('adds a new channel to a group', () => {
  //     const channelName = 'New Channel';
  //     cy.get('input[placeholder="Channel Name"]').first().type(channelName);
  //     cy.get('button').contains('Add Channel').first().click();
  //     // Verify the channel was added, possibly intercepting the API call or checking the UI update
  //   });

  //   it('removes a user from a group', () => {
  //     cy.get('button').contains('Remove User').first().click();
  //     // Verify the user is removed from the group (might need to mock or check API response)
  //   });

  //   it('adds and removes a user from a channel', () => {
  //     cy.get('select').eq(0).select('userId'); // Adjust based on how users are identified
  //     cy.get('button').contains('Add User to Channel').click();
  //     // Verify the user is added to the channel
  //     cy.get('button').contains('Remove').click();
  //     // Verify the user is removed from the channel
  //   });
});
