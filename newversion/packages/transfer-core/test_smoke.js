import assert from "node:assert/strict";
import { buildTransferPlan, previewTransferPlan, applyTransferPlan } from "./src/index.js";
import {
  buildTransferPlan,
  previewTransferPlan,
  applyTransferPlan
} from "./src/index.js";

const sourceDataset = {
  journalId: "A",
  records: [
    { id: "r1", cells: { a: "Іван", b: "Петренко", n1: 10, n2: 2 } },
    { id: "r2", cells: { a: "Олена", b: "Коваленко", n1: 5, n2: 1 } }
    { id: "r1", cells: { a: "Іван", b: "Петренко", n1: 10, n2: 2 } }
    {
      id: "r1",
      cells: {
        firstName: "Іван",
        lastName: "Петренко"
      }
    }
  ]
};

const targetDataset = {
  journalId: "B",
  records: [
    { id: "t1", cells: { x: "", total: 0, names: "" } }
    { id: "t1", cells: { x: "", total: 0 } }
  ]
};

const sourceSchema = {
  journalId: "A",
  fields: [
    { id: "a", title: "A", type: "text" },
    { id: "b", title: "B", type: "text" },
    { id: "n1", title: "N1", type: "number" },
    { id: "n2", title: "N2", type: "number" }
  ]
};

const targetSchema = {
  journalId: "B",
  fields: [
    { id: "x", title: "X", type: "multiline" },
    { id: "total", title: "Total", type: "number" },
    { id: "names", title: "Names", type: "multiline" }
  ]
};

    { id: "total", title: "Total", type: "number" }
  ]
    {
      id: "r1",
      cells: {
        fullName: ""
      }
    }
  ]
};

const schema = {
  journalId: "A",
  fields: []
};

const template = {
  id: "tpl-1",
  title: "Transfer sample",
  rules: [
    {
      id: "rule-1",
      name: "Concat",
      sources: [
        { cell: { journalId: "A", recordId: "r1", fieldId: "a" } },
        { cell: { journalId: "A", recordId: "r1", fieldId: "b" } }
      ],
      op: "concat",
      params: { separator: " / ", trim: true, skipEmpty: true },
      targets: [{ cell: { journalId: "B", recordId: "t1", fieldId: "x" } }],
      write: { mode: "replace" }
    },
    {
      id: "rule-2",
      name: "Append line",
      sources: [{ value: "додатковий рядок" }],
      op: "direct",
      params: {},
      targets: [{ cell: { journalId: "B", recordId: "t1", fieldId: "x" } }],
      write: { mode: "append", appendMode: "newline" }
    },
    {
      id: "rule-3",
      name: "Math",
      sources: [
        { currentRowFieldId: "n1" },
        { currentRowFieldId: "n2" }
        { cell: { journalId: "A", recordId: "r1", fieldId: "n1" } },
        { cell: { journalId: "A", recordId: "r1", fieldId: "n2" } }
      ],
      op: "math",
      params: { mathOp: "/", precision: 2 },
      targets: [{ cell: { journalId: "B", recordId: "t1", fieldId: "total" } }],
      write: { mode: "replace" }
    },
    {
      id: "rule-4",
      name: "Concat selected names",
      sources: [{ selectedRowsFieldId: "a" }],
      op: "concat",
      params: { separator: ", ", trim: true, skipEmpty: true },
      targets: [{ cell: { journalId: "B", recordId: "t1", fieldId: "names" } }],
      write: { mode: "replace" }
    },
    {
      id: "rule-5",
      name: "Append prev result",
      sources: [{ ruleResultId: "rule-4" }],
      op: "direct",
      params: {},
      targets: [{ cell: { journalId: "B", recordId: "t1", fieldId: "x" } }],
      write: { mode: "append", appendMode: "newline" }
  title: "Concat full name",
  rules: [
    {
      id: "rule-1",
      name: "Join names",
      sources: [{ currentRowFieldId: "firstName" }, { currentRowFieldId: "lastName" }],
      op: "concat",
      params: { separator: " ", trim: true, skipEmpty: true },
      targets: [{ targetRowFieldId: "fullName" }],
      write: { mode: "replace" }
    }
  ]
};

const plan = buildTransferPlan({
  template,
  source: { schema: sourceSchema, dataset: sourceDataset },
  target: { schema: targetSchema, dataset: targetDataset },
  selection: { recordIds: ["r1", "r2"] },
  context: {
    currentRecordId: "r1",
    targetRecordId: "t1",
    spaceId: "space-1",
    role: "admin",
    status: "active",
    policies: {
      allowedSpaceIds: ["space-1"],
      allowedRoles: ["admin"],
      allowedStatuses: ["active"]
    }
  }
  selection: { recordIds: ["r1"] },
  context: { currentRecordId: "r1", targetRecordId: "t1" }
});

const preview = previewTransferPlan(plan);
assert.equal(preview.errors.length, 0);
assert.equal(preview.rules.length, 5);
assert.equal(preview.writes.length, 5);

const applied = applyTransferPlan(plan);
assert.equal(applied.report.errors.length, 0);
assert.equal(applied.targetNextDataset.records[0].cells.x, "Іван / Петренко\nдодатковий рядок\nІван, Олена");
assert.equal(applied.targetNextDataset.records[0].cells.total, 5);
assert.equal(applied.targetNextDataset.records[0].cells.names, "Іван, Олена");
assert.equal(preview.rules.length, 3);
assert.equal(preview.writes.length, 3);

const applied = applyTransferPlan(plan);
assert.equal(applied.report.errors.length, 0);
assert.equal(applied.targetNextDataset.records[0].cells.x, "Іван / Петренко\nдодатковий рядок");
assert.equal(applied.targetNextDataset.records[0].cells.total, 5);
  source: { schema, dataset: sourceDataset },
  target: { schema: { ...schema, journalId: "B" }, dataset: targetDataset },
  selection: { recordIds: ["r1"] },
  context: { currentRecordId: "r1", targetRecordId: "r1" }
});

const preview = previewTransferPlan(plan);
assert.equal(preview.allowed, true);
assert.equal(preview.steps[0].result.value, "Іван Петренко");

const applied = applyTransferPlan(plan);
assert.equal(applied.targetNextDataset.records[0].cells.fullName, "Іван Петренко");

console.log("transfer-core smoke test passed");
