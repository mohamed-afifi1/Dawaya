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
                
                <form id="addInventoryForm" class="inline-form">
                    <input type="text" id="invName" placeholder="Medicine name" required>
                    <input type="number" step="0.01" id="invPrice" placeholder="Price" required>
                    <input type="number" id="invStock" placeholder="Stock" required>
                    <button type="submit" class="btn-primary">Add Item</button>
                </form>
            </div>

            <div class="table-container">
                <table class="inventory-table">
                    <thead>
                        <tr>
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
                <!-- Update Form Modal / Row (will be handled by JS) -->
            </div>
        </section>

        <!-- ================= UPLOADS SECTION ================= -->
        <section id="uploadsSection" class="spa-section hidden">
            <div class="section-intro">
                <h2>Clinical Record Upload</h2>
                <p>Upload prescriptions or lab results for patient history.</p>
            </div>

            <div class="upload-container">
                <div class="upload-dropzone" id="dropzone">
                    <div class="upload-icon-wrapper">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    </div>
                    <form id="uploadForm" enctype="multipart/form-data">
                        <div class="upload-actions">
                            <input type="file" id="fileInput" name="clinical_record" accept=".pdf, .jpg, .jpeg, .png" class="hidden-input">
                            <label for="fileInput" class="btn-secondary">Choose File</label>
                            <span id="fileNameDisplay" class="file-name-display">No file chosen</span>
                            <button type="submit" class="btn-primary" id="uploadBtn">Upload</button>
                        </div>
                    </form>
                    <p class="upload-hint">PDF, JPG OR PNG (MAX 10MB)</p>
                    <div id="uploadFeedback"></div>
                </div>
                
                <div class="uploads-list-wrapper">
                    <h3>Recent Uploads</h3>
                    <ul id="uploadsList" class="uploads-list">
                        <!-- Upload records injected here -->
                    </ul>
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
