import { isSubrowsEnabled } from './columns';
import { getGroupOfRow, isGroup } from './model';
import { resolveGroupId } from './model';
import type { CellActionResult, CellRef, SubrowsSettings, TableDataset } from '../types';

export function resolveEditTarget(
  dataset: TableDataset,
  cellRef: CellRef,
  settings: SubrowsSettings,
): CellActionResult {
  const row = dataset.records[cellRef.rowId];
  if (!row) {
    throw new Error(`Row not found: ${cellRef.rowId}`);
  }

  const group = getGroupOfRow(dataset, cellRef.rowId);
  const enabled = isSubrowsEnabled(settings, cellRef.colKey);

  if (!enabled) {
    if (group) {
      return { type: 'normalEdit', targetRowId: group.id };
    }

    if (isGroup(row)) {
      return { type: 'normalEdit', targetRowId: row.id };
    }

    return { type: 'normalEdit', targetRowId: row.id };
  }

  if (group) {
  const groupId = resolveGroupId(dataset, cellRef.rowId);
  const group = groupId ? dataset.records[groupId] : null;
  const enabled = isSubrowsEnabled(settings, cellRef.columnId);

  if (!enabled) {
    if (group?.kind === 'group') {
      return { type: 'normalEdit', targetRowId: group.id };
    }

    return { type: 'normalEdit', targetRowId: row.id };
  }

  if (group?.kind === 'group') {
    const subrowIds = [...(group.childrenIds ?? [])];
    if (subrowIds.length === 0) {
      return { type: 'canAddSubrow' };
    }

    if (subrowIds.length === 1) {
      return { type: 'normalEdit', targetRowId: subrowIds[0] };
    }

    if (subrowIds.includes(row.id)) {
      return { type: 'normalEdit', targetRowId: row.id };
    }

    return { type: 'needsChoice', subrowIds };
  }

  if (isGroup(row)) {
    const subrowIds = [...(row.childrenIds ?? [])];
    if (subrowIds.length === 0) {
      return { type: 'canAddSubrow' };
    }
    if (subrowIds.length === 1) {
      return { type: 'normalEdit', targetRowId: subrowIds[0] };
    }
    return { type: 'needsChoice', subrowIds };
  }

  return { type: 'normalEdit', targetRowId: row.id };
}
