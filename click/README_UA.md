# SubrowActionUI — модалка дій підстроки (як на скріні)

Дата: 2026-02-20

Ця модалка показується в журналі при натисканні на підстроку рядка і пропонує:
- Скасувати
- Редагувати (поточну підстроку)
- Додати підстрочку (створити нову підстроку для цього ж рядка)

## Файли
- subrow_action_modal.css
- subrow_action_modal.html
- subrow_action_modal.js
- demo.html
- README_UA.md

## Підключення
1) CSS
```html
<link rel="stylesheet" href="subrow_action_modal.css">
```
2) HTML (вставити 1 раз у DOM)
Вставте вміст `subrow_action_modal.html` (наприклад, в кінець body).
3) JS
```html
<script src="subrow_action_modal.js"></script>
```

## Виклик з журналу
```js
SubrowActionUI.open({
  context: {
    sheetKey: currentSheetKey,
    rowId: row.id,
    rowIndex,
    rowTitle: row.title || row.cells?.[0] || ""
  },
  subrow: clickedSubrow, // {id,title,...}
  onEdit: (subrow, ctx) => {
    // відкрити вашу “велику” модалку редагування підстроки
    openSubrowEditor(ctx, subrow);
  },
  onAdd: (ctx) => {
    // відкрити вашу “велику” модалку створення підстроки
    openSubrowCreate(ctx);
  }
});
```

## Дані
- `context` — інформація про журнал і рядок
- `subrow` — підстрока, на яку натиснули
- `onEdit` / `onAdd` — колбеки, які ви підʼєднуєте до вашої логіки
