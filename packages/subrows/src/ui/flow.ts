import type { CellActionResult } from '../types';

export interface UiFlowState {
  shouldOpenChoice: boolean;
  shouldOfferAddSubrow: boolean;
  editTargetRowId: string | null;
}

export function toUiFlowState(result: CellActionResult): UiFlowState {
  switch (result.type) {
    case 'normalEdit':
      return {
        shouldOpenChoice: false,
        shouldOfferAddSubrow: false,
        editTargetRowId: result.targetRowId,
      };
    case 'needsChoice':
      return {
        shouldOpenChoice: true,
        shouldOfferAddSubrow: false,
        editTargetRowId: null,
      };
    case 'canAddSubrow':
      return {
        shouldOpenChoice: false,
        shouldOfferAddSubrow: true,
        editTargetRowId: null,
      };
  }
}
