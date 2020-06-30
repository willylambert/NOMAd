/// <reference types="Cypress" />
context('Demand', () => {

  beforeEach(() => {
    cy.login();
    cy.navigateToList("logistics","demands");
  })

  /**
   * Create a new transport demand.
   */
  function createNewDemand(){
    // Reach the page for a new demand creation
    cy.get('#btn-add').click();
    cy.get('legend').should('contain','Nouvelle demande');
    cy.get('#btn-save').should('be.disabled')
    // Pick an HR (using a filter)
    cy.get(':nth-child(3) > .col-md-4 > .btn').click();
    cy.get(':nth-child(3) > .col-md-4 > .btn').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(3) > .col-md-4 > .btn').should('have.class', 'ng-invalid')
    cy.get('.modal-header .btn-success').should('not.exist')
    cy.get('.col-md-12 > .form-control').should('exist')
    // Type the filter and check that the number of hits gets very limited
    cy.get('.col-md-12 > .form-control').type('LEPONGE')
    cy.get('.ag-selection-checkbox .ag-icon-checkbox-unchecked').eq(3).should('not.exist')
    cy.get('.modal-header .btn-success').should('not.exist')
    cy.get('.ag-selection-checkbox .ag-icon-checkbox-unchecked').first().click();
    cy.get('.modal-header .btn-success').should('exist')
    cy.get('.modal-header .btn-success').click()
    cy.get(':nth-child(3) > .col-md-4 > .btn').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(3) > .col-md-4 > .btn').should('have.class', 'ng-valid')
    // Pick an institution
    cy.get(':nth-child(2) > .col-md-4 > .btn').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(2) > .col-md-4 > .btn').should('have.class', 'ng-invalid')
    cy.get(':nth-child(2) > .col-md-4 > .btn').click();
    cy.get('.modal-header .btn-success').should('not.exist')
    cy.get('.ag-selection-checkbox .ag-icon-checkbox-unchecked').first().click();
    cy.get('.modal-header .btn-success').should('exist')
    cy.get('.modal-header .btn-success').click()
    cy.get(':nth-child(2) > .col-md-4 > .btn').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(2) > .col-md-4 > .btn').should('have.class', 'ng-valid')
    // Pick 2 dates (the start date is the earliest date that is displayed after the start calendar button click,
    //   and the end date is the latest date after the end calendar buton click)
    cy.get('.fa-calendar').first().click()
    cy.get('.ngb-dp-day').first().click()
    cy.get('.fa-calendar').last().click()
    cy.get('.ngb-dp-day').last().click()
    // Pickup a morning timeslot and set the associated time window
    cy.get(':nth-child(6) > .col-lg-9 > table').should('have.class', 'ng-invalid')
    cy.get(':nth-child(6) > .col-lg-9 > table').should('not.have.class', 'ng-valid')
    cy.get('tbody > :nth-child(1) > :nth-child(1) > .btn').click();
    cy.get(':nth-child(6) > .col-lg-9 > table').should('have.class', 'ng-valid')
    cy.get(':nth-child(6) > .col-lg-9 > table').should('not.have.class', 'ng-invalid')
    // The widget for typing hours should not be visible by default
    cy.get('.col-md-9 > .btn').should('exist');
    cy.get('.col-md-9 > .btn').click();
    cy.get('.col-md-9 > .btn').should('not.exist');
    cy.get(':nth-child(3) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .form-control').type('8')
    cy.get(':nth-child(3) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .form-control').type('0')
    cy.get(':nth-child(5) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .form-control').type('12')
    cy.get(':nth-child(5) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .form-control').type('0')
    // Click somewhere in the page so as to leave the time picker, which makes the formular valid
    cy.get('tbody').click();
    cy.get('#btn-save').should('not.be.disabled')
    // Save the demand
    cy.get('#btn-save').click();
    // Check that we are redirected to the created demand in view mode
    cy.get('legend').should('contain','Demande de transport');
  }

  /**
   * Assuming we are in the transport demand list menu, navigate to the last transport demand crud
   */
  function navigateToCrud(){
    // Filter the transport demands and check that only one matches the pattern
    cy.get('.form-control').clear().type("LEPONGE")
    cy.get('[ref="lbRecordCount"]').should('contain','1')
    // Check that the filtered demands contain the one we want and open it
    cy.get('div.ag-row div[col-id="site_poi_label_hr"]').eq(0).should('contain','Bob LEPONGE (mézon)')
    cy.get('div.ag-row div[col-id="site_poi_label_hr"]').eq(0).click();
    // Check that we reach the transport demand crud page
    cy.get('legend').should('contain','Demande de transport');
    // Wait for timeslots to be loaded
    cy.get('form table tbody tr td').should('exist');
  }

  it('should check demand list page ', () => {
    // Check the page title
    cy.get('legend > div').first().should('contain','Demandes');
    // Check that at least one demand is already present in the list
    cy.get('.ag-row').its('length').should('be.greaterThan',0)
    // check the presence of the button for adding a new demand
    cy.get('#btn-add').should('exist');
  })

  it('should create a new demand', () => {
    // Creation of a new test HR
    cy.createNewHR('Bob','LEPONGE');
    // Creation of a demand with the new HR
    cy.navigateToList("logistics","demands");
    createNewDemand();
  })

  it('should update an existing demand', () => {
    // Retrieve the test demand
    navigateToCrud()
    // Enter edit mode
    cy.get('#btn-edit').click()
    // pick a timeslot in the afternoon
    cy.get('tbody > :nth-child(2) > :nth-child(1) > .btn').click()
    // The widget for typing hours in the afternoon should not be visible by default
    cy.get('.col-md-9 > .btn').should('exist');
    cy.get('.col-md-9 > .btn').click();
    cy.get('.col-md-9 > .btn').should('not.exist');
    cy.get(':nth-child(8) > :nth-child(3) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .form-control').type('14');
    cy.get(':nth-child(8) > :nth-child(3) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .form-control').type('0')
    cy.get(':nth-child(8) > :nth-child(5) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .form-control').type('18');
    cy.get(':nth-child(8) > :nth-child(5) > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .form-control').type('0')
    // Click somewhere in the page so as to leave the time picker, which makes the formular valid
    cy.get('tbody').click();
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('#btn-save').click();
    // Check that we are redirected to the created demand in view mode
    cy.get('legend').should('contain','Demande de transport');
    cy.get('#btn-save').should('not.exist');
    // Go back to list menu
    cy.get('#btn-list').click();
  });

  it('should check changes in a demand', () => {
    // Retrieve the test demand
    navigateToCrud()
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
    cy.get('tbody > :nth-child(2) > :nth-child(1) > .btn').should('be.visible')
    cy.get(':nth-child(8) > :nth-child(1)').should('contain','Descente')
    cy.get('tbody > :nth-child(2) > :nth-child(1) > .btn').click()
    cy.get('#btn-cancel').click();
    cy.get('.modal-footer .btn-success').click();
    cy.get('#btn-save').should('not.exist')
  });

  it('should mark a demand as removed', () => {
    //TODO : compter le nombre de demandes avant et après
    // Retrieve the test demand
    navigateToCrud()
    // Enter edit mode (we can not delete an item from view mode)
    cy.get('#btn-edit').click()
    cy.get('#btn-delete').click()
    // Confirm the deletion : we perform a shallow deletion
    cy.get('.modal-footer .btn-success').click()
    // Check that we are back on the list page
    cy.get('legend > div  > :nth-child(1)').should('contain','Demandes');
    // Filter the list of transport demands
    cy.get('.form-control').should('exist')
    cy.get('.form-control').clear().type("LEPONGE")
    // Check that there is no transport demand with the test user
    cy.get('[ref="lbRecordCount"]').should('contain','0')
  });

  it('should hard delete a transport demand', () => {
    //TODO : compter le nombre de demandes avant et après
    createNewDemand();
    cy.navigateToList("logistics","demands");
    // Retrieve the test demand
    navigateToCrud();
    // Enter edit mode (we can not delete an item from view mode)
    cy.get('#btn-edit').click()
    cy.get('#btn-delete').click()
    // Confirm the deletion : we perform a hard deletion
    cy.get('#chkDelete').click()
    cy.get('.modal-footer .btn-success').click()
    // Check that we are back on the list page
    cy.get('legend > div  > :nth-child(1)').should('contain','Demandes');
    // Filter the list of transport demands
    cy.get('.form-control').should('exist')
    cy.get('.form-control').clear().type("LEPONGE")
    // Check that there is no transport demand with the test user
    cy.get('[ref="lbRecordCount"]').should('contain','0')
    // Delete the HR after last test
    cy.hardDeleteHR('Bob','LEPONGE');
  });

  })
  