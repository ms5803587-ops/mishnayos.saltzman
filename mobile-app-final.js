/* V14.2 clean fixes: desktop home layout, settings icons, readable light mode, mobile board and controls. */
(function(){
  var originalRenderCalendar = window.renderCalendar;
  var originalRefresh = window.refresh;
  var pressTimer = null;
  var pressFired = false;

  function isMobile(){return window.matchMedia && window.matchMedia("(max-width: 680px)").matches;}
  function esc(v){
    if(typeof escapeHtml === "function") return escapeHtml(v);
    return String(v == null ? "" : v).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];});
  }
  function rows(){try{if(typeof DATA !== "undefined" && Array.isArray(DATA)) return DATA;if(Array.isArray(window.DATA)) return window.DATA;}catch(e){}return [];}
  function doneMap(){try{if(typeof getDone === "function") return getDone();}catch(e){}return {};}
  function localIsoDate(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function getToday(){try{if(typeof currentToday !== "undefined") return currentToday;}catch(e){}return window.currentToday||null;}
  function setToday(item){try{if(typeof currentToday !== "undefined") currentToday=item;}catch(e){}window.currentToday=item;}
  function monthName(hdate){try{if(typeof hebrewMonth === "function") return hebrewMonth(hdate)||"ללא חודש";}catch(e){}var h=String(hdate||"");var m=h.match(/(תשרי|חשוון|חשון|מרחשון|כסלו|טבת|שבט|אדר א|אדר ב|אדר|ניסן|אייר|סיוון|סיון|תמוז|אב|אלול)/);return m?m[1]:"ללא חודש";}
  function dayNumber(hdate){var h=String(hdate||"").trim();return h?(h.split(/\s+/)[0]||h):"";}
  function dayIndex(item){var d=String((item&&item.day)||"");if(d.indexOf("ראשון")!==-1)return 0;if(d.indexOf("שני")!==-1)return 1;if(d.indexOf("שלישי")!==-1)return 2;if(d.indexOf("רביעי")!==-1)return 3;if(d.indexOf("חמישי")!==-1)return 4;if(d.indexOf("שישי")!==-1)return 5;if(d.indexOf("שבת")!==-1)return 6;var dt=new Date(String(item&&item.iso||"")+"T12:00:00");return isNaN(dt)?0:dt.getDay();}

  function injectCss(){
    var old=document.getElementById("v141FixesCss"); if(old) old.remove();
    if(document.getElementById("v142CleanFixesCss")) return;
    var style=document.createElement("style");
    style.id="v142CleanFixesCss";
    style.textContent=`
@media(min-width:681px){
  #homePage .home-hero{display:grid!important;grid-template-columns:minmax(700px,1.58fr) minmax(305px,.68fr)!important;gap:18px!important;align-items:stretch!important;direction:ltr!important}
  #homePage .home-main,#homePage .home-side{direction:rtl!important;grid-row:1!important}
  #homePage .home-main{grid-column:1!important;min-height:545px!important;padding:38px 42px!important;justify-self:stretch!important}
  #homePage .home-side{grid-column:2!important;width:100%!important;max-width:390px!important;justify-self:stretch!important;padding:17px!important;overflow:hidden!important}
  #homePage .home-side .map-head{align-items:flex-start!important;gap:10px!important}
  #homePage .home-side .map-head p{display:none!important}
  #homePage .home-side .stats{grid-template-columns:1fr!important;gap:7px!important}
  #homePage .home-side .stat{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:9px 11px!important;text-align:right!important}
  #homePage .home-side .stat b{font-size:18px!important}#homePage .home-side .stat span{font-size:12px!important}
  #homePage .home-side .year-map{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:4px!important;max-height:345px!important;overflow-y:auto!important;padding-left:3px!important}
  #homePage .home-side .dot{height:18px!important;min-height:18px!important;border-radius:5px!important}
  #homePage .home-side .dot::before{font-size:9px!important;line-height:1!important;color:inherit!important}
  #homePage .home-side .map-weekday{font-size:10px!important;min-height:20px!important}
}
body.light{--bg:#f7f0e5;--bg2:#fffaf2;--panel:#fffaf1;--panel2:#fff;--card:#fff8ea;--text:#1b1308;--muted:#4d3922;--line:#bf9a61;--gold:#74470c;--gold2:#b67a22;background:linear-gradient(180deg,#fffdf8,#f2e5cf)!important;color:#1b1308!important}
body.light .site-header,body.light .tabs,body.light .panel,body.light .home-main,body.light .home-side,body.light .modal-box,body.light #printPicker .print-picker-box,body.light #calendar.mobile-real-mini .mobile-real-month,body.light #actionsPage .action-tile-clean,body.light #settingsPage .settings-box,body.light .calendar-month,body.light .calendar-cell,body.light .card,body.light .stat{background:linear-gradient(145deg,#fffdf8,#f0dfc0)!important;border-color:#bf9a61!important;color:#1b1308!important;box-shadow:0 16px 36px rgba(91,60,14,.13)!important}
body.light h1,body.light h2,body.light h3,body.light h4,body.light h5,body.light p,body.light span,body.light label,body.light small,body.light .muted,body.light .home-learning,body.light .home-meta,body.light .home-kicker,body.light .date-time,body.light .card p,body.light .calendar-cell p,body.light .calendar-cell small,body.light #actionsPage .action-tile-clean p,body.light #settingsPage .settings-box p,body.light #settingsPage .settings-box label,body.light #settingsPage .settings-export-note{color:#24180b!important;text-shadow:none!important}
body.light .home-kicker,body.light .home-learning strong,body.light .panel h3,body.light .month-head h3,body.light #actionsPage .action-tile-clean h4,body.light #settingsPage .settings-box h4{color:#68400d!important}
body.light .btn:not(.primary),body.light input,body.light select,body.light textarea,body.light .check-filter,body.light .print-mode-tile{background:#fffaf0!important;border-color:#a97d3f!important;color:#1b1308!important}
body.light .btn.primary,body.light .tab.active,body.light .tab:hover,body.light #modalDoneBtn,body.light .print-mode-tile.active{background:linear-gradient(135deg,#6a3d07,#b67a22)!important;color:#fff9ed!important;border-color:transparent!important}
body.light .btn.danger{background:#fff5f1!important;border-color:#b76155!important;color:#7d2118!important}
#settingsPage .settings-boxes{display:grid!important;grid-template-columns:repeat(2,minmax(360px,1fr))!important;gap:18px!important;max-width:980px!important;margin:22px auto 0!important;align-items:stretch!important}
#settingsPage .settings-box{display:grid!important;grid-template-columns:54px minmax(0,1fr)!important;grid-auto-rows:auto!important;align-content:start!important;gap:12px 16px!important;min-height:0!important;padding:18px 20px!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02))!important;border:1px solid rgba(215,178,100,.30)!important;box-shadow:0 16px 44px rgba(0,0,0,.18)!important}
#settingsPage .settings-real-icon{display:grid!important;place-items:center!important;width:50px!important;height:50px!important;border-radius:15px!important;grid-column:1!important;grid-row:1!important;background:linear-gradient(135deg,var(--gold),var(--gold2))!important;box-shadow:0 12px 24px rgba(0,0,0,.18)!important;opacity:1!important;visibility:visible!important}
#settingsPage .settings-real-icon::before{content:""!important;width:24px!important;height:24px!important;display:block!important;background:#fffaf0!important;-webkit-mask:var(--settings-real-svg) center/contain no-repeat!important;mask:var(--settings-real-svg) center/contain no-repeat!important}
.settings-user-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z'/%3E%3C/svg%3E")}.settings-theme-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 2a10 10 0 1 0 0 20 8 8 0 0 1 0-20Z'/%3E%3C/svg%3E")}.settings-save-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M4 4h16v4H4V4Zm2 6h12v10H6V10Zm3 2v2h6v-2H9Z'/%3E%3C/svg%3E")}.settings-import-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M11 4h2v9l3-3 1.4 1.4L12 16.8l-5.4-5.4L8 10l3 3V4ZM5 19h14v2H5v-2Z'/%3E%3C/svg%3E")}.settings-phone-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm0 17H7V4h10v14Zm-6 3h2v-1h-2v1Z'/%3E%3C/svg%3E")}
#settingsPage .settings-box::before,#settingsPage .settings-box h4::before,#settingsPage .settings-box h4::after{display:none!important;content:none!important}#settingsPage .settings-box h4{grid-column:2!important;grid-row:1!important;align-self:center!important;margin:0!important;font-size:20px!important;line-height:1.2!important;color:var(--gold2)!important}#settingsPage .settings-box p{display:block!important;grid-column:1/-1!important;margin:0!important;font-size:13px!important;line-height:1.45!important}#settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row,#settingsPage .settings-box textarea,#settingsPage .settings-box>.btn,#settingsPage .settings-export-note{grid-column:1/-1!important}#settingsPage .settings-box .form-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:end!important}#settingsPage .settings-box .form-row label{grid-column:1/-1!important}#settingsPage .settings-box .actions-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}#settingsPage .settings-box textarea{min-height:88px!important}#settingsPage .settings-box .btn{min-height:44px!important}#settingsPage .settings-export-note{display:block!important;visibility:visible!important;opacity:1!important;border-radius:14px!important;font-size:13px!important;line-height:1.5!important;color:var(--muted)!important}
@media(max-width:820px){#settingsPage .settings-boxes{grid-template-columns:1fr!important;max-width:560px!important}}
@media(max-width:680px){
  #calendar.mobile-real-mini{display:block!important;width:100%!important;max-width:352px!important;margin:0 auto!important;overflow:hidden!important}
  #calendar.mobile-real-mini .mobile-real-calendar{display:flex!important;flex-direction:column!important;width:100%!important;max-width:352px!important;gap:10px!important;margin:0 auto!important}
  #calendar.mobile-real-mini .mobile-real-month{width:100%!important;box-sizing:border-box!important;border-radius:18px!important;padding:10px!important;overflow:hidden!important}
  #calendar.mobile-real-mini .mobile-real-month-title{width:100%!important;min-height:42px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:8px 10px!important;box-sizing:border-box!important}
  #calendar.mobile-real-mini .mobile-real-week-head,#calendar.mobile-real-mini .mobile-real-grid{display:grid!important;width:100%!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:5px!important;box-sizing:border-box!important}
  #calendar.mobile-real-mini .mobile-real-week-head span{font-size:11px!important;text-align:center!important;min-width:0!important}
  #calendar.mobile-real-mini .mobile-real-day,#calendar.mobile-real-mini .mobile-real-empty{width:100%!important;height:36px!important;min-height:36px!important;min-width:0!important;box-sizing:border-box!important;border-radius:10px!important;padding:0!important;font-size:13px!important;line-height:1!important;display:grid!important;place-items:center!important}
  #calendar.mobile-real-mini .mobile-real-day{touch-action:manipulation!important}
  #calendar.mobile-real-mini .mobile-real-day.today{outline:2px solid var(--gold2)!important;outline-offset:1px!important}
  #actionsPage button,#actionsPage a,#actionsPage input,#settingsPage button,#settingsPage a,#settingsPage input,#settingsPage select,#settingsPage textarea{pointer-events:auto!important;position:relative!important;z-index:5!important}
  #actionsPage .action-tile-clean p,#settingsPage .settings-box p,#settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row,#settingsPage .settings-box textarea,#settingsPage .settings-export-note{display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important}
  #settingsPage .settings-box{grid-template-columns:46px minmax(0,1fr)!important;padding:16px!important}
  #settingsPage .settings-real-icon{width:42px!important;height:42px!important}#settingsPage .settings-real-icon::before{width:21px!important;height:21px!important}#settingsPage .settings-box h4{font-size:18px!important}#settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row{grid-template-columns:1fr!important}
}
`;
    document.head.appendChild(style);
  }

  function fixLocalToday(){
    var data=rows(); if(!data.length) return;
    var item=data.find(function(x){return x&&x.iso===localIsoDate();})||data[0];
    if(item) setToday(item);
    try{if(typeof renderToday === "function") renderToday();}catch(e){}
    try{if(typeof renderTodayMobilePolished === "function") renderTodayMobilePolished();}catch(e){}
    document.querySelectorAll(".today").forEach(function(el){if(el.matches(".dot,.card,.calendar-cell,.mobile-real-day")) el.classList.remove("today");});
    if(item) document.querySelectorAll('[data-day-idx="'+item.idx+'"]').forEach(function(el){if(el.matches(".dot,.card,.calendar-cell,.mobile-real-day")) el.classList.add("today");});
  }

  function filteredRows(){
    var data=rows().slice(), sel=document.getElementById("calendarMonthSelect"), search=document.getElementById("search"), only=document.getElementById("onlyUndoneFilter"), done=doneMap();
    var m=sel&&sel.value?sel.value:"all", q=search&&search.value?search.value.trim():"";
    return data.filter(function(x){return (m==="all"||monthName(x&&x.hdate)===m)&&(!q||String([x&&x.idx,x&&x.iso,x&&x.hdate,x&&x.day,x&&x.chapters].join(" ")).indexOf(q)!==-1)&&(!(only&&only.checked)||!done[x.idx]);});
  }

  function renderMobileCalendar(){
    var cal=document.getElementById("calendar"); if(!cal) return;
    var data=filteredRows(); cal.classList.add("mobile-real-mini");
    if(!data.length){cal.innerHTML='<div class="calendar-empty-state">לא נמצאו ימים להצגה</div>';return;}
    var groups={}; data.forEach(function(item){var m=monthName(item.hdate);(groups[m]||(groups[m]=[])).push(item);});
    var keys=Object.keys(groups), sel=document.getElementById("calendarMonthSelect"), today=getToday(), open=window.__mobileOpenMonth;
    if(sel&&sel.value&&sel.value!=="all") open=sel.value;
    if(!open&&today) open=monthName(today.hdate);
    if(keys.indexOf(open)===-1) open=keys[0];
    window.__mobileOpenMonth=open;
    var items=groups[open]||[], done=doneMap(), cells=[];
    for(var i=0;i<dayIndex(items[0]);i++) cells.push('<div class="mobile-real-empty"></div>');
    items.forEach(function(item){
      var cls="mobile-real-day"+(done[item.idx]?" done":"")+(today&&today.idx===item.idx?" today":"");
      cells.push('<button type="button" class="'+cls+'" data-day-idx="'+item.idx+'" title="'+esc((item.day||"")+" "+(item.chapters||""))+'">'+esc(dayNumber(item.hdate))+'</button>');
    });
    var monthDone=items.filter(function(item){return done[item.idx];}).length;
    cal.innerHTML='<div class="mobile-longpress-hint">לחיצה פותחת יום. לחיצה ארוכה מסמנת כנלמד.</div><div class="mobile-real-calendar"><section class="mobile-real-month mobile-month-open"><button type="button" class="mobile-real-month-title"><span class="mobile-month-name">'+esc(open)+'</span><span class="mobile-month-meta">'+monthDone+'/'+items.length+'</span></button><div class="mobile-real-week-head"><span>א</span><span>ב</span><span>ג</span><span>ד</span><span>ה</span><span>ו</span><span>ש</span></div><div class="mobile-real-grid">'+cells.join("")+'</div></section></div>';
  }

  window.renderCalendar=function(){
    if(isMobile()){fixLocalToday();renderMobileCalendar();return;}
    var cal=document.getElementById("calendar"); if(cal) cal.classList.remove("mobile-real-mini");
    if(typeof originalRenderCalendar === "function") originalRenderCalendar();
    setTimeout(fixLocalToday,0);
  };
  if(typeof originalRefresh === "function") window.refresh=function(){originalRefresh();setTimeout(function(){injectCss();fixLocalToday();if(isMobile()) renderMobileCalendar();bindControlProtection();},0);};

  function bindMobileCalendar(){
    if(window.__v142MobileCalendarBound) return; window.__v142MobileCalendarBound=true;
    document.addEventListener("click",function(e){
      var day=e.target.closest&&e.target.closest(".mobile-real-day");
      if(day&&isMobile()){
        if(pressFired){pressFired=false;e.preventDefault();return;}
        var idx=Number(day.getAttribute("data-day-idx"));
        var item=rows().find(function(x){return Number(x.idx)===idx;});
        if(item&&typeof openDay === "function"){e.preventDefault();openDay(item);}
      }
    });
    document.addEventListener("pointerdown",function(e){
      var day=e.target.closest&&e.target.closest(".mobile-real-day"); if(!day||!isMobile()) return;
      pressFired=false; var idx=Number(day.getAttribute("data-day-idx"));
      pressTimer=setTimeout(function(){pressFired=true;if(typeof toggleDone === "function"){toggleDone(idx);renderMobileCalendar();fixLocalToday();}},550);
    });
    document.addEventListener("pointerup",function(){clearTimeout(pressTimer);});
    document.addEventListener("pointercancel",function(){clearTimeout(pressTimer);});
  }

  function bindControlProtection(){
    document.querySelectorAll('#actionsPage button,#actionsPage a,#actionsPage input,#settingsPage button,#settingsPage a,#settingsPage input,#settingsPage select,#settingsPage textarea').forEach(function(el){
      if(el.dataset.v142ControlOk) return;
      el.dataset.v142ControlOk="1";
      el.addEventListener("click",function(e){if(isMobile()) e.stopPropagation();},true);
      el.addEventListener("pointerdown",function(e){if(isMobile()) e.stopPropagation();},true);
    });
  }

  function patchPrintDay(){
    window.printDayLineHard=function(x){
      var day=String((x&&x.day)||"").trim();
      var special=["שבת","חג","פסח","שבועות","סוכות","ראש השנה","כיפור","שמחת תורה","עצרת","פורים","חנוכה"].some(function(w){return day.indexOf(w)!==-1;});
      return day && (dayIndex(x)===6 || special) ? '<div class="print-day">'+esc(day)+'</div>' : "";
    };
  }

  function setup(){injectCss();patchPrintDay();fixLocalToday();bindMobileCalendar();bindControlProtection();if(isMobile()) renderMobileCalendar();setTimeout(bindControlProtection,700);}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setup); else setup();
  window.addEventListener("load",setup);
  window.addEventListener("resize",function(){injectCss();fixLocalToday();if(isMobile()) renderMobileCalendar();});
})();
