import { CreateCallInput } from '../../src/generated/sdk';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates new call with values passed. If nothing is passed it generates random values. You need to be logged in as a user-officer.
       *
       * @returns {typeof createProposal}
       * @memberof Chainable
       * @example
       *    cy.createCall({shortCode: 'Test call 1', startDate: '22-02-2021', endDate: '28-02-2021', surveyComment: 'This is survey comment', cycleComment: 'This is cycle comment'})
       */
      createCall: (newCallInput: CreateCallInput) => void;
    }
  }
}

export {};
