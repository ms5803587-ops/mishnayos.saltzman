
/* מובייל: פתיחת פעולות והגדרות כמו לשוניות קטנות */
(function(){
  function isMobile(){
    return window.matchMedia && window.matchMedia("(max-width: 680px)").matches;
  }

  function closeSiblings(item, selector){
    var parent = item.parentElement;
    if(!parent) return;
    parent.querySelectorAll(selector + ".mobile-open").forEach(function(openItem){
      if(openItem !== item) openItem.classList.remove("mobile-open");
    });
  }

  function prepareCollapsible(selector){
    document.querySelectorAll(selector).forEach(function(item){
      if(item.dataset.mobileCollapseReady === "1") return;
      item.dataset.mobileCollapseReady = "1";

      item.addEventListener("click", function(e){
        if(!isMobile()) return;

        var clickedRealControl = e.target.closest("button, a, input, select, textarea");
        var isTitleClick = !!e.target.closest("h4");

        if(clickedRealControl && !isTitleClick && item.classList.contains("mobile-open")){
          return;
        }

        if(clickedRealControl && !isTitleClick && !item.classList.contains("mobile-open")){
          e.preventDefault();
        }

        closeSiblings(item, selector);
        item.classList.toggle("mobile-open");
      });
    });
  }

  function setupMobileAppMode(){
    prepareCollapsible("#actionsPage .action-tile");
    prepareCollapsible("#actionsPage .action-tile-clean");
    prepareCollapsible("#settingsPage .settings-box");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", setupMobileAppMode);
  }else{
    setupMobileAppMode();
  }

  window.addEventListener("resize", setupMobileAppMode);
})();
