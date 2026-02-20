/**
 * Table settings feature module.
 */
(function attachTableSettingsFeature(global) {
  const UI = (global.UI = global.UI || {});
  UI.settings = UI.settings || {};

  const TABLE_SETTINGS_KEY = '@sdo/module-table-renderer:settings';

  function sectionContent(title, description) {
    return function render(container) {
      container.innerHTML = '';
      const h = document.createElement('h4');
      h.textContent = title;
      const p = document.createElement('p');
      p.textContent = description;
      container.append(h, p);
    };
  }

  async function readTableSettings() {
    try {
      const value = await UI.storage?.get(TABLE_SETTINGS_KEY);
      return value ?? { columns: { visibility: {} }, subrows: { columnsSubrowsEnabled: {} } };
    } catch {
      return { columns: { visibility: {} }, subrows: { columnsSubrowsEnabled: {} } };
    }
  }

  function renderColumnsSettingsSection(container) {
    container.innerHTML = '';
    const header = document.createElement('h4');
    header.textContent = 'Колонки';
    const desc = document.createElement('p');
    desc.textContent = 'Увімкніть підстроки для потрібних колонок.';
    container.append(header, desc);

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '8px';
    container.append(list);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Зберегти';
    saveBtn.style.marginTop = '12px';
    container.append(saveBtn);

    let settings = { columns: { visibility: {} }, subrows: { columnsSubrowsEnabled: {} } };

    const run = async () => {
      settings = await readTableSettings();
      const state = UI.sdo?.getState?.() ?? { journals: [], activeJournalId: null };
      const activeJournal = (state.journals ?? []).find((j) => j.id === state.activeJournalId) ?? null;
      const templateId = activeJournal?.templateId;
      const template = templateId ? await UI.sdo?.journalTemplates?.getTemplate?.(templateId) : null;
      const columns = template?.columns ?? [];

      list.innerHTML = '';
      for (const column of columns) {
        const row = document.createElement('label');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';

        const subrows = document.createElement('input');
        subrows.type = 'checkbox';
        subrows.checked = settings.subrows?.columnsSubrowsEnabled?.[column.key] === true;
        subrows.addEventListener('change', () => {
          settings = {
            ...settings,
            subrows: {
              ...(settings.subrows ?? { columnsSubrowsEnabled: {} }),
              columnsSubrowsEnabled: {
                ...((settings.subrows ?? {}).columnsSubrowsEnabled ?? {}),
                [column.key]: subrows.checked
              }
            }
          };
        });

        const text = document.createElement('span');
        text.textContent = `${column.label} (${column.key})`;
        row.append(subrows, text);
        list.append(row);
      }
    };

    saveBtn.addEventListener('click', async () => {
      await UI.storage?.set(TABLE_SETTINGS_KEY, settings);
      UI.toast?.show?.('Налаштування колонок збережено');
    });

    run();
  }

  function createTableSettingsFeature() {
    return {
      id: 'table',
      title: 'Таблиці',
      order: 10,
      sections: [
        {
          id: 'journals',
          title: 'Журнали',
          order: 10,
          renderContent: sectionContent('Журнали', 'Керування журналами та шаблонами журналів.'),
          onConfirm: ({ draft }) => draft
        },
        {
          id: 'columns',
          title: 'Колонки',
          order: 20,
          renderContent: renderColumnsSettingsSection,
          onConfirm: ({ draft }) => draft
        },
        {
          id: 'quickAdd',
          title: 'Поля +Додати',
          order: 30,
          renderContent: sectionContent('Поля +Додати', 'Набір полів для швидкого додавання записів.'),
          onConfirm: ({ draft }) => draft
        },
        {
          id: 'transfer',
          title: 'Перенесення',
          order: 40,
          renderContent: sectionContent('Перенесення', 'Параметри перенесення даних між таблицями.'),
          onConfirm: ({ draft }) => draft
        }
      ]
    };
  }

  function registerTableSettingsFeature() {
    const feature = createTableSettingsFeature();
    UI.settings.registry?.registerFeature(feature);
    return feature;
  }

  UI.settings.createTableSettingsFeature = createTableSettingsFeature;
  UI.settings.registerTableSettingsFeature = registerTableSettingsFeature;
})(typeof window !== 'undefined' ? window : globalThis);
