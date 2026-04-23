export const SearchModule = {
  state: {
    lastResults: [],
  },

  init() {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const suggestions = document.getElementById("searchSuggestions");

    if (!searchForm || !searchInput || !suggestions) return;

    // --- 1. Autocomplete Logic (Show suggestions as you type) ---
    let debounceTimer;
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      clearTimeout(debounceTimer);

      if (query.length < 2) {
        suggestions.classList.add("hidden");
        return;
      }

      debounceTimer = setTimeout(async () => {
        const res = await API_Ops.searchDrug(query);
        if (res.status === "success" && res.data.results.length > 0) {
          this.renderSuggestions(res.data.results, suggestions, searchInput);
        } else {
          suggestions.classList.add("hidden");
        }
      }, 400);
    });

    // --- 2. Main Search Submit Logic ---
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.executeSearch(searchInput.value.trim());
      suggestions.classList.add("hidden");
    });

    // Close suggestions if clicking outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.add("hidden");
      }
    });
  },

  renderSuggestions(results, container, input) {
    container.innerHTML = "";
    container.classList.remove("hidden");

    results.forEach((drug) => {
      const div = document.createElement("div");
      div.style.cssText =
        "padding:12px 16px; cursor:pointer; border-bottom:1px solid #f3f4f6; font-size:14px; transition: background 0.2s;";
      div.innerHTML = `<strong>${drug.brand_name}</strong> <span style="color:#6b7280;">— ${drug.generic_name}</span>`;

      div.addEventListener("mouseenter", () => (div.style.background = "#f9fafb"));
      div.addEventListener("mouseleave", () => (div.style.background = "white"));

      div.addEventListener("click", () => {
        input.value = drug.brand_name;
        container.classList.add("hidden");
        this.executeSearch(drug.brand_name);
      });
      container.appendChild(div);
    });
  },

  async executeSearch(query) {
    const container = document.getElementById("searchResults");
    if (!container) return;

    this.toggleLoader(true);
    container.innerHTML = '<div class="placeholder-text">Searching databases...</div>';

    try {
      // Fetch both simultaneously
      const [apiRes, invRes] = await Promise.all([
        API_Ops.searchDrug(query),
        fetch(`DB_Ops.php?action=get_all_medicines&search=${encodeURIComponent(query)}`).then((r) => r.json()),
      ]);
      
      this.renderResults(apiRes, invRes, query);
    } catch (error) {
      console.error("Search execution failed:", error);
      container.innerHTML = `<div class="error-text">Search failed. Please check your connection and try again.</div>`;
    } finally {
      this.toggleLoader(false);
    }
  },

  toggleLoader(isLoading) {
    const btn = document.getElementById("searchBtn");
    if (!btn) return;
    const loader = btn.querySelector(".loader");
    const btnText = btn.querySelector(".btn-text");
    if (loader) loader.classList.toggle("hidden", !isLoading);
    if (btnText) btnText.classList.toggle("hidden", isLoading);
    btn.disabled = isLoading;
  },

  normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/\s+(mg|ml|g|mcg|tablet|capsule|tabs|caps)\b/gi, "")
      .replace(/[^a-z0-9 ]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  renderResults(apiRes, invRes, query) {
    const container = document.getElementById("searchResults");
    container.innerHTML = "";

    if (
      (apiRes.status === "error" && /authentication required/i.test(apiRes.message || "")) ||
      (invRes.success === false && /authentication required/i.test(invRes.error || ""))
    ) {
      container.innerHTML = '<div class="error-text">Please login as Customer or Pharmacy to search drugs.</div>';
      return;
    }
    
    // Store results in state for access by addToInventory
    this.state.lastResults = (apiRes.status === "success" && apiRes.data) ? apiRes.data.results : [];
    const localItems = (invRes.success && Array.isArray(invRes.data)) ? invRes.data : [];

    if (this.state.lastResults.length === 0) {
      container.innerHTML = `<div class="error-text">No matches found for "${query}" in international database.</div>`;
      return;
    }

    this.state.lastResults.forEach((drug, index) => {
      const apiBrand = this.normalize(drug.brand_name);
      const apiGeneric = this.normalize(drug.generic_name);
      const apiATC = (drug.atc_code || "").toLowerCase().trim();

      const localMatch = localItems.find((local) => {
        const localName = this.normalize(local.medicine_name);
        const localGeneric = this.normalize(local.generic_name);
        const localATC = (local.atc_code || "").toLowerCase().trim();

        if (apiATC && localATC && apiATC !== "n/a" && apiATC === localATC) return true;
        if (apiBrand === localName && apiGeneric === localGeneric) return true;
        if (apiBrand === localName && apiBrand.length > 3) return true;
        return false;
      });

      const card = document.createElement("div");
      card.className = "result-card";

      if (localMatch) {
        const stock = parseInt(localMatch.stock || 0);
        card.innerHTML = `
            <div class="result-info">
                <div class="result-details">
                    <h3>${drug.brand_name} <span class="status-badge in-stock">- ${stock} in stock</span></h3>
                    <p><strong>Generic:</strong> ${drug.generic_name}</p>
                    <p style="font-size:13px; color:#6b7280; margin-top:5px;">${this.getPurpose(drug)}</p>
                </div>
            </div>
            <div class="result-meta">
                <div class="result-price">EGP ${parseFloat(localMatch.price).toFixed(2)}</div>
                <div class="result-tag">In Inventory</div>
            </div>
        `;
      } else {
        card.innerHTML = `
            <div class="result-info">
                <div class="result-details">
                    <h3>${drug.brand_name} <span class="status-badge available">- Available in DB</span></h3>
                    <p><strong>Generic:</strong> ${drug.generic_name}</p>
                    <p style="font-size:13px; color:#6b7280; margin-top:5px;">${this.getPurpose(drug)}</p>
                </div>
            </div>
            <div class="result-meta">
                <button class="btn-primary btn-sm" onclick="SearchModule.addToInventory(${index})">
                    Add to Inventory
                </button>
            </div>
        `;
      }
      container.appendChild(card);
    });
  },

  getPurpose(drug) {
    return (drug.purpose && drug.purpose !== "N/A")
      ? drug.purpose
      : (drug.indications && drug.indications !== "N/A")
        ? drug.indications
        : "Clinical data available for this medicine.";
  },

  addToInventory(index) {
    const drug = this.state.lastResults[index];
    if (!drug) return;

    if (window.Router) window.Router.switchSection("inventorySection");
    if (window.InventoryModule) window.InventoryModule.prefillForm(drug);
  }
};

window.SearchModule = SearchModule;
