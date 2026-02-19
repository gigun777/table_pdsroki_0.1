export function dispatchCellAction(result, hooks) {
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
