/* V14.5 focused fix: disable mobile accordion hiding, restore buttons, stable print. */
(function(){
  var lastActionKey = '';
  var lastActionAt = 0;

  function mobile(){ return window.matchMedia && window.matchMedia('(max-width: 680px)').matches; }
  function byId(id){ return document.getElementById(id); }
  function esc(v){
    if(typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; });
  }
  function rows(){ try{ if(typeof DATA !== 'undefined' && Array.isArray(DATA)) return DATA; if(Array.isArray(window.DATA)) return window.DATA; }catch(e){} return []; }
  function dayIndex(x){
    var d = String((x && x.day) || '');
    if(d.indexOf('ראשון') !== -1) return 0; if(d.indexOf('שני') !== -1) return 1; if(d.indexOf('שלישי') !== -1) return 2;
    if(d.indexOf('רביעי') !== -1) return 3; if(d.indexOf('חמישי') !== -1) return 4; if(d.indexOf('שישי') !== -1) return 5; if(d.indexOf('שבת') !== -1) return 6;
    var dt = new Date(String(x && x.iso || '') + 'T12:00:00'); return isNaN(dt) ? 0 : dt.getDay();
  }

  function injectCss(){
    ['v141FixesCss','v142CleanFixesCss','v143HardFixesCss','v144BugfixCss','v145NoAccordionCss'].forEach(function(id){ var n = document.getElementById(id); if(n) n.remove(); });
    var s = document.createElement('style');
    s.id = 'v145NoAccordionCss';
    s.textContent = `
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
#settingsPage .settings-boxes{display:grid!important;grid-template-columns:repeat(2,minmax(360px,1fr))!important;gap:18px!important;max-width:980px!important;margin:22px auto 0!important;align-items:stretch!important}
#settingsPage .settings-box{display:grid!important;grid-template-columns:54px minmax(0,1fr)!important;grid-auto-rows:auto!important;align-content:start!important;gap:12px 16px!important;min-height:0!important;padding:18px 20px!important;border-radius:18px!important}
#settingsPage .settings-real-icon{display:grid!important;place-items:center!important;width:50px!important;height:50px!important;border-radius:15px!important;grid-column:1!important;grid-row:1!important;background:linear-gradient(135deg,var(--gold),var(--gold2))!important;opacity:1!important;visibility:visible!important}
#settingsPage .settings-real-icon::before{content:''!important;width:24px!important;height:24px!important;display:block!important;background:#fffaf0!important;-webkit-mask:var(--settings-real-svg) center/contain no-repeat!important;mask:var(--settings-real-svg) center/contain no-repeat!important}
.settings-user-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z'/%3E%3C/svg%3E")}.settings-theme-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 2a10 10 0 1 0 0 20 8 8 0 0 1 0-20Z'/%3E%3C/svg%3E")}.settings-save-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M4 4h16v4H4V4Zm2 6h12v10H6V10Zm3 2v2h6v-2H9Z'/%3E%3C/svg%3E")}.settings-import-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M11 4h2v9l3-3 1.4 1.4L12 16.8l-5.4-5.4L8 10l3 3V4ZM5 19h14v2H5v-2Z'/%3E%3C/svg%3E")}.settings-phone-icon{--settings-real-svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm0 17H7V4h10v14Zm-6 3h2v-1h-2v1Z'/%3E%3C/svg%3E")}
#settingsPage .settings-box::before,#settingsPage .settings-box::after,#settingsPage .settings-box h4::before,#settingsPage .settings-box h4::after{display:none!important;content:none!important}
#settingsPage .settings-box h4{grid-column:2!important;grid-row:1!important;align-self:center!important;margin:0!important;font-size:20px!important;line-height:1.2!important;color:var(--gold2)!important}
#settingsPage .settings-box p,#settingsPage .settings-box .form-row,#settingsPage .settings-box .actions-row,#settingsPage .settings-box textarea,#settingsPage .settings-box>.btn,#settingsPage .settings-export-note{grid-column:1/-1!important}
#settingsPage .settings-export-note{display:block!important;visibility:visible!important;opacity:1!important;border-radius:14px!important;font-size:13px!important;line-height:1.5!important;color:var(--muted)!important}
@media(max-width:680px){
  body #actionsPage .action-tile-clean,body #settingsPage .settings-box{display:grid!important;overflow:visible!important;min-height:0!important;max-height:none!important;height:auto!important;transform:none!important;pointer-events:auto!important}
  body #actionsPage .action-tile-clean p,body #actionsPage .action-tile-clean>.btn,body #actionsPage .action-tile-clean .tile-buttons,body #actionsPage .action-tile-clean:not(.mobile-open) p,body #actionsPage .action-tile-clean:not(.mobile-open)>.btn,body #actionsPage .action-tile-clean:not(.mobile-open) .tile-buttons{display:flex!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;pointer-events:auto!important;transform:none!important}
  body #actionsPage .action-tile-clean p,body #actionsPage .action-tile-clean:not(.mobile-open) p{display:block!important}
  body #actionsPage .action-tile-clean>.btn,body #actionsPage .action-tile-clean .tile-buttons .btn{width:100%!important;min-height:44px!important;margin-top:8px!important;position:relative!important;z-index:9999!important;pointer-events:auto!important}
  body #actionsPage .action-tile-clean .tile-buttons{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;width:100%!important}
  body #settingsPage .settings-box p,body #settingsPage .settings-box .form-row,body #settingsPage .settings-box .actions-row,body #settingsPage .settings-box textarea,body #settingsPage .settings-box>.btn,body #settingsPage .settings-box .backup-box,body #settingsPage .settings-box .settings-export-note,body #settingsPage .settings-box:not(.mobile-open) p,body #settingsPage .settings-box:not(.mobile-open) .form-row,body #settingsPage .settings-box:not(.mobile-open) .actions-row,body #settingsPage .settings-box:not(.mobile-open)>textarea,body #settingsPage .settings-box:not(.mobile-open)> .btn,body #settingsPage .settings-box:not(.mobile-open) .backup-box,body #settingsPage .settings-box:not(.mobile-open) .settings-export-note{display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;height:auto!important;pointer-events:auto!important;transform:none!important}
  body #settingsPage .settings-box .form-row,body #settingsPage .settings-box:not(.mobile-open) .form-row{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
  body #settingsPage .settings-box .actions-row,body #settingsPage .settings-box:not(.mobile-open) .actions-row{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
  body #settingsPage .settings-box button,body #settingsPage .settings-box .btn,body #settingsPage .settings-box input,body #settingsPage .settings-box textarea,body #settingsPage .settings-box select{width:100%!important;min-height:44px!important;position:relative!important;z-index:9999!important;pointer-events:auto!important;touch-action:manipulation!important}
  body #settingsPage .settings-box{grid-template-columns:44px minmax(0,1fr)!important;gap:10px 12px!important;padding:14px!important;border-radius:17px!important}
  body #settingsPage .settings-real-icon{width:42px!important;height:42px!important}
}
`;
    document.head.appendChild(s);
  }

  function forceOpenCards(){
    document.querySelectorAll('#actionsPage .action-tile-clean,#settingsPage .settings-box').forEach(function(el){
      el.classList.add('mobile-open');
      el.dataset.mobileReadyFinal = '1';
      el.dataset.mobileReadyV15 = '1';
      el.style.setProperty('overflow','visible','important');
    });
  }

  function runInlineAction(el){
    var code = el.getAttribute('onclick') || '';
    var m = code.match(/^\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*;?\s*$/);
    if(m && typeof window[m[1]] === 'function'){
      var arg = m[2].trim();
      if(!arg){ window[m[1]](); return true; }
      if(/^['"][^'"]*['"]$/.test(arg)){ window[m[1]](arg.slice(1,-1)); return true; }
    }
    if(typeof el.onclick === 'function'){
      try{ el.onclick.call(el, new MouseEvent('click',{bubbles:false,cancelable:true})); return true; }catch(e){}
    }
    return false;
  }

  function hardMobileButton(e){
    if(!mobile()) return;
    forceOpenCards();
    var field = e.target.closest && e.target.closest('#settingsPage input,#settingsPage textarea,#settingsPage select');
    if(field){ e.stopPropagation(); return; }
    var btn = e.target.closest && e.target.closest('#actionsPage button,#settingsPage button');
    if(!btn) return;
    var key = (btn.getAttribute('onclick') || btn.textContent || 'button').trim();
    var now = Date.now();
    e.preventDefault();
    e.stopImmediatePropagation();
    if(lastActionKey === key && now - lastActionAt < 650) return;
    lastActionKey = key; lastActionAt = now;
    setTimeout(function(){ forceOpenCards(); runInlineAction(btn); forceOpenCards(); },0);
  }

  ['pointerup','touchend','click'].forEach(function(type){ document.addEventListener(type, hardMobileButton, {capture:true, passive:false}); });
  document.addEventListener('pointerdown', function(e){ if(mobile() && e.target.closest && e.target.closest('#actionsPage button,#settingsPage button')){ forceOpenCards(); e.stopImmediatePropagation(); } }, true);

  var baseShowPage = window.showPage;
  if(typeof baseShowPage === 'function'){
    window.showPage = function(page){ var r = baseShowPage.apply(this, arguments); setTimeout(function(){ injectCss(); forceOpenCards(); },0); return r; };
  }

  function patchPrint(){
    function getRows(){ try{ if(typeof getPrintRowsByMode === 'function') return getPrintRowsByMode(); }catch(e){} return rows().slice(); }
    function weeks(items){ if(typeof buildCalendarWeeks === 'function'){ try{return buildCalendarWeeks(items);}catch(e){} } var out=[],cur=new Array(7).fill(null); items.forEach(function(x){var i=dayIndex(x); if(cur[i]){out.push(cur);cur=new Array(7).fill(null);} cur[i]=x; if(i===6){out.push(cur);cur=new Array(7).fill(null);}}); if(cur.some(Boolean)) out.push(cur); return out; }
    function clean(t){ return String(t||'').replace(/\s*\|\s*/g,' | ').replace(/\s+/g,' ').trim(); }
    function lines(t){ var p=String(t||'').split('|').map(clean).filter(Boolean); if(!p.length)p=[clean(t)]; while(p.length<3)p.push(''); return p.slice(0,3).map(function(x){return '<div>'+esc(x)+'</div>';}).join(''); }
    function dayLine(x){ var d=String((x&&x.day)||'').trim(); var sp=['שבת','חג','פסח','שבועות','סוכות','ראש השנה','כיפור','שמחת תורה','עצרת','פורים','חנוכה'].some(function(w){return d.indexOf(w)!==-1;}); return d&&(dayIndex(x)===6||sp)?'<div class="p145-day">'+esc(d)+'</div>':''; }
    function css(){ return 'body{margin:0;background:#fff;color:#201608;font-family:Arial,system-ui,sans-serif;direction:rtl}.preview-actions{position:sticky;top:0;z-index:10;display:flex;gap:8px;justify-content:center;padding:10px;background:#201608}.preview-actions button{border:0;border-radius:999px;padding:10px 16px;font-weight:800;background:#d7b264;color:#1b1207}.wrap{max-width:940px;margin:0 auto;padding:12px}.page{background:#fff;border:1px solid #bb873a;border-radius:8px;padding:10px}.head{text-align:center;border-bottom:2px solid #bb873a;margin-bottom:8px;padding-bottom:6px}.head img{width:54px;display:block;margin:0 auto 2px}.head h1{font-size:17px;margin:0 0 3px;color:#3d270b}.head p{font-size:10px;margin:0;color:#6e5c3b}.tbl{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:5px;direction:rtl}.tbl th{background:#5a3811;color:#fff8e8;border-radius:4px;padding:5px 2px;font-size:10px}.tbl td{padding:0!important;vertical-align:top;border:0!important;background:transparent!important}.cell,.empty{height:72px;min-height:72px;border:1.6px solid #a9782f;border-radius:7px;background:#fffaf0;padding:5px;box-sizing:border-box;overflow:hidden}.empty{border-color:#f0e2c8;background:#fffaf3}.date{display:block;border-bottom:1px solid #d0a765;padding-bottom:2px;margin-bottom:2px;font-size:8.4px;font-weight:900;color:#3e280c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.p145-day{font-size:7.8px;line-height:1.1;color:#6a4514;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}.learn{font-size:8px;line-height:1.18;color:#201608;overflow:hidden}.learn div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media print{@page{size:A4 portrait;margin:8mm}.preview-actions{display:none}.wrap{max-width:none;padding:0}.page{border:0;border-radius:0;padding:0}.head{margin-bottom:2mm;padding-bottom:1.4mm}.head img{width:11mm}.head h1{font-size:12pt}.head p{font-size:6.5pt}.tbl{border-spacing:1mm}.tbl th{font-size:6.3pt;padding:1mm .4mm}.cell,.empty{height:17.5mm;min-height:17.5mm;max-height:17.5mm;border:1.25px solid #9a6d29;border-radius:3.5px;padding:1mm;background:#fffaf0}.date{font-size:5.55pt;margin-bottom:.35mm;padding-bottom:.35mm}.p145-day{font-size:5.25pt}.learn{font-size:5.35pt;line-height:1.08}}'; }
    function html(items){ var heads=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']; function cell(x){ return x?'<td><div class="cell"><div class="date">'+esc(String(x.hdate||'').replace(/\s+/g,' ').trim())+'</div>'+dayLine(x)+'<div class="learn">'+lines(x.chapters)+'</div></div></td>':'<td><div class="empty"></div></td>'; } return '<div class="page"><div class="head"><img src="header-logo.png"><h1>לוח שנה למשניות משפחת זלצמן</h1><p>'+(items.length?esc(items[0].hdate)+' - '+esc(items[items.length-1].hdate):'')+' | '+items.length+' ימים</p></div><table class="tbl"><thead><tr>'+heads.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'+weeks(items).map(function(w){return '<tr>'+w.map(cell).join('')+'</tr>';}).join('')+'</tbody></table></div>'; }
    window.buildPrintCalendarHtml = html;
    window.openPrintPreviewPage = function(){ var r=getRows(); if(!r.length){ if(typeof showToast==='function') showToast('לא נמצאו ימים לתצוגה'); return; } var w=window.open('','_blank'); if(!w){ if(typeof showToast==='function') showToast('הדפדפן חסם פתיחת חלון חדש'); return; } w.document.open(); w.document.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>תצוגת הדפסה</title><style>'+css()+'</style></head><body><div class="preview-actions"><button onclick="window.print()">הדפס / שמור PDF</button><button onclick="window.close()">סגור</button></div><main class="wrap">'+html(r)+'</main></body></html>'); w.document.close(); };
    window.printSelectedRange = function(){ var r=getRows(), area=byId('printArea'); if(!r.length){ if(typeof showToast==='function') showToast('לא נמצאו ימים להדפסה'); return; } if(area) area.innerHTML='<style>'+css()+'</style>'+html(r); if(typeof closePrintPicker==='function') closePrintPicker(); document.body.classList.add('print-mode'); setTimeout(function(){ window.print(); },180); };
  }

  function setup(){ injectCss(); forceOpenCards(); patchPrint(); setTimeout(forceOpenCards,100); setTimeout(forceOpenCards,800); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
  window.addEventListener('load', setup);
  window.addEventListener('resize', function(){ injectCss(); forceOpenCards(); });
  setInterval(function(){ if(mobile()) forceOpenCards(); }, 1200);
})();
