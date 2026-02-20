import { migrateTemplates, validateTemplate } from './model/template.schema.js';

function resolveTarget(target, targetJournalId, context, selection) {
  if (target?.cell) return target.cell;
  if (target?.targetRowFieldId) {
    return {
      journalId: targetJournalId,
      recordId: context?.targetRecordId ?? context?.currentRecordId ?? selection?.recordIds?.[0] ?? null,
      fieldId: target.targetRowFieldId
    };
  }
  return null;
}

function getDatasetByJournal(ctx, journalId) {
  if (ctx.source.dataset?.journalId === journalId) return ctx.source.dataset;
  if (ctx.target.dataset?.journalId === journalId) return ctx.target.dataset;
  return null;
}

function getRecord(dataset, recordId) {
  return dataset?.records?.find((r) => r.id === recordId) ?? null;
}

function resolveSources(rule, ctx, ruleResults) {
  const out = [];
  for (const source of rule.sources ?? []) {
    if (source?.cell) {
      const ds = getDatasetByJournal(ctx, source.cell.journalId);
      const rec = getRecord(ds, source.cell.recordId);
      out.push(rec?.cells?.[source.cell.fieldId]);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(source ?? {}, 'value')) {
      out.push(source.value);
      continue;
    }
    if (source?.currentRowFieldId) {
      const rec = getRecord(ctx.source.dataset, ctx.context?.currentRecordId);
      out.push(rec?.cells?.[source.currentRowFieldId]);
      continue;
    }
    if (source?.selectedRowsFieldId) {
      const ids = ctx.selection?.recordIds ?? [];
      for (const id of ids) {
        const rec = getRecord(ctx.source.dataset, id);
        out.push(rec?.cells?.[source.selectedRowsFieldId]);
      }
      continue;
    }
    if (source?.ruleResultId) {
      out.push(ruleResults.get(source.ruleResultId));
      continue;
    }
    out.push(undefined);
  }
  return out;
}

function evaluateRule(rule, values) {
  if (rule.op === 'direct') return { ok: true, value: values[0] };

  if (rule.op === 'concat') {
    const sep = rule.params?.separator === '\\n' ? '\n' : (rule.params?.separator ?? '');
    const trim = Boolean(rule.params?.trim);
    const skipEmpty = Boolean(rule.params?.skipEmpty);
    const prepared = values.map((v) => {
      const s = v == null ? '' : String(v);
      return trim ? s.trim() : s;
    });
    const filtered = skipEmpty ? prepared.filter((v) => v !== '') : prepared;
    return { ok: true, value: filtered.join(sep) };
  }

  if (rule.op === 'math') {
    const op = rule.params?.mathOp ?? '+';
    const nums = values.map((v) => Number(v));
    if (nums.some((n) => !Number.isFinite(n))) return { ok: false, error: 'math_non_numeric', value: null };
    let result = nums[0] ?? 0;
    for (let i = 1; i < nums.length; i += 1) {
      if (op === '+') result += nums[i];
      if (op === '-') result -= nums[i];
      if (op === '*') result *= nums[i];
      if (op === '/') result /= nums[i];
    }
    if (typeof rule.params?.precision === 'number') result = Number(result.toFixed(rule.params.precision));
    return { ok: true, value: result };
  }

  return { ok: false, error: 'unsupported_op', value: null };
}

function cloneDataset(dataset) {
  return {
    ...dataset,
    records: (dataset.records ?? []).map((r) => ({ ...r, cells: { ...(r.cells ?? {}) } }))
  };
}

function appendValue(current, incoming, write) {
  const c = current ?? '';
  const n = incoming ?? '';
  if (c === '') return n;
  if (write.appendMode === 'space') return `${c} ${n}`;
  if (write.appendMode === 'newline') return `${c}\n${n}`;
  if (write.appendMode === 'separator') return `${c}${write.appendSeparator ?? ''}${n}`;
  return `${c}${n}`;
}

function applyWrites(sourceDataset, targetDataset, writes) {
  const sourceNext = cloneDataset(sourceDataset);
  const targetNext = cloneDataset(targetDataset);

  for (const write of writes) {
    const ds = write.target.journalId === sourceNext.journalId ? sourceNext : targetNext;
    const rec = getRecord(ds, write.target.recordId);
    if (!rec) continue;
    if (write.writeMode?.mode === 'append') rec.cells[write.target.fieldId] = appendValue(rec.cells[write.target.fieldId], write.value, write.writeMode);
    else rec.cells[write.target.fieldId] = write.value;
  }

  return { sourceNextDataset: sourceNext, targetNextDataset: targetNext };
}

