(function () {
  if (window.QuantalogEmbed) {
    window.QuantalogEmbed.scan();
    return;
  }

  var script = document.currentScript;
  var origin = script && script.src ? new URL(script.src).origin : window.location.origin;
  var frames = [];
  var TOKEN = /^em_[0-9A-Za-z]{32}$/;

  function mount(el) {
    if (el.getAttribute("data-quantalog-mounted")) return;
    var token = el.getAttribute("data-quantalog-embed") || "";
    if (!TOKEN.test(token)) return;
    el.setAttribute("data-quantalog-mounted", "1");

    var iframe = document.createElement("iframe");
    iframe.src = origin + "/embed/" + token;
    iframe.title = el.getAttribute("data-title") || "Analytics widget";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", "no");
    iframe.style.cssText =
      "display:block;width:100%;height:" +
      (parseInt(el.getAttribute("data-height"), 10) || 320) +
      "px;border:0;border-radius:16px;overflow:hidden;background:transparent;color-scheme:normal";
    el.appendChild(iframe);
    frames.push(iframe);
  }

  function scan() {
    var nodes = document.querySelectorAll("[data-quantalog-embed]");
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== origin) return;
    var data = event.data;
    if (!data || data.type !== "quantalog:embed-height" || typeof data.height !== "number") return;
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === event.source) {
        frames[i].style.height = Math.min(Math.max(Math.ceil(data.height), 60), 2000) + "px";
      }
    }
  });

  window.QuantalogEmbed = { scan: scan };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
  else scan();
})();
