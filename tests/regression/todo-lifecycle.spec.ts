import { test, expect } from '@fixtures';
import { generateTodoDataset } from '../../src/mcp/todo-data-generator';

test.describe('TodoMVC State Lifecycle & Filter Regression @regression @advanced', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.open();
    await todoPage.assertLoaded();
  });

  test('Scenario 1: Data-driven todo generation and counter synchronization', async ({ todoPage }) => {
    const dataset = generateTodoDataset({ count: 3, completedRatio: 0, prefix: 'Regression Task' });
    const titles = dataset.items.map((it) => it.title);

    await todoPage.addTodos(titles);
    await todoPage.assertItemCount(dataset.expectedTotal);
    await todoPage.assertItemTitles(titles);
    await todoPage.assertCounterText(dataset.expectedCounterText);
    await todoPage.assertFooterVisible(true);
  });

  test('Scenario 2: State transition and dynamic filter routing', async ({ todoPage }) => {
    const titles = ['Task Alpha', 'Task Beta', 'Task Gamma'];
    await todoPage.addTodos(titles);

    // Transition second task to completed
    await todoPage.toggleTodo('Task Beta');
    await todoPage.assertItemCompleted('Task Beta', true);
    await todoPage.assertCounterText('2 items left');

    // Filter Active: only Alpha and Gamma should be visible
    await todoPage.filterBy('Active');
    await todoPage.assertItemCount(2);
    await todoPage.assertItemTitles(['Task Alpha', 'Task Gamma']);

    // Filter Completed: only Beta should be visible
    await todoPage.filterBy('Completed');
    await todoPage.assertItemCount(1);
    await todoPage.assertItemTitles(['Task Beta']);

    // Filter All: all 3 tasks restored
    await todoPage.filterBy('All');
    await todoPage.assertItemCount(3);
  });

  test('Scenario 3: Inline title editing and cancellation integrity', async ({ todoPage }) => {
    await todoPage.addTodo('Initial Work Item');
    await todoPage.assertItemTitles(['Initial Work Item']);

    // Commit edit
    await todoPage.editTodo('Initial Work Item', 'Committed Work Item');
    await todoPage.assertItemTitles(['Committed Work Item']);

    // Abort edit via Escape
    await todoPage.cancelEditTodo('Committed Work Item', 'Discarded Edit');
    await todoPage.assertItemTitles(['Committed Work Item']);
  });

  test('Scenario 4: Bulk state mutations (Toggle All and Clear Completed)', async ({ todoPage }) => {
    await todoPage.addTodos(['Item One', 'Item Two', 'Item Three']);

    // Toggle All Complete
    await todoPage.toggleAll();
    await todoPage.assertItemCompleted(0, true);
    await todoPage.assertItemCompleted(1, true);
    await todoPage.assertItemCompleted(2, true);
    await todoPage.assertCounterText('0 items left');

    // Clear completed items
    await todoPage.clearCompleted();
    await todoPage.assertItemCount(0);
    await todoPage.assertFooterVisible(false);
  });

  test('Scenario 5: Negative input boundary and item deletion', async ({ todoPage }) => {
    // Attempt empty submissions
    await todoPage.addTodo('');
    await todoPage.addTodo('    ');
    await todoPage.assertItemCount(0);

    // Add legitimate item and delete
    await todoPage.addTodo('Disposable Item');
    await todoPage.assertItemCount(1);
    await todoPage.deleteTodo('Disposable Item');
    await todoPage.assertItemCount(0);
  });

  test('Scenario 6: Edge-case dataset validation and unicode resilience', async ({ todoPage }) => {
    const dataset = generateTodoDataset({ count: 3, includeEdgeCases: true });
    for (const item of dataset.items) {
      await todoPage.addTodo(item.title);
    }

    // Whitespace in the first item should be trimmed by TodoMVC
    await todoPage.assertItemCount(3);
    await todoPage.assertCounterText('3 items left');
  });

  test('Scenario 7: Network route interception resilience', async ({ todoPage }) => {
    // Intercept client telemetry / ping requests with route mocking
    await todoPage.mockNetworkRoute(/.*\/telemetry.*|.*\/analytics.*/, { acknowledged: true });

    await todoPage.addTodo('Resilient Network Item');
    await todoPage.assertItemTitles(['Resilient Network Item']);
  });
});
