/// <reference types="Cypress" />
context('User', () => {

  beforeEach(() => {
    cy.login();
    cy.navigateToList("data","users");
  })

  it('should check user list page ', () => {
    // Check the page title
    cy.get('legend > div').first().should('contain','Utilisateurs');
    // Check that at least one user is already present in the list
    cy.get('tr>td>a').its('length').should('be.greaterThan',0)
    // check the presence of the button for adding a new user
    cy.get('#btn-add').should('exist');
  })

  /**
   * Create a new user. In the current version the user login is the only parameter that can be changed.
   * @param string login : the user login
   */
  function createNewUser(login){
    cy.get('tr>td>a').contains(login).should('not.exist')

    // Reach the page for a new user creation
    cy.get('#btn-add').click();
    cy.get('#btn-save').should('be.disabled')
    // Set the login
    cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-invalid')
    cy.get(':nth-child(2) > .col-md-4 > input').type(login);
    cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-valid')
    // Set the password (must be at least 8 characters)
    cy.get(':nth-child(3) > .col-lg-4 > input').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(3) > .col-lg-4 > input').should('have.class', 'ng-invalid')
    cy.get(':nth-child(3) > .col-lg-4 > input').type(login+login+login);
    cy.get(':nth-child(3) > .col-lg-4 > input').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(3) > .col-lg-4 > input').should('have.class', 'ng-valid')
    // Set the firstname
    cy.get(':nth-child(4) > .col-lg-10 > input').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(4) > .col-lg-10 > input').should('have.class', 'ng-invalid')
    cy.get(':nth-child(4) > .col-lg-10 > input').type('Bob');
    cy.get(':nth-child(4) > .col-lg-10 > input').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(4) > .col-lg-10 > input').should('have.class', 'ng-valid')
    // Set the lastname
    cy.get(':nth-child(5) > .col-lg-10 > input').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(5) > .col-lg-10 > input').should('have.class', 'ng-invalid')
    cy.get(':nth-child(5) > .col-lg-10 > input').type('LEPONGE');
    cy.get(':nth-child(5) > .col-lg-10 > input').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(5) > .col-lg-10 > input').should('have.class', 'ng-valid')
    // Status choice : active
    cy.get(':nth-child(6) >  .col-lg-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
    cy.get('.ng-dropdown-panel-items .ng-option').first().click()
    // Type choice : client
    cy.get(':nth-child(7) > .col-lg-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
    cy.get('.ng-dropdown-panel-items .ng-option').first().click()
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('#btn-save').click();
    cy.get('.h5').should('contain','Utilisateur '+login);
    cy.get('#btn-save').should('not.exist')
    cy.get('#btn-edit').should('exist')
  }

  it('should create a new user', () => {
    createNewUser('u_test')
  })

  /**
   * Assuming we are in the user list menu, navigate to a user crud
   * @param string login : the user login
   */
  function navigateToCrud(login){
    cy.get('tr>td>a').contains(login).should('exist')
    cy.get('tr>td>a').contains(login).click();
    cy.get('.h5').should('contain','Utilisateur '+login);
    cy.get('#btn-save').should('not.exist')
    cy.get('#btn-edit').should('exist')
  }

  it('should update an existing user', () => {
    // Retrieve the test user
    navigateToCrud('u_test')
    // Enter edit mode
    cy.get('#btn-edit').click()
    // Change the first and lastname
    cy.get(':nth-child(4) > .col-lg-10 > input').clear().type('Patrick');
    cy.get(':nth-child(5) > .col-lg-10 > input').clear().type('LETOILE-DEMER');
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('#btn-save').click();
    // Go back to list menu
    cy.get('#btn-list').click();
  });

  it('should check changes in a user', () => {
    // Retrieve the test user
    navigateToCrud('u_test')
    // Enter edit mode
    cy.get('#btn-edit').click()
    cy.get('#btn-save').should('not.be.disabled')
    // Cancel after no modification
    cy.get('#btn-cancel').click();
    cy.get('#btn-save').should('not.exist')
    // Enter edit mode again
    cy.get('#btn-edit').click()
    cy.get('#btn-save').should('not.be.disabled')
    // Cancel after a modification : a confirmation should be requested
    cy.get(':nth-child(6) > .col-lg-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
    cy.get('.ng-dropdown-panel-items .ng-option').first().next().click()
    cy.get('#btn-cancel').click();
    cy.get('.modal-footer .btn-success').click();
    cy.get('#btn-save').should('not.exist')
  });

  it('should hard delete an existing user', () => {
    // Retrieve the test user
    navigateToCrud('u_test');
    // Enter edit mode (we can not delete an item from view mode)
    cy.get('#btn-edit').click()
    cy.get('#btn-delete').click()
    // Confirm the deletion : we perform a hard deletion, otherwise we will not be able to play the test again
    cy.get('#chkDelete').click()
    cy.get('.modal-footer .btn-success').click()
    // Back in the list menu, check that the user was removed
    cy.get('legend > div > :nth-child(1)').should('contain','Utilisateurs');
    cy.get('tr>td>a').contains('u_test').should('not.exist')
  });
})
    