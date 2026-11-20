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

  function applyCodeMirrorTheme() {
    const isDark = currentTheme === "dark";
    const editorHost = document.querySelector(".source-editor");
    const surfaces = editorHost
      ? [editorHost, ...editorHost.querySelectorAll(".cm-editor, .cm-scroller, .cm-content, .cm-line, .cm-gutters, .cm-gutterElement")]
      : [];
    const surfaceBackground = isDark ? "#111c2b" : "";
    const surfaceColor = isDark ? "#e3eaf7" : "";
    const gutterBackground = isDark ? "#172438" : "";
    const gutterColor = isDark ? "#8493aa" : "";

    surfaces.forEach(function (element) {
      const isGutter = element.classList.contains("cm-gutters") ||
        element.classList.contains("cm-gutterElement");
      element.style.setProperty(
        "background-color",
        isGutter ? gutterBackground : surfaceBackground,
        "important"
      );
      element.style.setProperty(
        "color",
        isGutter ? gutterColor : surfaceColor,
        "important"
      );
      if (element.classList.contains("cm-gutters")) {
        element.style.setProperty("border-right-color", isDark ? "#34445c" : "", "important");
      }
    });

    const fallbackEditor = document.getElementById("source");
    if (fallbackEditor) {
      fallbackEditor.style.setProperty("background-color", surfaceBackground, "important");
      fallbackEditor.style.setProperty("color", surfaceColor, "important");
      fallbackEditor.style.setProperty("border-color", isDark ? "#3a4960" : "", "important");
    }
  }

  function applyTheme(theme) {
    currentTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    applyCodeMirrorTheme();

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

    // CodeMirror is loaded asynchronously on the LaTeX page. Reapply the
    // theme whenever its editor DOM is mounted or replaced.
    const editorHost = document.querySelector(".source-editor");
    if (editorHost && typeof MutationObserver === "function") {
      const editorObserver = new MutationObserver(function () {
        applyCodeMirrorTheme();
      });
      editorObserver.observe(editorHost, { childList: true, subtree: true });
    }
    applyCodeMirrorTheme();

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