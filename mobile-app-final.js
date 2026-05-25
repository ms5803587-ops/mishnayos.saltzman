/* V14 final UX fixes: home layout, light theme, settings, print, local date, mobile calendar. */
(function(){
  var originalRenderCalendar = window.renderCalendar;
  var originalRefresh = window.refresh;
  var longPressTimer = null;
  var longPressFired = false;
  var longPressTarget = null;

  function isMobile(){ return window.matchMedia && window.matchMedia("(max-width: 680px)").matches; }
  function esc(v){
    if(typeof escapeHtml === "function") return escapeHtml(v);
    return String(v == null ? "" : v).replace(/[&<>"']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]; });
  }
  function rows(){ try{ if(typeof DATA !== "undefined" && Array.isArray(DATA)) return DATA; if(Array.isArray(window.DATA)) return window.DATA; }catch(e){} return []; }
  function doneMap(){ try{ if(typeof getDone === "function") return getDone(); }catch(e){} return {}; }
  function localIsoDate(d){ d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
  function getCurrentToday(){ try{ if(typeof currentToday !== "undefined") return currentToday; }catch(e){} return window.currentToday || null; }
  function setCurrentToday(item){ try{ if(typeof currentToday !== "undefined") currentToday = item; }catch(e){} window.currentToday = item; }
  function monthName(hdate){
    try{ if(typeof hebrewMonth === "function") return hebrewMonth(hdate) || "ללא חודש"; }catch(e){}
    var h = String(hdate || "");
    var m = h.match(/(תשרי|חשוון|חשון|מרחשון|כסלו|טבת|שבט|אדר א|אדר ב|אדר|ניסן|אייר|סיוון|סיון|תמוז|אב|אלול)/);
    return m ? m[1] : "ללא חודש";
  }
  function dayNumber(hdate){ var h = String(hdate || "").trim(); return h ? (h.split(/\s+/)[0] || h) : ""; }
  function dayIndex(item){
    var d = String((item && item.day) || "");
    if(d.indexOf("ראשון") !== -1) return 0;
    if(d.indexOf("שני") !== -1) return 1;
    if(d.indexOf("שלישי") !== -1) return 2;
    if(d.indexOf("רביעי") !== -1) return 3;
    if(d.indexOf("חמישי") !== -1) return 4;
    if(d.indexOf("שישי") !== -1) return 5;
    if(d.indexOf("שבת") !== -1) return 6;
    return 0;
  }

  function injectFinalCss(){
    if(document.getElementById("v14FinalFixesCss")) return;
    var style = document.createElement("style");
    style.id = "v14FinalFixesCss";
    style.textContent = `
@media(min-width:681px){
  #homePage .home-hero{grid-template-columns:minmax(720px,1.65fr) minmax(280px,.58fr)!important;gap:18px!important;align-items:stretch!important;direction:ltr!important}
  #homePage .home-main,#homePage .home-side{direction:rtl!important}
  #homePage .home-main{grid-column:1!important;min-height:520px!important;padding:34px 38px!important}
  #homePage .home-side{grid-column:2!important;width:100%!important;max-width:360px!important;justify-self:stretch!important;padding:16px!important;overflow:hidden!important}
  #homePage .home-side .map-head{align-items:flex-start!important;gap:10px!important}
  #homePage .home-side .map-head p{display:none!important}
  #homePage .home-side .stats{grid-template-columns:1fr!important;gap:7px!important}
  #homePage .home-side .stat{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:9px 11px!important;text-align:right!important}
  #homePage .home-side .stat b{font-size:18px!important}
  #homePage .home-side .stat span{font-size:12px!important}
  #homePage .home-side:not(.map-collapsed) .year-map,#homePage .home-side .year-map{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px!important;max-height:330px!important;overflow-y:auto!important;padding-left:3px!important}
  #homePage .home-side .dot{min-height:15px!important;height:15px!important;border-radius:4px!important}
  #homePage .home-side .dot::before{font-size:8px!important}
}
body.light{--bg:#f5efe6;--bg2:#fffaf2;--panel:#fffaf1;--panel2:#fff;--card:#fff7e8;--text:#1e160c;--muted:#66533b;--line:#d9c39d;--gold:#8a5c18;--gold2:#b77d25;background:radial-gradient(circle at 15% 10%,rgba(183,125,37,.12),transparent 26%),radial-gradient(circle at 86% 18%,rgba(94,64,17,.08),transparent 28%),linear-gradient(180deg,#fffdf8,#f3eadb)!important;color:var(--text)!important}
body.light .site-header,body.light .tabs,body.light .panel,body.light .home-main,body.light .home-side,body.light .modal-box,body.light #printPicker .print-picker-box,body.light #calendar.mobile-real-mini .mobile-real-month,body.light #actionsPage .action-tile-clean,body.light #settingsPage .settings-box,body.light .calendar-month,body.light .calendar-cell,body.light .card,body.light .stat{background:linear-gradient(145deg,#fffefa,#f7ead5)!important;border-color:#d6bd8f!important;color:#1e160c!important;box-shadow:0 16px 36px rgba(91,60,14,.13)!important}
body.light .home-main{background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(246,230,198,.82)),radial-gradient(circle at 12% 18%,rgba(183,125,37,.12),transparent 30%)!important}
body.light h1,body.light h2,body.light h3,body.light h4,body.light h5,body.light p,body.light label,body.light small,body.light .home-learning,body.light .home-meta,body.light .home-kicker,body.light .date-time,body.light .muted,body.light .card p,body.light .calendar-cell p,body.light .calendar-cell small,body.light #actionsPage .action-tile-clean p,body.light #settingsPage .settings-box p{color:#2a1c0e!important}
body.light .muted,body.light small,body.light .card .mini,body.light .settings-export-note{color:#66533b!important}
body.light .home-kicker,body.light .home-learning strong,body.light .month-head h3,body.light .panel h3,body.light .calendar-month-title,body.light #actionsPage .action-tile-clean h4,body.light #settingsPage .settings-box h4{color:#7a4d12!important}
body.light .btn,body.light input,body.light select,body.light textarea,body.light .check-filter,body.light .print-mode-tile{background:#fffef9!important;border-color:#c9aa74!important;color:#1e160c!important}
body.light input::placeholder,body.light textarea::placeholder{color:#8b765d!important}
body.light .btn.primary,body.light .tab.active,body.light .tab:hover,body.light #modalDoneBtn,body.light .print-mode-tile.active{background:linear-gradient(135deg,#74470c,#b77d25)!important;color:#fffaf0!important;border-color:transparent!important}
body.light .btn.danger{background:#fff8f5!important;color:#842d22!important;border-color:#cf8d82!important}
body.light .dot{background:#fffaf1!important;border-color:#d4bc8b!important}
body.light .dot.done{background:#2f9b62!important;border-color:#2f9b62!important}
body.light .dot.today{background:#b77d25!important;border-color:#b77d25!important}
#settingsPage .settings-boxes{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important;max-width:920px!important;margin:20px auto 0!important}
#settingsPage .settings-box{display:grid!important;grid-template-columns:56px minmax(0,1fr)!important;align-items:start!important;gap:12px 16px!important;min-height:172px!important;padding:20px!important;border-radius:22px!important;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02))!important;border:1px solid rgba(215,178,100,.30)!important;box-shadow:0 16px 44px rgba(0,0,0,.18)!important}
#settingsPage .settings-real-icon{display:grid!important;place-items:center!important;width:52px!important;height:52px!important;border-radius:16px!important;grid-column:1!important;grid-row:1!important;background:linear-gradient(135deg,var(--gold),var(--gold2))!important;box-shadow:0 12px 24px rgba(0,0,0,.18)!important}
#settingsPage .settings-real-icon::before{content:""!important;width:25px!important;height:25px!important;display:block!important;background:#fffaf0!important;-webkit-mask:var(--settings-real-svg) center / contain no-repeat!important;mask:var(--settings-real-svg) center / contain no-repeat!important}
.settings-user-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z'/%3E%3C/svg%3E")}
.settings-theme-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 2a10 10 0 1 0 0 20 8 8 0 0 1 0-20Z'/%3E%3C/svg%3E")}
.settings-save-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M4 4h16v4H4V4Zm2 6h12v10H6V10Zm3 2v2h6v-2H9Z'/%3E%3C/svg%3E")}
.settings-import-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M11 4h2v9l3-3 1.4 1.4L12 16.8l-5.4-5.4L8 10l3 3V4ZM5 19h14v2H5v-2Z'/%3E%3C/svg%3E")}
.settings-phone-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm0 17H7V4h10v14Zm-6 3h2v-1h-2v1Z'/%3E%3C/svg%3E")}
#settingsPage .settings-box::before,#settingsPage .settings-box h4::before,#settingsPage .settings-box h4::after{display:none!important;content:none!important}
#settingsPage .settings-box h4{grid-column:2!important;grid-row:1!important;align-self:center!important;margin:0!important;font-size:21px!important;color:var(--gold2)!important}
#settingsPage .settings-box p{grid-column:1/-1!important;margin:0!important;min-height:0!important;line-height:1.55!important}
#settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row,#settingsPage .settings-box textarea,#settingsPage .settings-box>.btn{grid-column:1/-1!important}
#settingsPage .settings-box .form-row{grid-template-columns:1fr auto!important;align-items:end!important}
#settingsPage .settings-box .form-row label{grid-column:1/-1!important}
#settingsPage .settings-box .actions-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}
#settingsPage .settings-box .btn{min-height:46px!important}
#settingsPage .settings-export-note{grid-column:1/-1!important;border-radius:14px!important}
@media(max-width:820px){#settingsPage .settings-boxes{grid-template-columns:1fr!important;max-width:560px!important}}
@media(max-width:680px){#settingsPage .settings-box{grid-template-columns:46px minmax(0,1fr)!important;min-height:0!important;padding:16px!important}#settingsPage .settings-real-icon{width:42px!important;height:42px!important}#settingsPage .settings-real-icon::before{width:21px!important;height:21px!important}#settingsPage .settings-box h4{font-size:18px!important}#settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row{grid-template-columns:1fr!important}}
.designed-calendar-print .print-cal-cell,.print-cal-cell{border:2px solid #4f3210!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.82)!important}
.designed-calendar-print .print-date,.print-date{border:0!important;border-bottom:1px solid #c8a566!important;border-radius:0!important;background:transparent!important;padding:0 0 3px!important;display:block!important}
.designed-calendar-print .print-day,.print-day{display:block!important;color:#6a4514!important;font-weight:900!important}
@media print{.designed-calendar-print .print-cal-cell,.print-cal-cell{border:1.8px solid #4f3210!important;background:#fffdf8!important}.designed-calendar-print .print-date,.print-date{border:0!important;border-bottom:1px solid #c8a566!important;background:transparent!important}.designed-calendar-print .print-day,.print-day{display:block!important;font-size:6.5pt!important;line-height:1.12!important;margin:0 0 .6mm!important;color:#5a3510!important}}
@media(max-width:680px){#calendar.mobile-real-mini{display:block!important;width:100%!important;max-width:352px!important;margin:0 auto!important;overflow:hidden!important}#calendar.mobile-real-mini .mobile-real-calendar{display:flex!important;flex-direction:column!important;width:100%!important;max-width:352px!important;gap:10px!important;margin:0 auto!important}#calendar.mobile-real-mini .mobile-real-week-head,#calendar.mobile-real-mini .mobile-real-grid{width:100%!important;grid-template-columns:repeat(7,minmax(0,1fr))!important}}
`;
    document.head.appendChild(style);
  }

  function fixLocalToday(){
    var data = rows();
    if(!data.length) return false;
    var localIso = localIsoDate();
    var item = data.find(function(x){ return x && x.iso === localIso; }) || data[0];
    var current = getCurrentToday();
    if(item && (!current || current.iso !== item.iso)) setCurrentToday(item);
    try{ if(typeof renderToday === "function") renderToday(); }catch(e){}
    try{ if(typeof renderTodayMobilePolished === "function") renderTodayMobilePolished(); }catch(e){}
    document.querySelectorAll(".today").forEach(function(el){ if(el.matches(".dot,.card,.calendar-cell,.mobile-real-day")) el.classList.remove("today"); });
    if(item){ document.querySelectorAll('[data-day-idx="' + item.idx + '"]').forEach(function(el){ if(el.matches(".dot,.card,.calendar-cell,.mobile-real-day")) el.classList.add("today"); }); }
    return true;
  }

  function patchPrint(){
    window.printDayLineHard = function(x){
      var day = String((x && x.day) || "").trim();
      var words = ["שבת","חג","פסח","שבועות","סוכות","ראש השנה","כיפור","שמחת תורה","עצרת","פורים","חנוכה"];
      var isSpecial = day && words.some(function(word){ return day.indexOf(word) !== -1; });
      var isSaturday = false;
      try{ if(typeof printDayIndex === "function") isSaturday = printDayIndex(x) === 6; }catch(e){}
      return (day && (isSaturday || isSpecial)) ? '<div class="print-day">' + esc(day) + '</div>' : "";
    };
  }

  function filteredCalendarRows(){
    var data = rows().slice();
    var sel = document.getElementById("calendarMonthSelect");
    var search = document.getElementById("search");
    var onlyUndone = document.getElementById("onlyUndoneFilter");
    var done = doneMap();
    var monthValue = sel && sel.value ? sel.value : "all";
    var q = search && search.value ? search.value.trim() : "";
    return data.filter(function(x){
      var monthOk = monthValue === "all" || monthName(x && x.hdate) === monthValue;
      var textOk = !q || String([x && x.idx, x && x.iso, x && x.hdate, x && x.day, x && x.chapters].join(" ")).indexOf(q) !== -1;
      var undoneOk = !(onlyUndone && onlyUndone.checked) || !done[x.idx];
      return monthOk && textOk && undoneOk;
    });
  }

  function renderMobileCalendar(){
    var cal = document.getElementById("calendar");
    if(!cal) return;
    var data = filteredCalendarRows();
    cal.classList.add("mobile-real-mini");
    if(!data.length){ cal.innerHTML = '<div class="calendar-empty-state">לא נמצאו ימים להצגה</div>'; return; }
    var groups = {};
    data.forEach(function(item){ var m = monthName(item.hdate); if(!groups[m]) groups[m] = []; groups[m].push(item); });
    var keys = Object.keys(groups);
    var sel = document.getElementById("calendarMonthSelect");
    var today = getCurrentToday();
    var openMonth = window.__mobileOpenMonth;
    if(sel && sel.value && sel.value !== "all") openMonth = sel.value;
    if(!openMonth && today) openMonth = monthName(today.hdate);
    if(keys.indexOf(openMonth) === -1) openMonth = keys[0];
    window.__mobileOpenMonth = openMonth;
    var done = doneMap();
    var heads = ["א","ב","ג","ד","ה","ו","ש"];
    var items = groups[openMonth] || [];
    var cells = [];
    for(var i=0; i<dayIndex(items[0]); i++) cells.push('<div class="mobile-real-empty"></div>');
    items.forEach(function(item){
      var cls = "mobile-real-day";
      if(done && done[item.idx]) cls += " done";
      if(today && today.idx === item.idx) cls += " today";
      cells.push('<button type="button" class="' + cls + '" data-day-idx="' + item.idx + '" title="' + esc((item.hdate || "") + " · " + (item.day || "")) + '">' + esc(dayNumber(item.hdate)) + '</button>');
    });
    var monthDone = items.filter(function(item){ return done && done[item.idx]; }).length;
    var html = '<div class="mobile-longpress-hint">לחיצה פותחת יום. לחיצה ארוכה מסמנת כנלמד.</div><div class="mobile-real-calendar">';
    html += '<button type="button" class="mobile-board-arrow mobile-board-prev" aria-label="חודש קודם" onclick="mobileCalendarMonthStep(-1)">‹</button>';
    html += '<button type="button" class="mobile-board-arrow mobile-board-next" aria-label="חודש הבא" onclick="mobileCalendarMonthStep(1)">›</button>';
    html += '<section class="mobile-real-month mobile-month-open" data-mobile-month="' + esc(openMonth) + '">';
    html += '<button type="button" class="mobile-real-month-title" data-mobile-month-title="' + esc(openMonth) + '"><span class="mobile-month-name">' + esc(openMonth) + '</span><span class="mobile-month-meta">' + monthDone + '/' + items.length + '</span></button>';
    html += '<div class="mobile-real-week-head">' + heads.map(function(h){return '<span>' + h + '</span>';}).join("") + '</div>';
    html += '<div class="mobile-real-grid">' + cells.join("") + '</div></section></div>';
    cal.innerHTML = html;
  }

  window.renderCalendar = function(){
    if(isMobile()){ fixLocalToday(); renderMobileCalendar(); return; }
    var cal = document.getElementById("calendar");
    if(cal) cal.classList.remove("mobile-real-mini");
    if(typeof originalRenderCalendar === "function") originalRenderCalendar();
    setTimeout(fixLocalToday, 0);
  };
  if(typeof originalRefresh === "function"){ window.refresh = function(){ originalRefresh(); setTimeout(fixLocalToday, 0); }; }

  function closeSiblings(item, selector){ var parent = item.parentElement; if(!parent) return; parent.querySelectorAll(selector + ".mobile-open").forEach(function(openItem){ if(openItem !== item) openItem.classList.remove("mobile-open"); }); }
  function prepareCollapsible(selector){
    document.querySelectorAll(selector).forEach(function(item){
      if(item.dataset.mobileReadyFinal === "1") return;
      item.dataset.mobileReadyFinal = "1";
      item.addEventListener("click", function(e){
        if(!isMobile()) return;
        var h4 = e.target.closest("h4");
        var control = e.target.closest("button,a,input,select,textarea");
        if(control && !h4 && item.classList.contains("mobile-open")) return;
        if(control && !h4 && !item.classList.contains("mobile-open")) e.preventDefault();
        closeSiblings(item, selector);
        item.classList.toggle("mobile-open");
      });
    });
  }

  function bindCalendarGestures(){
    if(window.__mobileCalendarGesturesBound) return;
    window.__mobileCalendarGesturesBound = true;
    document.addEventListener("click", function(e){
      var title = e.target.closest && e.target.closest(".mobile-real-month-title");
      if(title && isMobile()){ window.__mobileOpenMonth = title.getAttribute("data-mobile-month-title"); renderMobileCalendar(); return; }
      var day = e.target.closest && e.target.closest(".mobile-real-day");
      if(day && isMobile()){
        if(longPressFired){ e.preventDefault(); e.stopPropagation(); longPressFired = false; return; }
        if(typeof openDay === "function") openDay(Number(day.getAttribute("data-day-idx")));
      }
    }, true);
    document.addEventListener("pointerdown", function(e){
      var day = e.target.closest && e.target.closest(".mobile-real-day");
      if(!day || !isMobile()) return;
      longPressFired = false;
      longPressTarget = day;
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(function(){ if(!longPressTarget) return; longPressFired = true; var idx = Number(longPressTarget.getAttribute("data-day-idx")); if(typeof toggleDone === "function") toggleDone(idx); }, 560);
    }, true);
    ["pointerup","pointercancel","pointerleave"].forEach(function(type){ document.addEventListener(type, function(){ clearTimeout(longPressTimer); longPressTarget = null; }, true); });
  }

  function bindMapTip(){
    if(window.__mobileMapLongPressFinalBound) return;
    window.__mobileMapLongPressFinalBound = true;
    var timer = null;
    var shown = false;
    var tip = null;
    function hideTip(){ if(tip && tip.parentNode) tip.parentNode.removeChild(tip); tip = null; }
    function showTip(dot){
      var text = dot.getAttribute("data-tip") || "";
      if(!text || !isMobile()) return;
      hideTip();
      var rect = dot.getBoundingClientRect();
      tip = document.createElement("div");
      tip.className = "map-mobile-tip";
      tip.innerHTML = "<b>פרטי היום</b>" + esc(text);
      document.body.appendChild(tip);
      var margin = 10;
      var box = tip.getBoundingClientRect();
      var left = rect.left + rect.width / 2 - box.width / 2;
      var top = rect.top - box.height - 10;
      if(left < margin) left = margin;
      if(left + box.width + margin > window.innerWidth) left = window.innerWidth - box.width - margin;
      if(top < margin) top = rect.bottom + 10;
      if(top + box.height + margin > window.innerHeight) top = window.innerHeight - box.height - margin;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
      shown = true;
      setTimeout(hideTip, 3600);
    }
    document.addEventListener("pointerdown", function(e){ var dot = e.target.closest && e.target.closest(".year-map .dot:not(.dot-empty)"); if(!dot || !isMobile()) return; shown = false; clearTimeout(timer); timer = setTimeout(function(){ showTip(dot); }, 620); }, true);
    ["pointerup","pointercancel","pointerleave"].forEach(function(type){ document.addEventListener(type, function(){ clearTimeout(timer); }, true); });
    document.addEventListener("click", function(e){ var dot = e.target.closest && e.target.closest(".year-map .dot:not(.dot-empty)"); if(dot && isMobile() && shown){ e.preventDefault(); e.stopPropagation(); shown = false; } }, true);
  }

  function setup(){
    injectFinalCss();
    patchPrint();
    prepareCollapsible("#actionsPage .action-tile");
    prepareCollapsible("#actionsPage .action-tile-clean");
    prepareCollapsible("#settingsPage .settings-box");
    bindCalendarGestures();
    bindMapTip();
    if(isMobile()){
      var side = document.querySelector(".home-side");
      if(side && !side.dataset.mobileDefaultCollapsed){ side.dataset.mobileDefaultCollapsed = "1"; side.classList.add("map-collapsed"); }
      setTimeout(renderMobileCalendar, 0);
    }
    setTimeout(fixLocalToday, 0);
    setTimeout(fixLocalToday, 1200);
    setTimeout(fixLocalToday, 3500);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup); else setup();
  window.addEventListener("load", setup);
  window.addEventListener("resize", setup);
  document.addEventListener("change", function(e){ if(e.target && e.target.id === "calendarMonthSelect") setTimeout(function(){ if(typeof window.renderCalendar === "function") window.renderCalendar(); }, 0); });
  var oldShowPage = window.showPage;
  if(typeof oldShowPage === "function"){
    window.showPage = function(page){ oldShowPage(page); if(page === "calendarPage" || page === "calendar") setTimeout(function(){ if(typeof window.renderCalendar === "function") window.renderCalendar(); }, 0); setTimeout(setup, 0); };
  }
})();
