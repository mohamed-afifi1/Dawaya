<?php
// Upload.php
header('Content-Type: application/json');

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fileKey = isset($_FILES['image']) ? 'image' : (isset($_FILES['clinical_record']) ? 'clinical_record' : null);

    if (!$fileKey || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        $errorMsg = 'Upload failed or no file selected.';
        if ($fileKey && isset($_FILES[$fileKey])) {
             switch($_FILES[$fileKey]['error']) {
                 case UPLOAD_ERR_INI_SIZE:
                 case UPLOAD_ERR_FORM_SIZE:
                     $errorMsg = 'File exceeds max size limit.';
                     break;
                 case UPLOAD_ERR_PARTIAL:
                     $errorMsg = 'File was only partially uploaded.';
                     break;
                 case UPLOAD_ERR_NO_FILE:
                     $errorMsg = 'No file was uploaded.';
                     break;
             }
        }
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
        exit;
    }

    $file = $_FILES[$fileKey];
    
    // Validate File Type
    $allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    $allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
    
    $fileMime = mime_content_type($file['tmp_name']);
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($fileMime, $allowedMimes) || !in_array($fileExt, $allowedExts)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only PDF, JPG, and PNG are allowed.']);
        exit;
    }

    // Validate File Size (10MB limit)
    $maxSize = 10 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        echo json_encode(['status' => 'error', 'message' => 'File exceeds 10MB limit.']);
        exit;
    }

    // Prepare Upload Directory
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate Safe Unique File Name
    $safeFileName = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($file['name']));
    $uniqueFileName = time() . '_' . uniqid() . '_' . $safeFileName;
    $destination = $uploadDir . $uniqueFileName;
    $relativePath = 'uploads/' . $uniqueFileName;

    // Move file
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        // Save to Database
        $stmt = $pdo->prepare("INSERT INTO uploads (file_name, file_path) VALUES (?, ?)");
        if ($stmt->execute([$file['name'], $relativePath])) {
            echo json_encode([
                'status' => 'success', 
                'message' => 'File uploaded successfully!',
                'data' => [
                    'file_name' => htmlspecialchars($file['name']),
                    'file_path' => $relativePath
                ]
            ]);
        } else {
            // Rollback file if db fails
            unlink($destination);
            echo json_encode(['status' => 'error', 'message' => 'Database error. File not saved.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file.']);
    }

} else {
     echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
