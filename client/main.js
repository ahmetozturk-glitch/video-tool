const navItems = [
  { id: "home", label: "Home" },
  { id: "presets", label: "Preset Gallery" },
  { id: "asset", label: "Asset Animator" },
  { id: "legal", label: "Text & Legal" },
  { id: "render", label: "Render Manager" },
  { id: "updates", label: "Updates" },
  { id: "settings", label: "Settings" },
];

const presetData = [
  { name: "Headline Pop In", category: "text", duration: "0.5s" },
  { name: "Typewriter Reveal", category: "text", duration: "1.2s" },
  { name: "CTA Bounce", category: "button", duration: "0.6s" },
  { name: "Legal Crawl Base", category: "legal", duration: "8.0s" },
  { name: "Logo Soft Reveal", category: "logo", duration: "1.0s" },
  { name: "Price Flash", category: "text", duration: "0.4s" },
];

const navRoot = document.getElementById("nav");
const screenRoot = document.getElementById("screenRoot");
const screenTitle = document.getElementById("screenTitle");
const syncStatus = document.getElementById("syncStatus");
const checkUpdatesBtn = document.getElementById("checkUpdatesBtn");
const activeCompEl = document.getElementById("activeComp");
const selectedLayerEl = document.getElementById("selectedLayer");
const refreshContextBtn = document.getElementById("refreshContextBtn");

let activeScreen = "home";

function hasCep() {
  return typeof window.__adobe_cep__ !== "undefined";
}

function evalHost(scriptCall, callback) {
  if (!hasCep()) {
    callback && callback("CEP mevcut degil (browser preview mode)");
    return;
  }
  window.__adobe_cep__.evalScript(scriptCall, function (result) {
    callback && callback(result);
  });
}

function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function renderNav() {
  navRoot.innerHTML = navItems
    .map(
      (item) => `
      <button class="nav-item ${activeScreen === item.id ? "active" : ""}" data-screen="${item.id}">
        ${item.label}
      </button>
    `
    )
    .join("");
}

function mountTemplate(id) {
  const tpl = document.getElementById(id);
  screenRoot.innerHTML = "";
  screenRoot.appendChild(tpl.content.cloneNode(true));
}

function updateTitle() {
  const item = navItems.find((x) => x.id === activeScreen);
  screenTitle.textContent = item ? item.label : "Home";
}

function renderPresets(filter = "all") {
  const presetList = document.getElementById("presetList");
  if (!presetList) return;

  const filtered =
    filter === "all"
      ? presetData
      : presetData.filter((preset) => preset.category === filter);

  presetList.innerHTML = filtered
    .map(
      (preset) => `
      <article class="preset-card">
        <h4>${preset.name}</h4>
        <p class="preset-meta">${preset.category.toUpperCase()} | ${preset.duration}</p>
        <button class="btn btn-small" data-apply-preset="${preset.name}">Apply</button>
      </article>
    `
    )
    .join("");
}

function refreshContext() {
  evalHost("aett_getContext()", (result) => {
    try {
      const parsed = JSON.parse(result);
      activeCompEl.textContent = parsed.comp || "-";
      selectedLayerEl.textContent = parsed.layer || "-";
    } catch (_err) {
      activeCompEl.textContent = "Browser Preview";
      selectedLayerEl.textContent = "Host bagli degil";
    }
  });
}

