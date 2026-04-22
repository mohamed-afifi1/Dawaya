// js/main.js
document.addEventListener('DOMContentLoaded', () => {

    // --- SPA Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.spa-section');

    function switchSection(targetId) {
        // Hide all sections
        sections.forEach(sec => sec.classList.remove('active', 'hidden'));
        sections.forEach(sec => {
            if (sec.id !== targetId) sec.classList.add('hidden');
        });
        
        // Show target
        const targetSec = document.getElementById(targetId);
        if (targetSec) {
            targetSec.classList.remove('hidden');
            targetSec.classList.add('active');
        }

        // Update Nav
        navLinks.forEach(link => {
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Trigger section specific loads
        if (targetId === 'inventorySection') {
            loadInventory();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            switchSection(target);
            // Update URL hash for simple routing
            window.location.hash = link.getAttribute('href');
        });
    });

    // Check initial hash
    if (window.location.hash) {
        const hash = window.location.hash; // e.g. #inventory
        const link = document.querySelector(`.nav-link[href="${hash}"]`);
        if (link) {
            switchSection(link.dataset.target);
        }
    }

    // --- Mobile Menu Toggle ---
    const navToggleBtn = document.getElementById('navToggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (navToggleBtn && mainNav) {
        navToggleBtn.addEventListener('click', () => {
            mainNav.classList.toggle('show');
        });
        
        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('show');
            });
        });
    }

    // --- 1. Search Section Logic (using API_Ops.js) ---
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchBtnBtn = document.getElementById('searchBtn');
    const loader = searchBtnBtn.querySelector('.loader');
    const btnText = searchBtnBtn.querySelector('.btn-text');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if(!query) return;

        // UI Loading state
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        searchBtnBtn.disabled = true;
        
        searchResults.innerHTML = '<div class="placeholder-text">Searching databases...</div>';

        const res = await API_Ops.searchDrug(query); // Calls API_Ops.js -> API_Ops.php
        
        // Reset UI
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
        searchBtnBtn.disabled = false;

        renderSearchResults(res, query);
    });

    function renderSearchResults(res, query) {
        searchResults.innerHTML = ''; // clear
        
        if (res.status === 'success' && res.data.results && res.data.results.length > 0) {
            res.data.results.forEach(info => {
                // Ensure we handle missing fields gracefully
                const openfda = info.openfda || {};
                const brandName = openfda.brand_name ? openfda.brand_name[0] : query;
                const genericName = openfda.generic_name ? openfda.generic_name[0] : 'N/A';
                const purpose = info.purpose ? info.purpose[0] : (info.indications_and_usage ? info.indications_and_usage[0].substring(0, 100) + '...' : 'Clinical data abstract not fully available.');
                const productType = openfda.product_type ? openfda.product_type[0] : 'Drug';

                // Random mock price for UI consistency since FDA doesn't provide consumer prices
                const mockPrice = '$' + (Math.random() * 50 + 5).toFixed(2);

                const card = document.createElement('div');
                card.className = 'result-card';
                card.innerHTML = `
                    <div class="result-info">
                        <div class="result-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M10.5 20.5l-6-6a4.5 4.5 0 0 1 6.5-6.5l6 6a4.5 4.5 0 0 1-6.5 6.5z"></path><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"></line></svg>
                        </div>
                        <div class="result-details">
                            <h3>${brandName}</h3>
                            <p>${genericName} &bull; ${productType}</p>
                            <p style="margin-top: 8px; font-size: 13px; color: var(--text-main);">${purpose}</p>
                        </div>
                    </div>
                    <div class="result-meta">
                        <div class="result-price">${mockPrice}</div>
                        <div class="result-tag">ESTIMATE</div>
                    </div>
                `;
                searchResults.appendChild(card);
            });
        } else {
            searchResults.innerHTML = `<div class="error-text">${res.message || 'No matching clinical records found.'}</div>`;
        }
    }


    // --- 2. Live Inventory Logic ---
    const addInventoryForm = document.getElementById('addInventoryForm');
    const tableBody = document.getElementById('inventoryTableBody');

    async function loadInventory() {
        try {
            const response = await fetch('../DB_Ops.php?action=read_inventory');
            const res = await response.json();
            
            tableBody.innerHTML = '';
            
            if (res.status === 'success' && res.data.length > 0) {
                res.data.forEach(item => {
                    const row = document.createElement('tr');
                    
                    const priceFormatted = '$' + parseFloat(item.price).toFixed(2);
                    const stockClass = item.stock < 20 ? 'low' : '';
                    const imgSrc = item.image_path ? item.image_path : 'https://placehold.co/50x50/eee/999?text=Rx';
                    
                    row.innerHTML = `
                        <td><img src="${imgSrc}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #ddd;"></td>
                        <td>
                            <strong>${item.medicine_name}</strong>
                            <div style="font-size:12px; color:var(--text-light); margin-top:4px;">Internal ID: ${item.id}</div>
                        </td>
                        <td><strong>${priceFormatted}</strong></td>
                        <td><span class="stock-badge ${stockClass}">${item.stock}u</span></td>
                        <td class="action-btns">
                            <button class="action-btn" onclick="appContext.editItem(${item.id}, '${item.medicine_name.replace(/'/g, "\\'")}', ${item.price}, ${item.stock})" title="Edit">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            </button>
                            <button class="action-btn del" onclick="appContext.deleteItem(${item.id})" title="Delete">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">No inventory items found. Add one above.</td></tr>';
            }
        } catch (e) {
            console.error('Error fetching inventory', e);
        }
    }

    addInventoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Client-side validation is enforced by required attributes and type="number" in HTML, 
        // but we double check here before fetch
        const name = document.getElementById('invName').value.trim();
        const price = document.getElementById('invPrice').value;
        const stock = document.getElementById('invStock').value;
        
        if (!name || price === '' || stock === '') {
            alert('Please fill all inventory fields.');
            return;
        }

        const imageFile = document.getElementById('invImage').files[0];
        let imagePath = '';
        if (imageFile) {
            const uploadData = new FormData();
            uploadData.append('image', imageFile);
            try {
                const uploadRes = await fetch('./Upload.php', { method: 'POST', body: uploadData }).then(r => r.json());
                if (uploadRes.status === 'success') {
                    imagePath = uploadRes.data.file_path;
                } else {
                    alert('Image upload failed: ' + uploadRes.message);
                    return;
                }
            } catch (err) {
                alert('Upload network error');
                return;
            }
        }

        const formData = new FormData();
        formData.append('action', 'create_inventory');
        formData.append('medicine_name', name);
        formData.append('price', price);
        formData.append('stock', stock);
        
        if (imagePath) {
            formData.append('image_path', imagePath);
        }

        try {
            const res = await fetch('../DB_Ops.php', { method: 'POST', body: formData }).then(r => r.json());
            if (res.status === 'success') {
                addInventoryForm.reset();
                loadInventory();
            } else {
                alert(res.message);
            }
        } catch(e) {
            console.error(e);
            alert('Failed to add item.');
        }
    });

    // We expose delete/edit to global scope gently so inline onclick can see it
    window.appContext = {
        deleteItem: async (id) => {
            if (!confirm('Are you sure you want to delete this record?')) return;
            const formData = new FormData();
            formData.append('action', 'delete_inventory');
            formData.append('id', id);
            
            const res = await fetch('../DB_Ops.php', { method: 'POST', body: formData }).then(r => r.json());
            if (res.status === 'success') {
                loadInventory();
            } else {
                alert(res.message);
            }
        },
        editItem: async (id, currentName, currentPrice, currentStock) => {
             const modal = document.getElementById('editInventoryModal');
             document.getElementById('editInvId').value = id;
             document.getElementById('editInvName').value = currentName;
             document.getElementById('editInvPrice').value = currentPrice;
             document.getElementById('editInvStock').value = currentStock;
             document.getElementById('editInvImage').value = ''; // clear file input
             modal.style.display = 'flex';
        }
    };

    // --- Modal Logic ---
    const editModal = document.getElementById('editInventoryModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const editInventoryForm = document.getElementById('editInventoryForm');

    closeEditModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    editInventoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('editInvId').value;
        const name = document.getElementById('editInvName').value.trim();
        const price = document.getElementById('editInvPrice').value;
        const stock = document.getElementById('editInvStock').value;
        const imageFile = document.getElementById('editInvImage').files[0];
        
        if (!name || price === '' || stock === '') {
            alert('Please fill all inventory fields.');
            return;
        }

        let imagePath = '';
        if (imageFile) {
            const uploadData = new FormData();
            uploadData.append('image', imageFile);
            try {
                const uploadRes = await fetch('../Upload.php', { method: 'POST', body: uploadData }).then(r => r.json());
                if (uploadRes.status === 'success') {
                    imagePath = uploadRes.data.file_path;
                } else {
                    alert('Image upload failed: ' + uploadRes.message);
                    return;
                }
            } catch (err) {
                alert('Upload network error');
                return;
            }
        }

        const formData = new FormData();
        formData.append('action', 'update_inventory');
        formData.append('id', id);
        formData.append('medicine_name', name);
        formData.append('price', price);
        formData.append('stock', stock);
        if (imagePath) {
            formData.append('image_path', imagePath);
        }

        try {
            const res = await fetch('../DB_Ops.php', { method: 'POST', body: formData }).then(r => r.json());
            if (res.status === 'success') {
                editModal.style.display = 'none';
                loadInventory();
            } else {
                alert(res.message);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to update item.');
        }
    });
});
