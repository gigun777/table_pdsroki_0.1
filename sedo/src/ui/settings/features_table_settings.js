/**
 * Table settings feature module.
 * Contains sections migrated from legacy table settings modal navigation.
 */
(function attachTableSettingsFeature(global) {
  const UI = (global.UI = global.UI || {});
  UI.settings = UI.settings || {};

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

  function transferSectionContent() {
    return function render(container) {
      container.innerHTML = '';
      const status = document.createElement('p');
      status.textContent = 'Завантаження конструктора перенесень...';
      container.append(status);

      const run = async () => {
        try {
          const mod = await import('../../../../packages/transfer/src/index.js');
          const mod = await import('../../../../packages/transfer-ui/src/index.js');
          const state = UI.sdo?.getState?.() || { journals: [] };
          const tableStore = UI.sdo?.api?.tableStore;
          const journalTemplates = UI.sdo?.journalTemplates || UI.sdo?.api?.journalTemplates;

          const transferStorage = mod.createTransferStorage({
            storage: {
          const transferUI = mod.createTransferUI({
            storageAdapter: {
              get: async (key) => {
                const raw = UI.storage?.getItem?.(key);
                try { return JSON.parse(raw); } catch { return raw; }
              },
              set: async (key, value) => {
                UI.storage?.setItem?.(key, JSON.stringify(value));
              }
            }
          });

          const journals = mod.createJournalsAdapter({
            },
            loadDataset: async (journalId) => tableStore?.getDataset?.(journalId) ?? { journalId, records: [] },
            saveDataset: async (journalId, dataset) => tableStore?.upsertRecords?.(journalId, dataset.records ?? [], 'replace'),
            getSchema: async (journalId) => {
              const journal = (UI.sdo?.getState?.().journals ?? []).find((item) => item.id === journalId);
              const template = journal?.templateId ? await journalTemplates?.getTemplate?.(journal.templateId) : null;
              return {
                journalId,
                fields: (template?.columns ?? []).map((column) => ({ id: column.key, title: column.label, type: 'text' }))
              };
            },
            listJournals: async () => (UI.sdo?.getState?.().journals ?? []).map((journal) => ({ id: journal.id, title: journal.title }))
          });

          const core = mod.createTransferCore({ storage: transferStorage, journals, logger: console });
          const transferUI = mod.createTransferUI({
            core,
            journals,
            ui: {
              openModal: ({ title, contentNode }) => UI.modal.open({ title, contentNode, closeOnOverlay: true }),
              closeModal: (id) => UI.modal.close(id)
            }
          });

          status.remove();
          await transferUI.openSettings(container);
          status.remove();
          await transferUI.renderTransferSettingsSection(container);
        } catch (error) {
          status.textContent = `Помилка завантаження перенесень: ${error.message}`;
        }
      };

      run();
    };
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
          renderContent: sectionContent('Колонки', 'Налаштування видимості та порядку колонок.'),
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
          title: 'Перенесення → Шаблони',
          order: 40,
          renderContent: transferSectionContent(),
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
