<?php
// index.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dawaya - Clinical Sanctuary</title>
    <!-- Google Fonts for modern typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" href="assets/icon.ico" type="image/x-icon">
</head>
<body>
    <!-- Header -->
    <?php require_once 'header.php'; ?>

    <!-- Main Content Container -->
    <main class="app-main">
        <!-- ================= SEARCH SECTION ================= -->
        <section id="searchSection" class="spa-section active">
            <div class="section-intro">
                <h2>Drug Index Search</h2>
                <p>Query clinical data and international drug databases.</p>
            </div>

            <!-- Search Form -->
            <div class="search-container">
                <form id="searchForm" class="search-form">
                    <div class="search-input-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="searchInput" placeholder="Search by brand, generic name..." required>
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

            <form id="addInventoryForm" class="inline-form" enctype="multipart/form-data">
                <input type="text" id="invName" placeholder="Medicine name" required>
                <input type="number" step="0.01" id="invPrice" placeholder="Price" required>
                <input type="number" id="invStock" placeholder="Stock" required>
                <input type="file" id="invImage" accept="image/*" title="Medicine Image">
                <button type="submit" class="btn-primary">Add Item</button>
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
            <div id="editInventoryModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <h3>Edit Medicine</h3>
                    <form id="editInventoryForm" class="modal-form">
                        <input type="hidden" id="editInvId">
                        <input type="text" id="editInvName" placeholder="Medicine name" required class="modal-input">
                        <input type="number" step="0.01" id="editInvPrice" placeholder="Price" required class="modal-input">
                        <input type="number" id="editInvStock" placeholder="Stock" required class="modal-input">
                        <label class="modal-label">Update Image (Optional)</label>
                        <input type="file" id="editInvImage" accept="image/*" class="modal-input">
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary flex-1">Save Changes</button>
                            <button type="button" class="btn-secondary flex-1" id="closeEditModal">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
    </main>

    <!-- Footer -->    
    <?php require_once 'footer.php'; ?>

    <!-- Main JS Application Logic -->
    <script src="js/API_Ops.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
