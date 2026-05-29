/* V14.6 clean fix: normal mobile cards, compact mobile calendar, non-conflicting print. */
(function(){
  var baseRenderCalendar = window.renderCalendar;
  var baseRefresh = window.refresh;
  var lastKey = '';
  var lastAt = 0;

  function isMobile(){ return window.matchMedia && window.matchMedia('(max-width: 680px)').matches; }
  function $(id){ return document.getElementById(id); }
  function esc(v){ if(typeof escapeHtml === 'function') return escapeHtml(v); return String(v == null ? '' : v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];}); }
  function rows(){ try{ if(typeof DATA !== 'undefined' && Array.isArray(DATA)) return DATA; if(Array.isArray(window.DATA)) return window.DATA; }catch(e){} return []; }
  function doneMap(){ try{ if(typeof getDone === 'function') return getDone(); }catch(e){} return {}; }
  function dayIndex(x){ var d=String((x&&x.day)||''); if(d.indexOf('ראשון')!==-1)return 0;if(d.indexOf('שני')!==-1)return 1;if(d.indexOf('שלישי')!==-1)return 2;if(d.indexOf('רביעי')!==-1)return 3;if(d.indexOf('חמישי')!==-1)return 4;if(d.indexOf('שישי')!==-1)return 5;if(d.indexOf('שבת')!==-1)return 6; var dt=new Date(String(x&&x.iso||'')+'T12:00:00'); return isNaN(dt)?0:dt.getDay(); }
  function monthName(hdate){ try{ if(typeof hebrewMonth === 'function') return hebrewMonth(hdate)||'ללא חודש'; }catch(e){} var h=String(hdate||''); var m=h.match(/(תשרי|חשוון|חשון|מרחשון|כסלו|טבת|שבט|אדר א|אדר ב|אדר|ניסן|אייר|סיוון|סיון|תמוז|אב|אלול)/); return m?m[1]:'ללא חודש'; }
  function dayNum(hdate){ var h=String(hdate||'').trim(); return h ? (h.split(/\s+/)[0] || h) : ''; }
  function todayItem(){ var d=new Date(); var iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); return rows().find(function(x){return x&&x.iso===iso;}) || rows()[0]; }

  function injectCss(){
    ['v141FixesCss','v142CleanFixesCss','v143HardFixesCss','v144BugfixCss','v145NoAccordionCss','v146CleanCss'].forEach(function(id){ var n=document.getElementById(id); if(n) n.remove(); });
    var s=document.createElement('style');
    s.id='v146CleanCss';
    s.textContent=`
@media(min-width:681px){
  #homePage .home-hero{display:grid!important;grid-template-columns:minmax(420px,.78fr) minmax(740px,1.55fr)!important;direction:ltr!important;gap:22px!important;align-items:stretch!important}
  #homePage .home-side{grid-column:1!important;grid-row:1!important;direction:rtl!important;width:100%!important;max-width:none!important;justify-self:stretch!important;padding:18px!important;overflow:hidden!important}
  #homePage .home-main{grid-column:2!important;grid-row:1!important;direction:rtl!important;min-height:560px!important;padding:42px 46px!important;justify-self:stretch!important}
  #homePage .home-learning{font-size:22px!important;line-height:1.65!important;font-weight:900!important;color:#fff2c7!important}
  #homePage .home-learning strong{font-size:24px!important;color:var(--gold2)!important}
  #homePage .home-side .map-head p{display:block!important;font-size:12px!important;line-height:1.35!important;color:var(--muted)!important;margin:4px 0 0!important}
  #homePage .home-side .stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;margin:12px 0!important}
  #homePage .home-side .stat{display:block!important;text-align:center!important;padding:9px 7px!important;min-width:0!important}
  #homePage .home-side .stat b{display:block!important;font-size:20px!important;line-height:1.1!important}
  #homePage .home-side .stat span{display:block!important;font-size:10.5px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  #homePage .home-side .year-map{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:4px!important;max-height:390px!important;overflow-y:auto!important;padding-left:4px!important}
  #homePage .home-side .dot{height:22px!important;min-height:22px!important;border-radius:6px!important}
  #homePage .home-side .dot::before{font-size:9.5px!important;line-height:1!important;color:inherit!important}
}
body.light{--bg:#f7f0e5;--bg2:#fffaf2;--panel:#fffaf1;--panel2:#fff;--card:#fff8ea;--text:#1b1308;--muted:#4d3922;--line:#bf9a61;--gold:#74470c;--gold2:#b67a22;background:linear-gradient(180deg,#fffdf8,#f2e5cf)!important;color:#1b1308!important}
body.light h1,body.light h2,body.light h3,body.light h4,body.light h5,body.light p,body.light span,body.light label,body.light small,body.light .muted,body.light .home-learning,body.light .home-meta,body.light .home-kicker,body.light .date-time,body.light .card p,body.light .calendar-cell p,body.light .calendar-cell small,body.light #actionsPage .action-tile-clean p,body.light #settingsPage .settings-box p,body.light #settingsPage .settings-box label,body.light #settingsPage .settings-export-note{color:#24180b!important;text-shadow:none!important}
body.light .btn:not(.primary),body.light input,body.light select,body.light textarea{background:#fffaf0!important;border-color:#a97d3f!important;color:#1b1308!important}
body.light .btn.primary,body.light .tab.active,body.light .tab:hover,body.light #modalDoneBtn{background:linear-gradient(135deg,#6a3d07,#b67a22)!important;color:#fff9ed!important;border-color:transparent!important}
#settingsPage .settings-real-icon{display:grid!important;place-items:center!important;width:50px!important;height:50px!important;border-radius:15px!important;background:linear-gradient(135deg,var(--gold),var(--gold2))!important;opacity:1!important;visibility:visible!important}
#settingsPage .settings-real-icon::before{content:''!important;width:24px!important;height:24px!important;display:block!important;background:#fffaf0!important;-webkit-mask:var(--settings-real-svg) center/contain no-repeat!important;mask:var(--settings-real-svg) center/contain no-repeat!important}
.settings-user-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z'/%3E%3C/svg%3E")}.settings-theme-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 2a10 10 0 1 0 0 20 8 8 0 0 1 0-20Z'/%3E%3C/svg%3E")}.settings-save-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M4 4h16v4H4V4Zm2 6h12v10H6V10Zm3 2v2h6v-2H9Z'/%3E%3C/svg%3E")}.settings-import-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M11 4h2v9l3-3 1.4 1.4L12 16.8l-5.4-5.4L8 10l3 3V4ZM5 19h14v2H5v-2Z'/%3E%3C/svg%3E")}.settings-phone-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm0 17H7V4h10v14Zm-6 3h2v-1h-2v1Z'/%3E%3C/svg%3E")}
@media(max-width:680px){
  #actionsPage .action-tile-clean,#settingsPage .settings-box{display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;gap:10px 12px!important;padding:14px!important;border-radius:17px!important;min-height:0!important;max-height:none!important;height:auto!important;overflow:visible!important;transform:none!important;pointer-events:auto!important}
  #actionsPage .action-tile-clean::after,#settingsPage .settings-box::after,#settingsPage .settings-box::before,#settingsPage .settings-box h4::before,#settingsPage .settings-box h4::after{display:none!important;content:none!important}
  #actionsPage .action-tile-clean > div:first-child{display:contents!important}
  #actionsPage .action-tile-clean .action-icon,#settingsPage .settings-real-icon{grid-column:1!important;grid-row:1!important;width:42px!important;height:42px!important}
  #actionsPage .action-tile-clean h4,#settingsPage .settings-box h4{grid-column:2!important;grid-row:1!important;align-self:center!important;margin:0!important;font-size:18px!important;line-height:1.25!important;white-space:normal!important}
  #actionsPage .action-tile-clean p,#actionsPage .action-tile-clean > .btn,#actionsPage .action-tile-clean .tile-buttons,#settingsPage .settings-box p,#settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row,#settingsPage .settings-box textarea,#settingsPage .settings-box > .btn,#settingsPage .settings-export-note,#settingsPage .settings-box .backup-box,#actionsPage .action-tile-clean:not(.mobile-open) p,#actionsPage .action-tile-clean:not(.mobile-open) > .btn,#actionsPage .action-tile-clean:not(.mobile-open) .tile-buttons,#settingsPage .settings-box:not(.mobile-open) p,#settingsPage .settings-box:not(.mobile-open) .form-row,#settingsPage .settings-box:not(.mobile-open) .actions-row,#settingsPage .settings-box:not(.mobile-open) textarea,#settingsPage .settings-box:not(.mobile-open) > .btn,#settingsPage .settings-box:not(.mobile-open) .settings-export-note{grid-column:1/-1!important;display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;transform:none!important;pointer-events:auto!important}
  #settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row,#actionsPage .action-tile-clean .tile-buttons{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;width:100%!important}
  #actionsPage .action-tile-clean .btn,#settingsPage .settings-box .btn,#settingsPage .settings-box input,#settingsPage .settings-box textarea,#settingsPage .settings-box select{width:100%!important;min-height:44px!important;position:relative!important;z-index:20!important;pointer-events:auto!important;touch-action:manipulation!important;margin-top:8px!important}
  .modal.open{display:grid!important;place-items:center!important;padding:10px!important;z-index:10000!important;background:rgba(0,0,0,.72)!important}
  .modal-box{width:calc(100vw - 22px)!important;max-width:calc(100vw - 22px)!important;max-height:82vh!important;overflow:auto!important;border-radius:20px!important;padding:16px!important;margin:auto!important;box-sizing:border-box!important}
  .modal-box .actions-row{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
  .modal-box .btn,.modal-box input,.modal-box select,.modal-box textarea{width:100%!important;min-height:42px!important}
  #calendar.mobile-real-mini{display:block!important;width:100%!important;max-width:354px!important;margin:0 auto!important;overflow:visible!important;position:relative!important}
  #calendar.mobile-real-mini .mobile-real-calendar{display:flex!important;flex-direction:column!important;width:100%!important;max-width:354px!important;margin:0 auto!important;position:relative!important}
  #calendar.mobile-real-mini .mobile-board-arrow{display:grid!important;place-items:center!important;position:absolute!important;top:54px!important;z-index:30!important;width:34px!important;height:34px!important;border-radius:999px!important;border:1px solid rgba(215,178,100,.45)!important;background:linear-gradient(135deg,var(--gold),var(--gold2))!important;color:#201609!important;font-size:24px!important;font-weight:900!important}
  #calendar.mobile-real-mini .mobile-board-prev{right:-4px!important}#calendar.mobile-real-mini .mobile-board-next{left:-4px!important}
  #calendar.mobile-real-mini .mobile-real-month{width:100%!important;box-sizing:border-box!important;border-radius:18px!important;padding:10px!important;overflow:hidden!important}
  #calendar.mobile-real-mini .mobile-real-month-title{width:100%!important;min-height:42px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:8px 42px!important;box-sizing:border-box!important}
  #calendar.mobile-real-mini .mobile-real-week-head,#calendar.mobile-real-mini .mobile-real-grid{display:grid!important;width:100%!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:5px!important;box-sizing:border-box!important}
  #calendar.mobile-real-mini .mobile-real-day,#calendar.mobile-real-mini .mobile-real-empty{width:100%!important;height:36px!important;min-height:36px!important;min-width:0!important;box-sizing:border-box!important;border-radius:10px!important;padding:0!important;font-size:13px!important;line-height:1!important;display:grid!important;place-items:center!important}
}
`;
    document.head.appendChild(s);
  }

  function normalizeCards(){
    document.querySelectorAll('#actionsPage .action-tile-clean,#settingsPage .settings-box').forEach(function(el){
      el.classList.add('mobile-open');
      el.style.setProperty('overflow','visible','important');
      el.style.setProperty('max-height','none','important');
    });
  }

  function runInline(el){
    var code=el.getAttribute('onclick')||'';
    var m=code.match(/^\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*;?\s*$/);
    if(m && typeof window[m[1]]==='function'){
      var a=m[2].trim();
      if(!a){window[m[1]]();return true;}
      if(/^['"][^'"]*['"]$/.test(a)){window[m[1]](a.slice(1,-1));return true;}
    }
    if(typeof el.onclick==='function'){try{el.onclick.call(el,new MouseEvent('click',{bubbles:false,cancelable:true}));return true;}catch(e){}}
    return false;
  }

  function buttonCapture(e){
    if(!isMobile()) return;
    var field=e.target.closest&&e.target.closest('#settingsPage input,#settingsPage textarea,#settingsPage select,.modal input,.modal textarea,.modal select');
    if(field){e.stopPropagation();return;}
    var btn=e.target.closest&&e.target.closest('#actionsPage button,#settingsPage button');
    if(!btn || btn.closest('.modal')) return;
    var key=(btn.getAttribute('onclick')||btn.textContent||'button').trim();
    var now=Date.now();
    e.preventDefault(); e.stopImmediatePropagation();
    if(lastKey===key && now-lastAt<650) return;
    lastKey=key; lastAt=now;
    setTimeout(function(){normalizeCards();runInline(btn);},0);
  }
  ['pointerup','touchend','click'].forEach(function(t){document.addEventListener(t,buttonCapture,{capture:true,passive:false});});

  function filteredRows(){
    var data=rows().slice(), sel=$('calendarMonthSelect'), search=$('search'), only=$('onlyUndoneFilter'), done=doneMap();
    var m=sel&&sel.value?sel.value:'all', q=search&&search.value?search.value.trim():'';
    return data.filter(function(x){return (m==='all'||monthName(x&&x.hdate)===m)&&(!q||String([x&&x.idx,x&&x.iso,x&&x.hdate,x&&x.day,x&&x.chapters].join(' ')).indexOf(q)!==-1)&&(!(only&&only.checked)||!done[x.idx]);});
  }
  function monthGroups(){var g={};filteredRows().forEach(function(x){var m=monthName(x.hdate);(g[m]||(g[m]=[])).push(x);});return {groups:g,keys:Object.keys(g)};}
  window.mobileCalendarMonthStep=function(step){var info=monthGroups();if(!info.keys.length)return;var cur=window.__mobileOpenMonth||(todayItem()&&monthName(todayItem().hdate))||info.keys[0];var i=info.keys.indexOf(cur);if(i<0)i=0;window.__mobileOpenMonth=info.keys[(i+step+info.keys.length)%info.keys.length];renderMobileCalendar();};
  function renderMobileCalendar(){
    var cal=$('calendar'); if(!cal) return; var info=monthGroups(); cal.classList.add('mobile-real-mini');
    if(!info.keys.length){cal.innerHTML='<div class="calendar-empty-state">לא נמצאו ימים להצגה</div>';return;}
    var sel=$('calendarMonthSelect'), today=todayItem(), open=window.__mobileOpenMonth;
    if(sel&&sel.value&&sel.value!=='all') open=sel.value; if(!open&&today) open=monthName(today.hdate); if(info.keys.indexOf(open)===-1) open=info.keys[0]; window.__mobileOpenMonth=open;
    var items=info.groups[open]||[], done=doneMap(), cells=[];
    for(var i=0;i<dayIndex(items[0]);i++) cells.push('<div class="mobile-real-empty"></div>');
    items.forEach(function(x){var cls='mobile-real-day'+(done[x.idx]?' done':'')+(today&&today.idx===x.idx?' today':'');cells.push('<button type="button" class="'+cls+'" data-day-idx="'+x.idx+'">'+esc(dayNum(x.hdate))+'</button>');});
    var monthDone=items.filter(function(x){return done[x.idx];}).length;
    cal.innerHTML='<div class="mobile-longpress-hint">לחיצה פותחת יום. לחיצה ארוכה מסמנת כנלמד.</div><div class="mobile-real-calendar"><button type="button" class="mobile-board-arrow mobile-board-prev" onclick="mobileCalendarMonthStep(-1)">›</button><button type="button" class="mobile-board-arrow mobile-board-next" onclick="mobileCalendarMonthStep(1)">‹</button><section class="mobile-real-month mobile-month-open"><button type="button" class="mobile-real-month-title"><span class="mobile-month-name">'+esc(open)+'</span><span class="mobile-month-meta">'+monthDone+'/'+items.length+'</span></button><div class="mobile-real-week-head"><span>א</span><span>ב</span><span>ג</span><span>ד</span><span>ה</span><span>ו</span><span>ש</span></div><div class="mobile-real-grid">'+cells.join('')+'</div></section></div>';
  }

  window.renderCalendar=function(){if(isMobile()){renderMobileCalendar();return;}var cal=$('calendar');if(cal)cal.classList.remove('mobile-real-mini');if(typeof baseRenderCalendar==='function')baseRenderCalendar();};
  if(typeof baseRefresh==='function') window.refresh=function(){baseRefresh();setTimeout(function(){injectCss();normalizeCards();if(isMobile())renderMobileCalendar();},0);};

  function printPatch(){
    function getRows(){try{if(typeof getPrintRowsByMode==='function')return getPrintRowsByMode();}catch(e){}return rows().slice();}
    function weeks(items){if(typeof buildCalendarWeeks==='function'){try{return buildCalendarWeeks(items);}catch(e){}}var out=[],cur=new Array(7).fill(null);items.forEach(function(x){var i=dayIndex(x);if(cur[i]){out.push(cur);cur=new Array(7).fill(null);}cur[i]=x;if(i===6){out.push(cur);cur=new Array(7).fill(null);}});if(cur.some(Boolean))out.push(cur);return out;}
    function clean(t){return String(t||'').replace(/\s*\|\s*/g,' | ').replace(/\s+/g,' ').trim();}
    function lines(t){var p=String(t||'').split('|').map(clean).filter(Boolean);if(!p.length)p=[clean(t)];while(p.length<3)p.push('');return p.slice(0,3).map(function(x){return '<div>'+esc(x)+'</div>';}).join('');}
    function dayLine(x){var d=String((x&&x.day)||'').trim();var sp=['שבת','חג','פסח','שבועות','סוכות','ראש השנה','כיפור','שמחת תורה','עצרת','פורים','חנוכה'].some(function(w){return d.indexOf(w)!==-1;});return d&&(dayIndex(x)===6||sp)?'<div class="p146-day">'+esc(d)+'</div>':'';}
    function css(){return 'body{margin:0;background:#fff;color:#201608;font-family:Arial,system-ui,sans-serif;direction:rtl}.preview-actions{position:sticky;top:0;z-index:10;display:flex;gap:8px;justify-content:center;padding:10px;background:#201608}.preview-actions button{border:0;border-radius:999px;padding:10px 16px;font-weight:800;background:#d7b264;color:#1b1207}.p146-wrap{max-width:940px;margin:0 auto;padding:12px}.p146-sheet{background:#fff;border:1px solid #bb873a;border-radius:8px;padding:10px}.p146-head{text-align:center;border-bottom:2px solid #bb873a;margin-bottom:8px;padding-bottom:6px}.p146-head img{width:54px;display:block;margin:0 auto 2px}.p146-head h1{font-size:17px;margin:0 0 3px;color:#3d270b}.p146-head p{font-size:10px;margin:0;color:#6e5c3b}.p146-table{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:5px;direction:rtl}.p146-table th{background:#5a3811;color:#fff8e8;border-radius:4px;padding:5px 2px;font-size:10px}.p146-table td{padding:0!important;vertical-align:top;border:0!important;background:transparent!important}.p146-cell,.p146-empty{height:72px;min-height:72px;border:1.6px solid #a9782f;border-radius:7px;background:#fffaf0;padding:5px;box-sizing:border-box;overflow:hidden}.p146-empty{border-color:#f0e2c8;background:#fffaf3}.p146-date{display:block;border-bottom:1px solid #d0a765;padding-bottom:2px;margin-bottom:2px;font-size:8.4px;font-weight:900;color:#3e280c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.p146-day{font-size:7.8px;line-height:1.1;color:#6a4514;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}.p146-learn{font-size:8px;line-height:1.18;color:#201608;overflow:hidden}.p146-learn div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media print{@page{size:A4 portrait;margin:8mm}.preview-actions{display:none}.p146-wrap{max-width:none;padding:0}.p146-sheet{border:0;border-radius:0;padding:0}.p146-head{margin-bottom:2mm;padding-bottom:1.4mm}.p146-head img{width:11mm}.p146-head h1{font-size:12pt}.p146-head p{font-size:6.5pt}.p146-table{border-spacing:1mm}.p146-table th{font-size:6.3pt;padding:1mm .4mm}.p146-cell,.p146-empty{height:17.5mm;min-height:17.5mm;max-height:17.5mm;border:1.25px solid #9a6d29;border-radius:3.5px;padding:1mm;background:#fffaf0}.p146-date{font-size:5.55pt;margin-bottom:.35mm;padding-bottom:.35mm}.p146-day{font-size:5.25pt}.p146-learn{font-size:5.35pt;line-height:1.08}}';}
    function html(items){var heads=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];function cell(x){return x?'<td><div class="p146-cell"><div class="p146-date">'+esc(String(x.hdate||'').replace(/\s+/g,' ').trim())+'</div>'+dayLine(x)+'<div class="p146-learn">'+lines(x.chapters)+'</div></div></td>':'<td><div class="p146-empty"></div></td>';}return '<div class="p146-sheet"><div class="p146-head"><img src="header-logo.png"><h1>לוח שנה למשניות משפחת זלצמן</h1><p>'+(items.length?esc(items[0].hdate)+' - '+esc(items[items.length-1].hdate):'')+' | '+items.length+' ימים</p></div><table class="p146-table"><thead><tr>'+heads.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'+weeks(items).map(function(w){return '<tr>'+w.map(cell).join('')+'</tr>';}).join('')+'</tbody></table></div>';}
    window.buildPrintCalendarHtml=html;
    window.openPrintPreviewPage=function(){var r=getRows();if(!r.length){if(typeof showToast==='function')showToast('לא נמצאו ימים לתצוגה');return;}var w=window.open('','_blank');if(!w){if(typeof showToast==='function')showToast('הדפדפן חסם פתיחת חלון חדש');return;}w.document.open();w.document.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>תצוגת הדפסה</title><style>'+css()+'</style></head><body><div class="preview-actions"><button onclick="window.print()">הדפס / שמור PDF</button><button onclick="window.close()">סגור</button></div><main class="p146-wrap">'+html(r)+'</main></body></html>');w.document.close();};
    window.printSelectedRange=function(){var r=getRows(),area=$('printArea');if(!r.length){if(typeof showToast==='function')showToast('לא נמצאו ימים להדפסה');return;}if(area)area.innerHTML='<style>'+css()+'</style><main class="p146-wrap">'+html(r)+'</main>';if(typeof closePrintPicker==='function')closePrintPicker();document.body.classList.add('print-mode');setTimeout(function(){window.print();},180);};
  }

  var baseShowPage=window.showPage;
  if(typeof baseShowPage==='function') window.showPage=function(){var r=baseShowPage.apply(this,arguments);setTimeout(function(){injectCss();normalizeCards();if(isMobile())renderMobileCalendar();},0);return r;};

  function setup(){injectCss();normalizeCards();printPatch();if(isMobile())renderMobileCalendar();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  window.addEventListener('load',setup);
  window.addEventListener('resize',function(){injectCss();normalizeCards();if(isMobile())renderMobileCalendar();});
})();
