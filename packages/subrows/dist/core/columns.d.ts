import type { ColKey, RowRecord, SubrowsSettings } from '../types';
export declare function isSubrowsEnabled(settings: SubrowsSettings, colKey: ColKey): boolean;
export declare function splitCellsBySubrows(row: RowRecord, settings: SubrowsSettings): {
    groupCells: Record<ColKey, unknown>;
    subrowCells: Record<ColKey, unknown>;
};
export declare function createSubrowCells(settings: SubrowsSettings): Record<ColKey, unknown>;
