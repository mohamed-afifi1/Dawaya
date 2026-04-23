// ============================================================
//  API_Ops.js — Frontend handler for drug search
//  Calls API_Ops.php which calls openFDA
// ============================================================

const API_Ops = {
  // ── Base path to API_Ops.php ──────────────────────────────
  base: 'API_Ops.php',

  // ── Smart search (main function used by main.js) ──────────
  // Tries brand → generic → broad automatically
  searchDrug: async function (query) {
    try {
      const url = `${this.base}?action=search&query=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        return {
          status: "error",
          message: "Server error. Please try again.",
          data: null,
        };
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("API_Ops.searchDrug error:", err);
      return {
        status: "error",
        message: "Network error. Check your connection.",
        data: null,
      };
    }
  },

  // ── Search by brand name only ─────────────────────────────
  searchByBrand: async function (query) {
    try {
      const url = `${this.base}?action=search_brand&query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error("API_Ops.searchByBrand error:", err);
      return { status: "error", message: "Network error.", data: null };
    }
  },

  // ── Search by generic name only ───────────────────────────
  searchByGeneric: async function (query) {
    try {
      const url = `${this.base}?action=search_generic&query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error("API_Ops.searchByGeneric error:", err);
      return { status: "error", message: "Network error.", data: null };
    }
  },

  // ── Search by ATC code only ───────────────────────────────
  searchByATC: async function (atcCode) {
    try {
      const url = `${this.base}?action=search_atc&query=${encodeURIComponent(atcCode)}`;
      const response = await fetch(url);
      return await response.json();
    } catch (err) {
      console.error("API_Ops.searchByATC error:", err);
      return { status: "error", message: "Network error.", data: null };
    }
  },
};
