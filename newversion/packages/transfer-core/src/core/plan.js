import { resolveSources } from "./extract.js";
import { evaluateRule } from "./rules.js";
import { applyWrites } from "./writer.js";
import { validate } from "./guards.js";
import { buildReport } from "./result.js";

function resolveTargetSpec(target, plan) {
  if (target?.cell) return target.cell;

  if (target?.targetRowFieldId) {
    return {
      journalId: plan.target.dataset.journalId,
      recordId: plan.context?.targetRecordId ?? plan.context?.currentRecordId ?? plan.selection?.recordIds?.[0] ?? null,
import { validate } from "./guards.js";
import { buildReport } from "./result.js";
import { applyWrites } from "./writer.js";

function pickDefaultTargetRecordId(input) {
  return input.context?.targetRecordId ?? input.context?.currentRecordId ?? input.selection?.recordIds?.[0] ?? null;
}

function resolveTarget(target, input) {
  if (target.cell) return target.cell;

  if (target.targetRowFieldId) {
    return {
      journalId: input.target.dataset.journalId,
      recordId: pickDefaultTargetRecordId(input),
      fieldId: target.targetRowFieldId
    };
  }

  return null;
}

function createExecution(plan) {
  const ruleResults = new Map();
  const ctxBase = {
    sourceDataset: plan.source.dataset,
    targetDataset: plan.target.dataset,
    selection: plan.selection,
    context: plan.context,
    ruleResults
  };

  const steps = [];
  for (const rule of plan.template.rules ?? []) {
    const resolvedSources = resolveSources(rule.sources, ctxBase);
  const ctx = {
    sourceDataset: plan.source.dataset,
    targetDataset: plan.target.dataset
  };

  const steps = (plan.template.rules ?? []).map((rule) => {
    const resolvedSources = resolveSources(rule.sources, ctx);
    const result = evaluateRule(rule, resolvedSources);
    const resolvedTargets = (rule.targets ?? [])
      .map((target) => resolveTargetSpec(target, plan))
      .filter(Boolean);

    ruleResults.set(rule.id, result.value);
    steps.push({ rule, resolvedSources, resolvedTargets, result });
  }
    return { rule, resolvedSources, resolvedTargets, result };
  });

  return { steps };
}

export function buildTransferPlan(input) {
  return {
    template: input.template,
    source: input.source,
    target: input.target,
    selection: input.selection ?? { recordIds: [] },
    context: input.context ?? {}
export function buildTransferPlan(input) {
  const ctx = {
    sourceDataset: input.source.dataset,
    targetDataset: input.target.dataset,
    selection: input.selection ?? { recordIds: [] },
    context: input.context ?? {},
    policies: input.context?.policies ?? {}
  };

  const steps = (input.template.rules ?? []).map((rule) => {
    const resolvedSources = resolveSources(rule.sources, ctx);
    const result = evaluateRule(rule, resolvedSources, ctx);
    const writes = (rule.targets ?? [])
      .map((target) => ({
        target: resolveTarget(target, input),
        value: result.value,
        write: rule.write
      }))
      .filter((write) => Boolean(write.target?.recordId && write.target?.fieldId));

    return { rule, resolvedSources, result, writes };
  });

  const validation = validate({ steps }, ctx);

  return {
    templateId: input.template.id,
    source: input.source,
    target: input.target,
    steps,
    validation,
    context: input.context ?? {},
    selection: input.selection ?? { recordIds: [] }
  };
}

export function previewTransferPlan(plan) {
  const execution = createExecution(plan);
  const validation = validate(execution, plan);
  return buildReport(execution, validation);
}

export function applyTransferPlan(plan) {
  const execution = createExecution(plan);
  const validation = validate(execution, plan);
  const report = buildReport(execution, validation);

  if (!validation.allowed) {
    return {
      sourceNextDataset: plan.source.dataset,
      targetNextDataset: plan.target.dataset,
      report
    };
  }

  const writes = report.writes.map((item) => ({
    target: item.target,
    value: item.value,
    writeMode: item.writeMode
  }));

  const nextDatasets = applyWrites(
  return buildReport(plan);
}

export function applyTransferPlan(plan) {
  if (!plan.validation.allowed) {
    return {
      sourceNextDataset: plan.source.dataset,
      targetNextDataset: plan.target.dataset,
      report: buildReport(plan)
    };
  }

  const writes = plan.steps.flatMap((step) => step.writes);
  const next = applyWrites(
    {
      sourceDataset: plan.source.dataset,
      targetDataset: plan.target.dataset
    },
    writes
  );

  return {
    ...nextDatasets,
    report
    ...next,
    report: buildReport(plan)
  };
}
