(() => {
  "use strict";
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  const key = "vy-analytics-disabled";
  const config = window.SITE_CONFIG || {};
  const id = config.analyticsId || "";
  const production = location.hostname === config.analyticsHost;
  const browserOptOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1";
  function optedOut() { try { return localStorage.getItem(key) === "true"; } catch (_) { return false; } }
  let enabled = production && /^G-[A-Z0-9]+$/.test(id) && !browserOptOut && !optedOut();
  const status = document.getElementById("analytics-status");
  const toggle = document.getElementById("analytics-toggle");
  function updatePreference() {
    if (!status || !toggle) return;
    status.textContent = browserOptOut ? "Analytics is disabled by your browser’s privacy preference." : optedOut() ? "Analytics is disabled in this browser." : production ? "Analytics is enabled for this browser." : "This preview does not send analytics. Your preference will apply on the live site.";
    toggle.textContent = optedOut() ? "Enable analytics" : "Disable analytics";
    toggle.disabled = browserOptOut;
  }
  updatePreference();
  if (toggle) toggle.addEventListener("click", () => {
    const disabled = !optedOut();
    try { localStorage.setItem(key, String(disabled)); } catch (_) { status.textContent = "Your browser could not save this preference. You can disable analytics with your browser’s privacy controls."; return; }
    if (disabled) { window["ga-disable-" + id] = true; enabled = false; updatePreference(); }
    else location.reload();
  });
  if (!enabled) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  // Standard GA4 campaign attribution reads utm_* parameters on arrival.
  window.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(script);
  document.querySelectorAll("[data-track]").forEach(link => link.addEventListener("click", () => {
    window.gtag("event", link.dataset.track, { page_path: location.pathname, transport_type: "beacon" });
  }));
})();
