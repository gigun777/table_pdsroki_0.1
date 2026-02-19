import { describe, expect, it } from 'vitest';
import { computeVisibleRows } from '../src/core/compute';
import type { SubrowsSettings, TableDataset } from '../src/types';

const settings: SubrowsSettings = {
  columnsSubrowsEnabled: {
    amount: true,
    note: false,
  },
};

describe('computeVisibleRows', () => {
  it('does not return group rows', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'group' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 100 } },
      },
      order: ['g1', 'r1'],
    };

    const visible = computeVisibleRows(dataset, settings);

    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('r1');
  });

  it('merges cells from group and subrow', () => {
    const dataset: TableDataset = {
      records: {
        g1: { id: 'g1', kind: 'group', parentId: null, childrenIds: ['r1'], cells: { note: 'group note' } },
        r1: { id: 'r1', kind: 'row', parentId: 'g1', cells: { amount: 200 } },
      },
      order: ['g1', 'r1'],
    };

    const visible = computeVisibleRows(dataset, settings);

    expect(visible[0].cells).toEqual({
      note: 'group note',
      amount: 200,
    });
  });
});
