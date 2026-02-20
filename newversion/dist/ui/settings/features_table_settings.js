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

  function getSettingsStorage() {
    if (UI.storage && typeof UI.storage.get === 'function' && typeof UI.storage.set === 'function') {
      return UI.storage;
    }

    if (UI.storage && typeof UI.storage.getItem === 'function' && typeof UI.storage.setItem === 'function') {
      return {
        get: async (key) => {
          const raw = UI.storage.getItem(key);
          if (raw == null) return null;
          try { return JSON.parse(raw); } catch { return raw; }
        },
        set: async (key, value) => {
          UI.storage.setItem(key, JSON.stringify(value));
        }
      };
    }

    return {
      get: async (key) => {
        const raw = global.localStorage?.getItem?.(key);
        if (raw == null) return null;
        try { return JSON.parse(raw); } catch { return raw; }
      },
      set: async (key, value) => {
        global.localStorage?.setItem?.(key, JSON.stringify(value));
      }
    };
  }

  async function readTableSettings() {
    const storage = getSettingsStorage();
    try {
      const value = await storage.get(TABLE_SETTINGS_KEY);
  async function readTableSettings() {
    try {
      const value = await UI.storage?.get(TABLE_SETTINGS_KEY);
      return value ?? { columns: { visibility: {} }, subrows: { columnsSubrowsEnabled: {} } };
    } catch {
      return { columns: { visibility: {} }, subrows: { columnsSubrowsEnabled: {} } };
    }
  }

  function getJournalsState() {
    const state = UI.sdo?.getState?.() ?? { journals: [], activeJournalId: null };
    return {
      journals: state.journals ?? [],
      activeJournalId: state.activeJournalId ?? null
    };
  }

  async function loadColumnsForJournal(journalId) {
    const { journals } = getJournalsState();
    const journal = journals.find((item) => item.id === journalId) ?? null;
    const templateId = journal?.templateId ?? null;
    if (!templateId) return [];

    const jt = UI.sdo?.journalTemplates || UI.sdo?.api?.journalTemplates;
    const template = await jt?.getTemplate?.(templateId);
    return template?.columns ?? [];
  }

  function createColumnsSettingsNode(settings, columns, onChange) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '8px';

    for (const column of columns) {
      const row = document.createElement('label');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '8px';

      const subrows = document.createElement('input');
      subrows.type = 'checkbox';
      subrows.checked = settings.subrows?.columnsSubrowsEnabled?.[column.key] === true;
      subrows.addEventListener('change', () => {
        const next = {
          ...settings,
          subrows: {
            ...(settings.subrows ?? { columnsSubrowsEnabled: {} }),
            columnsSubrowsEnabled: {
              ...((settings.subrows ?? {}).columnsSubrowsEnabled ?? {}),
              [column.key]: subrows.checked
            }
          }
        };
        onChange(next);
      });

      const text = document.createElement('span');
      text.textContent = `${column.label} (${column.key})`;
      row.append(subrows, text);
      wrapper.append(row);
    }

    return wrapper;
  }

  function renderColumnsSettingsSection(container) {
    container.innerHTML = '';

    const header = document.createElement('h4');
    header.textContent = 'Колонки';
    const desc = document.createElement('p');
    desc.textContent = 'Оберіть журнал та налаштуйте колонки для підстрок.';
    desc.textContent = 'Відкрийте модалку налаштувань і увімкніть підстроки для потрібних колонок.';
    const openBtn = document.createElement('button');
    openBtn.textContent = 'Налаштувати колонки';

    container.append(header, desc, openBtn);

    openBtn.addEventListener('click', async () => {
      let settings = await readTableSettings();
      const { journals, activeJournalId } = getJournalsState();
      let selectedJournalId = activeJournalId ?? journals[0]?.id ?? null;
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

      if (!UI.modal?.open) {
        UI.toast?.show?.('Модалка недоступна в цьому середовищі');
        return;
      }

      const body = document.createElement('div');
      body.style.display = 'grid';
      body.style.gap = '12px';

      const journalSelect = document.createElement('select');
      for (const journal of journals) {
        journalSelect.append(new Option(journal.title ?? journal.id, journal.id));
      }
      if (selectedJournalId) journalSelect.value = selectedJournalId;

      const listWrap = document.createElement('div');
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Зберегти';

      const rerenderList = async () => {
        const columns = await loadColumnsForJournal(selectedJournalId);
        listWrap.innerHTML = '';
        if (!columns.length) {
          const empty = document.createElement('p');
          empty.textContent = 'Для обраного журналу не знайдено колонок.';
          listWrap.append(empty);
          return;
        }
      const rerenderList = () => {
        listWrap.innerHTML = '';
        listWrap.append(createColumnsSettingsNode(settings, columns, (next) => {
          settings = next;
          rerenderList();
        }));
      };

      journalSelect.addEventListener('change', async () => {
        selectedJournalId = journalSelect.value;
        await rerenderList();
      });

      await rerenderList();
      body.append('Обрати журнал', journalSelect, listWrap, saveBtn);
      rerenderList();

      body.append(listWrap, saveBtn);

      const modalId = UI.modal.open({
        title: 'Налаштування колонок',
        contentNode: body,
        closeOnOverlay: true,
        escClose: true
      });

      saveBtn.addEventListener('click', async () => {
        const storage = getSettingsStorage();
        await storage.set(TABLE_SETTINGS_KEY, settings);
        UI.toast?.show?.('Налаштування колонок збережено');
        UI.modal.close(modalId);
      });
    });
  }

  function renderTransferSection(container) {
    container.innerHTML = '';

    const status = document.createElement('p');
    status.textContent = 'Завантаження налаштувань перенесення...';
    container.append(status);

    const run = async () => {
      try {
        const { createTransferUI } = await import('../../../../packages/transfer-ui/src/index.js');

        const storageAdapter = getSettingsStorage();
        const transferUI = createTransferUI({
          storageAdapter,
          loadDataset: async (journalId) => {
            const store = UI.sdo?.api?.tableStore;
            return (await store?.getDataset?.(journalId)) ?? { journalId, records: [], merges: [] };
          },
          saveDataset: async (journalId, dataset) => {
            const store = UI.sdo?.api?.tableStore;
            await store?.upsertRecords?.(journalId, dataset.records ?? [], 'replace');
          },
          getSchema: async (journalId) => {
            const { journals } = getJournalsState();
            const journal = journals.find((item) => item.id === journalId) ?? null;
            const templateId = journal?.templateId;
            const template = templateId ? await (UI.sdo?.journalTemplates?.getTemplate?.(templateId)) : null;
            return {
              journalId,
              fields: (template?.columns ?? []).map((column) => ({ id: column.key, title: column.label, type: column.type ?? 'text' }))
            };
          },
          listJournals: async () => {
            const { journals } = getJournalsState();
            return journals.map((journal) => ({ id: journal.id, title: journal.title }));
          }
        });

        container.innerHTML = '';
        await transferUI.renderTransferSettingsSection(container);
      } catch (error) {
        status.textContent = `Помилка налаштувань перенесення: ${error.message}`;
      }
    };

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
          renderContent: renderTransferSection,
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
