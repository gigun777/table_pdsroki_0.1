import type { CellActionResult, RowId } from '../types';
export interface SubrowsUI {
    askCellAction(opts: {
        title: string;
        message: string;
        canAddSubrow: boolean;
        canEdit: boolean;
    }): Promise<'addSubrow' | 'editExisting' | null>;
    pickSubrow(opts: {
        title: string;
        items: Array<{
            id: RowId;
            label: string;
            preview?: string;
        }>;
    }): Promise<RowId | null>;
    toast(msg: string, type?: 'info' | 'success' | 'warn' | 'error'): void;
}
export interface SubrowsUiHooks {
    onNeedsChoice?(subrowIds: RowId[]): void;
    onCanAddSubrow?(): void;
    onNormalEdit?(targetRowId: RowId): void;
}
export declare function dispatchCellAction(result: CellActionResult, hooks: SubrowsUiHooks): void;
