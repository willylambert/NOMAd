/// <reference types="Cypress" />
context('HR Driver', () => {

  beforeEach(() => {
    cy.login();
    cy.navigateToList("data","hr-drivers");
  });

  it('should check hr-driver list page ', () => {
    // Check the page title
    cy.get('legend > div').first().should('contain','Conducteurs');
    // Check that at least one hr is already present in the list
    cy.get('.ag-row').its('length').should('be.greaterThan',0)
    // check the presence of the button for adding a new hr
    cy.get('#btn-add').should('exist');
  });

  it('should create a new driver', () => {
    cy.createNewHRDriver('Pierre','KIROOL');
    var firstname = "Pierre";
    var lastname = "KIROOL";
  });

  it('should update an existing hr-driver', () => {
    // Retrieve the test hr
    cy.navigateToHRDriverCrud('Pierre','KIROOL')
    // Enter edit mode
    cy.get('#btn-edit').click()
    // Change name
    cy.get(':nth-child(3) > .col-md-4 > input').clear().type("Guy");
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('#btn-save').click();
    // Go back to list menu
    cy.get('#btn-list').click();
  });

  it('should check changes in a driver', () => {
    cy.navigateToHRDriverCrud("Guy","KIROOL");
  });

  it('should mark a hr driver as removed', () => {
    // Retrieve the test hr
    cy.navigateToHRDriverCrud("Guy","KIROOL");
    // Enter edit mode (we can not delete an item from view mode)
    cy.get('#btn-edit').click()
    cy.get('#btn-delete').click()
    // Confirm the deletion : we perform a shallow deletion
    cy.get('.modal-footer .btn-success').click()
    // Back in the list menu, check that the hr was removed
    cy.get('legend > div > :nth-child(1)').should('contain','Conducteurs');
    cy.get('.form-control').clear();
    cy.get('.ag-row div[col-id="firstname"]').contains('Guy KIROOL').should('not.exist');
  });

  it('should hard delete an existing driver', () => {
    cy.createNewHRDriver('Guy','KIROOL');
    cy.hardDeleteHRDriver('Guy','KIROOL')
  });

})
  