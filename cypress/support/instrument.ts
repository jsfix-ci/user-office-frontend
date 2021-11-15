import {
  AssignInstrumentsToCallMutationVariables,
  AssignProposalsToInstrumentMutationVariables,
  AssignScientistsToInstrumentMutationVariables,
  CreateInstrumentMutationVariables,
  UpdateTechnicalReviewAssigneeMutationVariables,
} from '../../src/generated/sdk';
import { getE2EApi } from './utils';

function createInstrument(
  createInstrumentInput: CreateInstrumentMutationVariables
) {
  const api = getE2EApi();
  const request = api.createInstrument(createInstrumentInput);
  // cy.contains('Instruments').click();
  // cy.contains('Create').click();
  // cy.get('#name').type(name);
  // cy.get('#shortCode').type(shortCode);
  // cy.get('#description').type(description);

  // cy.get('[data-cy=beamline-manager]').click();
  // cy.get('[role=presentation]').contains(scientist).click();

  // cy.get('[data-cy="submit"]').click();

  // cy.contains(name);
  // cy.contains(shortCode);
  // cy.contains(description);
  // cy.contains(scientist);

  // cy.notification({ variant: 'success', text: 'created successfully' });

  cy.wrap(request);
}

function assignScientistsToInstrument(
  assignScientistsToInstrumentInput: AssignScientistsToInstrumentMutationVariables
) {
  const api = getE2EApi();
  const request = api.assignScientistsToInstrument(
    assignScientistsToInstrumentInput
  );
  // cy.contains(instrument).parent().find('[title="Assign scientist"]').click();

  // cy.get('[data-cy="co-proposers"] input[type="checkbox"]').first().click();

  // cy.get('.MuiDialog-root').contains('Update').click();

  // cy.notification({
  //   variant: 'success',
  //   text: 'Scientist assigned to instrument',
  // });
  cy.wrap(request);
}

const assignInstrumentToCall = (
  assignInstrumentsToCall: AssignInstrumentsToCallMutationVariables
) => {
  const api = getE2EApi();
  const request = api.assignInstrumentsToCall(assignInstrumentsToCall);
  // cy.contains(call).parent().find('[title="Assign Instrument"]').click();

  // cy.contains(instrument).parent().find('[type="checkbox"]').check();

  // cy.contains('Assign instrument').click();

  // cy.notification({
  //   variant: 'success',
  //   text: 'Instrument/s assigned successfully',
  // });
  cy.wrap(request);
};

const assignProposalsToInstrument = (
  assignProposalsToInstrumentInput: AssignProposalsToInstrumentMutationVariables
) => {
  const api = getE2EApi();
  const request = api.assignProposalsToInstrument(
    assignProposalsToInstrumentInput
  );
  // cy.contains(proposal).parent().find('[type="checkbox"]').as('checkbox');

  // cy.get('@checkbox').check();

  // cy.get('[data-cy="assign-remove-instrument"]').click();

  // cy.get('[data-cy="proposals-instrument-assignment"]')
  //   .contains('Loading...')
  //   .should('not.exist');

  // cy.get('#selectedInstrumentId-input').first().click();

  // cy.get("[id='menu-selectedInstrumentId'] li").contains(instrument).click();

  // cy.get('[data-cy="submit-assign-remove-instrument"]').click();

  // cy.get('[data-cy="proposals-instrument-assignment"]').should('not.exist');

  // cy.notification({
  //   variant: 'success',
  //   text: 'Proposal/s assigned to the selected instrument successfully!',
  // });

  // cy.get('@checkbox').uncheck();

  // cy.contains(proposal).parent().contains(instrument);
  cy.wrap(request);
};

const updateTechnicalReviewAssignee = (
  updateTechnicalReviewAssigneeInput: UpdateTechnicalReviewAssigneeMutationVariables
) => {
  const api = getE2EApi();
  const request = api.updateTechnicalReviewAssignee(
    updateTechnicalReviewAssigneeInput
  );
  // cy.contains('Proposals');

  // cy.get('[data-cy="status-filter"]').click();
  // cy.get('[role="listbox"] [data-value="0"]').click();

  // cy.contains(proposalTitle).parent().find('[data-cy="view-proposal"]').click();
  // cy.get('[role="dialog"]').as('dialog');
  // cy.finishedLoading();
  // cy.get('@dialog').contains('Technical review').click();

  // cy.get('[data-cy=re-assign]').click();
  // cy.get('[data-cy=user-list]').click();
  // cy.contains(reviewerName).click();
  // cy.get('[data-cy=re-assign-submit]').click();
  // cy.get('[role=presentation]').contains('OK').click();
  cy.wrap(request);
};

Cypress.Commands.add('createInstrument', createInstrument);
Cypress.Commands.add(
  'assignScientistsToInstrument',
  assignScientistsToInstrument
);
Cypress.Commands.add(
  'assignProposalsToInstrument',
  assignProposalsToInstrument
);

Cypress.Commands.add('assignInstrumentToCall', assignInstrumentToCall);

Cypress.Commands.add(
  'updateTechnicalReviewAssignee',
  updateTechnicalReviewAssignee
);
