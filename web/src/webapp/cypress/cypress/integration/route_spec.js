/// <reference types="Cypress" />
context('Route', () => {

  beforeEach(() => {
    cy.login();
    cy.navigateToList("logistics","trip");
  })

  it('should check welcome route page ', () => {
    // Check that everything is in order on the route page :
    // Page title should be displayed
    cy.get('.h5').should('contain','Tournées');
    // Map should contain no POI representing a HR or a transport demand
    cy.get('#mapid .leaflet-overlay-pane').should('be.empty')
    // route toolbar should be hidden
    cy.get('route.toolbar').should('not.exist');
    // routes should not be displayed
    cy.get('#no-poi-alert').should('not.exist');
    cy.get('#routes').should('not.exist');
    cy.get('.alert-info').should('contain','Veuiller sélectionner au moins un scénario, un établissement et un créneau.');
    // Transport demand mode should be active
    cy.get('span > .ng-fa-icon > .fa-check').should('exist');
    cy.get('span > .ng-fa-icon > .fa-times').should('not.exist');
    // Morning timeslots are selected by default
    cy.get('.active').should('contain','Aller');
    // All select boxes should be empty
    cy.get('#institutions .ng-value-container > .ng-value').should('not.exist');
    cy.get('#days .ng-value-container > .ng-value .ng-value-label').should('be.empty')
  })

  /**
   * Creation of a new route from the route menu
   * @param string label : label for the route
   */
  function createNewRoute(label){
    // Check that there is no marker corresponding to and institution on the map
    cy.get('#mapid .fa-hospital').should('not.exist');
    // Check that the button for creating a new route is not displayed : we still have to create a scenario
    cy.get('#new-route-btn').should('not.exist');
    // The creation of a new scenario required to move to scenario crud page
    var reference = 'test_'+(10000+Math.floor((Math.random() * 10000)));
    cy.createNewScenario(reference,'test_cypress_32');
    // Get back to routes page
    cy.navigateToList("logistics","trip");
    // Select the scenario, assuming that there is only one scenario (if there are several scenarios with the same
    //   name, the first one may be selected)
    cy.get('.left > .item').contains('test_cypress_32').click();
    // click the institutions list
    cy.get('#institutions > .ng-select-container > .ng-arrow-wrapper').click()
    // Choose the first institution in the list
    cy.get('.ng-dropdown-panel-items .ng-option').eq(3).click();
    // Check that there is now a marker corresponding to and institution on the map
    cy.get('#mapid .fa-hospital').should('exist');
    // Check that the button for creating a new route is not displayed
    cy.get('#new-route-btn').should('not.exist');
    cy.get('#days > .ng-select-container > .ng-arrow-wrapper').click()
    cy.get('.ng-dropdown-panel-items .ng-option').first().click()
    // Check that the button for creating a new route is displayed
    cy.get('#new-route-btn').should('exist');
    cy.get('.alert-info').should('not.exist');
    cy.get('#new-route-btn').should('not.be.disabled');
    cy.get('#new-route-btn').click();
    cy.get('.modal-header').should('exist');
    cy.get('.pull-right > .btn-success').click();
    cy.get('.modal-header').should('not.exist');
    // Check that there are no route entitled label, since this may lead to test failures
    cy.get('#routes .card').should('exist');
    cy.get('#routes .card').contains(label).should('not.exist');
    cy.get('#new-route-btn').click();
    // Enter the modal, set a name for the route and validate
    cy.get('.modal-header').should('exist');
    cy.get('.form-control').type(label);
    cy.get('.pull-right > .btn-success').click();
    cy.get('.modal-header').should('not.exist');
    // Pick a non-selected point on the map (non selected points have a stroke-width in their SVG source)
    cy.get('.leaflet-marker-pane img[src*="stroke-width"]').first().click();
    // Save the route (only the active route has a non-void style attribute)
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().should('not.be.disabled')
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().click();
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().should('be.disabled')
  }

  it('should create a new route', () => {
    createNewRoute("tournée test");
  })

  /**
   * Assuming we are in the routes menu, open a route
   * @param string label
   */
  function navigateToCrud(label){
    // Select a scenario, assuming that there is only one scenario
    cy.get('.left > .item').contains('test_cypress_32').click();
    // Select the first institution and the first day in the lists
    cy.get('#institutions > .ng-select-container > .ng-arrow-wrapper').click()
    cy.get('.ng-dropdown-panel-items .ng-option').eq(3).click();
    cy.get('#days > .ng-select-container > .ng-arrow-wrapper').click()
    cy.get('.ng-dropdown-panel-items .ng-option').first().click()
    // Open the route entitled label
    cy.get('#routes .card').contains(label).should('exist');
    cy.get('#routes .card').contains(label).click();
  }

  it('should update an existing route', () => {
    navigateToCrud('tournée test');
    // Edit the route entitled 'tournée test'
    cy.get('#routes .card[style^="border-color"] .card-header .float-right').should('exist');
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().next().click();
    // Click on the second button ("start time") and validate
    cy.get('.col-md-8 > :nth-child(2)').click()
    cy.get('.pull-right > .btn-success').click()
    // Pick a new unselected marker from the maps
    cy.get('.leaflet-marker-pane img[src*="stroke-width"]').first().click();
    // Save the changes
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().should('not.be.disabled')
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().click()
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().should('be.disabled')
  });

  function deleteScenario(label){
    // Delete the scenario
    cy.get('.left > .item').contains(label).click();
    cy.get('.left > .item').contains(label).get('.scenario-actions > :nth-child(3)').click();
    cy.get('.modal-header').should('exist');
    cy.get('.modal-header').should('contain','Confirmation de suppression');
    cy.get('#chkDelete').click();
    cy.get('.modal-footer .btn-success').click();
    // Test that we are back on the tournées page
    cy.get('.modal-header').should('not','exist');
    cy.get('.h5').should('contain','Tournées');
    cy.get('.h6').should('not.exist');
  }

  it('should delete an existing route', () => {
    navigateToCrud('tournée test');
    // Delete the route entitled 'tournée test'
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().next().next().click();
    cy.get('.modal-header').should('exist');
    cy.get('.modal-footer > .btn-success').click()
    cy.get('.modal-header').should('not.exist');
    cy.get('#routes .card').contains('tournée test').should('not.exist');
    // Delete the scenario
    deleteScenario('test_cypress_32');
  });

  it('should hard delete an existing route', () => {
    createNewRoute("tournée test");
    // Delete the route entitled 'tournée test'
    cy.get('#routes .card[style^="border-color"] .card-header .float-right button').first().next().next().click();
    cy.get('.modal-header').should('exist');
    // Tell this is a hard deletion
    cy.get('#chkDelete').click()
    cy.get('.modal-footer > .btn-success').click()
    cy.get('.modal-header').should('not.exist');
    cy.get('#routes .card').contains('tournée test').should('not.exist');
    deleteScenario('test_cypress_32');
  });

})
  