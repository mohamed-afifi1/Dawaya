CREATE DATABASE IF NOT EXISTS DawayaDB;
USE DawayaDB;

CREATE TABLE IF NOT EXISTS Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy data for inventory
INSERT INTO Inventory (medicine_name, price, stock) VALUES
('Lisinopril 10mg', 45.00, 850),
('Metformin 500mg', 32.50, 12),
('Amoxicillin 500mg', 12.50, 430);
