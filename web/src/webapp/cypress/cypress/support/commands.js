// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Login function
Cypress.Commands.add("login", () => {
  cy.visit("")
  // enter the login and password
  cy.get('input[formcontrolname=username]').type('cypress');
  cy.get('input[formcontrolname=password]').type('cypress');
  cy.get('button[name=submit]').click();
  // Check that we are on home page and that we are logged-in (user name must appear at the upper right page corner)
  cy.get('h2').should('contain','Bienvenue');
  cy.get('.my-md-0').should('contain','Cypress');
})

/**
 * Navigate to the right menu and submenu : the ids for the menu and submenus must be defined in the navbar html
 * @param string menu : data or logistics or optim
 * @param string submenu : see the html id attributes in the navbar html
 */
Cypress.Commands.add("navigateToList", (menu,submenu) => {
  // Unfold a menu and click on the item to reach the submenu.
  cy.get('#'+menu+'-navbarDropdown').should('be.visible');
  cy.get('#'+menu+'-navbarDropdown').click();
  cy.get('#'+menu+'-'+submenu).should('be.visible');
  cy.get('#'+menu+'-'+submenu).click();
})

/**
 * Create a new hr.
 * @param string firstname : the hr firstname
 * @param string lastname : the hr lastname
 */
Cypress.Commands.add("createNewHRDriver", (firstname,lastname) => {
  // Unfold a menu and click on the item to reach the submenu.
  cy.navigateToList("data","hr-drivers");
  // The ag-grid uses the firstname column to display the firstname aggregated with the lastname
  cy.get('.form-control').clear().type(lastname.substring(0,2))
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).should('not.exist')

  // Reach the page for a new driver creation
  cy.get('#btn-add').click();
  cy.get('legend').should('contain','Nouveau conducteur');
  cy.get('#btn-save').should('be.disabled')
  // Set the lastname
  cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-valid')
  cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-invalid')
  cy.get(':nth-child(2) > .col-md-4 > input').type(lastname);
  cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-invalid')
  cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-valid')
  // Set the firstname
  cy.get(':nth-child(3) > .col-md-4 > input').should('not.have.class', 'ng-valid')
  cy.get(':nth-child(3) > .col-md-4 > input').should('have.class', 'ng-invalid')
  cy.get(':nth-child(3) > .col-md-4 > input').type(firstname);
  cy.get(':nth-child(3) > .col-md-4 > input').should('not.have.class', 'ng-invalid')
  cy.get(':nth-child(3) > .col-md-4 > input').should('have.class', 'ng-valid')

  // Gender choice : male
  cy.get(':nth-child(4) > .col-md-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
  cy.get('.ng-dropdown-panel-items .ng-option').first().next().click()

  // Status choice : active
  cy.get(':nth-child(5) > .col-md-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
  cy.get('.ng-dropdown-panel-items .ng-option').first().click()

  // Attach the HR to an existing transporters (since page may be crowded, scroll before click)
  cy.get('#btn-update-transporter').scrollIntoView().should('be.visible');
  cy.get('#btn-update-transporter').click()
  cy.get('.modal-header').should('exist')
  cy.get('.ag-selection-checkbox .ag-icon-checkbox-unchecked').first().click();
  cy.get('.modal-header .btn-success').should('exist')
  cy.get('.modal-header .btn-success').click()
  // Check that the list of transporters is updated
  cy.get('.modal-header .btn-success').should('not.exist')
  cy.get('#site-table tbody tr td').should('exist')
  cy.get('#btn-save').scrollIntoView().should('not.be.disabled')
  cy.get('#btn-save').click();
  cy.get('.h5').should('contain','Conducteur '+firstname+' '+lastname);
})

/**
 * Create a new hr.
 * @param string firstname : the hr firstname
 * @param string lastname : the hr lastname
 */
Cypress.Commands.add("createNewHR", (firstname,lastname) => {
  // Unfold a menu and click on the item to reach the submenu.
  cy.navigateToList("data","hrs");
  // The ag-grid uses the firstname column to display the firstname aggregated with the lastname
  cy.get('.form-control').clear().type(lastname.substring(0,2))
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).should('not.exist')

  // Reach the page for a new hr creation
  cy.get('#btn-add').click();
  cy.get('legend').should('contain','Nouvel usager');
  cy.get('#btn-save').should('be.disabled')
  // Set the lastname
  cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-valid')
  cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-invalid')
  cy.get(':nth-child(2) > .col-md-4 > input').type(lastname);
  cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-invalid')
  cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-valid')
  // Set the firstname
  cy.get(':nth-child(3) > .col-md-4 > input').should('not.have.class', 'ng-valid')
  cy.get(':nth-child(3) > .col-md-4 > input').should('have.class', 'ng-invalid')
  cy.get(':nth-child(3) > .col-md-4 > input').type(firstname);
  cy.get(':nth-child(3) > .col-md-4 > input').should('not.have.class', 'ng-invalid')
  cy.get(':nth-child(3) > .col-md-4 > input').should('have.class', 'ng-valid')
  // Set the date of birth
  cy.get('.input-group-append > .btn').click()
  //cy.get('[aria-label="Select year"]').select('2010')
  cy.get('.ngb-dp-day').first().click()
  // Gender choice : male
  cy.get(':nth-child(5) > .col-md-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
  cy.get('.ng-dropdown-panel-items .ng-option').first().next().click()
  // Status choice : active
  cy.get(':nth-child(6) > .col-md-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
  cy.get('.ng-dropdown-panel-items .ng-option').first().click()
  // Transportation mode : walking
  cy.get(':nth-child(7) > .col-md-4 > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click()
  cy.get('.ng-dropdown-panel-items .ng-option').first().click()
  // Crisis risks
  cy.get(':nth-child(8) > .col-md-4 > .input-group > .form-control').type('aucun')
  // Specific arrangements
  cy.get(':nth-child(9) > .col-md-4 > .input-group > .form-control').type('aucun')
  // The minimal information for formular validity was set
  cy.get('#btn-save').should('not.be.disabled')
  // Now we want to draw a marker on the map.
  // First, move the map to an adress of interest
  cy.get('.leaflet-control-geocoder-icon').click()
  cy.get('.leaflet-control-geocoder-form >input').should('be.visible')
  cy.get('.leaflet-control-geocoder-form >input').type('Lyon')
  cy.get('.leaflet-control-geocoder-form >input').type('{enter}')
  cy.get('.leaflet-control-geocoder-alternatives').should('be.visible')
  cy.get('.leaflet-control-geocoder-alternatives > li > a').first().click()
  // Then activate the marker drawing mode
  cy.get('.leaflet-draw-draw-marker').click()
  // Note :
  //   In order to trigger a click on the map so as to put a marker on it, a first attempt is
  //     using cy.get('.leaflet-container').click() instruction, but it seems to be effectless.
  //   As an alternative, we want to click on the geocoder marker.
  //   So as to avoid mismatch between the geocoder marker and the
  //     drawing marker (marker that is temporarilly generated by leaflet-draw and that is following the
  //     mouse pointer for animation purpose) we prefer click on the geocoder marker shadow.
  //   Last thing, since the geocoder marker shadow may be hidden by the temporary drawing marker, we have
  //     to force the click on the marker shadow.
  cy.get('.leaflet-shadow-pane > img').first().click({ force: true })
  cy.get('.modal-dialog').should('exist')
  cy.get(':nth-child(1) > .col-lg-8 > .form-control').should('exist')
  cy.get(':nth-child(1) > .col-lg-8 > .form-control').type('mézon')
  // Add a service duration
  cy.get(':nth-child(6) > .col-lg-8 > .input-group > .form-control').clear();
  cy.get(':nth-child(6) > .col-lg-8 > .input-group > .form-control').type('7');
  cy.get('.pull-right > .btn-success').should('not.be.disabled')
  cy.get('.pull-right > .btn-success').click()
  // Attach the HR to an existing institution (since page may be crowded, scroll before click)
  cy.get('#btn-update-establishment').scrollIntoView().should('be.visible');
  cy.get('#btn-update-establishment').click()
  cy.get('.modal-header').should('exist')
  cy.get('.ag-selection-checkbox .ag-icon-checkbox-unchecked').first().click();
  cy.get('.modal-header .btn-success').should('exist')
  cy.get('.modal-header .btn-success').click()
  // Check that the list of institutions is updated
  cy.get('.modal-header .btn-success').should('not.exist')
  cy.get('#site-table tbody tr td').should('exist')
  cy.get('#btn-save').scrollIntoView().should('not.be.disabled')
  cy.get('#btn-save').click();
  cy.get('.h5').should('contain','Usager '+firstname+' '+lastname);
})

/**
 * Navigate to a hr crud
 * @param string firstname : the hr firstname
 * @param string lastname : the hr lastname
 */
Cypress.Commands.add("navigateToHRCrud", (firstname,lastname) => {
  cy.navigateToList("data","hrs");
  cy.get('.form-control').clear().type(lastname)
  cy.get('[ref="lbRecordCount"]').should('contain','1')
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).should('exist')
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).click();
  cy.get('.h5').should('contain','Usager '+firstname+' '+lastname);
})

/**
 * Navigate to a hr driver crud
 * @param string firstname : the hr firstname
 * @param string lastname : the hr lastname
 */
Cypress.Commands.add("navigateToHRDriverCrud", (firstname,lastname) => {
  cy.navigateToList("data","hr-drivers");
  cy.get('.form-control').clear().type(lastname)
  cy.get('[ref="lbRecordCount"]').should('contain','1')
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).should('exist')
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).click();
  cy.get('.h5').should('contain','Conducteur '+firstname+' '+lastname);
})

