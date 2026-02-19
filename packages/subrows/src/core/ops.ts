import { createSubrowCells, splitCellsBySubrows } from './columns';
import { cloneDataset, createRowId, resolveGroupId } from './model';
import type {
  RowRecord,
  SubrowsApiResult,
  SubrowsSettings,
  TableDataset,
} from '../types';

function requireRecord(dataset: TableDataset, rowId: string): RowRecord {
  const row = dataset.records[rowId];
  if (!row) {
    throw new Error(`Row not found: ${rowId}`);
  }

  return row;
}

export function ensureGroup(
  dataset: TableDataset,
  rowId: string,
  settings: SubrowsSettings,
): SubrowsApiResult<{ groupId: string; firstSubrowId: string }> {
  const current = requireRecord(dataset, rowId);

  if (current.kind === 'group') {
    const firstSubrowId = current.childrenIds?.[0] ?? '';
    return { dataset: cloneDataset(dataset), value: { groupId: current.id, firstSubrowId } };
  }

  if (current.parentId) {
    return {
      dataset: cloneDataset(dataset),
      value: { groupId: current.parentId, firstSubrowId: current.id },
    };
  }

  const next = cloneDataset(dataset);
  const sourceRow = requireRecord(next, rowId);
  const groupId = createRowId(next, 'group');
  const firstSubrowId = createRowId(next, 'row');
  const { groupCells, subrowCells } = splitCellsBySubrows(sourceRow, settings);

  const group: RowRecord = {
    id: groupId,
    kind: 'group',
    parentId: null,
    childrenIds: [firstSubrowId],
    cells: groupCells,
    fmt: sourceRow.fmt ? { ...sourceRow.fmt } : undefined,
  };

  const firstSubrow: RowRecord = {
    id: firstSubrowId,
    kind: 'row',
    parentId: groupId,
    childrenIds: sourceRow.childrenIds ? [...sourceRow.childrenIds] : undefined,
    cells: subrowCells,
    fmt: sourceRow.fmt ? { ...sourceRow.fmt } : undefined,
  };

  next.records[groupId] = group;
  next.records[firstSubrowId] = firstSubrow;
  delete next.records[rowId];

  const rowIndex = next.order.indexOf(rowId);
  if (rowIndex >= 0) {
    next.order.splice(rowIndex, 1, groupId, firstSubrowId);
  } else {
    next.order.push(groupId, firstSubrowId);
  }

  return {
    dataset: next,
    value: { groupId, firstSubrowId },
  };
}

export function addSubrow(
  dataset: TableDataset,
  rowId: string,
  settings: SubrowsSettings,
): SubrowsApiResult<string> {
  const next = cloneDataset(dataset);
  const groupId = resolveGroupId(next, rowId) ?? rowId;
  const group = requireRecord(next, groupId);

  if (group.kind !== 'group') {
    throw new Error(`Group not found for row: ${rowId}`);
  }

  const subrowId = createRowId(next, 'row');
  const subrow: RowRecord = {
    id: subrowId,
    kind: 'row',
    parentId: groupId,
    cells: createSubrowCells(settings),
    childrenIds: [],
  };

  group.childrenIds = [...(group.childrenIds ?? []), subrowId];
  next.records[subrowId] = subrow;

  const groupIndex = next.order.indexOf(groupId);
  if (groupIndex >= 0) {
    const insertIndex = groupIndex + (group.childrenIds?.length ?? 0);
    next.order.splice(insertIndex, 0, subrowId);
  } else {
    next.order.push(subrowId);
  }

  return { dataset: next, value: subrowId };
}

export function removeSubrow(dataset: TableDataset, subrowId: string): SubrowsApiResult<boolean> {
  const next = cloneDataset(dataset);
  const subrow = requireRecord(next, subrowId);

  if (subrow.kind !== 'row' || !subrow.parentId) {
    return { dataset: next, value: false };
  }

  const group = requireRecord(next, subrow.parentId);
  if (group.kind !== 'group') {
    throw new Error(`Parent group not found for subrow: ${subrowId}`);
  }

  group.childrenIds = (group.childrenIds ?? []).filter((id) => id !== subrowId);
  delete next.records[subrowId];
  next.order = next.order.filter((id) => id !== subrowId);

  if (group.childrenIds.length === 0) {
    delete next.records[group.id];
    next.order = next.order.filter((id) => id !== group.id);
  }

  return { dataset: next, value: true };
}

export function getTransferCandidates(dataset: TableDataset, rowId: string): string[] {
  const row = dataset.records[rowId];
  if (!row) {
    return [];
  }

  if (row.kind === 'group') {
    return [...(row.childrenIds ?? [])];
  }

  return [row.id];
}

export function getHighlightSubrows(dataset: TableDataset, rowId: string): string[] {
  const groupId = resolveGroupId(dataset, rowId);
  if (!groupId) {
    return rowId in dataset.records ? [rowId] : [];
  }

  const group = dataset.records[groupId];
  if (!group || group.kind !== 'group') {
    return [];
  }

  return [...(group.childrenIds ?? [])];
}
