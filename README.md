# 💊 Dawaya - Drug Management & Clinical Assistant SPA

## 📌 Overview

**Dawaya** is a Single Page Application (SPA) built using **PHP, MySQL, and AJAX** that helps users manage drug information, track inventory, and upload clinical records efficiently.

The application simulates a lightweight clinical/pharmacy assistant system that combines:

* Drug search
* Inventory management
* Clinical record handling
* External drug data integration (via API)

All interactions happen dynamically without full page reloads.

---

## 🎯 Features

### 🔍 Drug Index Search

* Search drugs by:

  * Brand name
  * Generic name
  * ATC code
* Displays:

  * Drug name
  * Type (Capsule, Liquid, etc.)
  * Category (Antibiotic, Analgesic...)
  * Price
  * Source (Local / Import)

---

### 📦 Live Inventory Management

* Add new medicines
* Update existing records
* Delete items
* Track stock levels visually
* Fully dynamic using AJAX

---

### 📁 Clinical Record Upload

* Upload:

  * Prescriptions
  * Lab results
* Supported formats:

  * PDF, JPG, PNG
* File validation (size & type)
* Stored on server with DB reference

---

### 🌐 Third-Party API Integration

* External drug data enrichment
* API calls handled securely via PHP (cURL)
* API key hidden from frontend
* Graceful error handling

---

## 🏗️ Tech Stack

| Layer         | Technology            |
| ------------- | --------------------- |
| Frontend      | HTML, CSS, JavaScript |
| Backend       | PHP                   |
| Database      | MySQL                 |
| Communication | AJAX (Fetch API)      |
| API Handling  | cURL (PHP)            |

---

## 📂 Project Structure

```
Dawaya/
│
├── index.php          # Main SPA page
├── header.php         # Header UI
├── footer.php         # Footer UI
│
├── DB_Ops.php         # Database operations (CRUD + validation)
├── API_Ops.php        # External API calls using cURL
├── API_Ops.js         # AJAX requests for API
│
├── Upload.php         # File upload handler
│
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
│
├── uploads/           # Stored user files
│
├── database.sql       # Database backup
└── Team_Members.txt   # Team info
```

---

## 🧠 Core Concepts Implemented

* Single Page Application (SPA)
* Asynchronous data fetching (AJAX)
* CRUD operations (Create, Read, Update, Delete)
* Secure database handling (Prepared Statements)
* File upload & validation
* API integration via backend
* Client-side + server-side validation

---

## 🔐 Security Measures

* ✅ Prepared statements (PDO / bind_param)
* ✅ Input validation (Client & Server)
* ✅ File type & size validation
* ✅ API keys hidden in backend
* ✅ Session-based authentication (Customer / Pharmacy)
* ✅ Role-based authorization (Pharmacy can modify inventory; Customer is read-only)
* ✅ Error handling for API & DB operations

### Demo Accounts

* Customer: `customer` / `customer123`
* Pharmacy: `pharmacy` / `pharmacy123`

---

## 👥 Team Members

| Student Name | ID | GitHub |
|--------------|----|--------|
| Mohamed Ahmed Mohamed | 20231134 | [Link](https://github.com/mohamedahmed2005) |
| Mostafa Mahmoud Fathy | 20231244 | [Link](https://github.com/mostafa-mahmoud-fathy) |
| Mohamed Atef Abd El-Kader | 20231143 | [Link](https://github.com/Mohammed-3tef) |
| Mostafa Ehab Mostafa | 20231167 | [Link](https://github.com/Eng-M0stafaEhab) |
| Marwan Hussein Mohamed | 20230382 | [Link](https://github.com/Marwan-Hussein) |
| Mohamed Ayman Afifi | 20230618 | [Link](https://github.com/mohamed-afifi1) |
| Mahmoud Abd El-Aziz Mahmoud | 20230603 | [Link](https://github.com/Mahmoudabdelaziz-2004) |
| Mohamed Saad Taha | 20231141 | [Link](https://github.com/Mohamed-sa3d200) |

---

## 📌 Notes

* No page reloads (true SPA behavior)
* API failures handled gracefully
* Clean modular PHP structure

---

## 🚀 Future Improvements

* User authentication system
* Role-based access (Admin / Pharmacist)
* Advanced drug analytics
* Barcode scanning for medicines
* Notifications for low stock

---

## 📄 License

This project is developed for educational purposes (IS333 – Cairo University).
