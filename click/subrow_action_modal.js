(function(){
  const $ov = document.getElementById("dvSubrowActionOverlay");
  const $subtitle = document.getElementById("dvsraSubtitle");
  const $edit = document.getElementById("dvsraEdit");
  const $add = document.getElementById("dvsraAdd");

  let S = {
    context: null,   // {sheetKey, rowId, rowIndex, rowTitle}
    subrow: null,    // {id, title, ...} (та, на яку клікнули)
    onEdit: null,
    onAdd: null,
    onClose: null,
  };

  function open(){
    $ov.classList.add("dvsra-open");
    $ov.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  }
  function close(){
    $ov.classList.remove("dvsra-open");
    $ov.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    if(typeof S.onClose === "function") S.onClose();
  }

  // close by overlay click
  $ov.addEventListener("mousedown", (e) => {
    if(e.target === $ov) close();
  });

  // close by ESC
  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && $ov.classList.contains("dvsra-open")) close();
  });

  // cancel buttons
  document.querySelectorAll("[data-dvsra-cancel]").forEach(b => b.addEventListener("click", close));

  // actions
  $edit.addEventListener("click", () => {
    const fn = S.onEdit;
    const ctx = S.context;
    const sr = S.subrow;
    close();
    if(typeof fn === "function") fn(sr, ctx);
  });

  $add.addEventListener("click", () => {
    const fn = S.onAdd;
    const ctx = S.context;
    close();
    if(typeof fn === "function") fn(ctx);
  });

  // Public API
  window.SubrowActionUI = {
    /**
     * open({
     *   context: {sheetKey,rowId,rowIndex,rowTitle},
     *   subrow: {id,title,...},
     *   onEdit(subrow, context),
     *   onAdd(context),
     *   onClose()
     * })
     */
    open(opts){
      S.context = opts.context || {};
      S.subrow = opts.subrow || null;
      S.onEdit = (typeof opts.onEdit === "function") ? opts.onEdit : null;
      S.onAdd  = (typeof opts.onAdd  === "function") ? opts.onAdd  : null;
      S.onClose= (typeof opts.onClose=== "function") ? opts.onClose: null;

      // Subtitle like screenshot: "Номенклатура  Коли закінчено  Підстрочка № 1"
      const parts = [];
      if(S.context?.rowTitle) parts.push(S.context.rowTitle);
      if(S.subrow?.title) parts.push(S.subrow.title);
      $subtitle.textContent = parts.join("  ");

      open();
    },
    close
  };
})();
