import type { ColKey, RowRecord, SubrowsSettings } from '../types';

export function isSubrowsEnabled(settings: SubrowsSettings, colKey: ColKey): boolean {
  return settings.columnsSubrowsEnabled[colKey] === true;
}

export function splitCellsBySubrows(
  row: RowRecord,
  settings: SubrowsSettings,
): {
  groupCells: Record<ColKey, unknown>;
  subrowCells: Record<ColKey, unknown>;
} {
  const groupCells: Record<ColKey, unknown> = {};
  const subrowCells: Record<ColKey, unknown> = {};

  for (const [colKey, value] of Object.entries(row.cells ?? {})) {
    if (isSubrowsEnabled(settings, colKey)) {
      subrowCells[colKey] = value;
    } else {
      groupCells[colKey] = value;
    }
  }

  return { groupCells, subrowCells };
}

export function createSubrowCells(settings: SubrowsSettings): Record<ColKey, unknown> {
  return Object.fromEntries(
    Object.entries(settings.columnsSubrowsEnabled)
      .filter(([, enabled]) => enabled)
      .map(([colKey]) => [colKey, '']),
  );
}
