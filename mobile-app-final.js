/* Mishnayos calendar — stability and responsive layer, v21 */
(function(){
  "use strict";

  const MOBILE_QUERY = "(max-width: 680px)";
  const CACHE_KEY = "zaltsman_mishnayos_sheet_cache_v18";
  const MAP_STATE_KEY = "zaltsman_mishnayos_map_collapsed";
  const DESIGN_KEY = "zaltsman_mishnayos_design_v18";
  const $ = id => document.getElementById(id);
  const isMobile = () => !!(window.matchMedia && window.matchMedia(MOBILE_QUERY).matches);
  const rows = () => {
    try{ return Array.isArray(window.DATA) ? window.DATA : (Array.isArray(DATA) ? DATA : []); }
    catch(_){ return []; }
  };
  const doneMap = () => {
    try{ return typeof getDone === "function" ? getDone() : {}; }
    catch(_){ return {}; }
  };
  const esc = value => {
    if(typeof escapeHtml === "function") return escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, char=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[char]);
  };

  document.documentElement.classList.add("v18");

  function localToday(){
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth()+1).padStart(2,"0"),
      String(d.getDate()).padStart(2,"0")
    ].join("-");
  }

  function dayIndex(item){
    const text = String(item?.day || "");
    if(text.includes("ראשון")) return 0;
    if(text.includes("שני")) return 1;
    if(text.includes("שלישי")) return 2;
    if(text.includes("רביעי")) return 3;
    if(text.includes("חמישי")) return 4;
    if(text.includes("שישי")) return 5;
    if(text.includes("שבת")) return 6;
    const date = new Date(String(item?.iso || "") + "T12:00:00");
    return Number.isNaN(date.getTime()) ? 0 : date.getDay();
  }

  function dateNumber(hdate){
    return String(hdate || "").trim().split(/\s+/)[0] || "";
  }

  function todayItem(){
    const data = rows();
    return data.find(item=>item.iso === localToday()) || window.currentToday || data[0] || null;
  }

  /* Keep a validated local copy of the schedule for temporary network failures. */
  const baseLoadSheetData = window.loadSheetData;
  if(typeof baseLoadSheetData === "function"){
    window.loadSheetData = async function(){
      await baseLoadSheetData.apply(this, arguments);
      const data = rows();
      if(data.length){
        try{
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            savedAt:Date.now(),
            rows:data
          }));
        }catch(_){}
        return;
      }

      try{
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if(!cached || !Array.isArray(cached.rows) || !cached.rows.length) return;
        const valid = cached.rows
          .filter(item=>item && Number.isFinite(Number(item.idx)) && /^\d{4}-\d{2}-\d{2}$/.test(String(item.iso || "")))
          .map(item=>({
            idx:Number(item.idx),
            iso:String(item.iso),
            hdate:String(item.hdate || ""),
            day:String(item.day || ""),
            chapters:String(item.chapters || "")
          }));
        if(!valid.length) return;

        window.DATA = valid;
        try{ DATA = valid; }catch(_){}
        const current = valid.find(item=>item.iso === localToday()) || valid[0];
        window.currentToday = current;
        try{ currentToday = current; }catch(_){}
        if(typeof setupActions === "function") setupActions();
        if(typeof setupPrintSelects === "function") setupPrintSelects();
        if(typeof setupCalendarControls === "function") setupCalendarControls(true);
        if(typeof refresh === "function") refresh();

        const status = $("loadStatus");
        if(status){
          status.className = "loading-note";
          status.textContent = "מוצג עותק שמור — החיבור יתעדכן כשיחזור";
          status.style.display = "block";
        }
      }catch(error){
        console.warn("Saved schedule could not be restored:", error);
      }
    };
  }

  /* A compact, native-feeling calendar on narrow screens. */
  const baseRenderCalendar = window.renderCalendar;
  function filteredRows(){
    const data = rows();
    const query = ($("search")?.value || "").trim();
    const month = $("calendarMonthSelect")?.value || "all";
    const onlyUndone = !!$("onlyUndoneFilter")?.checked;
    const done = doneMap();
    return data.filter(item=>{
      const itemMonth = typeof hebrewMonth === "function" ? hebrewMonth(item.hdate) : "";
      const text = [item.idx,item.iso,item.hdate,item.day,item.chapters].join(" ");
      return (!query || text.includes(query))
        && (month === "all" || itemMonth === month)
        && (!onlyUndone || !done[item.idx]);
    });
  }

  function renderMobileCalendar(){
    const calendar = $("calendar");
    if(!calendar) return;
    const data = filteredRows();
    if(!data.length){
      calendar.className = "mobile-calendar";
      calendar.innerHTML = '<p class="muted">לא נמצאו ימים להצגה.</p>';
      return;
    }

    const groups = new Map();
    data.forEach(item=>{
      const month = typeof hebrewMonth === "function" ? hebrewMonth(item.hdate) : "ללא חודש";
      if(!groups.has(month)) groups.set(month, []);
      groups.get(month).push(item);
    });
    const done = doneMap();
    const current = todayItem();
    const weekdayNames = ["א","ב","ג","ד","ה","ו","ש"];

    calendar.className = "mobile-calendar";
    calendar.innerHTML = '<p class="mobile-calendar-hint">לחיצה פותחת את היום · לחיצה ארוכה מסמנת כנלמד</p>' +
      [...groups.entries()].map(([month,items])=>{
        const blanks = Array.from({length:dayIndex(items[0])},()=>'<span class="mobile-empty" aria-hidden="true"></span>').join("");
        const completed = items.filter(item=>done[item.idx]).length;
        const days = items.map(item=>{
          const classes = [
            "mobile-day",
            done[item.idx] ? "done" : "",
            current && Number(current.idx) === Number(item.idx) ? "today" : ""
          ].filter(Boolean).join(" ");
          const state = done[item.idx] ? "נלמד" : "טרם נלמד";
          return '<button type="button" class="'+classes+'" data-mobile-day="'+item.idx+'" aria-label="'
            +esc(item.hdate+" · "+item.chapters+" · "+state)+'">'+esc(dateNumber(item.hdate))+'</button>';
        }).join("");
        return '<section class="mobile-calendar-month" data-mobile-month="'+esc(month)+'">'
          +'<div class="mobile-calendar-title"><strong>'+esc(month)+'</strong><span>'+completed+' מתוך '+items.length+'</span></div>'
          +'<div class="mobile-week-head">'+weekdayNames.map(name=>"<span>"+name+"</span>").join("")+'</div>'
          +'<div class="mobile-days">'+blanks+days+'</div></section>';
      }).join("");
  }

  window.renderCalendar = function(){
    if(typeof setupCalendarControls === "function") setupCalendarControls(false);
    if(isMobile()) return renderMobileCalendar();
    const calendar = $("calendar");
    if(calendar) calendar.classList.remove("mobile-calendar");
    if(typeof baseRenderCalendar === "function") return baseRenderCalendar.apply(this, arguments);
  };

  let longPressTimer = 0;
  let longPressedAt = 0;
  document.addEventListener("pointerdown", event=>{
    const button = event.target.closest?.("[data-mobile-day]");
    if(!button || !isMobile()) return;
    clearTimeout(longPressTimer);
    longPressTimer = window.setTimeout(()=>{
      const idx = Number(button.dataset.mobileDay);
      longPressedAt = Date.now();
      if(typeof toggleDone === "function") toggleDone(idx);
      if(navigator.vibrate) navigator.vibrate(20);
    }, 580);
  });
  ["pointerup","pointercancel","pointerleave"].forEach(type=>{
    document.addEventListener(type, ()=>clearTimeout(longPressTimer));
  });
  document.addEventListener("click", event=>{
    const button = event.target.closest?.("[data-mobile-day]");
    if(!button || !isMobile()) return;
    event.preventDefault();
    event.stopPropagation();
    if(Date.now() - longPressedAt < 800) return;
    if(typeof openDay === "function") openDay(Number(button.dataset.mobileDay));
  });

  /* Map visibility is remembered, and starts compact on mobile. */
  const baseToggleMapPanel = window.toggleMapPanel;
  function updateMapToggle(){
    const side = document.querySelector(".home-side");
    const button = document.querySelector(".map-toggle");
    if(!side || !button) return;
    const collapsed = side.classList.contains("map-collapsed");
    button.textContent = collapsed ? "הצג מפה" : "הסתר מפה";
    button.setAttribute("aria-expanded", String(!collapsed));
  }
  window.toggleMapPanel = function(){
    if(typeof baseToggleMapPanel === "function") baseToggleMapPanel.apply(this, arguments);
    const collapsed = document.querySelector(".home-side")?.classList.contains("map-collapsed");
    try{ localStorage.setItem(MAP_STATE_KEY, collapsed ? "1" : "0"); }catch(_){}
    updateMapToggle();
  };

  function restoreMapState(){
    const side = document.querySelector(".home-side");
    if(!side) return;
    let saved = null;
    try{ saved = localStorage.getItem(MAP_STATE_KEY); }catch(_){}
    const collapsed = saved === "1" || (saved === null && isMobile());
    side.classList.toggle("map-collapsed", collapsed);
    updateMapToggle();
  }

  /* Keep modal scroll state and accessibility hints consistent. */
  function syncModalState(){
    const open = !!document.querySelector(".modal.open,#printPicker.open");
    document.body.classList.toggle("modal-open", open);
    document.querySelectorAll(".modal").forEach(modal=>{
      modal.setAttribute("role","dialog");
      modal.setAttribute("aria-modal","true");
      modal.setAttribute("aria-hidden", String(!modal.classList.contains("open")));
    });
  }
  const observer = new MutationObserver(syncModalState);
  document.querySelectorAll(".modal,#printPicker").forEach(node=>{
    observer.observe(node,{attributes:true,attributeFilter:["class","style"]});
  });

  /* Canonical link: do not copy an old cache-busting version. */
  window.copySiteLink = function(){
    const url = location.origin + location.pathname;
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(url)
        .then(()=>typeof showToast === "function" && showToast("הקישור הועתק"))
        .catch(()=>window.prompt("העתק את הקישור:",url));
    }else{
      window.prompt("העתק את הקישור:",url);
    }
  };

  function updateThemeColor(){
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content = "#f6f3ed";
  }
  window.toggleTheme = function(){
    document.body.classList.add("light");
    try{ localStorage.setItem("zaltsman_mishnayos_theme","light"); }catch(_){}
    updateThemeColor();
  };

  function setup(){
    document.body.classList.remove("v17","v18","v19","v20");
    document.body.classList.add("v21","light");
    try{
      localStorage.setItem("zaltsman_mishnayos_theme","light");
      localStorage.setItem(DESIGN_KEY,"1");
    }catch(_){}
    restoreMapState();
    syncModalState();
    updateThemeColor();
    if(isMobile()) renderMobileCalendar();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", setup, {once:true});
  }else{
    setup();
  }
  window.addEventListener("load", setup, {once:true});
  window.addEventListener("resize", ()=>{
    restoreMapState();
    if(typeof window.renderCalendar === "function") window.renderCalendar();
  });
})();
