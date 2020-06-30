/// <reference types="Cypress" />
context('scenario', () => {

    beforeEach(() => {
      cy.login();
      cy.navigateToList("logistics","scenario");
    })

    it('should check scenario list page ', () => {
      // Check the page title
      cy.get('legend > div').first().should('contain','Scénarios');
      // Check that at least one scenario is already present in the list
      cy.get('tr>td>a').its('length').should('be.greaterThan',0)
      // check the presence of the button for adding a new scenario
      cy.get('#btn-add').should('exist');
    })

    it('should create a new scenario', () => {
      cy.createNewScenario('scenario_test','scénario test');
    })

    /**
     * Assuming we are in the scenario list menu, navigate to a scenario crud
     * @param string reference : the scenario reference
     */
     function navigateToCrud(reference){
      cy.get('.form-control').clear().type(reference)
      cy.get('tr>td>a').contains(reference).should('exist')
      cy.get('tr>td>a').contains(reference).click();
      cy.get('.h5').should('contain','Scénario '+reference);
    }

    it('should update an existing scenario', () => {
      // Retrieve the test scenario
      navigateToCrud('scenario_test');
      // click on the main tab
      cy.get('#crud').click()   
      // Enter edit mode
      cy.get('#btn-edit').click()
      // Change the description
      cy.get(':nth-child(3) > .col-md-9 > input').type("changed label");
      cy.get('#btn-save').should('not.be.disabled')
      cy.get('#btn-save').click();
      // Go back to list menu
      cy.get('#btn-list').click();
    });

    it('should check changes in a scenario', () => {
      // Retrieve the test scenario
      navigateToCrud('scenario_test');
      // click on the main tab
      cy.get('#crud').click()   
      // Enter edit mode
      cy.get('#btn-edit').click()
      cy.get('#btn-save').should('not.be.disabled')
      // Cancel after no modification
      cy.get('#btn-cancel').click();
      cy.get('#btn-save').should('not.exist')
      // Enter edit mode again
      cy.get('#btn-edit').click()
      cy.get('#btn-save').should('not.be.disabled')
      // Modify one element of the form : here this will be the fleet
      cy.get('#btn-update-fleet').should('be.visible')
      // Open the modal windows for fleet picking
      cy.get('#btn-update-fleet').click()
      cy.get('.modal-dialog').should('be.visible')
      cy.get('#modal-basic-title').should('be.visible')
      cy.get('#modal-basic-title').should('contain','Flotte de véhicules pour le scenario scenario_test')
      // At least one row must be visible, but there may be some hidden row because of ag-grid
      //  So instead of targetting ag-row we target ag-celles
      cy.get('.ag-row .ag-cell').its('length').should('be.greaterThan',0)
      cy.get('.ag-row .ag-cell').eq(0).click()
      cy.get('.modal-dialog .btn-success ').should('not.be.disabled')
      cy.get('.modal-dialog .btn-success ').click()
      // Check that we are back in the scenario crud page
      cy.get('.modal-dialog').should('not.be.visible')
      cy.get('#btn-save').should('be.visible')
      cy.get('#btn-save').should('not.be.disabled')
      // Cancel after a modification : a confirmation should be requested
      cy.get('#btn-cancel').click();
      cy.get('.modal-footer .btn-success').click();
      cy.get('#btn-save').should('not.exist')
    });

    it('should hard delete an existing scenario', () => {
      // Retrieve the test scenario
      navigateToCrud('scenario_test');
      // click on the main tab
      cy.get('#crud').click()   
      // Enter edit mode (we can not delete an item from view mode)
      cy.get('#btn-edit').click()
      cy.get('#btn-delete').click()
      // Confirm the deletion : we perform a hard deletion, otherwise we will not be able to play the test again
      cy.get('#chkDelete').click()
      cy.get('.modal-footer .btn-success').click()
      // Back in the list menu, check that the scenario was removed
      cy.get('legend > div > :nth-child(1)').should('contain','Scénarios');
      cy.get('tr>td>a').contains('scenario_test').should('not.exist')
    });

    it('should mark a scenario as removed', () => {
      // Create a random number between 10000 and 19999
      var reference = 'test_'+(10000+Math.floor((Math.random() * 10000)));
      cy.createNewScenario(reference,'Random test scenario');
      // Retrieve the test scenario
      cy.navigateToList("logistics","scenario");
      navigateToCrud(reference);
      // click on the main tab
      cy.get('#crud').click()   
      // Enter edit mode (we can not delete an item from view mode)
      cy.get('#btn-edit').click()
      cy.get('#btn-delete').click()
      // Confirm the deletion : we perform a shallow deletion
      cy.get('.modal-footer .btn-success').click()
      // Back in the list menu, check that the scenario was removed
      cy.get('legend > div > :nth-child(1)').should('contain','Scénarios');
      cy.get('tr>td>a').contains(reference).should('not.exist')
    });

  })
    