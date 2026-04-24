-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql312.infinityfree.com
-- Generation Time: 23 أبريل 2026 الساعة 16:59
-- إصدار الخادم: 11.4.7-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_41738124_dawaya_db`
--

-- --------------------------------------------------------

--
-- بنية الجدول `Inventory`
--

CREATE TABLE `Inventory` (
  `id` int(11) NOT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `generic_name` varchar(255) NOT NULL DEFAULT '',
  `atc_code` varchar(20) NOT NULL DEFAULT '',
  `drug_type` varchar(50) NOT NULL DEFAULT 'Other',
  `category` varchar(100) NOT NULL DEFAULT '',
  `source` varchar(20) NOT NULL DEFAULT 'Local',
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `image_path` varchar(500) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `Inventory`
--

INSERT INTO `Inventory` (`id`, `medicine_name`, `generic_name`, `atc_code`, `drug_type`, `category`, `source`, `price`, `stock`, `image_path`, `created_at`, `updated_at`) VALUES
(2, 'PANADOL PM', 'ACETAMINOPHEN AND DIPHENHYDRAMINE HCL', 'N/A', 'HUMAN OTC DRUG', 'N/A', 'Import', '125.00', 136, 'uploads/1776969148_1776962650_panadol.webp', '2026-04-23 11:32:28', '2026-04-23 11:32:28');

-- --------------------------------------------------------

--
-- بنية الجدول `Uploads`
--

CREATE TABLE `Uploads` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` enum('prescription','lab_result','other') NOT NULL DEFAULT 'other',
  `mime_type` varchar(100) NOT NULL DEFAULT '',
  `file_size` int(11) NOT NULL DEFAULT 0,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `username` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','pharmacy') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `Users`
--

INSERT INTO `Users` (`id`, `full_name`, `username`, `password_hash`, `role`, `created_at`) VALUES
(1, 'Customer User', 'customer', '$2y$10$vU2s8ogf7LaeSKnSgWxhRur5R1Mv/CBh8b.vh.DvA3stl1poF9phO', 'customer', '2026-04-23 11:31:46'),
(2, 'Pharmacy User', 'pharmacy', '$2y$10$e.XEZai.j86tDcqvLuVIfeIJ8VlHq936Q2e59igLXIRyxjuidcZBy', 'pharmacy', '2026-04-23 11:31:46'),
(3, 'Mohamed', 'mody', '$2y$10$iCTQ.XNG946H3v6B7CPMBucEtLtBSIDx/t28z4bOjQx7jUNagd9h.', 'customer', '2026-04-23 11:31:46'),
(4, 'Mohamed', 'mohamed', '$2y$10$IqIP3XwR8nnve/vOVn0cLOgEHANNk6DPOmE5M2LjELzIkxowkUUSS', 'pharmacy', '2026-04-23 11:32:07'),
(5, 'Mohammed Atef', '3tef', '$2y$10$scL1F2zDbVGzWm2GqX/FVOQ19PQPlrbcL3atHwOJsLrlSN4rn0fjG', 'customer', '2026-04-23 11:33:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Inventory`
--
ALTER TABLE `Inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Uploads`
--
ALTER TABLE `Uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Inventory`
--
ALTER TABLE `Inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Uploads`
--
ALTER TABLE `Uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
