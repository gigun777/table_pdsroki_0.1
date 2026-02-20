import { renderTransferSettingsSection } from './settings/renderTransfersSettings.js';
import { openRunTransferModal } from './run/runTransferModal.js';
import {
  loadTemplates,
  saveTemplates,
  exportTemplatesBackup,
  importTemplatesBackup
} from './storage/templates_store.js';
import { loadTemplates, saveTemplates } from './storage/templates_store.js';

export function createTransferUI(api) {
  return {
    renderTransferSettingsSection: (container) => renderTransferSettingsSection(container, api),
    openRunTransferModal: ({ sourceJournalId, recordIds }) =>
      openRunTransferModal({ api, sourceJournalId, recordIds }),
    loadTemplates: () => loadTemplates(api.storageAdapter),
    saveTemplates: (templates) => saveTemplates(api.storageAdapter, templates),
    exportTemplatesBackup: () => exportTemplatesBackup(api.storageAdapter),
    importTemplatesBackup: (input) => importTemplatesBackup(api.storageAdapter, input)
  };
}

export {
  renderTransferSettingsSection,
  openRunTransferModal,
  loadTemplates,
  saveTemplates,
  exportTemplatesBackup,
  importTemplatesBackup
};
    saveTemplates: (templates) => saveTemplates(api.storageAdapter, templates)
  };
}

export { renderTransferSettingsSection, openRunTransferModal, loadTemplates, saveTemplates };
export function notImplementedYet() {
  return "@sedo/transfer-ui will be implemented in next stage";
}
