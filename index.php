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
        <div id="authMessage" class="auth-message hidden"></div>

        <!-- ================= AUTH SECTION ================= -->
        <section id="authSection" class="spa-section active">
            <div class="section-intro">
                <h2>Account Access</h2>
                <p>Sign in or create a new account to use Dawaya features.</p>
            </div>

            <div class="auth-shell">
                <div class="auth-tabs">
                    <button id="showLoginTab" class="auth-tab active" type="button">Login</button>
                    <button id="showRegisterTab" class="auth-tab" type="button">Register</button>
                </div>

                <form id="loginForm" class="auth-form" autocomplete="off">
                    <div class="auth-grid">
                        <input type="text" id="loginUsername" placeholder="Username" required>
                        <input type="password" id="loginPassword" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn-primary auth-submit">Login</button>
                </form>

                <form id="registerForm" class="auth-form hidden" autocomplete="off">
                    <div class="auth-grid">
                        <input type="text" id="registerFullName" placeholder="Full name" required>
                        <input type="text" id="registerUsername" placeholder="Username" required>
                        <input type="password" id="registerPassword" placeholder="Password (min 6 chars)" required>
                        <select id="registerRole" required>
                            <option value="customer" selected>Customer</option>
                            <option value="pharmacy">Pharmacy</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary auth-submit">Create Account</button>
                </form>

                <div id="sessionBox" class="session-box hidden">
                    <span id="sessionUserText"></span>
                    <button id="logoutBtn" class="btn-secondary btn-auth" type="button">Logout</button>
                </div>
            </div>
        </section>

        <!-- ================= SEARCH SECTION ================= -->
        <section id="searchSection" class="spa-section hidden">
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
                        <div id="searchSuggestions" class="search-suggestions hidden"></div>
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

        <div id="inventoryRoleNote" class="role-note hidden"></div>

        <div class="section-header">
            <div class="section-intro">
                <h2>Live Inventory</h2>
                <p>Manage your stock levels directly.</p>
            </div>

            <form id="addInventoryForm" class="inline-form" enctype="multipart/form-data">
                <div class="input-group">
                    <input type="text" id="invName" placeholder="Medicine name" required autocomplete="off">
                    <div id="invSuggestions" class="search-suggestions hidden"></div>
                </div>
                
                <!-- Hidden fields populated by autocomplete -->
                <input type="hidden" id="invGenericName">
                <input type="hidden" id="invAtcCode">
                <input type="hidden" id="invDrugType">
                <input type="hidden" id="invCategory">
                <input type="hidden" id="invSource" value="Local">

                <input type="number" step="0.01" min="0" id="invPrice" placeholder="Price" required>
                <input type="number" min="0" id="invStock" placeholder="Stock" required>
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
            <div id="editInventoryModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <h3>Edit Medicine</h3>
                    <form id="editInventoryForm" class="modal-form">
                        <input type="hidden" id="editInvId">
                        <!-- Hidden metadata fields to prevent data loss during edit -->
                        <input type="hidden" id="editInvGenericName">
                        <input type="hidden" id="editInvAtcCode">
                        <input type="hidden" id="editInvCategory">
                        <input type="hidden" id="editInvSource">

                        <input type="text" id="editInvName" placeholder="Medicine name" required class="modal-input">
                        <input type="number" step="0.01" min="0" id="editInvPrice" placeholder="Price" required class="modal-input">
                        <input type="number" min="0" id="editInvStock" placeholder="Stock" required class="modal-input">
                        <label class="modal-label">Update Image (Optional)</label>
                        <input type="file" id="editInvImage" accept="image/*" class="modal-input">
                        <div class="modal-actions">
                            <button type="submit" class="btn-primary flex-1">Save Changes</button>
                            <button type="button" class="btn-secondary flex-1" id="closeEditModal">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Delete Confirmation Modal -->
            <div id="deleteConfirmModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div style="text-align: center; padding: 10px;">
                        <div style="color: var(--danger); margin-bottom: 15px;">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </div>
                        <h3>Confirm Delete</h3>
                        <p style="color: var(--text-muted); margin: 10px 0 20px;">Are you sure you want to remove <strong id="deleteTargetName"></strong>? This action cannot be undone.</p>
                        <div class="modal-actions">
                            <button id="confirmDeleteBtn" class="btn-primary" style="background-color: var(--danger); flex: 1;">Delete</button>
                            <button id="cancelDeleteBtn" class="btn-secondary" style="flex: 1;">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </main>

    <!-- Footer -->    
    <?php require_once 'footer.php'; ?>

    <!-- Main JS Application Logic -->
    <script src="js/API_Ops.js"></script>
    <script type="module" src="js/main.js"></script>
</body>
</html>
