import type { RowRecord, SubrowsSettings } from '../types';

export function isSubrowsEnabled(settings: SubrowsSettings, columnId: string): boolean {
  return settings.columnsSubrowsEnabled[columnId] === true;
}

export function splitCellsBySubrows(
  row: RowRecord,
  settings: SubrowsSettings,
): {
  groupCells: Record<string, unknown>;
  subrowCells: Record<string, unknown>;
} {
  const groupCells: Record<string, unknown> = {};
  const subrowCells: Record<string, unknown> = {};

  for (const [columnId, value] of Object.entries(row.cells)) {
    if (isSubrowsEnabled(settings, columnId)) {
      subrowCells[columnId] = value;
    } else {
      groupCells[columnId] = value;
    }
  }

  return { groupCells, subrowCells };
}

export function createSubrowCells(settings: SubrowsSettings): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(settings.columnsSubrowsEnabled)
      .filter(([, enabled]) => enabled)
      .map(([columnId]) => [columnId, null]),
  );
}
