/// <reference types="cypress" />

describe('share location', () => {
  beforeEach(() => {
    cy.visit('/').then(window => {
      cy.stub(window.navigator.geolocation, 'getCurrentPosition')
        .as('getUserPosition')
        .callsFake(cb => {
          setTimeout(() => {
            cb({
              coords: {
                longitude: 48.01,
                latitude: 37.5
              }
            });
          }, 100);
        });
    });
  });
  it('should fetch the user location', () => {
    cy.get('[data-cy="get-loc-btn"]').click();
    cy.get('@getUserPosition').should('have.been.called');
    cy.get('[data-cy="get-loc-btn"]').should('be.disabled');
    cy.get('[data-cy="actions"]').contains('Location fetched');
  });

  it('should share a location URL', () => {});
});
