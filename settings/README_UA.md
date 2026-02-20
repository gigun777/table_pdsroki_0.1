# ColumnSettingsUI — модалка “Налаштування → Колонки”

Дата пакету: 2026-02-20

Модалка дозволяє:
- додавання / видалення / дублювання колонок
- редагування: name, id, type, width, align, visible, wrap, required, format, default, options
- зміна порядку (↑/↓)
- пошук по name/id
- виклик `onSave(newColumns)` для збереження у ваш cfg

## Файли
- `column_settings_modal.css`
- `column_settings_modal.html`
- `column_settings_modal.js`
- `demo.html`
- `README_UA.md`

## Підключення
1) CSS
```html
<link rel="stylesheet" href="column_settings_modal.css">
```
2) HTML (1 раз у DOM)
- вставте вміст `column_settings_modal.html`
3) JS
```html
<script src="column_settings_modal.js"></script>
```

## Виклик
```js
ColumnSettingsUI.open({
  sheet: currentSheet,
  onSave: (newColumns) => {
    cfgSet("sheet_columns_"+currentSheet.key, newColumns);
    applyColumnsToTable(currentSheet.key, newColumns);
  }
});
```

## Залежності “налаштування → функція / змінна”
- `columns[].name` → заголовок колонки (UI таблиці)
- `columns[].id` → стабільний ключ для мапінгу, експорту/імпорту, перенесень
- `columns[].type` → рендер/редактор клітинки + валідація
- `columns[].width` → ширина колонки (px)
- `columns[].align` → вирівнювання тексту
- `columns[].visible` → показ/приховування колонки
- `columns[].subrows` → дозволити підстроки (вкладені рядки/деталізацію)
- `columns[].wrap` → перенос рядка
- `columns[].required` → перевірки перед збереженням/експортом (ваша логіка)
- `columns[].format` → формат числа/дати (ваша логіка)
- `columns[].default` → значення за замовчуванням при створенні рядка
- `columns[].options` → дозволені значення для select

> Важливо: якщо рядки зберігаються як `row[]`, перестановка колонок змінює індекси.
> Рекомендовано або мігрувати рядки, або перейти на `{colId: value}`.
