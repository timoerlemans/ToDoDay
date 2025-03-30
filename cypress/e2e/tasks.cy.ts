describe('Tasks Feature', () => {
  beforeEach(() => {
    // Mock authentication if needed or use custom login command
    cy.visit('/tasks');
  });

  it('should display the tasks page', () => {
    cy.contains('Tasks').should('exist');
  });

  it('should create a new task', () => {
    const taskTitle = 'New Cypress Test Task';
    const taskDescription = 'This task was created by Cypress';

    // Use the custom command we created
    cy.createTask(taskTitle, taskDescription);

    // Verify task was created
    cy.contains(taskTitle).should('exist');
    cy.contains(taskDescription).should('exist');
  });

  it('should mark task as complete', () => {
    // First create a task
    const taskTitle = 'Task to Complete';
    cy.createTask(taskTitle);

    // Find the task and click its complete checkbox
    cy.contains(taskTitle).parent().find('[data-cy=task-complete-checkbox]').click();

    // Verify task is marked as complete
    cy.contains(taskTitle).parent().should('have.class', 'completed');
  });

  it('should delete a task', () => {
    // First create a task
    const taskTitle = 'Task to Delete';
    cy.createTask(taskTitle);

    // Find and delete the task
    cy.contains(taskTitle).parent().find('[data-cy=task-delete-button]').click();

    // Confirm deletion in the modal
    cy.get('[data-cy=confirm-delete-button]').click();

    // Verify task is removed
    cy.contains(taskTitle).should('not.exist');
  });
});
