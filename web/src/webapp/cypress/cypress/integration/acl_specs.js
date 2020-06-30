/// <reference types="Cypress" />
context('ACL', () => {

  /**
   * In case a modal was just closed, some information may be passed to a ag grid which will cause the ag grid
   *   to update its DOM. In that case, retrieving an element in the ag grid DOM can be misleading if the retrieval
   *   starts before the ag grid DOM is ready.
   */
  function waitGrid(){
    // Option 1 : reload the page (visit the home page and get back)
    // reloadPage()

    // Option 2 : play with the navbar withoyt reloading the page
    // navigateToList()

    // Option 3 : wait for a few milliseconds
    cy.wait(500);
  }

  /**
   * Force page reload by visiting the home page and then going back to the ACL list page
   */
  function reloadPage(){
    cy.get('img').click();
    cy.navigateToList("data","acl");
  }

  beforeEach(() => {
    cy.login();
    cy.navigateToList("data","acl");
  })

  it('should check acl list page ', () => {
    // Check the page titles
    cy.get('.acl-users h4').should('contain','Utilisateurs');
    cy.get('.acl-roles h4').should('contain','Rôles');
    cy.get('.acl-actions h4').should('contain','Actions');
    // Check that at least one user is already present in the list
    cy.get('.acl-users .ag-row').its('length').should('be.greaterThan',0)
    // Check that at least one role is already present in the list
    cy.get('.acl-roles .ag-row').its('length').should('be.greaterThan',0)
    // Check that at least one action is already present in the list
    cy.get('.acl-actions .ag-row').its('length').should('be.greaterThan',0)
    // check the presence of the button for adding a new role
    cy.get('#btn-add-role').should('exist');
  })

  /**
   * Open the modal that enables to grant some roles to a user.
   * User is assumed to already have the ADMIN role.
   * @param string user : user for which we want to have the modal open
   */
  function openUserModal(user){
    // Check the page title
    cy.get(':nth-child(1) > h4').should('contain','Utilisateurs');
    // Check that at least one user is already present in the list
    cy.get('.acl-users .ag-row').its('length').should('be.greaterThan',0)
    cy.get('.acl-users .ag-row button').contains(user).click();
    // Check that we entered the modal for user/role association
    cy.get('#modal-basic-title').should('exist')
    cy.get('.col-lg-2').should('contain','Rôles');
    // Check that at least one right is proposed in the list
    cy.get('.ag-row').its('length').should('be.greaterThan',0)
    // Check that the list of rights is loaded
    cy.get('.ag-row div[col-id="code"] .ag-cell-wrapper').contains('ADMIN').prev('.ag-selection-checkbox').children('.ag-icon-checkbox-checked').should('have.class','ag-hidden');
    cy.get('.ag-row div[col-id="code"] .ag-cell-wrapper').contains('ADMIN').prev('.ag-selection-checkbox').children('.ag-icon-checkbox-unchecked').should('not.have.class','ag-hidden');
    cy.get('.ag-row div[col-id="code"] .ag-cell-wrapper').contains('ADMIN').prev('.ag-selection-checkbox').children('.ag-icon-checkbox-indeterminate').should('have.class','ag-hidden');
  }

  it('should create a new role', () => {
    // check the presence of the button for adding a new role
    cy.get('#btn-add-role').should('exist');
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').should('not.exist')
    cy.get('#btn-add-role').click();
    cy.get('#modal-basic-title').should('contain','Nouveau rôle');
    cy.get(':nth-child(1) > .col-lg-10 > .form-control').type('test_role')
    cy.get(':nth-child(2) > .col-lg-10 > .form-control').type('test_role')
    cy.get('.ag-cell-wrapper > .ag-selection-checkbox > .ag-icon-checkbox-unchecked').first().click()
    cy.get('.modal-footer > .btn-success').click();
    cy.get('#modal-basic-title').should('not.exist');
    // Without this delay, the ag grid loaded in DOM would still contain the old values
    waitGrid()
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').should('exist')
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').should('contain','test_role');
  })

  /**
   * Assuming we are in the acl list menu, navigate to a role crud menu
   * @param string role
   */
  function navigateToRoleCrud(role){
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').contains(role).should('exist')
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').contains(role).click();
    // Check that the modal title is present and contains the role, which forces to wait for the ag grid DOM completion
    cy.get('#modal-basic-title').should('contain','Rôle '+role);
    // Check that the modal title is exactly the one we expect (we can do that only when the ag grid DOM is complete)
    cy.get('#modal-basic-title').invoke('text').should('eq','Rôle '+role)
  }

  it('should update an existing role', () => {
    navigateToRoleCrud('test_role');
    cy.get(':nth-child(2) > .col-lg-10 > .form-control').clear().type('modified test')
    cy.get('.modal-footer > .btn-success').click();
    cy.get('#modal-basic-title').should('not.exist');
    // Without this delay, the ag grid loaded in DOM would still contain the old values
    waitGrid()
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').contains('test_role').should('exist')
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').contains('test_role').parent().parent().next().invoke('text').should('eq','modified test')
  })

  it('should check that user can view his roles', () => {
    // Check the page title
    cy.get(':nth-child(1) > h4').should('contain','Utilisateurs');
    // Check that at least one user is already present in the list
    cy.get('.acl-users .ag-row').its('length').should('be.greaterThan',0)
    cy.get('.acl-users .ag-row button').contains('cypress').click();
    // Check that we entered the modal for user/role association
    cy.get('#modal-basic-title').should('exist')
    cy.get('.col-lg-2').should('contain','Rôles');
    // Check that at least one right is proposed in the list
    cy.get('.ag-row').its('length').should('be.greaterThan',0)
    cy.get('.close > span').should('exist')
    cy.get('.close > span').click();
    // Check the page title
    cy.get(':nth-child(1) > h4').should('contain','Utilisateurs');
  })

  it('should hard delete an existing role', () => {
    navigateToRoleCrud('test_role');
    cy.get('.modal-footer > .btn-danger').click();
    cy.get('#modal-basic-title').should('not.exist');
    // Without this delay, the ag grid loaded in DOM would still contain the old values
    reloadPage()
    cy.get('.acl-roles div[row-id="5"] div[col-id="code"]').should('not.exist')
  })
})
