CREATE DATABASE IF NOT EXISTS DawayaDB;
USE DawayaDB;

CREATE TABLE IF NOT EXISTS Inventory (
    id            INT            NOT NULL AUTO_INCREMENT,
    medicine_name VARCHAR(255)   NOT NULL,
    generic_name  VARCHAR(255)   NOT NULL DEFAULT '',
    atc_code      VARCHAR(20)    NOT NULL DEFAULT '',
    drug_type VARCHAR(50) NOT NULL DEFAULT 'Other',
    category      VARCHAR(100)   NOT NULL DEFAULT '',
    source        VARCHAR(20) NOT NULL DEFAULT 'Local',
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

CREATE TABLE IF NOT EXISTS Users (
    id            INT          NOT NULL AUTO_INCREMENT,
    full_name     VARCHAR(120) NOT NULL,
    username      VARCHAR(80)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('customer', 'pharmacy') NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;