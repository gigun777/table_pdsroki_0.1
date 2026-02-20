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
          title: 'Перенесення',
          order: 40,
          renderContent: function renderTransferSection(container){
            container.innerHTML='';
            const h=document.createElement('h3'); h.textContent='Перенесення';
            const p=document.createElement('p'); p.textContent='Шаблони перенесення між журналами та правила формування рядка.';
            const btn=document.createElement('button'); btn.textContent='Відкрити налаштування перенесення';
            btn.onclick=()=>{ const tr=(globalThis.UI?.transfer); if(tr?.openSettings) tr.openSettings(); else globalThis.UI?.toast?.warning?.('Transfer UI не готовий'); };
            container.append(h,p,btn);
          },
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
