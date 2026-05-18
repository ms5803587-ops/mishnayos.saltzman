
/* תיקון סופי מובייל: לוח תאריכים אמיתי + כרטיסים נפתחים */
(function(){
  var originalRenderCalendar = window.renderCalendar;

  function isMobile(){
    return window.matchMedia && window.matchMedia("(max-width: 680px)").matches;
  }

  function esc(v){
    if(typeof escapeHtml === "function") return escapeHtml(v);
    return String(v == null ? "" : v);
  }

  function getRows(){
    var rows = [];
    try{
      if(typeof DATA !== "undefined" && Array.isArray(DATA)) rows = DATA.slice();
      else if(Array.isArray(window.DATA)) rows = window.DATA.slice();
    }catch(e){}
    var sel = document.getElementById("calendarMonthSelect");
    if(sel && sel.value){
      rows = rows.filter(function(x){
        return String((x && x.hdate) || "").indexOf(sel.value) !== -1;
      });
    }
    return rows;
  }

  function getCurrentToday(){
    try{
      if(typeof currentToday !== "undefined") return currentToday;
    }catch(e){}
    return window.currentToday || null;
  }

  function getDoneSafe(){
    try{
      if(typeof getDone === "function") return getDone();
    }catch(e){}
    return {};
  }

  function monthName(hdate){
    var h = String(hdate || "");
    var m = h.match(/(תשרי|חשוון|חשון|כסלו|טבת|שבט|אדר א|אדר ב|אדר|ניסן|אייר|סיוון|סיון|תמוז|אב|אלול)/);
    return m ? m[1] : "ללא חודש";
  }

  function dayNumber(hdate){
    var h = String(hdate || "").trim();
    var m = h.match(/^([א-ת"׳'\-]+)\s+/);
    return m ? m[1] : h;
  }

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

  function openDaySafe(idx){
    if(typeof openDay === "function") openDay(idx);
  }
  window.openDaySafeMobile = openDaySafe;

  function renderMobileCalendar(){
    var cal = document.getElementById("calendar");
    if(!cal) return;

    var rows = getRows();
    cal.classList.add("mobile-real-mini");

    if(!rows.length){
      cal.innerHTML = '<div class="panel muted">אין נתונים להצגה</div>';
      return;
    }

    var groups = {};
    rows.forEach(function(item){
      var m = monthName(item.hdate);
      if(!groups[m]) groups[m] = [];
      groups[m].push(item);
    });

    var done = getDoneSafe();
    var today = getCurrentToday();
    var heads = ["א","ב","ג","ד","ה","ו","ש"];
    var html = '<div class="mobile-real-calendar">';

    Object.keys(groups).forEach(function(month){
      var items = groups[month];
      var cells = [];
      var offset = dayIndex(items[0]);
      for(var i=0; i<offset; i++) cells.push('<div class="mobile-real-empty"></div>');

      items.forEach(function(item){
        var cls = "mobile-real-day";
        if(done && done[item.idx]) cls += " done";
        if(today && today.idx === item.idx) cls += " today";
        cells.push(
          '<button type="button" class="' + cls + '" onclick="openDaySafeMobile(' + item.idx + ')" title="' + esc((item.hdate || "") + " · " + (item.day || "")) + '">' +
          esc(dayNumber(item.hdate)) +
          '</button>'
        );
      });

      html += '<section class="mobile-real-month">';
      html += '<h3 class="mobile-real-month-title">' + esc(month) + '</h3>';
      html += '<div class="mobile-real-week-head">' + heads.map(function(h){return '<span>' + h + '</span>';}).join("") + '</div>';
      html += '<div class="mobile-real-grid">' + cells.join("") + '</div>';
      html += '</section>';
    });

    html += '</div>';
    cal.innerHTML = html;
  }

  window.renderCalendar = function(){
    if(isMobile()){
      renderMobileCalendar();
      return;
    }
    var cal = document.getElementById("calendar");
    if(cal) cal.classList.remove("mobile-real-mini");
    if(typeof originalRenderCalendar === "function") originalRenderCalendar();
  };

  function closeSiblings(item, selector){
    var parent = item.parentElement;
    if(!parent) return;
    parent.querySelectorAll(selector + ".mobile-open").forEach(function(openItem){
      if(openItem !== item) openItem.classList.remove("mobile-open");
    });
  }

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

  function setup(){
    prepareCollapsible("#actionsPage .action-tile");
    prepareCollapsible("#actionsPage .action-tile-clean");
    prepareCollapsible("#settingsPage .settings-box");
    if(isMobile()) setTimeout(renderMobileCalendar, 0);
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();

  window.addEventListener("resize", setup);
  document.addEventListener("change", function(e){
    if(e.target && e.target.id === "calendarMonthSelect") setTimeout(renderMobileCalendar, 0);
  });

  var oldShowPage = window.showPage;
  if(typeof oldShowPage === "function"){
    window.showPage = function(page){
      oldShowPage(page);
      if(page === "calendarPage" || page === "calendar") setTimeout(renderMobileCalendar, 0);
      setTimeout(setup, 0);
    };
  }
})();