/**
 * Hard delete an existing hr.
 * @param string firstname : the hr firstname
 * @param string lastname : the hr lastname
 */
Cypress.Commands.add("hardDeleteHR", (firstname,lastname) => {
  // Retrieve the test hr
  cy.navigateToHRCrud(firstname,lastname);
  // Enter edit mode (we can not delete an item from view mode)
  cy.get('#btn-edit').click()
  cy.get('#btn-delete').click()
  // Confirm the deletion : we perform a hard deletion, otherwise we will not be able to play the test again
  cy.get('#chkDelete').click()
  cy.get('.modal-footer .btn-success').click()
  // Back in the list menu, check that the hr was removed
  cy.get('legend > div > :nth-child(1)').should('contain','Usagers');
  cy.get('.form-control').clear().type(lastname.substring(0,2))
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).should('not.exist')
})

/**
 * Hard delete an existing hr.
 * @param string firstname : the hr firstname
 * @param string lastname : the hr lastname
 */
Cypress.Commands.add("hardDeleteHRDriver", (firstname,lastname) => {
  // Retrieve the test hr
  cy.navigateToHRDriverCrud(firstname,lastname);
  // Enter edit mode (we can not delete an item from view mode)
  cy.get('#btn-edit').click()
  cy.get('#btn-delete').click()
  // Confirm the deletion : we perform a hard deletion, otherwise we will not be able to play the test again
  cy.get('#chkDelete').click()
  cy.get('.modal-footer .btn-success').click()
  // Back in the list menu, check that the hr was removed
  cy.get('legend > div > :nth-child(1)').should('contain','Conducteurs');
  cy.get('.form-control').clear();
  cy.get('.ag-row div[col-id="firstname"]').contains(firstname+' '+lastname).should('not.exist')
})

