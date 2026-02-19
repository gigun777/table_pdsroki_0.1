import type { CellActionResult } from '../types';

export interface SubrowsUiHooks {
  onNeedsChoice?(subrowIds: string[]): void;
  onCanAddSubrow?(): void;
  onNormalEdit?(targetRowId: string): void;
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
