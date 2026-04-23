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
  deleteModal: document.getElementById("deleteConfirmModal"),

  state: {
    selectedDrug: null,
    debounceTimer: null,
    deleteTargetId: null,
  },

  init() {
    this.loadTable();
    this.setupAutocomplete();
    this.setupFormSubmissions();
    this.setupModalClosing();

    // Expose functions to window for inline onclick attributes
    window.appContext = {
      deleteItem: (id, name) => this.openDeleteModal(id, name),
      editItem: (id, name, price, stock, generic, atc, category, source) =>
        this.openEditModal(id, name, price, stock, generic, atc, category, source),
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

    const imgSrc = item.image_path ? item.image_path : 'https://placehold.co/50x50/eee/999?text=Rx';

    row.innerHTML = `
            <td><img src="${imgSrc}" class="inventory-img"></td>
            <td>
                <strong>${medicineName}</strong>
                <div style="font-size:12px;color:var(--text-light);margin-top:4px;">
                    ${genericName} — ${category}
                </div>
            </td>
            <td><strong>EGP ${price}</strong></td>
            <td><span class="stock-badge ${stockClass}">${stock}u</span></td>
            <td class="action-btns">
                <button class="action-btn" onclick="appContext.editItem(${item.id}, '${escapedName}', ${price}, ${stock}, '${(item.generic_name || "").replace(/'/g, "\\'")}', '${(item.atc_code || "").replace(/'/g, "\\'")}', '${(item.category || "").replace(/'/g, "\\'")}', '${(item.source || "").replace(/'/g, "\\'")}')" title="Edit Item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="action-btn del" onclick="appContext.deleteItem(${item.id}, '${escapedName}')" title="Delete Item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
      
      // Enable button if there is a name (allows manual entry)
      this.addBtn.disabled = query.length === 0;

      clearTimeout(this.state.debounceTimer);
      if (query.length < 2) {
        this.suggestions.classList.add("hidden");
        return;
      }

      this.state.debounceTimer = setTimeout(async () => {
        const res = await API_Ops.searchDrug(query);

        if (res.status === "success" && res.data.results.length > 0) {
          this.renderSuggestions(res.data.results);
        } else {
          this.suggestions.innerHTML =
            '<div style="padding:10px 14px;color:#9ca3af;font-size:14px;">No medicines found</div>';
          this.suggestions.classList.remove("hidden");
        }
      }, 400);
    });

    document.addEventListener("click", (e) => {
      if (
        !this.invNameInput.contains(e.target) &&
        !this.suggestions.contains(e.target)
      ) {
        this.suggestions.classList.add("hidden");
      }
    });
  },

  renderSuggestions(results) {
    this.suggestions.innerHTML = "";
    this.suggestions.classList.remove("hidden");

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
        this.suggestions.classList.add("hidden");
      });
      this.suggestions.appendChild(item);
    });
  },

  // ── CREATE / UPDATE / DELETE ────────────────────────────────
  setupFormSubmissions() {
    this.addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (this.invNameInput.value.trim() === "") {
        alert("Please enter a medicine name.");
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

      // Append image if selected
      const imageInput = document.getElementById("invImage");
      if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
      }

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
      
      // Include hidden metadata to prevent data loss
      formData.append("generic_name", document.getElementById("editInvGenericName").value);
      formData.append("atc_code", document.getElementById("editInvAtcCode").value);
      formData.append("category", document.getElementById("editInvCategory").value);
      formData.append("source", document.getElementById("editInvSource").value);
      formData.append("drug_type", "Other");

      // Append image if selected
      const imageInput = document.getElementById("editInvImage");
      if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
      }

      try {
        const res = await fetch("DB_Ops.php", {
          method: "POST",
          body: formData,
        }).then((r) => r.json());
        if (res.success) {
          this.editModal.classList.add("hidden");
          this.loadTable();
        }
      } catch (e) {
        alert("Update failed.");
      }
    });
  },

  openDeleteModal(id, name) {
    this.state.deleteTargetId = id;
    document.getElementById("deleteTargetName").textContent = name;
    this.deleteModal.classList.remove("hidden");
  },

  async confirmDelete() {
    if (!this.state.deleteTargetId) return;

    const formData = new FormData();
    formData.append("action", "delete_medicine");
    formData.append("id", this.state.deleteTargetId);

    try {
      const res = await fetch("DB_Ops.php", {
        method: "POST",
        body: formData,
      }).then((r) => r.json());
      
      if (res.success) {
        this.deleteModal.classList.add("hidden");
        this.loadTable();
      } else {
        alert(res.error || "Delete failed.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      this.state.deleteTargetId = null;
    }
  },

  openEditModal(id, name, price, stock, generic, atc, category, source) {
    document.getElementById("editInvId").value = id;
    document.getElementById("editInvName").value = name;
    document.getElementById("editInvPrice").value = price;
    document.getElementById("editInvStock").value = stock;
    
    // Set hidden metadata
    document.getElementById("editInvGenericName").value = generic || "";
    document.getElementById("editInvAtcCode").value = atc || "";
    document.getElementById("editInvCategory").value = category || "";
    document.getElementById("editInvSource").value = source || "";
    
    this.editModal.classList.remove("hidden");
  },

  setupModalClosing() {
    // Edit Modal
    const closeEditBtn = document.getElementById("closeEditModal");
    if (closeEditBtn)
      closeEditBtn.addEventListener(
        "click",
        () => this.editModal.classList.add("hidden"),
      );

    // Delete Modal
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    if (cancelDeleteBtn)
      cancelDeleteBtn.addEventListener(
        "click",
        () => this.deleteModal.classList.add("hidden"),
      );

    if (confirmDeleteBtn)
      confirmDeleteBtn.addEventListener(
        "click",
        () => this.confirmDelete(),
      );

    window.addEventListener("click", (e) => {
      if (e.target === this.editModal) this.editModal.classList.add("hidden");
      if (e.target === this.deleteModal) this.deleteModal.classList.add("hidden");
    });
  },
};
