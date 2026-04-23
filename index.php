<?php
// index.php
require_once 'header.php';
?>

<!-- ================= SEARCH SECTION ================= -->
<section id="searchSection" class="spa-section active">
    
    <div class="section-intro">
        <h2>Drug Index Search</h2>
        <p>Query clinical data and international drug databases.</p>
    </div>

    <!-- Search Form -->
    <div class="search-container">
        <form id="searchForm" class="search-form">
            <div class="search-input-wrapper" style="position: relative;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="searchInput" placeholder="Search by brand, generic name..." required autocomplete="off">
                <div id="searchSuggestions" style="
                    position:absolute; top:100%; left:0; right:0;
                    background:white; border:1px solid #e5e7eb;
                    border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);
                    z-index:999; display:none; max-height:200px; overflow-y:auto;">
                </div>
            </div>
            <button type="submit" class="btn-primary" id="searchBtn">
                <span class="btn-text">Search</span>
                <span class="loader hidden"></span>
            </button>
        </form>
    </div>

    <!-- Search Results -->
    <div id="searchResults" class="results-container">
        <!-- Results injected here via JS -->
        <div class="placeholder-text">Please enter a drug name to search.</div>
    </div>

</section>

<!-- ================= INVENTORY SECTION ================= -->
<section id="inventorySection" class="spa-section hidden">
    
    <div class="section-header">
        <div class="section-intro">
            <h2>Live Inventory</h2>
            <p>Manage your stock levels directly.</p>
        </div>
        
        <form id="addInventoryForm" class="inline-form">
            <div style="position:relative;">
                <input type="text" id="invName" placeholder="Search medicine name..." required autocomplete="off">
                <div id="invSuggestions" style="
                    position:absolute; top:100%; left:0; right:0;
                    background:white; border:1px solid #e5e7eb;
                    border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);
                    z-index:999; display:none; max-height:200px; overflow-y:auto;">
                </div>
            </div>
            <!-- Hidden fields auto-filled from API -->
            <input type="hidden" id="invGenericName">
            <input type="hidden" id="invAtcCode">
            <input type="hidden" id="invDrugType">
            <input type="hidden" id="invCategory">
            <input type="hidden" id="invSource" value="Import">
            <input type="number" step="0.01" id="invPrice" placeholder="Price" required>
            <input type="number" id="invStock" placeholder="Stock" required>
            <input type="file" id="invImage" accept="image/*" title="Medicine Image">
            <button type="submit" class="btn-primary" id="addBtn" disabled>Add Item</button>
        </form>
    </div>

    <div class="table-container">
        <table class="inventory-table">
            <thead>
                <tr>
                    <th>IMAGE</th>
                    <th>MEDICINE</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th class="text-right">ACTIONS</th>
                </tr>
            </thead>
            <tbody id="inventoryTableBody">
                <!-- Inventory rows injected here -->
            </tbody>
        </table>
        <!-- Update Form Modal -->
        <div id="editInventoryModal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 20px; border-radius: 8px; width: 400px; max-width: 90%;">
                <h3>Edit Medicine</h3>
                <form id="editInventoryForm" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    <input type="hidden" id="editInvId">
                    <input type="text" id="editInvName" placeholder="Medicine name" required style="padding: 8px;">
                    <input type="number" step="0.01" id="editInvPrice" placeholder="Price" required style="padding: 8px;">
                    <input type="number" id="editInvStock" placeholder="Stock" required style="padding: 8px;">
                    <label style="font-size: 14px; margin-top: 5px;">Update Image (Optional)</label>
                    <input type="file" id="editInvImage" accept="image/*" style="padding: 8px;">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button type="submit" class="btn-primary" style="flex: 1;">Save Changes</button>
                        <button type="button" class="btn-secondary" id="closeEditModal" style="flex: 1;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>

<?php
require_once 'footer.php';
?>