function cloneDataset(dataset) {
  return {
    ...dataset,
    records: (dataset.records ?? []).map((record) => ({
      ...record,
      cells: { ...(record.cells ?? {}) }
    })),
    meta: { ...(dataset.meta ?? {}), updatedAt: Date.now() }
  };
}

function appendByMode(currentValue, nextValue, writeMode) {
    meta: {
      ...(dataset.meta ?? {}),
      updatedAt: Date.now()
    }
  };
}

function getRecord(dataset, recordId) {
  return dataset.records.find((record) => record.id === recordId);
}

function appendValue(currentValue, nextValue, write) {
  const current = currentValue ?? "";
  const incoming = nextValue ?? "";

  if (current === "") return incoming;

  if (writeMode?.mode !== "append") return incoming;
  if (writeMode.appendMode === "space") return `${current} ${incoming}`;
  if (writeMode.appendMode === "newline") return `${current}\n${incoming}`;
  if (writeMode.appendMode === "separator") return `${current}${writeMode.appendSeparator ?? ""}${incoming}`;
  return `${current}${incoming}`;
}

export function applyWrite(dataset, targetCell, value, writeMode) {
  const record = dataset.records?.find((item) => item.id === targetCell.recordId);
  if (!record) return false;

  const fieldId = targetCell.fieldId;
  if (!fieldId) return false;

  if (writeMode?.mode === "append") {
    record.cells[fieldId] = appendByMode(record.cells[fieldId], value, writeMode);
  } else {
    record.cells[fieldId] = value;
  }

  return true;
}

  if (write.appendMode === "space") return `${current} ${incoming}`;
  if (write.appendMode === "newline") return `${current}\n${incoming}`;
  if (write.appendMode === "separator") return `${current}${write.appendSeparator ?? ""}${incoming}`;
  return `${current}${incoming}`;
}

export function applyWrites(datasets, writes) {
  const sourceNextDataset = cloneDataset(datasets.sourceDataset);
  const targetNextDataset = cloneDataset(datasets.targetDataset);

  for (const write of writes ?? []) {
    const dataset =
      write.target.journalId === sourceNextDataset.journalId ? sourceNextDataset : targetNextDataset;
    applyWrite(dataset, write.target, write.value, write.writeMode);
  for (const write of writes) {
    const isSource = write.target.journalId === sourceNextDataset.journalId;
    const dataset = isSource ? sourceNextDataset : targetNextDataset;
    const record = getRecord(dataset, write.target.recordId);
    if (!record) continue;

    const fieldId = write.target.fieldId;
    if (write.write.mode === "append") {
      record.cells[fieldId] = appendValue(record.cells[fieldId], write.value, write.write);
    } else {
      record.cells[fieldId] = write.value;
    }
  }

  return { sourceNextDataset, targetNextDataset };
}
