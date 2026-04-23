CREATE DATABASE IF NOT EXISTS DawayaDB;
USE DawayaDB;

CREATE TABLE IF NOT EXISTS Inventory (
    id            INT            NOT NULL AUTO_INCREMENT,
    medicine_name VARCHAR(255)   NOT NULL,
    generic_name  VARCHAR(255)   NOT NULL DEFAULT '',
    atc_code      VARCHAR(20)    NOT NULL DEFAULT '',
    drug_type     ENUM('Tablet','Capsule','Liquid','Syrup','Injection','Cream','Drops','Inhaler','Other') NOT NULL DEFAULT 'Other',
    category      VARCHAR(100)   NOT NULL DEFAULT '',
    source        ENUM('Local','Import') NOT NULL DEFAULT 'Local',
    price         DECIMAL(10,2)  NOT NULL,
    stock         INT            NOT NULL DEFAULT 0,
    image_path    VARCHAR(500)   NOT NULL DEFAULT '',
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Uploads (
    id          INT          NOT NULL AUTO_INCREMENT,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_type   ENUM('prescription','lab_result','other') NOT NULL DEFAULT 'other',
    mime_type   VARCHAR(100) NOT NULL DEFAULT '',
    file_size   INT          NOT NULL DEFAULT 0,
    uploaded_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO Inventory (medicine_name, generic_name, atc_code, drug_type, category, source, price, stock) VALUES
('Lisinopril 10mg',  'Lisinopril',  'C09AA03', 'Tablet',  'Antihypertensive', 'Import', 45.00, 850),
('Metformin 500mg',  'Metformin',   'A10BA02', 'Tablet',  'Antidiabetic',     'Local',  32.50, 12),
('Amoxicillin 500mg','Amoxicillin', 'J01CA04', 'Capsule', 'Antibiotic',       'Local',  12.50, 430);