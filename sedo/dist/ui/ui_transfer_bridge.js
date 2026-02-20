/**
 * Transfer UI bridge:
 * - Uses window.TransferUI modals (visuals + interactions)
 * - Delegates persistence and computations to TransferCore (DOM-free)
 * - Persists changes via ctx.storage and ctx.api.tableStore
 *
 * Assumptions:
 * - ui_bootstrap_esm.js side-effect imports ./transfer_modals.js first (defines window.TransferUI)
 * - ctx.api.tableStore exists (from table_store module)
 */
import { createTransferCore } from '../core/transfer_core.js';

function uniqPush(arr, v){ if(v==null) return; if(!arr.includes(v)) arr.push(v); }
function ensureArray(x){ return Array.isArray(x) ? x : []; }


function normalizeKVStorage(storage){
  // Supports:
  // 1) {get,set} async/sync (SEDO storage iface)
  // 2) Web Storage ({getItem,setItem})
  // 3) Fallback to globalThis.localStorage
  const s = storage || globalThis?.UI?.storage || globalThis.localStorage;
  if(s && typeof s.get === 'function' && typeof s.set === 'function') return s;
  if(s && typeof s.getItem === 'function' && typeof s.setItem === 'function'){
    return {
      get: async (k)=>{
        const v = s.getItem(k);
        if(v == null) return null;
        try{ return JSON.parse(v); }catch{ return v; }
      },
      set: async (k,val)=>{
        const out = (typeof val === 'string') ? val : JSON.stringify(val);
        s.setItem(k, out);
      }
    };
  }
  throw new Error('No compatible storage provided (need get/set or getItem/setItem)');
}

function columnsFromDataset(dataset){
  const keys = [];
  for(const r of ensureArray(dataset?.records)){
    const cells = r?.cells ?? {};
    for(const k of Object.keys(cells)) uniqPush(keys, k);
  }
  return keys;
}

function rowArrayFromRecord(record, fromColKeys){
  const cells = record?.cells ?? {};
  return fromColKeys.map(k => cells?.[k]);
}

/**
 * @param {{storage:any, api:any, UI:any}} ctx
 */
export function attachTransferUI(ctx){
  const global = globalThis;
  const UI = ctx.UI || (global.UI = global.UI || {});
  const tableStore = ctx.api?.tableStore;
  const storage = normalizeKVStorage(ctx.storage);

  if(!tableStore || typeof tableStore.getDataset !== 'function'){
    // Don't throw: allow app to run even if tableStore not loaded yet.
    UI.transfer = UI.transfer || {
      openSettings: async ()=>UI.toast?.error?.('Transfer: tableStore API not ready') ?? console.error('Transfer: tableStore API not ready'),
      openRowModal: async ()=>UI.toast?.error?.('Transfer: tableStore API not ready') ?? console.error('Transfer: tableStore API not ready')
    };
    return UI.transfer;
  }

  const core = createTransferCore({ storage });

  async function buildSheets(){
    const state = ctx.api?.getState?.() ?? {};
    const journals = ensureArray(state.journals);
    const sheets = [];
    for(const j of journals){
      const key = j.id ?? j.key ?? j.journalId ?? '';
      if(!key) continue;

      // Prefer declared journal template columns (stable keys) over inferring from data.
      const tplId = j.templateId ?? j.tplId ?? null;
      let tpl = null;
      try{
        if (ctx.api?.journalTemplates?.getTemplate) tpl = await ctx.api.journalTemplates.getTemplate(tplId);
        else if (typeof ctx.api?.getTemplate === 'function') tpl = await ctx.api.getTemplate(tplId);
      }catch{ tpl = null; }

      let columns = [];
      if (tpl?.columns?.length){
        columns = tpl.columns.map(c=>({ id: c.key, name: c.label ?? c.key }));
      } else {
        // Fallback: infer from data when template not available
        let ds;
        try{ ds = await tableStore.getDataset(key); } catch { ds = null; }
        const colKeys = columnsFromDataset(ds);
        columns = (colKeys.length ? colKeys : ['c1']).map((k)=>({ id:k, name:k }));
      }

      sheets.push({
        key,
        name: j.title ?? j.name ?? j.label ?? key,
        columns
      });
    }
    // ensure at least one
    if(sheets.length === 0){
      sheets.push({ key:'default', name:'Default', columns:[{id:'c1',name:'Колонка 1'}] });
    }
    return sheets;
  }

  async function openSettings(){
    const TransferUI = global.TransferUI;
    if(!TransferUI?.openSettings){
      UI.toast?.error?.('TransferUI модалка не завантажена') ?? console.error('TransferUI modals not loaded');
      return;
    }
    const [sheets, templates] = await Promise.all([buildSheets(), core.loadTemplates()]);
    TransferUI.openSettings({
      title: 'Налаштування → Таблиці → Перенесення',
      sheets,
      templates,
      onSave: async (nextTemplates) => {
        await core.saveTemplates(nextTemplates);
        UI.toast?.success?.('Шаблони перенесення збережено') ?? console.log('Transfer templates saved');
      }
    });
  }

  async function openRowModal({ sourceJournalId, recordIds }){
    const TransferUI = global.TransferUI;
    if(!TransferUI?.openTransfer){
      UI.toast?.error?.('TransferUI модалка не завантажена') ?? console.error('TransferUI modals not loaded');
      return;
    }
    const [sheets, templates] = await Promise.all([buildSheets(), core.loadTemplates()]);
    const srcDataset = await tableStore.getDataset(sourceJournalId);
    const srcRecord = ensureArray(srcDataset?.records).find(r => r?.id === recordIds?.[0]);
    if(!srcRecord){
      UI.toast?.warning?.('Запис не знайдено') ?? console.warn('Record not found');
      return;
    }
    // build from cols from source sheet definition
    const fromSheet = sheets.find(s => s.key === sourceJournalId) || sheets[0];
    const fromColKeys = ensureArray(fromSheet?.columns).map(c => c.id);
    const srcRow = rowArrayFromRecord(srcRecord, fromColKeys);

    TransferUI.openTransfer({
      sheets,
      templates,
      sourceSheetKey: sourceJournalId,
      sourceRow: srcRow,
      onApply: async ({ template, targetRow }) => {
        const toId = template?.toSheetKey;
        if(!toId){
          UI.toast?.error?.('Не вказано цільовий журнал') ?? console.error('No target journal');
          return;
        }
        const toSheet = sheets.find(s => s.key === toId) || sheets[0];
        const toColKeys = ensureArray(toSheet?.columns).map(c => c.id);
        // If UI already computed targetRow, just use it.
        const recordPartial = core.buildRecordFromRow(toColKeys, targetRow);
        // Create record in target
        await tableStore.addRecord(toId, recordPartial);
        UI.toast?.success?.('Перенесення виконано (створено запис у цільовому журналі)') ?? console.log('Transfer applied');
      }
    });
  }

  UI.transfer = { openSettings, openRowModal };
  return UI.transfer;
}
