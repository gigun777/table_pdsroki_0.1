import { createSubrowCells, splitCellsBySubrows } from './columns.js';
import { cloneDataset, createRowId, getGroupOfRow, getSubrowsOfGroup, isGroup, isSubrow, } from './model.js';
function requireRecord(dataset, rowId) {
    const row = dataset.records[rowId];
    if (!row) {
        throw new Error(`Row not found: ${rowId}`);
    }
    return row;
}
export function ensureGroup(dataset, baseRowId, settings) {
    const current = requireRecord(dataset, baseRowId);
    if (isGroup(current)) {
        return { dataset: cloneDataset(dataset), value: { groupId: current.id } };
    }
    if (isSubrow(current)) {
        return { dataset: cloneDataset(dataset), value: { groupId: current.parentId } };
    }
    const next = cloneDataset(dataset);
    const sourceRow = requireRecord(next, baseRowId);
    const groupId = createRowId(next, 'group');
    const firstSubrowId = createRowId(next, 'row');
    const { groupCells, subrowCells } = splitCellsBySubrows(sourceRow, settings);
    const group = {
        id: groupId,
        kind: 'group',
        parentId: null,
        childrenIds: [firstSubrowId],
        cells: groupCells,
        fmt: sourceRow.fmt ? { ...sourceRow.fmt } : undefined,
    };
    const firstSubrow = {
        id: firstSubrowId,
        kind: 'row',
        parentId: groupId,
        childrenIds: sourceRow.childrenIds ? [...sourceRow.childrenIds] : undefined,
        cells: subrowCells,
        fmt: sourceRow.fmt ? { ...sourceRow.fmt } : undefined,
    };
    next.records[groupId] = group;
    next.records[firstSubrowId] = firstSubrow;
    delete next.records[baseRowId];
    const rowIndex = next.order.indexOf(baseRowId);
    if (rowIndex >= 0) {
        next.order.splice(rowIndex, 1, groupId, firstSubrowId);
    }
    else {
        next.order.push(groupId, firstSubrowId);
    }
    return {
        dataset: next,
        value: { groupId },
    };
}
export function addSubrow(dataset, anyRowIdInGroup, settings) {
    const next = cloneDataset(dataset);
    const directGroup = getGroupOfRow(next, anyRowIdInGroup);
    const group = directGroup ?? requireRecord(next, anyRowIdInGroup);
    if (!isGroup(group)) {
        throw new Error(`Group not found for row: ${anyRowIdInGroup}`);
    }
    const subrowId = createRowId(next, 'row');
    const subrow = {
        id: subrowId,
        kind: 'row',
        parentId: group.id,
        cells: createSubrowCells(settings),
        childrenIds: [],
    };
    group.childrenIds = [...(group.childrenIds ?? []), subrowId];
    next.records[subrowId] = subrow;
    const groupIndex = next.order.indexOf(group.id);
    if (groupIndex >= 0) {
        const insertIndex = groupIndex + (group.childrenIds?.length ?? 0);
        next.order.splice(insertIndex, 0, subrowId);
    }
    else {
        next.order.push(subrowId);
    }
    return { dataset: next, value: subrowId };
}
export function removeSubrow(dataset, subrowId) {
    const next = cloneDataset(dataset);
    const subrow = requireRecord(next, subrowId);
    if (!isSubrow(subrow)) {
        return { dataset: next, value: false };
    }
    const group = requireRecord(next, subrow.parentId);
    if (!isGroup(group)) {
        throw new Error(`Parent group not found for subrow: ${subrowId}`);
    }
    group.childrenIds = (group.childrenIds ?? []).filter((id) => id !== subrowId);
    delete next.records[subrowId];
    next.order = next.order.filter((id) => id !== subrowId);
    if (group.childrenIds.length === 0) {
        delete next.records[group.id];
        next.order = next.order.filter((id) => id !== group.id);
    }
    return { dataset: next, value: true };
}
export function getTransferCandidates(dataset, rowId) {
    const row = dataset.records[rowId];
    if (!row) {
        return [];
    }
    if (isGroup(row)) {
        return [...(row.childrenIds ?? [])];
    }
    return [rowId];
}
export function getHighlightSubrows(dataset, rowId) {
    const row = dataset.records[rowId];
    if (!row) {
        return [];
    }
    if (isGroup(row)) {
        return getSubrowsOfGroup(dataset, row.id).map((record) => record.id);
    }
    const group = getGroupOfRow(dataset, row.id);
    if (!group) {
        return [row.id];
    }
    return getSubrowsOfGroup(dataset, group.id).map((record) => record.id);
}
