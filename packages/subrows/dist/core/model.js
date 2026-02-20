export function cloneDataset(dataset) {
    const records = Object.fromEntries(Object.entries(dataset.records).map(([id, record]) => [id, cloneRecord(record)]));
    return {
        records,
        order: [...dataset.order],
    };
}
export function cloneRecord(record) {
    return {
        ...record,
        cells: { ...(record.cells ?? {}) },
        fmt: record.fmt ? { ...record.fmt } : undefined,
        childrenIds: record.childrenIds ? [...record.childrenIds] : undefined,
    };
}
export function createRowId(dataset, prefix = 'row') {
    const rand = Math.random().toString(36).slice(2, 8);
    let candidate = `${prefix}_${rand}`;
    while (dataset.records[candidate]) {
        candidate = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
    }
    return candidate;
}
export function isGroup(record) {
    return Boolean(record && record.kind === 'group');
}
export function isSubrow(record) {
    return Boolean(record && record.kind === 'row' && record.parentId);
}
export function getGroupOfRow(dataset, rowId) {
    const row = dataset.records[rowId];
    if (!row) {
        return null;
    }
    if (isGroup(row)) {
        return row;
    }
    if (!row.parentId) {
        return null;
    }
    const parent = dataset.records[row.parentId];
    return isGroup(parent) ? parent : null;
}
export function getSubrowsOfGroup(dataset, groupId) {
    const group = dataset.records[groupId];
    if (!isGroup(group)) {
        return [];
    }
    return (group.childrenIds ?? [])
        .map((id) => dataset.records[id])
        .filter((record) => Boolean(record && record.kind === 'row'));
}
export function resolveGroupId(dataset, rowId) {
    return getGroupOfRow(dataset, rowId)?.id ?? null;
}