/**
 * Create a new scenario. In the current version the scenario reference and label are the only parameter that can be changed.
 * @param string reference : the scenario reference
 * @param string label : the scenario label
 */
Cypress.Commands.add("createNewScenario", (reference,label) => {
  // Unfold a menu and click on the item to reach the submenu.
  cy.navigateToList("logistics","scenario");
  cy.get('tr>td>a').contains(reference).should('not.exist')
  // Reach the page for a new scenario creation
  cy.get('#btn-add').click();
  cy.get('legend').should('contain','Nouveau scénario');
  cy.get('#btn-save').should('be.disabled')
  // Set the reference
  cy.get(':nth-child(2) > .col-md-9 > input').should('not.have.class', 'ng-valid')
  cy.get(':nth-child(2) > .col-md-9 > input').should('have.class', 'ng-invalid')
  cy.get(':nth-child(2) > .col-md-9 > input').type(reference);
  cy.get(':nth-child(2) > .col-md-9 > input').should('not.have.class', 'ng-invalid')
  cy.get(':nth-child(2) > .col-md-9 > input').should('have.class', 'ng-valid')
  // Set the label
  cy.get(':nth-child(3) > .col-md-9 > input').should('not.have.class', 'ng-valid')
  cy.get(':nth-child(3) > .col-md-9 > input').should('have.class', 'ng-invalid')
  cy.get(':nth-child(3) > .col-md-9 > input').type(label);
  cy.get(':nth-child(3) > .col-md-9 > input').should('not.have.class', 'ng-invalid')
  cy.get(':nth-child(3) > .col-md-9 > input').should('have.class', 'ng-valid')
  // Set the status
  cy.get('ng-select').should('not.have.class', 'ng-valid')
  cy.get('ng-select').should('have.class', 'ng-invalid')
  cy.get('ng-select .ng-input > input').click()
  cy.get('ng-select .ng-dropdown-panel-items .ng-option').first().click()
  cy.get('ng-select').should('not.have.class', 'ng-invalid')
  cy.get('ng-select').should('have.class', 'ng-valid')
  // Pick 2 dates (the start date is the earliest date that is displayed after the start calendar button click,
  //   and the end date is the latest date after the end calendar buton click)
  cy.get('#btn-save').should('be.disabled')
  cy.get('.fa-calendar').first().click()
  cy.get('.ngb-dp-day').first().click()
  cy.get('.fa-calendar').last().click()
  cy.get('.ngb-dp-day').last().click()
  // The mandatory part of the form was filled
  cy.get('#btn-save').should('not.be.disabled')
  cy.get('#btn-update-groups').should('be.visible')
  // Open the modal windows for groups picking
  cy.get('#btn-update-groups').click()
  cy.get('.modal-dialog').should('be.visible')
  cy.get('#modal-basic-title').should('be.visible')
  cy.get('#modal-basic-title').should('contain','Groupes de demandes pour le scenario '+reference)
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
  cy.get('#btn-update-fleet').should('be.visible')
  // Open the modal windows for fleet picking
  cy.get('#btn-update-fleet').click()
  cy.get('.modal-dialog').should('be.visible')
  cy.get('#modal-basic-title').should('be.visible')
  cy.get('#modal-basic-title').should('contain','Flotte de véhicules pour le scenario '+reference)
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
  cy.get('#btn-save').click();
  cy.get('.h5').should('contain','Scénario '+reference);
})
