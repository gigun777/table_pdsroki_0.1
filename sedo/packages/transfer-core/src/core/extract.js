function getDatasetByJournalId(ctx, journalId) {
  if (ctx.sourceDataset?.journalId === journalId) return ctx.sourceDataset;
  if (ctx.targetDataset?.journalId === journalId) return ctx.targetDataset;
  return null;
}

function getRecordById(dataset, recordId) {
  return dataset?.records?.find((record) => record.id === recordId) ?? null;
}

function resolveCellSource(cellRef, ctx) {
  const dataset = getDatasetByJournalId(ctx, cellRef.journalId);
  if (!dataset) {
    return {
      value: undefined,
      meta: { kind: "cell", cell: cellRef, error: "journal_not_found" }
    };
  }

  const record = getRecordById(dataset, cellRef.recordId);
  if (!record) {
    return {
      value: undefined,
      meta: { kind: "cell", cell: cellRef, error: "record_not_found" }
    };
  }

  return {
    value: record.cells?.[cellRef.fieldId],
    meta: { kind: "cell", cell: cellRef }
  };
}

function resolveCurrentRowSource(fieldId, ctx) {
  const recordId = ctx.context?.currentRecordId;
  const record = getRecordById(ctx.sourceDataset, recordId);
  return {
    value: record?.cells?.[fieldId],
    meta: { kind: "current_row", recordId, fieldId }
  };
}

function resolveSelectedRowsSource(fieldId, ctx) {
  const recordIds = ctx.selection?.recordIds ?? [];
  return recordIds.map((recordId) => {
    const record = getRecordById(ctx.sourceDataset, recordId);
    return {
      value: record?.cells?.[fieldId],
      meta: { kind: "selected_row", recordId, fieldId }
    };
  });
}

function resolveRuleResultSource(source, ctx) {
  const ruleId = source.ruleResultId ?? source.ruleResult?.ruleId;
  if (!ruleId) {
    return {
      value: undefined,
      meta: { kind: "rule_result", error: "rule_result_id_missing" }
    };
  }

  if (!ctx.ruleResults?.has(ruleId)) {
    return {
      value: undefined,
      meta: { kind: "rule_result", ruleId, error: "rule_result_not_found" }
    };
  }

  return {
    value: ctx.ruleResults.get(ruleId),
    meta: { kind: "rule_result", ruleId }
function getRecord(dataset, recordId) {
  return dataset?.records?.find((record) => record.id === recordId) ?? null;
}

function resolveCell(cellRef, ctx) {
  const dataset =
    cellRef.journalId === ctx.sourceDataset.journalId
      ? ctx.sourceDataset
      : cellRef.journalId === ctx.targetDataset.journalId
        ? ctx.targetDataset
        : null;

  if (!dataset) {
    return { value: undefined, meta: { kind: "cell", cellRef, error: "journal_not_found" } };
  }

  const record = getRecord(dataset, cellRef.recordId);
  if (!record) {
    return { value: undefined, meta: { kind: "cell", cellRef, error: "record_not_found" } };
  }

  return {
    value: record.cells?.[cellRef.fieldId],
    meta: { kind: "cell", cell: cellRef }
    meta: { kind: "cell", cellRef }
  };
}

export function resolveSources(sources, ctx) {
  const resolved = [];

  for (const source of sources ?? []) {
    if (source?.cell) {
      resolved.push(resolveCellSource(source.cell, ctx));
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(source ?? {}, "value")) {
      resolved.push({ value: source.value, meta: { kind: "value" } });
      continue;
    }

    if (source?.currentRowFieldId) {
      resolved.push(resolveCurrentRowSource(source.currentRowFieldId, ctx));
      continue;
    }

    if (source?.selectedRowsFieldId) {
      resolved.push(...resolveSelectedRowsSource(source.selectedRowsFieldId, ctx));
      continue;
    }

    if (source?.ruleResultId || source?.ruleResult) {
      resolved.push(resolveRuleResultSource(source, ctx));
      continue;
    }

    resolved.push({ value: undefined, meta: { kind: "unknown_source", source, error: "unsupported_source" } });
    resolved.push({ value: undefined, meta: { kind: "unknown_source", source, error: "unsupported_source" } });
    if (Object.hasOwn(source, "value")) {
      resolved.push({ value: source.value, meta: { kind: "value" } });
      continue;
    }

    if (source.cell) {
      resolved.push(resolveCell(source.cell, ctx));
      continue;
    }

    if (source.currentRowFieldId) {
      const recordId = ctx.context?.currentRecordId;
      const record = getRecord(ctx.sourceDataset, recordId);
      resolved.push({
        value: record?.cells?.[source.currentRowFieldId],
        meta: { kind: "current_row", recordId, fieldId: source.currentRowFieldId }
      });
      continue;
    }

    if (source.selectedRowsFieldId) {
      const recordIds = ctx.selection?.recordIds ?? [];
      for (const recordId of recordIds) {
        const record = getRecord(ctx.sourceDataset, recordId);
        resolved.push({
          value: record?.cells?.[source.selectedRowsFieldId],
          meta: { kind: "selected_row", recordId, fieldId: source.selectedRowsFieldId }
        });
      }
    }
  }

  return resolved;
}
