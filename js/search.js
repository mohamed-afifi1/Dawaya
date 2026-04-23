export const SearchModule = {
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
        suggestions.style.display = "none";
        return;
      }

      debounceTimer = setTimeout(async () => {
        const res = await API_Ops.searchDrug(query);
        if (res.status === "success" && res.data.results.length > 0) {
          this.renderSuggestions(res.data.results, suggestions, searchInput);
        } else {
          suggestions.style.display = "none";
        }
      }, 400);
    });

    // --- 2. Main Search Submit Logic ---
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.executeSearch(searchInput.value.trim());
      suggestions.style.display = "none";
    });

    // Close suggestions if clicking outside
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.style.display = "none";
      }
    });
  },

  renderSuggestions(results, container, input) {
    container.innerHTML = "";
    container.style.display = "block";

    results.forEach((drug) => {
      const div = document.createElement("div");
      // Styling the suggestion items to look professional
      div.style.cssText =
        "padding:12px 16px; cursor:pointer; border-bottom:1px solid #f3f4f6; font-size:14px; transition: background 0.2s;";
      div.innerHTML = `<strong>${drug.brand_name}</strong> <span style="color:#6b7280;">— ${drug.generic_name}</span>`;

      div.addEventListener(
        "mouseenter",
        () => (div.style.background = "#f9fafb"),
      );
      div.addEventListener(
        "mouseleave",
        () => (div.style.background = "white"),
      );

      div.addEventListener("click", () => {
        input.value = drug.brand_name;
        container.style.display = "none";
        this.executeSearch(drug.brand_name);
      });
      container.appendChild(div);
    });
  },

  async executeSearch(query) {
    const container = document.getElementById("searchResults");
    if (!container) return;

    this.toggleLoader(true);
    container.innerHTML =
      '<div class="placeholder-text">Checking local stock...</div>';

    try {
      const [apiRes, invRes] = await Promise.all([
        API_Ops.searchDrug(query),
        fetch("DB_Ops.php?action=get_all_medicines").then((r) => r.json()),
      ]);
      this.renderResults(apiRes, invRes, query);
    } catch (error) {
      console.error("Search failed:", error);
      container.innerHTML = `<div class="error-text">Search failed. Please try again.</div>`;
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
      .replace(/\d+\s*(mg|ml|g|mcg|tablet|capsule)/gi, "")
      .replace(/[^a-z0-9 ]/gi, "")
      .trim();
  },

  renderResults(apiRes, invRes, query) {
    const container = document.getElementById("searchResults");
    container.innerHTML = "";
    const localItems =
      invRes.success && Array.isArray(invRes.data) ? invRes.data : [];

    if (apiRes.status !== "success" || !apiRes.data || !apiRes.data.results) {
      container.innerHTML = `<div class="error-text">No records found for "${query}".</div>`;
      return;
    }

    let foundMatch = false;
    apiRes.data.results.forEach((drug) => {
      const apiBrand = this.normalize(drug.brand_name);
      const apiGeneric = this.normalize(drug.generic_name);

      const localMatch = localItems.find((local) => {
        const localName = this.normalize(local.medicine_name);
        const localGeneric = this.normalize(local.generic_name);
        return (
          (apiBrand.includes(localName) && localName.length > 2) ||
          (localName.includes(apiBrand) && apiBrand.length > 2) ||
          (apiGeneric.includes(localGeneric) && localGeneric.length > 2)
        );
      });

      if (!localMatch) return;
      foundMatch = true;

      const stock = parseInt(localMatch.stock || 0);
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
                <div class="result-info">
                    <div class="result-details">
                        <h3>${drug.brand_name} <span style="font-size:12px; color:${stock <= 10 ? "#ef4444" : "#10b981"}">● ${stock} in stock</span></h3>
                        <p><strong>Generic:</strong> ${drug.generic_name}</p>
                        <p style="font-size:13px; color:#6b7280; margin-top:5px;">${drug.purpose !== "N/A" ? drug.purpose : drug.indications || "Clinical data available."}</p>
                    </div>
                </div>
                <div class="result-meta">
                    <div style="font-weight:700; color:#1e40af;">EGP ${parseFloat(localMatch.price).toFixed(2)}</div>
                </div>
            `;
      container.appendChild(card);
    });

    if (!foundMatch) {
      container.innerHTML = `<div class="error-text">"${query}" is not in your local inventory.</div>`;
    }
  },
};
