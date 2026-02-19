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
    items: Array<{ id: RowId; label: string; preview?: string }>;
  }): Promise<RowId | null>;

  toast(msg: string, type?: 'info' | 'success' | 'warn' | 'error'): void;
}

export interface SubrowsUiHooks {
  onNeedsChoice?(subrowIds: RowId[]): void;
  onCanAddSubrow?(): void;
  onNormalEdit?(targetRowId: RowId): void;
}

export function dispatchCellAction(result: CellActionResult, hooks: SubrowsUiHooks): void {
  if (result.type === 'needsChoice') {
    hooks.onNeedsChoice?.(result.subrowIds);
    return;
  }

  if (result.type === 'canAddSubrow') {
    hooks.onCanAddSubrow?.();
    return;
  }

  hooks.onNormalEdit?.(result.targetRowId);
}
