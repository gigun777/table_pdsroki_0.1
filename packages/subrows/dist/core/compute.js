import { isSubrowsEnabled } from './columns.js';
import { getGroupOfRow } from './model.js';
export function computeVisibleRows(dataset, settings) {
    const visible = [];
    for (const rowId of dataset.order) {
        const row = dataset.records[rowId];
        if (!row || row.kind === 'group') {
            continue;
        }
        const group = getGroupOfRow(dataset, row.id);
        const mergedCells = {};
        const colKeys = new Set([
            ...Object.keys(group?.cells ?? {}),
            ...Object.keys(row.cells ?? {}),
            ...Object.keys(settings.columnsSubrowsEnabled),
        ]);
        for (const colKey of colKeys) {
            if (group && !isSubrowsEnabled(settings, colKey)) {
                mergedCells[colKey] = group.cells?.[colKey];
            }
            else {
                mergedCells[colKey] = row.cells?.[colKey];
            }
        }
        visible.push({
            id: row.id,
            sourceRowId: row.id,
            groupId: group?.id ?? null,
            cells: mergedCells,
            fmt: row.fmt ? { ...row.fmt } : undefined,
        });
    }
    return visible;
}
