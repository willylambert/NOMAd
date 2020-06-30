/// <reference types="Cypress" />
context('datachecker', () => {

  beforeEach(() => {
    cy.login();
    cy.navigateToList("data","checkers");
  })

  it('should check datacheckers list page ', () => {
    // Check the page title
    cy.get('legend > div').first().should('contain','Contrôles de cohérence');
    // Check that at least one hr is already present in the list
    cy.get('.ag-row').its('length').should('be.greaterThan',0)
  });

});