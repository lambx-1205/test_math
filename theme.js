(function () {
  "use strict";

  const STORAGE_KEY = "utility-hub-theme";
  let currentTheme = "light";

  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      currentTheme = savedTheme;
    }
  } catch (error) {
    // Theme switching remains available for this page if storage is disabled.
  }

  function applyTheme(theme) {
    currentTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", currentTheme === "dark" ? "#0d1420" : "#f5f7fb");
    }

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      const isDark = currentTheme === "dark";
      toggle.textContent = isDark ? "☀ ライト" : "☾ ダーク";
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "ライトモードに切り替える" : "ダークモードに切り替える");
      toggle.title = isDark ? "ライトモードに切り替え" : "ダークモードに切り替え";
    }
  }

  // Apply the saved mode before the page is painted to avoid a light-mode flash.
  applyTheme(currentTheme);

  document.addEventListener("DOMContentLoaded", function () {
    const host = document.querySelector(".topbar-actions") ||
      document.querySelector(".topbar") ||
      document.querySelector("header") ||
      document.body;

    if (!document.getElementById("theme-toggle")) {
      const toggle = document.createElement("button");
      toggle.id = "theme-toggle";
      toggle.className = "theme-toggle";
      toggle.type = "button";
      toggle.addEventListener("click", function () {
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        try {
          localStorage.setItem(STORAGE_KEY, nextTheme);
        } catch (error) {
          // The current page still changes theme even if preferences cannot be saved.
        }
        window.dispatchEvent(new CustomEvent("utilityhubthemechange", {
          detail: { theme: nextTheme }
        }));
      });
      host.appendChild(toggle);
    }

    applyTheme(currentTheme);
  });

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue === "dark" || event.newValue === "light") {
      applyTheme(event.newValue);
    }
  });
})();