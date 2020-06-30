/// <reference types="Cypress" />
context('HR', () => {

  beforeEach(() => {
    cy.login();
    cy.navigateToList("data","hrs");
  })

  it('should check hr list page ', () => {
    // Check the page title
    cy.get('legend > div').first().should('contain','Usagers');
    // Check that at least one hr is already present in the list
    cy.get('.ag-row').its('length').should('be.greaterThan',0)
    // check the presence of the button for adding a new hr
    cy.get('#btn-add').should('exist');
  })

  it('should create a new hr', () => {
    cy.createNewHR('Bob','LEPONGE');
  })

  it('should update an existing hr', () => {
    // Retrieve the test hr
    cy.navigateToHRCrud('Bob','LEPONGE')
    // Enter edit mode
    cy.get('#btn-edit').click()
    // Change crisis risk
    cy.get(':nth-child(8) > .col-md-4 > .input-group > .form-control').clear().type('none')
    cy.get('#btn-save').should('not.be.disabled')
    // Change the acceptable duration : this happens in a modal window
    cy.get('[data-index="0"] > :nth-child(1) > .btn').should('be.visible');
    cy.get('[data-index="0"] > :nth-child(1) > .btn').click();
    cy.get('#modal-basic-title').should('be.visible');
    cy.get('.acceptable-duration-to-institution').clear();
    cy.get('.pull-right > .btn-success').should('be.disabled');
    cy.get('.acceptable-duration-to-institution').type('70')
    cy.get('.pull-right > .btn-success').should('not.be.disabled');
    cy.get('.pull-right > .btn-success').click();
    // The modal is now closed, check that we are back on the page
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('[data-index="0"] > :nth-child(3) > span').should('contain','7min');
    cy.get('#btn-save').click();
    // Go back to list menu
    cy.get('#btn-list').click();
  });

  it('should check changes in a hr', () => {
    // Retrieve the test hr
    cy.navigateToHRCrud('Bob','LEPONGE')
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
    cy.get(':nth-child(6) > .col-md-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
    cy.get('.ng-dropdown-panel-items .ng-option').first().next().click()
    cy.get('#btn-cancel').click();
    cy.get('.modal-footer .btn-success').click();
    cy.get('#btn-save').should('not.exist')
  });

  it('should mark a hr as removed', () => {
    // Retrieve the test hr
    cy.navigateToHRCrud('Bob','LEPONGE')
    // Enter edit mode (we can not delete an item from view mode)
    cy.get('#btn-edit').click()
    cy.get('#btn-delete').click()
    // Confirm the deletion : we perform a shallow deletion
    cy.get('.modal-footer .btn-success').click()
    // Back in the list menu, check that the hr was removed
    cy.get('legend > div > :nth-child(1)').should('contain','Usagers');
    cy.get('.form-control').clear().type('LE')
    cy.get('.ag-row div[col-id="firstname"]').contains('Bob LEPONGE').should('not.exist')
  });

  it('should hard delete an existing hr', () => {
    cy.createNewHR('Bob','LEPONGE');
    cy.hardDeleteHR('Bob','LEPONGE')
  });

})
  