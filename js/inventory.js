/**
 * inventory.js — Handles Live Inventory CRUD and UI
 */

export const InventoryModule = {
  // Selectors
  tableBody: document.getElementById("inventoryTableBody"),
  addForm: document.getElementById("addInventoryForm"),
  invNameInput: document.getElementById("invName"),
  suggestions: document.getElementById("invSuggestions"),
  addBtn: document.getElementById("addBtn"),
  editModal: document.getElementById("editInventoryModal"),
  editForm: document.getElementById("editInventoryForm"),

  state: {
    selectedDrug: null,
    debounceTimer: null,
  },

  init() {
    this.loadTable();
    this.setupAutocomplete();
    this.setupFormSubmissions();
    this.setupModalClosing();

    // Expose functions to window for inline onclick attributes
    window.appContext = {
      deleteItem: (id) => this.deleteItem(id),
      editItem: (id, name, price, stock) =>
        this.openEditModal(id, name, price, stock),
    };
  },

  // ── TABLE RENDERING ────────────────────────────────────────
  async loadTable() {
    if (!this.tableBody) return;

    try {
      const response = await fetch("DB_Ops.php?action=get_all_medicines");
      const res = await response.json();

      this.tableBody.innerHTML = "";

      if (res.success && res.data.length > 0) {
        res.data.forEach((item) => {
          const row = this.createRowHTML(item);
          this.tableBody.appendChild(row);
        });
      } else {
        this.tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;">No inventory items found. Add one above.</td></tr>`;
      }
    } catch (e) {
      console.error("loadInventory error:", e);
      this.tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:red;">Failed to load inventory.</td></tr>`;
    }
  },

  createRowHTML(item) {
    const row = document.createElement("tr");

    const medicineName = item.medicine_name || "Unknown Medicine";
    const genericName = item.generic_name || "N/A";
    const category = item.category || "General";
    const price = parseFloat(item.price || 0).toFixed(2);
    const stock = parseInt(item.stock || 0);
    const stockClass = stock <= 10 ? "low" : "";

    const escapedName = medicineName.replace(/'/g, "\\'");

    row.innerHTML = `
            <td><img src="https://placehold.co/50x50/eee/999?text=Rx" style="width:50px;height:50px;object-fit:cover;border-radius:4px;border:1px solid #ddd;"></td>
            <td>
                <strong>${medicineName}</strong>
                <div style="font-size:12px;color:var(--text-light);margin-top:4px;">
                    ${genericName} — ${category}
                </div>
            </td>
            <td><strong>EGP ${price}</strong></td>
            <td><span class="stock-badge ${stockClass}">${stock}u</span></td>
            <td class="action-btns">
                <button class="action-btn" onclick="appContext.editItem(${item.id}, '${escapedName}', ${price}, ${stock})">
                    Edit
                </button>
                <button class="action-btn del" onclick="appContext.deleteItem(${item.id})">
                    Delete
                </button>
            </td>
        `;
    return row;
  },

  // ── AUTOCOMPLETE LOGIC ──────────────────────────────────────
  setupAutocomplete() {
    if (!this.invNameInput) return;

    this.invNameInput.addEventListener("input", () => {
      const query = this.invNameInput.value.trim();
      this.state.selectedDrug = null;
      this.addBtn.disabled = true;

      clearTimeout(this.state.debounceTimer);
      if (query.length < 2) {
        this.suggestions.style.display = "none";
        return;
      }

      this.state.debounceTimer = setTimeout(async () => {
        const res = await API_Ops.searchDrug(query);

        if (res.status === "success" && res.data.results.length > 0) {
          this.renderSuggestions(res.data.results);
        } else {
          this.suggestions.innerHTML =
            '<div style="padding:10px 14px;color:#9ca3af;font-size:14px;">No medicines found</div>';
          this.suggestions.style.display = "block";
        }
      }, 400);
    });

    document.addEventListener("click", (e) => {
      if (
        !this.invNameInput.contains(e.target) &&
        !this.suggestions.contains(e.target)
      ) {
        this.suggestions.style.display = "none";
      }
    });
  },

  renderSuggestions(results) {
    this.suggestions.innerHTML = "";
    this.suggestions.style.display = "block";

    results.forEach((drug) => {
      const item = document.createElement("div");
      item.style.cssText =
        "padding:10px 14px;cursor:pointer;border-bottom:1px solid #f3f4f6;font-size:14px;";
      item.innerHTML = `<strong>${drug.brand_name}</strong> <span style="color:#9ca3af;">— ${drug.generic_name}</span>`;

      item.addEventListener("click", () => {
        this.invNameInput.value = drug.brand_name;
        document.getElementById("invGenericName").value = drug.generic_name;
        document.getElementById("invAtcCode").value = drug.atc_code;
        document.getElementById("invDrugType").value = drug.product_type;
        document.getElementById("invCategory").value = drug.atc_code;
        document.getElementById("invSource").value = "Import";
        this.state.selectedDrug = drug;
        this.addBtn.disabled = false;
        this.suggestions.style.display = "none";
      });
      this.suggestions.appendChild(item);
    });
  },

  // ── CREATE / UPDATE / DELETE ────────────────────────────────
  setupFormSubmissions() {
    this.addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.state.selectedDrug) {
        alert("Please select a medicine from the suggestions.");
        return;
      }

      // Explicitly build FormData to match DB_Ops requirements
      const formData = new FormData();
      formData.append("action", "add_medicine");
      formData.append("medicine_name", this.invNameInput.value);
      formData.append(
        "generic_name",
        document.getElementById("invGenericName").value,
      );
      formData.append("atc_code", document.getElementById("invAtcCode").value);
      formData.append(
        "drug_type",
        document.getElementById("invDrugType").value || "Other",
      );
      formData.append("category", document.getElementById("invCategory").value);
      formData.append("source", document.getElementById("invSource").value);
      formData.append("price", document.getElementById("invPrice").value);
      formData.append("stock", document.getElementById("invStock").value);

      try {
        const res = await fetch("DB_Ops.php", {
          method: "POST",
          body: formData,
        }).then((r) => r.json());
        if (res.success) {
          this.addForm.reset();
          this.addBtn.disabled = true;
          this.loadTable();
        } else {
          alert(res.error || "Failed to add medicine.");
        }
      } catch (e) {
        alert("Network error.");
      }
    });

    this.editForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("action", "update_medicine");
      formData.append("id", document.getElementById("editInvId").value);
      formData.append(
        "medicine_name",
        document.getElementById("editInvName").value,
      );
      formData.append("price", document.getElementById("editInvPrice").value);
      formData.append("stock", document.getElementById("editInvStock").value);
      formData.append("drug_type", "Other");

      try {
        const res = await fetch("DB_Ops.php", {
          method: "POST",
          body: formData,
        }).then((r) => r.json());
        if (res.success) {
          this.editModal.style.display = "none";
          this.loadTable();
        }
      } catch (e) {
        alert("Update failed.");
      }
    });
  },

  async deleteItem(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const formData = new FormData();
    formData.append("action", "delete_medicine");
    formData.append("id", id);

    const res = await fetch("DB_Ops.php", {
      method: "POST",
      body: formData,
    }).then((r) => r.json());
    if (res.success) this.loadTable();
  },

  openEditModal(id, name, price, stock) {
    document.getElementById("editInvId").value = id;
    document.getElementById("editInvName").value = name;
    document.getElementById("editInvPrice").value = price;
    document.getElementById("editInvStock").value = stock;
    this.editModal.style.display = "flex";
  },

  setupModalClosing() {
    const closeBtn = document.getElementById("closeEditModal");
    if (closeBtn)
      closeBtn.addEventListener(
        "click",
        () => (this.editModal.style.display = "none"),
      );

    window.addEventListener("click", (e) => {
      if (e.target === this.editModal) this.editModal.style.display = "none";
    });
  },
};