function bindScreenEvents() {
  const presetFilter = document.getElementById("presetFilter");
  if (presetFilter) {
    renderPresets();
    presetFilter.addEventListener("change", (event) => {
      renderPresets(event.target.value);
    });
  }

  screenRoot.querySelectorAll("[data-apply-preset]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const name = event.currentTarget.getAttribute("data-apply-preset");
      evalHost(`aett_applyTextPreset("${esc(name)}")`, (result) => {
        syncStatus.textContent = result || `Preset uygulandi: ${name}`;
        refreshContext();
      });
    });
  });

  const applyAssetAnim = document.getElementById("applyAssetAnim");
  if (applyAssetAnim) {
    applyAssetAnim.addEventListener("click", () => {
      const motion = document.getElementById("assetMotion").value;
      const duration = Number(document.getElementById("assetDuration").value || 0.6);
      const anchor = document.getElementById("autoAnchor").checked;
      const fit = document.getElementById("autoFit").checked;
      evalHost(
        `aett_applyAssetAnimation("${esc(motion)}", ${duration}, ${anchor}, ${fit})`,
        (result) => {
          document.getElementById("assetResult").textContent = result;
          refreshContext();
        }
      );
    });
  }

  const generateLegal = document.getElementById("generateLegal");
  if (generateLegal) {
    generateLegal.addEventListener("click", () => {
      const input = document.getElementById("legalInput").value.trim();
      const direction = document.getElementById("legalDirection").value;
      const speed = Number(document.getElementById("legalSpeed").value || 110);
      const safeAreaOk = input.length <= 240;
      const checks = document.getElementById("legalChecks");

      checks.innerHTML = `
        <li>Karakter limiti: ${input.length} (${safeAreaOk ? "uygun" : "uzun"})</li>
        <li>Safe area: ${safeAreaOk ? "uygun" : "kontrol gerekli"}</li>
        <li>Satir temizligi: tamamlandi</li>
      `;

      evalHost(
        `aett_generateLegalCrawl("${esc(input)}", "${esc(direction)}", ${speed})`,
        (result) => {
          document.getElementById("legalResult").textContent = result;
          refreshContext();
        }
      );
    });
  }

  const queueRender = document.getElementById("queueRender");
  if (queueRender) {
    queueRender.addEventListener("click", () => {
      const profile = document.getElementById("renderProfile").value;
      const naming = document.getElementById("renderName").value;
      evalHost(`aett_queueRender("${esc(profile)}", "${esc(naming)}")`, (result) => {
        document.getElementById("renderResult").textContent = result;
      });
    });
  }

  const updateNow = document.getElementById("updateNow");
  if (updateNow) {
    updateNow.addEventListener("click", () => {
      document.getElementById("currentVersion").textContent = "1.1.0";
      document.getElementById("updateResult").textContent = "Guncelleme tamamlandi (demo).";
      syncStatus.textContent = "Sync: guncel (1.1.0)";
    });
  }

  const rollback = document.getElementById("rollback");
  if (rollback) {
    rollback.addEventListener("click", () => {
      document.getElementById("currentVersion").textContent = "1.0.0";
      document.getElementById("updateResult").textContent = "Rollback yapildi (demo).";
      syncStatus.textContent = "Sync: rollback 1.0.0";
    });
  }

  screenRoot.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      if (action === "go-presets") setScreen("presets");
      if (action === "go-asset") setScreen("asset");
      if (action === "go-legal") setScreen("legal");
      if (action === "go-render") setScreen("render");
    });
  });
}

function renderScreen() {
  if (activeScreen === "home") mountTemplate("homeTemplate");
  if (activeScreen === "presets") mountTemplate("presetTemplate");
  if (activeScreen === "asset") mountTemplate("assetTemplate");
  if (activeScreen === "legal") mountTemplate("legalTemplate");
  if (activeScreen === "render") mountTemplate("renderTemplate");
  if (activeScreen === "updates") mountTemplate("updateTemplate");
  if (activeScreen === "settings") mountTemplate("settingsTemplate");

  bindScreenEvents();
}

function setScreen(screenId) {
  activeScreen = screenId;
  renderNav();
  updateTitle();
  renderScreen();
}

navRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-screen]");
  if (!button) return;
  setScreen(button.getAttribute("data-screen"));
});

checkUpdatesBtn.addEventListener("click", () => {
  syncStatus.textContent = "Sync: yeni surum bulundu (1.1.0 demo)";
  if (activeScreen !== "updates") setScreen("updates");
});

if (refreshContextBtn) {
  refreshContextBtn.addEventListener("click", refreshContext);
}

renderNav();
updateTitle();
renderScreen();
refreshContext();
