/* Mobile UX layer: compact calendar, month accordion, and long-press marking. */
(function(){
  var originalRenderCalendar = window.renderCalendar;
  var longPressTimer = null;
  var longPressFired = false;
  var longPressTarget = null;

  function isMobile(){
    return window.matchMedia && window.matchMedia("(max-width: 680px)").matches;
  }

  function esc(v){
    if(typeof escapeHtml === "function") return escapeHtml(v);
    return String(v == null ? "" : v).replace(/[&<>"']/g, function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];
    });
  }

  function allRows(){
    try{
      if(typeof DATA !== "undefined" && Array.isArray(DATA)) return DATA.slice();
      if(Array.isArray(window.DATA)) return window.DATA.slice();
    }catch(e){}
    return [];
  }

  function getDoneSafe(){
    try{
      if(typeof getDone === "function") return getDone();
    }catch(e){}
    return {};
  }

  function getCurrentToday(){
    try{
      if(typeof currentToday !== "undefined") return currentToday;
    }catch(e){}
    return window.currentToday || null;
  }

  function monthName(hdate){
    try{
      if(typeof hebrewMonth === "function") return hebrewMonth(hdate) || "ללא חודש";
    }catch(e){}
    var h = String(hdate || "");
    var m = h.match(/(תשרי|חשוון|חשון|כסלו|טבת|שבט|אדר א|אדר ב|אדר|ניסן|אייר|סיוון|סיון|תמוז|אב|אלול)/);
    return m ? m[1] : "ללא חודש";
  }

  function dayNumber(hdate){
    var h = String(hdate || "").trim();
    if(h) return h.split(/\s+/)[0] || h;
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

  function getRows(){
    var rows = allRows();
    var sel = document.getElementById("calendarMonthSelect");
    var search = document.getElementById("search");
    var onlyUndone = document.getElementById("onlyUndoneFilter");
    var done = getDoneSafe();
    var monthValue = sel && sel.value ? sel.value : "all";
    var q = search && search.value ? search.value.trim() : "";

    return rows.filter(function(x){
      var monthOk = monthValue === "all" || monthName(x && x.hdate) === monthValue;
      var textOk = !q || String([x && x.idx, x && x.iso, x && x.hdate, x && x.day, x && x.chapters].join(" ")).indexOf(q) !== -1;
      var undoneOk = !(onlyUndone && onlyUndone.checked) || !done[x.idx];
      return monthOk && textOk && undoneOk;
    });
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
      cal.innerHTML = '<div class="calendar-empty-state">לא נמצאו ימים להצגה</div>';
      return;
    }

    var groups = {};
    rows.forEach(function(item){
      var m = monthName(item.hdate);
      if(!groups[m]) groups[m] = [];
      groups[m].push(item);
    });

    var keys = Object.keys(groups);
    var sel = document.getElementById("calendarMonthSelect");
    var today = getCurrentToday();
    var openMonth = window.__mobileOpenMonth;
    if(sel && sel.value && sel.value !== "all") openMonth = sel.value;
    if(!openMonth && today) openMonth = monthName(today.hdate);
    if(keys.indexOf(openMonth) === -1) openMonth = keys[0];
    window.__mobileOpenMonth = openMonth;

    var done = getDoneSafe();
    var heads = ["א","ב","ג","ד","ה","ו","ש"];
    var html = '<div class="mobile-longpress-hint">לחיצה פותחת יום. לחיצה ארוכה מסמנת כנלמד.</div>';
    html += '<div class="mobile-real-calendar">';
    html += '<button type="button" class="mobile-board-arrow mobile-board-prev" aria-label="חודש קודם" onclick="mobileCalendarMonthStep(-1)">‹</button>';
    html += '<button type="button" class="mobile-board-arrow mobile-board-next" aria-label="חודש הבא" onclick="mobileCalendarMonthStep(1)">›</button>';

    [openMonth].forEach(function(month){
      var items = groups[month];
      if(!items) return;
      var cells = [];
      var offset = dayIndex(items[0]);
      var isOpen = month === openMonth;
      for(var i=0; i<offset; i++) cells.push('<div class="mobile-real-empty"></div>');

      items.forEach(function(item){
        var cls = "mobile-real-day";
        if(done && done[item.idx]) cls += " done";
        if(today && today.idx === item.idx) cls += " today";
        cells.push(
          '<button type="button" class="' + cls + '" data-day-idx="' + item.idx + '" title="' + esc((item.hdate || "") + " · " + (item.day || "")) + '">' +
          esc(dayNumber(item.hdate)) +
          '</button>'
        );
      });

      var monthDone = items.filter(function(item){ return done && done[item.idx]; }).length;
      html += '<section class="mobile-real-month ' + (isOpen ? "mobile-month-open" : "") + '" data-mobile-month="' + esc(month) + '">';
      html += '<button type="button" class="mobile-real-month-title" data-mobile-month-title="' + esc(month) + '">' +
        '<span class="mobile-month-name">' + esc(month) + '</span>' +
        '<span class="mobile-month-meta">' + monthDone + '/' + items.length + '</span>' +
        '</button>';
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

  function bindMobileCalendarGestures(){
    if(window.__mobileCalendarGesturesBound) return;
    window.__mobileCalendarGesturesBound = true;

    document.addEventListener("click", function(e){
      var title = e.target.closest && e.target.closest(".mobile-real-month-title");
      if(title && isMobile()){
        window.__mobileOpenMonth = title.getAttribute("data-mobile-month-title");
        renderMobileCalendar();
        return;
      }

      var day = e.target.closest && e.target.closest(".mobile-real-day");
      if(day && isMobile()){
        if(longPressFired){
          e.preventDefault();
          e.stopPropagation();
          longPressFired = false;
          return;
        }
        openDaySafe(Number(day.getAttribute("data-day-idx")));
      }
    }, true);

    document.addEventListener("pointerdown", function(e){
      var day = e.target.closest && e.target.closest(".mobile-real-day");
      if(!day || !isMobile()) return;
      longPressFired = false;
      longPressTarget = day;
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(function(){
        if(!longPressTarget) return;
        longPressFired = true;
        var idx = Number(longPressTarget.getAttribute("data-day-idx"));
        if(typeof toggleDone === "function") toggleDone(idx);
      }, 560);
    }, true);

    ["pointerup","pointercancel","pointerleave"].forEach(function(type){
      document.addEventListener(type, function(){
        clearTimeout(longPressTimer);
        longPressTarget = null;
      }, true);
    });
  }

  function bindMobileMapLongPressInfo(){
    if(window.__mobileMapLongPressFinalBound) return;
    window.__mobileMapLongPressFinalBound = true;
    var timer = null;
    var shown = false;
    var tip = null;

    function escapeText(v){
      return String(v == null ? "" : v).replace(/[&<>"']/g, function(m){
        return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m];
      });
    }

    function hideTip(){
      if(tip && tip.parentNode) tip.parentNode.removeChild(tip);
      tip = null;
    }

    function showTip(dot){
      var text = dot.getAttribute("data-tip") || "";
      if(!text || !isMobile()) return;
      hideTip();
      var rect = dot.getBoundingClientRect();
      tip = document.createElement("div");
      tip.className = "map-mobile-tip";
      tip.innerHTML = "<b>פרטי היום</b>" + escapeText(text);
      document.body.appendChild(tip);
      var margin = 10;
      var tipRect = tip.getBoundingClientRect();
      var left = rect.left + rect.width / 2 - tipRect.width / 2;
      var top = rect.top - tipRect.height - 10;
      if(left < margin) left = margin;
      if(left + tipRect.width + margin > window.innerWidth) left = window.innerWidth - tipRect.width - margin;
      if(top < margin) top = rect.bottom + 10;
      if(top + tipRect.height + margin > window.innerHeight) top = window.innerHeight - tipRect.height - margin;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
      shown = true;
      setTimeout(hideTip, 3600);
    }

    document.addEventListener("pointerdown", function(e){
      var dot = e.target.closest && e.target.closest(".year-map .dot:not(.dot-empty)");
      if(!dot || !isMobile()) return;
      shown = false;
      clearTimeout(timer);
      timer = setTimeout(function(){ showTip(dot); }, 620);
    }, true);

    ["pointerup","pointercancel","pointerleave"].forEach(function(type){
      document.addEventListener(type, function(){ clearTimeout(timer); }, true);
    });

    document.addEventListener("click", function(e){
      var dot = e.target.closest && e.target.closest(".year-map .dot:not(.dot-empty)");
      if(dot && isMobile() && shown){
        e.preventDefault();
        e.stopPropagation();
        shown = false;
      }
    }, true);
  }

  function setup(){
    prepareCollapsible("#actionsPage .action-tile");
    prepareCollapsible("#actionsPage .action-tile-clean");
    prepareCollapsible("#settingsPage .settings-box");
    bindMobileCalendarGestures();
    bindMobileMapLongPressInfo();
    if(isMobile()){
      var side = document.querySelector(".home-side");
      if(side && !side.dataset.mobileDefaultCollapsed){
        side.dataset.mobileDefaultCollapsed = "1";
        side.classList.add("map-collapsed");
      }
      setTimeout(renderMobileCalendar, 0);
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();

  window.addEventListener("resize", setup);
  document.addEventListener("change", function(e){
    if(e.target && e.target.id === "calendarMonthSelect") setTimeout(function(){
      if(typeof window.renderCalendar === "function") window.renderCalendar();
    }, 0);
  });

  var oldShowPage = window.showPage;
  if(typeof oldShowPage === "function"){
    window.showPage = function(page){
      oldShowPage(page);
      if(page === "calendarPage" || page === "calendar") setTimeout(function(){
        if(typeof window.renderCalendar === "function") window.renderCalendar();
      }, 0);
      setTimeout(setup, 0);
    };
  }
})();
