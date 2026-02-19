# @dilovodstvo/subrows

Незалежний ESM-модуль чистої логіки підстрок для таблиць.

## Що робить

- модель `group + subrow` без DOM
- `ensureGroup`, `addSubrow`, `removeSubrow`
- `computeVisibleRows`
- `resolveEditTarget`
- `getTransferCandidates`
- DOM-free UI flow через `handleCellClickSubrowsFlow`

## Що не робить

- не працює з DOM/window/document
- не виконує перенесення (тільки дає `getTransferCandidates`)
- не зберігає дані у storage

## Встановлення

```bash
npm i @dilovodstvo/subrows
```

## Використання

```ts
import {
  addSubrow,
  computeVisibleRows,
  getTransferCandidates,
  handleCellClickSubrowsFlow,
} from '@dilovodstvo/subrows';
```

## Runtime

- Node.js >= 18
- Browser (ESM)

## Ліцензування

Використовує ліцензію основного репозиторію.
