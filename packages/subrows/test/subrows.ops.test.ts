import { describe, expect, it } from 'vitest';
import { addSubrow, ensureGroup, removeSubrow } from '../src/core/ops';
import { addSubrow, removeSubrow } from '../src/core/ops';
import type { SubrowsSettings, TableDataset } from '../src/types';

const settings: SubrowsSettings = {
  columnsSubrowsEnabled: {
    amount: true,
    note: false,
    qty: true,
  },
};

describe('ensureGroup', () => {
  it('converts base row to group + first subrow', () => {
    const dataset: TableDataset = {
      records: {
        r0: { id: 'r0', kind: 'row', parentId: null, cells: { amount: 10, note: 'head', qty: 2 } },
      },
      order: ['r0'],
    };

    const result = ensureGroup(dataset, 'r0', settings);
    const group = result.dataset.records[result.value.groupId];

    expect(group.kind).toBe('group');
    expect(group.cells).toEqual({ note: 'head' });
    expect(group.childrenIds).toHaveLength(1);

    const subrowId = group.childrenIds?.[0] as string;
    expect(result.dataset.records[subrowId].cells).toEqual({ amount: 10, qty: 2 });
  });
});

describe('addSubrow', () => {
  it('creates a new subrow', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10, qty: 1 } },
      },
      order: ['g1', 'r1'],
    };

    const result = addSubrow(dataset, 'g1', settings);

    expect(result.value).toBeTypeOf('string');
    expect(result.dataset.records.g1.childrenIds).toHaveLength(2);
    expect(result.dataset.records[result.value].parentId).toBe('g1');
  });

  it('creates cells for all enabled columns', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: [], cells: { note: 'x' } },
      },
      order: ['g1'],
    };

    const result = addSubrow(dataset, 'g1', settings);

    expect(result.dataset.records[result.value].cells).toEqual({
      amount: '',
      qty: '',
      amount: null,
      qty: null,
    });
  });
});

describe('removeSubrow', () => {
  it('removes a subrow', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1', 'r2'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
        r2: { id: 'r2', kind: 'row', parentId: 'g1', cells: { amount: 20 } },
      },
      order: ['g1', 'r1', 'r2'],
    };

    const result = removeSubrow(dataset, 'r2');

    expect(result.value).toBe(true);
    expect(result.dataset.records.r2).toBeUndefined();
    expect(result.dataset.records.g1.childrenIds).toEqual(['r1']);
  });

  it('removes group when children become empty', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'x' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 10 } },
      },
      order: ['g1', 'r1'],
    };

    const result = removeSubrow(dataset, 'r1');

    expect(result.dataset.records.g1).toBeUndefined();
    expect(result.dataset.order).toEqual([]);
  });
});
