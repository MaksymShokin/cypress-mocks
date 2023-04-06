/// <reference types="cypress" />

describe('share location', () => {
  beforeEach(() => {
    cy.clock();
    cy.fixture('user-location.json').as('userLocation');
    cy.visit('/').then(window => {
      cy.get('@userLocation').then(fakePosition => {
        cy.stub(window.navigator.geolocation, 'getCurrentPosition')
          .as('getUserPosition')
          .callsFake(cb => {
            setTimeout(() => {
              cb(fakePosition);
            }, 100);
          });
      });

      cy.stub(window.navigator.clipboard, 'writeText')
        .as('saveToClipboard')
        .resolves();

      cy.spy(window.localStorage, 'getItem').as('getItem');
      cy.spy(window.localStorage, 'setItem').as('setItem');
    });
  });

  it('should fetch the user location', () => {
    cy.get('[data-cy="get-loc-btn"]').click();
    cy.get('@getUserPosition').should('have.been.called');
    cy.get('[data-cy="get-loc-btn"]').should('be.disabled');
    cy.get('[data-cy="actions"]').contains('Location fetched');
  });

  it('should share a location URL', () => {
    cy.get('[data-cy="name-input"]').type('John Doe');
    cy.get('[data-cy="get-loc-btn"]').click();
    cy.get('[data-cy="share-loc-btn"]').click();
    cy.get('@saveToClipboard').should('have.been.called');

    cy.get('@userLocation').then(({ coords }) => {
      cy.get('@saveToClipboard').should(
        'have.been.calledWithMatch',
        new RegExp(
          `${coords.latitude}.*${coords.longitude}.*${encodeURI('John Doe')}`
        )
      );
      cy.get('@setItem').should(
        'have.been.calledWithMatch',
        /John Doe/,
        new RegExp(
          `${coords.latitude}.*${coords.longitude}.*${encodeURI('John Doe')}`
        )
      );
    });

    cy.get('@getItem').should('have.been.called');

    cy.get('[data-cy="info-message"]').should('be.visible');
    cy.get('[data-cy="info-message"]').should('have.class', 'visible');
    cy.tick(2000);
    cy.get('[data-cy="info-message"]').should('not.be.visible');
  });
});
