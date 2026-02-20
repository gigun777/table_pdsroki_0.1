import { describe, expect, it } from 'vitest';
import { resolveEditTarget } from '../src/core/selection';
import type { CellRef, SubrowsSettings, TableDataset } from '../src/types';

const settings: SubrowsSettings = {
  columnsSubrowsEnabled: {
    amount: true,
    note: false,
  },
};

describe('resolveEditTarget', () => {
  it('returns group for non-subrow columns', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
      },
      order: ['g1', 'r1'],
    };
    const cellRef: CellRef = { rowId: 'r1', colKey: 'note' };

    expect(resolveEditTarget(dataset, cellRef, settings)).toEqual({
      type: 'normalEdit',
      targetRowId: 'g1',
    });
  });

  it('returns a single subrow for subrow-enabled columns', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
      },
      order: ['g1', 'r1'],
    };
    const cellRef: CellRef = { rowId: 'g1', colKey: 'amount' };

    expect(resolveEditTarget(dataset, cellRef, settings)).toEqual({
      type: 'normalEdit',
      targetRowId: 'r1',
    });
  });

  it('returns needsChoice for more than one subrow', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1', 'r2'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
        r2: { id: 'r2', kind: 'row', parentId: 'g1', cells: { amount: 20 } },
      },
      order: ['g1', 'r1', 'r2'],
    };
    const cellRef: CellRef = { rowId: 'g1', colKey: 'amount' };

    const result = resolveEditTarget(dataset, cellRef, settings);

    expect(result).toEqual({
      type: 'needsChoice',
      subrowIds: ['r1', 'r2'],
    });

    if (result.type === 'needsChoice') {
      expect(result.subrowIds).toHaveLength(2);
    }
  });

  it('returns canAddSubrow for a group without subrows on subrows-enabled column', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: [], cells: { note: 'x' } },
      },
      order: ['g1'],
    };
    const cellRef: CellRef = { rowId: 'g1', colKey: 'amount' };

    expect(resolveEditTarget(dataset, cellRef, settings)).toEqual({
      type: 'canAddSubrow',
    });
  });

  it('returns row itself for standalone row on subrows-enabled column', () => {
    const dataset: TableDataset = {
      records: {
        r1: { id: 'r1', kind: 'row', parentId: null, cells: { amount: 10, note: 'x' } },
      },
      order: ['r1'],
    };
    const cellRef: CellRef = { rowId: 'r1', colKey: 'amount' };

    expect(resolveEditTarget(dataset, cellRef, settings)).toEqual({
      type: 'normalEdit',
      targetRowId: 'r1',
    });
  });

});
