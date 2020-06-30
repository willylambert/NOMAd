/// <reference types="Cypress" />
context('VehicleCategory', () => {

  beforeEach(() => {
    cy.login();
    cy.navigateToList("data","vehicle-categories");
  })

  it('should check vehicle category list page ', () => {
    // Check the page title
    cy.get('legend > div').first().should('contain','Catégories de véhicules');
    // Check that at least one vehicle category is already present in the list
    cy.get('tr>td>a').its('length').should('be.greaterThan',0)
  })

  it('should check vehicle category crud page ', () => {
    // Check that at least one vehicle category is already present in the list
    cy.get('tr>td>a').its('length').should('be.greaterThan',0)
    cy.get('tr>td>a').first().click();
    cy.get('.h5').should('contain','Catégorie de véhicule ')
    // Check that vehicle category reference and label are set
    cy.get('.col-md-4 > .form-control-plaintext').should('be.visible')
    cy.get('.col-md-10 > .form-control-plaintext').should('be.visible')
    // Check that at least one configuration is available
    cy.get('tr span').its('length').should('be.greaterThan',0)
    cy.get('tr > :nth-child(1) > span').should('be.visible');
    // Check that we can go back to list menu
    cy.get('#btn-list').should('exist');
    cy.get('#btn-list').click();
    // Check the page title
    cy.get('legend > div').first().should('contain','Catégories de véhicules');
  })

  /**
   * Create a new vehicle category.
   * @param string reference : the vehicle category reference
   * @param string description : the vehicle category description
   */
  function createNewVehicleCategory(reference,description){
    cy.get('tr>td>a').contains(reference).should('not.exist')

    // Reach the page for a new vehicle category creation
    cy.get('#btn-add').click();
    cy.get('#btn-save').should('be.disabled')
    // Set the reference
    cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-invalid')
    cy.get(':nth-child(2) > .col-md-4 > input').type(reference);
    cy.get(':nth-child(2) > .col-md-4 > input').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(2) > .col-md-4 > input').should('have.class', 'ng-valid')
    // Set the description
    cy.get(':nth-child(3) > .col-md-10 > input').should('not.have.class', 'ng-valid')
    cy.get(':nth-child(3) > .col-md-10 > input').should('have.class', 'ng-invalid')
    cy.get(':nth-child(3) > .col-md-10 > input').type(description);
    cy.get(':nth-child(3) > .col-md-10 > input').should('not.have.class', 'ng-invalid')
    cy.get(':nth-child(3) > .col-md-10 > input').should('have.class', 'ng-valid')
    // The mandatory part of the formular was filled
    cy.get('#btn-save').should('not.be.disabled')
    // Set the axles count
    cy.get('div.col-md-2 > .form-control').type('7');
    cy.get('div.col-md-2 > .form-control').should('not.have.class', 'ng-invalid')
    // Set the vehicle category consumption
    cy.get(':nth-child(5) > div.col-md-2 > .input-group > .form-control').type('12.32');
    cy.get(':nth-child(5) > div.col-md-2 > .input-group > .form-control').should('not.have.class', 'ng-invalid')
    // Set the vehicle category daily cost
    cy.get(':nth-child(6) > div.col-md-2 > .input-group > .form-control').type('54.12');
    cy.get(':nth-child(6) > div.col-md-2 > .input-group > .form-control').should('not.have.class', 'ng-invalid')
    // Set the vehicle category hourly cost
    cy.get(':nth-child(7) > div.col-md-2 > .input-group > .form-control').type('4.58');
    cy.get(':nth-child(7) > div.col-md-2 > .input-group > .form-control').should('not.have.class', 'ng-invalid')
    // Set the vehicle category kilometric cost
    cy.get(':nth-child(8) > div.col-md-2 > .input-group > .form-control').type('1.22');
    cy.get(':nth-child(8) > div.col-md-2 > .input-group > .form-control').should('not.have.class', 'ng-invalid')
    // Set the vehicle category CO2 emmisson rate
    cy.get(':nth-child(9) > div.col-md-2 > .input-group > .form-control').type('3.05');
    cy.get(':nth-child(9) > div.col-md-2 > .input-group > .form-control').should('not.have.class', 'ng-invalid')
    // Add a new configuration
    cy.get('tr>td>button>span').should('not.exist')
    cy.get('#btn-add-configuration').click();
    cy.get('.modal-title').should('be.visible')
    cy.get('.modal-title').should('contain','Nouvelle configuration')
    cy.get('.modal-header .btn-success').should('be.disabled')
    // Set the configuration reference
    cy.get('.modal-body form > .form-group:nth-child(1) > .col-lg-9 > input').should('not.have.class', 'ng-valid')
    cy.get('.modal-body form > .form-group:nth-child(1) > .col-lg-9 > input').should('have.class', 'ng-invalid')
    cy.get('.modal-body form > .form-group:nth-child(1) > .col-lg-9 > input').type(reference+'_1')
    cy.get('.modal-body form > .form-group:nth-child(1) > .col-lg-9 > input').should('have.class', 'ng-valid')
    cy.get('.modal-body form > .form-group:nth-child(1) > .col-lg-9 > input').should('not.have.class', 'ng-invalid')
    // Set the configuration description
    cy.get('.modal-body form > .form-group:nth-child(2) > .col-lg-9 > input').should('not.have.class', 'ng-valid')
    cy.get('.modal-body form > .form-group:nth-child(2) > .col-lg-9 > input').should('have.class', 'ng-invalid')
    cy.get('.modal-body form > .form-group:nth-child(2) > .col-lg-9 > input').type(reference+'_1')
    cy.get('.modal-body form > .form-group:nth-child(2) > .col-lg-9 > input').should('have.class', 'ng-valid')
    cy.get('.modal-body form > .form-group:nth-child(2) > .col-lg-9 > input').should('not.have.class', 'ng-invalid')
    // The mandatory part of the formular was filled
    cy.get('.modal-header .btn-success').should('not.be.disabled')
    // Set the number of walking passengers this configuration can host
    cy.get('.card-body > .form-group:nth-child(1) > .col-lg-4 > input').clear().type(7)
    cy.get('.card-body > .form-group:nth-child(1) > .col-lg-4 > input').should('not.have.class', 'ng-invalid')
    // Set the number of wheelchair passengers this configuration can host
    cy.get('.card-body > .form-group:nth-child(2) > .col-lg-4 > input').clear().type(3)
    cy.get('.card-body > .form-group:nth-child(2) > .col-lg-4 > input').should('not.have.class', 'ng-invalid')
    // Validate the modal
    cy.get('.modal-header .btn-success').should('not.be.disabled')
    cy.get('.modal-header .btn-success').click()
    cy.get('.modal-title').should('not.be.visible')
    // Status choice : active
    cy.get('tr>td>button>span').contains(reference+'_1').should('exist')
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('#btn-save').click();
    cy.get('.h5').should('contain','Catégorie de véhicule '+reference);
    cy.get('#btn-save').should('not.exist')
    cy.get('#btn-edit').should('exist')
  }

  it('should create a new vehicle category', () => {
    createNewVehicleCategory('test','test')
  })

  /**
   * Assuming we are in the vehicle category list menu, navigate to a vehicle category crud
   * @param string reference : the vehicle category reference
   */
  function navigateToCrud(reference){
    cy.get('tr>td>a').contains(reference).should('exist')
    cy.get('tr>td>a').contains(reference).click();
    cy.get('.h5').should('contain','Catégorie de véhicule '+reference);
    cy.get('#btn-save').should('not.exist')
    cy.get('#btn-edit').should('exist')
  }

  it('should update an existing vehicle category', () => {
    // Retrieve the test vehicle category
    navigateToCrud('test')
    // Enter edit mode
    cy.get('#btn-edit').click()
    // Change the vehicle category consumption
    cy.get(':nth-child(5) > div.col-md-2 > .input-group > .form-control').clear().type('12.34');
    cy.get('#btn-save').should('not.be.disabled')
    cy.get('#btn-save').click();
    // Go back to list menu
    cy.get('#btn-list').click();
  });

  it('should check changes in a vehicle category', () => {
    // Retrieve the test vehicle category
    navigateToCrud('test')
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
    cy.get(':nth-child(6) > div.col-md-2 > .input-group > .form-control').clear().type('58.13');
    cy.get('#btn-cancel').click();
    cy.get('.modal-footer .btn-success').click();
    cy.get('#btn-save').should('not.exist')
  });

  it('should hard delete an existing vehicle category', () => {
    // Retrieve the test vehicle category
    navigateToCrud('test');
    // Enter edit mode (we can not delete an item from view mode)
    cy.get('#btn-edit').click()
    cy.get('#btn-delete').click()
    // Confirm the deletion : we perform a hard deletion, otherwise we will not be able to play the test again
    cy.get('#chkDelete').click()
    cy.get('.modal-footer .btn-success').click()
    // Back in the list menu, check that the vehicle category was removed
    cy.get('legend > div > :nth-child(1)').should('contain','Catégories de véhicules');
    cy.get('tr>td>a').contains('test').should('not.exist')
  });

  it('should mark a vehicle category as removed', () => {
    // Create a random number between 10000 and 19999
    var reference = 'test_'+(10000+Math.floor((Math.random() * 10000)));
    createNewVehicleCategory(reference,'Random test vehicle category');
    // Retrieve the test vehicle category
    cy.navigateToList("data","vehicle-categories");
    navigateToCrud(reference);
    // Enter edit mode (we can not delete an item from view mode)
    cy.get('#btn-edit').click()
    cy.get('#btn-delete').click()
    // Confirm the deletion : we perform a shallow deletion
    cy.get('.modal-footer .btn-success').click()
    // Back in the list menu, check that the vehicle category was removed
    cy.get('legend > div > :nth-child(1)').should('contain','Catégories de véhicules');
    cy.get('tr>td>a').contains(reference).should('not.exist')
  });
})
    