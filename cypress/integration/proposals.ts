import faker from 'faker';

context('Proposal tests', () => {
  const title = faker.lorem.words(2);
  const abstract = faker.lorem.words(3);
  const proposalToCloneTitle = faker.lorem.words(2);
  const proposalToCloneAbstract = faker.lorem.words(3);
  const clonedProposalTitle = `Copy of ${proposalToCloneTitle}`;

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  it('Should be able create proposal', () => {
    cy.login('user');

    cy.contains('New Proposal').click();

    cy.get('[data-cy=edit-proposer-button]').click();
    cy.contains('Benjamin').parent().find("[title='Select user']").click();

    cy.contains('Save and continue').click();

    cy.contains('Title is required');
    cy.contains('Abstract is required');
    cy.contains(
      'You must be part of the proposal. Either add yourself as Principal Investigator or a Co-Proposer!'
    );

    const proposer = 'Carl';

    cy.createProposal(title, abstract, '', proposer);

    cy.contains('Dashboard').click();

    cy.contains(title).parent().contains('draft');

    cy.get('[title="Edit proposal"]').should('exist').click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains('Dashboard').click();
    cy.contains(title);
    cy.contains('submitted');

    cy.get('[title="View proposal"]').should('exist');
  });

  it('Should be able to see proposal allocation time unit on the proposal', () => {
    cy.login('officer');

    cy.contains('Proposals').click();

    cy.get("[title='Show Columns']").first().click();
    cy.get('.MuiPopover-paper').contains('Time allocation').click();

    cy.get('body').click();

    cy.contains(title).parent().find('[title="View proposal"]').click();

    cy.contains('Technical review').click();

    cy.get('[data-cy="timeAllocation"] input').clear().type('10');

    cy.get('[data-cy="technical-review-status"]').click();
    cy.contains('Feasible').click();

    cy.get('[data-cy="save-technical-review"]').click();

    cy.closeModal();

    cy.contains(title).parent().contains('10(Days)');

    cy.contains('Calls').click();

    cy.finishedLoading();

    cy.get('[title="Edit"]').first().click();

    cy.get('[data-cy="allocation-time-unit"]').click();

    cy.contains('Hour').click();

    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains('Proposals').click();
    cy.contains(title).parent().contains('10(Hours)');
  });

  it('Should be able clone proposal to another call', () => {
    const shortCode = faker.lorem.word();
    const surveyComment = faker.lorem.word();
    const cycleComment = faker.lorem.word();
    const startDate = faker.date.past().toISOString().slice(0, 10);
    const endDate = faker.date.future().toISOString().slice(0, 10);
    const template = 'default template';

    cy.login('officer');

    cy.contains('Proposals');

    cy.createCall({
      shortCode,
      startDate,
      endDate,
      template,
      surveyComment,
      cycleComment,
    });

    cy.logout();

    cy.login('user');

    cy.createProposal(proposalToCloneTitle, proposalToCloneAbstract, 'call 1');

    cy.contains('Dashboard').click();

    cy.contains(proposalToCloneTitle);
    cy.contains('submitted');

    cy.get('[title="View proposal"]').should('exist');

    cy.get('[title="Clone proposal"]').first().click();

    cy.get('#mui-component-select-selectedCallId').click();

    cy.contains(shortCode).click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal cloned successfully',
    });

    cy.contains(clonedProposalTitle).parent().should('contain.text', shortCode);
  });

  it('User officer should be able to change status to one or multiple proposals', () => {
    cy.login('officer');

    cy.changeProposalStatus('DRAFT');

    cy.changeProposalStatus('SEP Meeting');

    cy.contains(proposalToCloneTitle)
      .parent()
      .should('contain.text', 'SEP Meeting');
    cy.contains(clonedProposalTitle)
      .parent()
      .should('contain.text', 'SEP Meeting');
  });

  it('Should be able to delete proposal', () => {
    cy.login('user');

    cy.contains(`Copy of ${proposalToCloneTitle}`)
      .parent()
      .find('[title="Delete proposal"]')
      .click();

    cy.contains('OK').click();

    cy.contains(`Copy of ${proposalToCloneTitle}`).should('not.exist');
  });

  it('User should not be able to edit and submit proposal with inactive call', () => {
    cy.login('officer');
    const pastDate = faker.date.past().toISOString().slice(0, 10);
    const topic = faker.random.words(2);
    const textQuestion = faker.random.words(2);
    const proposalName = faker.random.words(3);

    cy.navigateToTemplatesSubmenu('Proposal templates');

    cy.get('[title="Edit"]').first().click();

    cy.createTopic(topic);
    cy.createTextQuestion(textQuestion);

    cy.logout();

    cy.login('user');
    cy.createProposal(proposalName, '-', 'call 1');
    cy.contains(textQuestion).then(($elem: any) => {
      cy.get(`#${$elem.attr('for')}`).type(faker.random.word());
    });
    cy.contains('Save and continue').click();
    cy.notification({ text: 'Saved', variant: 'success' });

    cy.logout();

    cy.login('officer');

    cy.contains('Calls').click();
    cy.contains('call 1').parent().find('[title="Edit"]').click();

    cy.get('[data-cy=start-date] input')
      .clear()
      .type(pastDate)
      .should('have.value', pastDate);

    cy.get('[data-cy=end-date] input')
      .clear()
      .type(pastDate)
      .should('have.value', pastDate);

    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="submit"]').click();
    cy.notification({ variant: 'success', text: 'successfully' });

    cy.logout();

    cy.login('user');

    cy.contains(proposalName).parent().find('[title="View proposal"]').click();

    cy.contains('Submit').should('be.disabled');

    cy.contains(topic).click();

    cy.contains('label', textQuestion).then(($elem: any) => {
      cy.get(`#${$elem.attr('for')}`).then(($inputElem) => {
        expect($inputElem.css('pointer-events')).to.be.eq('none');
      });
    });

    cy.contains('Save and continue').should('not.exist');

    cy.contains('New proposal').click();

    cy.get('[data-cy="title"]').then(($inputElem) => {
      expect($inputElem.css('pointer-events')).to.be.eq('none');
    });

    cy.contains('Save and continue').should('not.exist');
  });
});
