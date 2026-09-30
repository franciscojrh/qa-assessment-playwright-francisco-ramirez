/**
 * Custom MCP Tool implementation for TodoMVC test data generation.
 * Conforms to src/mcp/todo-data-generator.json
 */
export interface TodoItemData {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoDatasetOptions {
  count: number;
  completedRatio?: number;
  includeEdgeCases?: boolean;
  prefix?: string;
}

export interface TodoDatasetResult {
  items: TodoItemData[];
  expectedTotal: number;
  expectedActive: number;
  expectedCompleted: number;
  expectedCounterText: string;
}

const EDGE_CASE_TITLES = [
  "   Trimmed Whitespace Task   ",
  "Special Chars: <script>alert('xss')</script> & quotes",
  "Unicode: 🚀 Emojis & Accents (ñ, ü, é, 日本語)",
  "Very long title ".repeat(8),
];

export function generateTodoDataset(options: TodoDatasetOptions): TodoDatasetResult {
  const { count, completedRatio = 0, includeEdgeCases = false, prefix = "Task" } = options;
  const items: TodoItemData[] = [];
  const completedTarget = Math.round(count * completedRatio);

  for (let i = 1; i <= count; i++) {
    let title = `${prefix} #${i}`;
    if (includeEdgeCases && i <= EDGE_CASE_TITLES.length) {
      title = EDGE_CASE_TITLES[i - 1];
    }

    const completed = i <= completedTarget;
    items.push({
      id: `todo-${i}`,
      title,
      completed,
    });
  }

  const expectedCompleted = items.filter((it) => it.completed).length;
  const expectedActive = items.length - expectedCompleted;
  const expectedCounterText = expectedActive === 1 ? "1 item left" : `${expectedActive} items left`;

  return {
    items,
    expectedTotal: items.length,
    expectedActive,
    expectedCompleted,
    expectedCounterText,
  };
}
