/**
 * サイト用共通スクリプト（jQuery と LazyLoad は CDN で読み込み）
 * index.html で config.js → jQuery → LazyLoad → common.js の順で読み込むこと
 */
(function () {
  "use strict";

  // ハンバーガー・Splide矢印は jQuery に依存せず常に vanilla JS で登録（クリックが効かなくなる不具合を防止）
  function initHamburger() {
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest(".hamberger");
      if (!btn) return;
      e.preventDefault();
      var body = document.body;
      btn.classList.toggle("active");
      body.classList.toggle("layerOn");
      if (body.classList.contains("layerOn")) {
        var scrollY = window.scrollY || window.pageYOffset;
        body.setAttribute("data-position", String(scrollY));
        body.style.position = "fixed";
        body.style.top = "-" + scrollY + "px";
        body.style.left = "0";
        body.style.width = "100%";
        body.style.height = document.documentElement.scrollHeight + "px";
        body.style.zIndex = "-1";
        body.style.touchAction = "none";
      } else {
        var pos = parseInt(body.getAttribute("data-position") || "0", 10);
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.width = "";
        body.style.height = "";
        body.style.zIndex = "";
        body.style.touchAction = "";
        window.scrollTo(0, pos);
      }
    });
  }
  function initSplideArrows() {
    if (typeof Splide === "undefined") return;
    var el = document.querySelector(".archive_list.splide.js-archivement");
    if (!el || el.classList.contains("is-initialized")) return;
    var splide = new Splide(el, {
      type: "loop",
      perPage: 1,
      perMove: 1,
      autoWidth: true,
      speed: 1000,
      gap: "40px",
      pagination: false,
      arrows: false,
      breakpoints: { 1000: { autoWidth: false, gap: "10px" } }
    }).mount();
    var prev = el.querySelector(".splide__arrow--prev");
    var next = el.querySelector(".splide__arrow--next");
    if (prev) prev.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); splide.go("-1"); });
    if (next) next.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); splide.go("+1"); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initHamburger();
      initSplideArrows();
      setTimeout(initSplideArrows, 150);
    });
  } else {
    initHamburger();
    initSplideArrows();
    setTimeout(initSplideArrows, 150);
  }
  window.addEventListener("load", function () { initSplideArrows(); });

  if (typeof window.jQuery === "undefined") {
    function addFadeUpInView() {
      var winH = window.innerHeight;
      var margin = 150;
      document.querySelectorAll(".c-fadeUp").forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < winH + margin) {
          el.classList.add("c-is-fadeUp");
        } else {
          el.classList.remove("c-is-fadeUp");
        }
      });
    }
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(addFadeUpInView, 200);
    });
    window.addEventListener("load", function () {
      setTimeout(addFadeUpInView, 0);
      setTimeout(addFadeUpInView, 200);
    });
    window.addEventListener("scroll", addFadeUpInView);
    return;
  }

  var $ = window.jQuery;
  var lazyloadInstance;

  function handleClickToTop() {
    $('[rel~="js-to-top"]').on("click", function () {
      $("html, body").stop().animate({ scrollTop: 0 }, 800, "swing");
    });
  }

  function handleGoogleFontLoader() {
    if (typeof JS_APP_URL === "undefined") return;
    window.WebFontConfig = {
      google: {
        display: "swap",
        families: ["Zen+Kaku+Gothic+New:400,500,700", "Jost:300,400,500,600,700", "Montserrat:300,400"]
      },
      active: function () {
        try { sessionStorage.fontsLoaded = true; } catch (e) {}
      }
    };
    var script = document.createElement("script");
    script.src = JS_APP_URL + "wp/wp-content/themes/wp-templ/assets/js/lib/webfont.min.js";
    script.async = true;
    script.defer = true;
    var first = document.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(script, first);
  }

  function handleAntiSpamMailContact() {
    if ($("#mailContact").length) {
      var mail = "info@sinmido.com";
      $("#mailContact").attr("href", "mailto:" + mail).text(mail);
    }
  }

  function handleLazy(callback) {
    document.querySelectorAll('[rel*="js-lazy"][data-bgpc]').forEach(function (el) {
      var bg = el.getAttribute("data-bgpc");
      if (window.innerWidth < 768) bg = el.getAttribute("data-bgsp") || bg;
      if (bg) el.setAttribute("data-bg", bg);
      if (el.hasAttribute("data-ll-status")) el.removeAttribute("data-ll-status");
    });
    if (typeof callback === "function") callback();
  }

  function handleAnchor(animated) {
    var offset = $(window).width() < 768 ? 60 : 86;
    var hash = location.hash;
    if (!hash || hash === "#noback") return;
    var target = $(hash);
    if (!target.length) return;
    var top = target.offset().top - offset;
    if (animated) {
      $("html, body").stop().animate({ scrollTop: top }, 800);
    } else {
      setTimeout(function () {
        $("html, body").scrollTop(top);
      }, 1);
    }
  }

  // 外部リンクに rel / target 付与
  $(function () {
    $('a:not(.custom_blank)')
      .filter('[href^="http"], [href^="//"]')
      .not('[href*="' + window.location.host + '"]')
      .attr("rel", "noopener nofollow")
      .not(".is-trusted")
      .attr("target", "_blank");
  });

  function initLazyLoad() {
    handleLazy(function () {
      if (typeof LazyLoad !== "undefined" && !lazyloadInstance) {
        lazyloadInstance = new LazyLoad({
          unobserve_entered: true,
          elements_selector: '[rel*="js-lazy"][data-src]',
          data_src: "src",
          data_srcset: "srcset",
          data_bg: "bg",
          threshold: 300
        });
      }
      // src がすでに設定されている img（data: 以外）は .loaded を付与して表示
      $('img[rel*="js-lazy"][src]').each(function () {
        var s = $(this).attr("src") || "";
        if (s.indexOf("data:") !== 0) {
          $(this).addClass("loaded");
        }
      });
    });
  }

  window.addEventListener("resize", function () {
    handleLazy(function () {
      if (lazyloadInstance && lazyloadInstance.update) lazyloadInstance.update();
    });
  });

  // アンカーリンク スムーススクロール
  $(window).on("load resize", function () {
    $('a[href^="#"]:not([href="#"])').on("click", function (e) {
      e.preventDefault();
      var offset = $(window).width() < 768 ? 60 : 86;
      var target = $(this.hash);
      if (!target.length) return;
      var top = target.offset().top - offset;
      $("html, body").stop().animate({ scrollTop: top }, 800);
    });
  });

  // スクロール: fixHeader
  function runScrollLoad() {
    if ($(window).scrollTop() > 100) {
      $("body").addClass("fixHeader");
    } else {
      $("body").removeClass("fixHeader");
    }
  }
  $(window).on("scroll load", runScrollLoad);

  // c-fadeUp: 表示域に入ったら c-is-fadeUp を付与、画面より上に出たら外す（上に戻って再度スクロールでアニメーション再発火）
  function applyFadeUpInView() {
    var winH = window.innerHeight;
    var margin = 150;
    document.querySelectorAll(".c-fadeUp").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < winH + margin) {
        el.classList.add("c-is-fadeUp");
      } else {
        el.classList.remove("c-is-fadeUp");
      }
    });
  }

  $(window).on("scroll", function () {
    applyFadeUpInView();
  });

  $(function () {
    initLazyLoad();
    handleClickToTop();
    var isReload = (window.performance.navigation && window.performance.navigation.type === 1) ||
      (window.performance.getEntriesByType && window.performance.getEntriesByType("navigation").some(function (e) { return e.type === "reload"; }));
    handleAnchor(isReload);
    handleGoogleFontLoader();
    handleAntiSpamMailContact();
    runScrollLoad();
    // 初回は遅延付与で transition を確実に発火させる
    setTimeout(applyFadeUpInView, 100);
    setTimeout(applyFadeUpInView, 300);
    setTimeout(applyFadeUpInView, 600);
  });
  window.addEventListener("load", function () {
    setTimeout(applyFadeUpInView, 0);
    setTimeout(applyFadeUpInView, 200);
  });

  // --vh と ヘッダー .header_other
  (function () {
    var headerH = 0;
    var vh = $(window).innerHeight() - headerH;
    if ($(window).width() < 1024) vh = $(window).innerHeight() - headerH;
    document.documentElement.style.setProperty("--vh", vh + "px");
  })();

  $(window).on("scroll", function () {
    if (!$(".c-scroll-to-change-header").length) return;
    var w = $(window).width();
    var offset = w > 767 ? 86 : 60;
    var trigger = $(".c-scroll-to-change-header").offset().top - offset;
    if ($(window).scrollTop() > trigger) {
      $("header").addClass("header_other");
    } else {
      $("header").removeClass("header_other");
    }
  });

})();
