export function buildReport(execution, validation) {
  return {
    rules: execution.steps.map((step) => ({
      ruleId: step.rule.id,
      ruleName: step.rule.name,
      op: step.rule.op,
      sources: step.resolvedSources.map((item) => item.meta),
      result: step.result
    })),
    writes: execution.steps.flatMap((step) =>
      step.resolvedTargets.map((target) => ({
        ruleId: step.rule.id,
        target,
        value: step.result.value,
        writeMode: step.rule.write ?? { mode: "replace" }
      }))
    ),
    errors: validation.errors,
    warnings: validation.warnings
export function buildReport(execution) {
  return {
    allowed: execution.validation.allowed,
    errors: execution.validation.errors,
    warnings: execution.validation.warnings,
    steps: execution.steps.map((step) => ({
      ruleId: step.rule.id,
      ruleName: step.rule.name,
      sources: step.resolvedSources.map((entry) => entry.meta),
      result: step.result,
      writes: step.writes
    }))
  };
}
