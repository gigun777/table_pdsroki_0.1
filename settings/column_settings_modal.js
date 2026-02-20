(function(){
  const uid = () => "c_" + Math.random().toString(16).slice(2,8) + "_" + Date.now().toString(16).slice(-6);
  const deepClone = (x) => JSON.parse(JSON.stringify(x));
  const toStr = (v) => (v===null||v===undefined) ? "" : String(v);
  const toInt = (v) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : NaN;
  };

  const $ov = document.getElementById("dvColSettingsOverlay");
  const $title = document.getElementById("dvColSettingsTitle");
  const $sub = document.getElementById("dvColSettingsSubtitle");
  const $list = document.getElementById("dvcsList");
  const $search = document.getElementById("dvcsSearch");
  const $msg = document.getElementById("dvcsMsg");

  const $add = document.getElementById("dvcsAdd");
  const $dup = document.getElementById("dvcsDup");
  const $del = document.getElementById("dvcsDel");
  const $up = document.getElementById("dvcsUp");
  const $down = document.getElementById("dvcsDown");

  const $name = document.getElementById("dvcsName");
  const $id = document.getElementById("dvcsId");
  const $type = document.getElementById("dvcsType");
  const $width = document.getElementById("dvcsWidth");
  const $align = document.getElementById("dvcsAlign");
  const $visible = document.getElementById("dvcsVisible");
  const $wrap = document.getElementById("dvcsWrap");
  const $required = document.getElementById("dvcsRequired");
    const $subrows = document.getElementById("dvcsSubrows");
const $format = document.getElementById("dvcsFormat");
  const $def = document.getElementById("dvcsDefault");
  const $opts = document.getElementById("dvcsOptions");
  const $preview = document.getElementById("dvcsPreview");

  const $reload = document.getElementById("dvcsReload");
  const $save = document.getElementById("dvcsSave");

  let S = {
    sheetKey: "",
    sheetName: "",
    colsOriginal: [],
    colsDraft: [],
    activeId: null,
    onSave: null,
    onClose: null,
  };

  function showMsg(text){
    $msg.style.display = text ? "" : "none";
    $msg.textContent = text || "";
  }

  function open(){
    $ov.classList.add("dv-open");
    $ov.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close(){
    $ov.classList.remove("dv-open");
    $ov.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function activeCol(){
    return S.colsDraft.find(c => c.id === S.activeId) || null;
  }

  function normalizeCols(cols){
    cols.forEach(c => {
      if(!c.id) c.id = uid();
      c.name = toStr(c.name) || "Нова колонка";
      c.type = c.type || "text";
      const w = (typeof c.width === "number") ? c.width : parseInt(c.width,10);
      c.width = Number.isFinite(w) ? w : 160;
      c.align = c.align || "left";
      c.visible = (c.visible === false) ? false : true;
      c.wrap = !!c.wrap;
      c.required = !!c.required;
            c.subrows = !!c.subrows;
c.format = toStr(c.format);
      c.default = toStr(c.default);
      c.options = Array.isArray(c.options) ? c.options : (toStr(c.options).trim() ? toStr(c.options).split(";").map(s=>s.trim()).filter(Boolean) : []);
    });
    return cols;
  }

  function renderList(){
    $list.innerHTML = "";
    const q = toStr($search.value).trim().toLowerCase();
    const cols = S.colsDraft.filter(c => {
      if(!q) return true;
      return (toStr(c.name).toLowerCase().includes(q) || toStr(c.id).toLowerCase().includes(q));
    });

    if(!cols.length){
      const d = document.createElement("div");
      d.className = "dvcs-hint";
      d.textContent = "Колонки не знайдено.";
      $list.appendChild(d);
      return;
    }

    cols.forEach((c) => {
      const item = document.createElement("div");
      item.className = "dvcs-item" + (c.id === S.activeId ? " dv-active" : "");
      item.onclick = () => { S.activeId = c.id; renderList(); renderEditor(); };

      const left = document.createElement("div");
      left.className = "dvcs-item-left";

      const title = document.createElement("div");
      title.className = "dvcs-item-title";
      const realIndex = S.colsDraft.findIndex(x => x.id === c.id);
      title.textContent = `${realIndex+1}. ${c.name}`;

      const meta = document.createElement("div");
      meta.className = "dvcs-item-meta";
      meta.textContent = `${c.id} • ${c.type} • ${c.width}px • ${c.visible ? "visible" : "hidden"}`;

      const badge = document.createElement("div");
      badge.className = "dvcs-badge";
      badge.textContent = c.required ? "обов’язк." : "опц.";

      left.appendChild(title);
      left.appendChild(meta);

      item.appendChild(left);
      item.appendChild(badge);
      $list.appendChild(item);
    });

    const has = !!activeCol();
    $dup.disabled = !has;
    $del.disabled = !has;
    $up.disabled = !has;
    $down.disabled = !has;
  }

  function renderEditor(){
    const c = activeCol();
    const has = !!c;

    [$name,$id,$type,$width,$align,$visible,$wrap,$required,$format,$def,$opts,$up,$down].forEach(el => el.disabled = !has);
    if(!has){
      $name.value = ""; $id.value = ""; $type.value="text"; $width.value=""; $align.value="left";
      $visible.checked = true; $wrap.checked=false; $required.checked=false;
      $format.value=""; $def.value=""; $opts.value="";
      $preview.innerHTML = "Оберіть колонку зі списку ліворуч.";
      return;
    }

    $name.value = c.name || "";
    $id.value = c.id || "";
    $type.value = c.type || "text";
    $width.value = String(c.width ?? 160);
    $align.value = c.align || "left";
    $visible.checked = (c.visible !== false);
    $wrap.checked = !!c.wrap;
    $required.checked = !!c.required;
        $subrows.checked = !!c.subrows;
$format.value = c.format || "";
    $def.value = c.default || "";
    $opts.value = (c.options || []).join(";");

    const realIndex = S.colsDraft.findIndex(x => x.id === c.id);
    $up.disabled = (realIndex <= 0);
    $down.disabled = (realIndex < 0 || realIndex >= S.colsDraft.length - 1);

    renderPreview();
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function renderPreview(){
    const c = activeCol();
    if(!c){ $preview.textContent = ""; return; }
    const optText = (c.type === "select") ? (c.options?.length ? `Опції: ${c.options.join(" | ")}` : "Опції: (порожньо)") : "";
    $preview.innerHTML = `
      <div><b>Превʼю:</b> <span class="dvcs-mono">${escapeHtml(c.name)}</span> (<span class="dvcs-mono">${escapeHtml(c.id)}</span>)</div>
      <div style="margin-top:6px;">Тип: <span class="dvcs-mono">${escapeHtml(c.type)}</span> • width: <span class="dvcs-mono">${escapeHtml(String(c.width))}</span> • align: <span class="dvcs-mono">${escapeHtml(c.align)}</span></div>
      <div style="margin-top:6px;">visible: <span class="dvcs-mono">${c.visible ? "true" : "false"}</span> • wrap: <span class="dvcs-mono">${c.wrap ? "true" : "false"}</span> • required: <span class="dvcs-mono">${c.required ? "true" : "false"}</span> • subrows: <span class="dvcs-mono">${c.subrows ? "true" : "false"}</span></div>
      <div style="margin-top:6px;">format: <span class="dvcs-mono">${escapeHtml(c.format||"")}</span> • default: <span class="dvcs-mono">${escapeHtml(c.default||"")}</span></div>
      ${optText ? `<div style="margin-top:6px;">${escapeHtml(optText)}</div>` : ""}
    `;
  }

  function addCol(){
    const c = {id: uid(), name: "Нова колонка", type: "text", width: 160, align: "left", visible: true, wrap: false, required: false, format: "", default: "", options: []};
    S.colsDraft.push(c);
    S.activeId = c.id;
    renderList(); renderEditor();
  }

  function duplicateCol(){
    const c = activeCol(); if(!c) return;
    const copy = deepClone(c);
    copy.id = uid();
    copy.name = (toStr(copy.name) || "Колонка") + " (копія)";
    S.colsDraft.splice(S.colsDraft.findIndex(x=>x.id===c.id)+1, 0, copy);
    S.activeId = copy.id;
    renderList(); renderEditor();
  }

  function deleteCol(){
    const c = activeCol(); if(!c) return;
    if(!confirm(`Видалити колонку "${c.name}"?`)) return;
    const idx = S.colsDraft.findIndex(x=>x.id===c.id);
    if(idx >= 0) S.colsDraft.splice(idx, 1);
    S.activeId = S.colsDraft[idx]?.id || S.colsDraft[idx-1]?.id || S.colsDraft[0]?.id || null;
    renderList(); renderEditor();
  }

  function moveActive(delta){
    const c = activeCol(); if(!c) return;
    const idx = S.colsDraft.findIndex(x=>x.id===c.id);
    const j = idx + delta;
    if(idx < 0 || j < 0 || j >= S.colsDraft.length) return;
    const tmp = S.colsDraft[idx];
    S.colsDraft[idx] = S.colsDraft[j];
    S.colsDraft[j] = tmp;
    renderList(); renderEditor();
  }

  function bindInputs(){
    function apply(fn){
      const c = activeCol(); if(!c) return;
      fn(c);
      renderList(); renderPreview();
    }
    $name.addEventListener("input", () => apply(c => { c.name = $name.value; }));
    $id.addEventListener("input", () => apply(c => { c.id = $id.value.trim() || c.id; S.activeId = c.id; }));
    $type.addEventListener("change", () => apply(c => { c.type = $type.value; }));
    $width.addEventListener("input", () => apply(c => { const n = toInt($width.value); if(Number.isFinite(n)) c.width = Math.max(40, n); }));
    $align.addEventListener("change", () => apply(c => { c.align = $align.value; }));
    $visible.addEventListener("change", () => apply(c => { c.visible = !!$visible.checked; }));
    $wrap.addEventListener("change", () => apply(c => { c.wrap = !!$wrap.checked; }));
    $required.addEventListener("change", () => apply(c => { c.required = !!$required.checked; }));
        $subrows.addEventListener("change", () => apply(c => { c.subrows = !!$subrows.checked; }));
$format.addEventListener("input", () => apply(c => { c.format = $format.value; }));
    $def.addEventListener("input", () => apply(c => { c.default = $def.value; }));
    $opts.addEventListener("input", () => apply(c => { c.options = toStr($opts.value).split(";").map(s=>s.trim()).filter(Boolean); }));
  }

  document.querySelectorAll("[data-dvcs-close]").forEach(btn => {
    btn.addEventListener("click", () => { close(); if(typeof S.onClose === "function") S.onClose(); });
  });

  $ov.addEventListener("mousedown", (e) => {
    if(e.target === $ov){ close(); if(typeof S.onClose === "function") S.onClose(); }
  });

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && $ov.classList.contains("dv-open")){ close(); if(typeof S.onClose === "function") S.onClose(); }
  });

  $add.addEventListener("click", addCol);
  $dup.addEventListener("click", duplicateCol);
  $del.addEventListener("click", deleteCol);
  $up.addEventListener("click", () => moveActive(-1));
  $down.addEventListener("click", () => moveActive(+1));
  $search.addEventListener("input", renderList);

  $reload.addEventListener("click", () => {
    S.colsDraft = deepClone(S.colsOriginal || []);
    normalizeCols(S.colsDraft);
    S.activeId = S.colsDraft[0]?.id || null;
    showMsg("↻ Перезавантажено зі сховища (draft скинуто).");
    renderList(); renderEditor();
  });

  $save.addEventListener("click", () => {
    try{
      normalizeCols(S.colsDraft);
      const out = deepClone(S.colsDraft);
      if(typeof S.onSave === "function") S.onSave(out);
      S.colsOriginal = deepClone(out);
      showMsg("✅ Збережено.");
      renderList(); renderEditor();
    }catch(err){
      showMsg("❌ Помилка збереження: " + (err?.message || String(err)));
    }
  });

  bindInputs();

  window.ColumnSettingsUI = {
    open(opts){
      const sheet = opts.sheet || {};
      S.sheetKey = sheet.key || "";
      S.sheetName = sheet.name || S.sheetKey || "Лист";
      S.colsOriginal = deepClone(sheet.columns || []);
      S.colsDraft = deepClone(sheet.columns || []);
      normalizeCols(S.colsDraft);

      S.onSave = (typeof opts.onSave === "function") ? opts.onSave : null;
      S.onClose = (typeof opts.onClose === "function") ? opts.onClose : null;

      $title.textContent = opts.title || "Налаштування → Колонки";
      $sub.textContent = `${S.sheetName} • ${S.colsDraft.length} колонок`;

      $search.value = "";
      S.activeId = S.colsDraft[0]?.id || null;
      showMsg("");

      renderList(); renderEditor();
      open();
    },
    close(){ close(); },
  };
})();
