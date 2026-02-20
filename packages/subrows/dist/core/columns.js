export function isSubrowsEnabled(settings, colKey) {
    return settings.columnsSubrowsEnabled[colKey] === true;
}
export function splitCellsBySubrows(row, settings) {
    const groupCells = {};
    const subrowCells = {};
    for (const [colKey, value] of Object.entries(row.cells ?? {})) {
        if (isSubrowsEnabled(settings, colKey)) {
            subrowCells[colKey] = value;
        }
        else {
            groupCells[colKey] = value;
        }
    }
    return { groupCells, subrowCells };
}
export function createSubrowCells(settings) {
    return Object.fromEntries(Object.entries(settings.columnsSubrowsEnabled)
        .filter(([, enabled]) => enabled)
        .map(([colKey]) => [colKey, '']));
}