function executePlan(plan) {
  const steps = [];
  const errors = [];
  const warnings = [];
  const ruleResults = new Map();

  for (const rule of plan.template.rules ?? []) {
    const values = resolveSources(rule, plan, ruleResults);
    const result = evaluateRule(rule, values);
    ruleResults.set(rule.id, result.value);

    const targets = (rule.targets ?? []).map((target) => resolveTarget(target, plan.target.dataset.journalId, plan.context, plan.selection)).filter(Boolean);
    if (!targets.length) errors.push({ ruleId: rule.id, code: 'empty_target' });
    if (!result.ok) errors.push({ ruleId: rule.id, code: result.error ?? 'rule_error' });

    steps.push({ rule, values, result, targets });
  }

  const writes = steps.flatMap((step) =>
    step.targets.map((target) => ({ target, value: step.result.value, writeMode: step.rule.write ?? { mode: 'replace' }, ruleId: step.rule.id }))
  );

  return {
    report: {
      rules: steps.map((s) => ({ ruleId: s.rule.id, op: s.rule.op, result: s.result })),
      writes,
      errors,
      warnings
    },
    writes
  };
}

import { buildTransferPlan, previewTransferPlan, applyTransferPlan } from '../../../transfer-core/src/index.js';
import { migrateTemplates, validateTemplate } from './model/template.schema.js';

export function createTransferCore({ storage, journals, logger } = {}) {
  if (!storage) throw new Error('createTransferCore requires storage adapter');
  if (!journals) throw new Error('createTransferCore requires journals adapter');

  async function loadTemplates() {
    return migrateTemplates(await storage.loadTemplates());
  }

  async function saveTemplates(next) {
    await storage.saveTemplates(migrateTemplates(next));
  }

  const templatesApi = {
    async list() {
      return loadTemplates();
    },
    async save(template) {
      validateTemplate(template);
      const current = await loadTemplates();
      const idx = current.findIndex((item) => item.id === template.id);
      if (idx >= 0) current[idx] = { ...template, schemaVersion: 2 };
      else current.push({ ...template, schemaVersion: 2 });
      await saveTemplates(current);
      return template;
    },
    async remove(id) {
      const current = await loadTemplates();
      await saveTemplates(current.filter((item) => item.id !== id));
    }
  };

  async function prepareTransfer({ templateId, sourceRef, rowIds }) {
    const templates = await loadTemplates();
    const template = templates.find((item) => item.id === templateId);
    if (!template) throw new Error(`template not found: ${templateId}`);

    const sourceDataset = await journals.loadDataset(sourceRef.journalId);
    const sourceSchema = await journals.getSchema(sourceRef.journalId);

    return {
      template,
      sourceRef,
      rowIds: Array.isArray(rowIds) ? rowIds : [rowIds],
      sourceDataset,
      sourceSchema
    };
  }

  async function preview(ctx, { targetRef }) {
    const targetDataset = await journals.loadDataset(targetRef.journalId);
    const targetSchema = await journals.getSchema(targetRef.journalId);
    const currentRecordId = ctx.rowIds?.[0] ?? null;
    const targetRecordId = targetDataset.records?.[0]?.id ?? null;

    const plan = {
    const plan = buildTransferPlan({
      template: ctx.template,
      source: { schema: ctx.sourceSchema, dataset: ctx.sourceDataset },
      target: { schema: targetSchema, dataset: targetDataset },
      selection: { recordIds: ctx.rowIds },
      context: { currentRecordId, targetRecordId }
    };

    const executed = executePlan(plan);
    return { plan, report: executed.report, targetDataset, targetSchema };
  }

  async function commit(previewCtx) {
    const executed = executePlan(previewCtx.plan);
    if (executed.report.errors.length) {
      logger?.error?.('transfer commit blocked', executed.report.errors);
      return {
        sourceNextDataset: previewCtx.plan.source.dataset,
        targetNextDataset: previewCtx.plan.target.dataset,
        report: executed.report
      };
    }

    const applied = applyWrites(previewCtx.plan.source.dataset, previewCtx.plan.target.dataset, executed.writes);
    await journals.saveDataset(previewCtx.plan.target.dataset.journalId, applied.targetNextDataset);
    return { ...applied, report: executed.report };
    });

    const report = previewTransferPlan(plan);
    return { plan, report, targetDataset, targetSchema };
  }

  async function commit(previewCtx) {
    const applied = applyTransferPlan(previewCtx.plan);
    if (applied.report.errors.length) {
      logger?.error?.('transfer commit blocked', applied.report.errors);
      return applied;
    }

    await journals.saveDataset(previewCtx.plan.target.dataset.journalId, applied.targetNextDataset);
    return applied;
  }

  return {
    templates: templatesApi,
    prepareTransfer,
    preview,
    commit
  };
}
