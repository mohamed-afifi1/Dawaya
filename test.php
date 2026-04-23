<?php
$pdo = new PDO('mysql:host=localhost;dbname=DawayaDB', 'dawaya', '1234');
$stmt = $pdo->query('SELECT * FROM Inventory');
$rows = $stmt->fetchAll();
print_r($rows);