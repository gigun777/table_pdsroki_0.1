import { describe, expect, it, vi } from 'vitest';
import { handleCellClickSubrowsFlow } from '../src/ui/flow';
import type { SubrowsUI } from '../src/ui/contracts';
import type { SubrowsSettings, TableDataset } from '../src/types';

const settings: SubrowsSettings = {
  columnsSubrowsEnabled: {
    amount: true,
    note: false,
  },
};

function createUi(overrides?: Partial<SubrowsUI>): SubrowsUI {
  return {
    askCellAction: vi.fn(async () => null),
    pickSubrow: vi.fn(async () => null),
    toast: vi.fn(),
    ...overrides,
  };
}

describe('handleCellClickSubrowsFlow', () => {
  it('returns direct edit target for non-subrows columns', async () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
      },
      order: ['g1', 'r1'],
    };
    const ui = createUi();

    const result = await handleCellClickSubrowsFlow({
      ds: dataset,
      cellRef: { rowId: 'r1', colKey: 'note' },
      settings,
      ui,
    });

    expect(result.editTargetRowId).toBe('g1');
    expect(ui.askCellAction).not.toHaveBeenCalled();
  });

  it('adds subrow when user selects addSubrow', async () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
      },
      order: ['g1', 'r1'],
    };

    const ui = createUi({
      askCellAction: vi.fn(async () => 'addSubrow'),
    });

    const result = await handleCellClickSubrowsFlow({
      ds: dataset,
      cellRef: { rowId: 'g1', colKey: 'amount' },
      settings,
      ui,
    });

    expect(result.addedSubrowId).toBeTruthy();
    expect(result.editTargetRowId).toBe(result.addedSubrowId);
  });

  it('asks to choose subrow for editExisting when there are multiple subrows', async () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1', 'r2'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
        r2: { id: 'r2', kind: 'row', parentId: 'g1', cells: { amount: 20 } },
      },
      order: ['g1', 'r1', 'r2'],
    };

    const ui = createUi({
      askCellAction: vi.fn(async () => 'editExisting'),
      pickSubrow: vi.fn(async () => null),
    });

    const result = await handleCellClickSubrowsFlow({
      ds: dataset,
      cellRef: { rowId: 'g1', colKey: 'amount' },
      settings,
      ui,
    });

    expect(result.needsChoice).toBe(true);
    expect(result.highlightSubrows).toEqual(['r1', 'r2']);
  });
});
