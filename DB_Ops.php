<?php
// ============================================================
//  DB_Ops.php — DawayaDB Database Operations
//  Handles all CRUD for Inventory & Uploads tables
// ============================================================

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// ── Connection ───────────────────────────────────────────────
function getConnection(): PDO {
$host = '127.0.0.1';
$db   = 'dawayadb';
$user = 'root';
$pass = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['success' => false, 'error' => 'Database connection failed.']));
    }
}

// ── Response Helper ──────────────────────────────────────────
function respond(bool $success, mixed $data = null, string $error = ''): void {
    header('Content-Type: application/json');
    echo json_encode($success
        ? ['success' => true,  'data'  => $data]
        : ['success' => false, 'error' => $error]
    );
    exit;
}

// ============================================================
//  AUTHENTICATION & AUTHORIZATION
// ============================================================

function ensureUsersTableAndSeed(): void {
    $pdo = getConnection();
    $pdo->exec('
        CREATE TABLE IF NOT EXISTS Users (
            id INT NOT NULL AUTO_INCREMENT,
            full_name VARCHAR(120) NOT NULL,
            username VARCHAR(80) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM("customer", "pharmacy") NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ');

    $count = (int) $pdo->query('SELECT COUNT(*) FROM Users')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $stmt = $pdo->prepare('INSERT INTO Users (full_name, username, password_hash, role) VALUES (:full_name, :username, :password_hash, :role)');

    $defaultUsers = [
        ['Customer User', 'customer', 'customer123', 'customer'],
        ['Pharmacy User', 'pharmacy', 'pharmacy123', 'pharmacy'],
    ];

    foreach ($defaultUsers as [$fullName, $username, $plainPassword, $role]) {
        $stmt->execute([
            ':full_name'     => $fullName,
            ':username'      => $username,
            ':password_hash' => password_hash($plainPassword, PASSWORD_DEFAULT),
            ':role'          => $role,
        ]);
    }
}

function loginUser(string $username, string $password): array|false {
    ensureUsersTableAndSeed();
    $pdo = getConnection();
    $stmt = $pdo->prepare('SELECT id, full_name, username, password_hash, role FROM Users WHERE username = :username LIMIT 1');
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        return false;
    }

    return [
        'id'        => (int) $user['id'],
        'full_name' => $user['full_name'],
        'username'  => $user['username'],
        'role'      => $user['role'],
    ];
}

function registerUser(string $fullName, string $username, string $password, string $role): array {
    ensureUsersTableAndSeed();

    $fullName = trim($fullName);
    $username = strtolower(trim($username));
    $role = strtolower(trim($role));

    if ($fullName === '' || mb_strlen($fullName) < 3) {
        respond(false, error: 'Full name must be at least 3 characters.');
    }

    if (!preg_match('/^[a-z0-9_]{3,30}$/', $username)) {
        respond(false, error: 'Username must be 3-30 chars using letters, numbers, or underscore.');
    }

    if (strlen($password) < 6) {
        respond(false, error: 'Password must be at least 6 characters.');
    }

    if (!in_array($role, ['customer', 'pharmacy'], true)) {
        respond(false, error: 'Role must be either customer or pharmacy.');
    }

    $pdo = getConnection();
    $existsStmt = $pdo->prepare('SELECT id FROM Users WHERE username = :username LIMIT 1');
    $existsStmt->execute([':username' => $username]);
    if ($existsStmt->fetch()) {
        respond(false, error: 'Username already exists.');
    }

    $stmt = $pdo->prepare('INSERT INTO Users (full_name, username, password_hash, role) VALUES (:full_name, :username, :password_hash, :role)');
    $stmt->execute([
        ':full_name'     => $fullName,
        ':username'      => $username,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':role'          => $role,
    ]);

    return [
        'id'        => (int) $pdo->lastInsertId(),
        'full_name' => $fullName,
        'username'  => $username,
        'role'      => $role,
    ];
}

function getSessionUser(): array|null {
    return $_SESSION['user'] ?? null;
}

function requireAuth(): array {
    $user = getSessionUser();
    if (!$user) {
        http_response_code(401);
        respond(false, error: 'Authentication required.');
    }
    return $user;
}

function requireRole(array $roles): array {
    $user = requireAuth();
    if (!in_array($user['role'], $roles, true)) {
        http_response_code(403);
        respond(false, error: 'You are not authorized for this action.');
    }
    return $user;
}

// ============================================================
//  INVENTORY OPERATIONS
// ============================================================

// ── READ: Get all medicines (with optional search & filters) ─
function getAllMedicines(string $search = ''): array {
    $pdo = getConnection();
    
    if ($search !== '') {
        // Use LIKE to find the medicine name or generic name
        $stmt = $pdo->prepare("SELECT * FROM Inventory WHERE medicine_name LIKE ? OR generic_name LIKE ? ORDER BY created_at DESC");
        $searchTerm = "%$search%";
        $stmt->execute([$searchTerm, $searchTerm]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Inventory ORDER BY created_at DESC");
    }
    
    return $stmt->fetchAll();
}

// ── READ: Get single medicine by ID ─────────────────────────
function getMedicineById(int $id): array|false {
    $pdo  = getConnection();
    $stmt = $pdo->prepare('SELECT * FROM Inventory WHERE id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch();
}

// ── READ: Get low-stock medicines ───────────────────────────
function getLowStockMedicines(int $threshold = 10): array {
    $pdo  = getConnection();
    $stmt = $pdo->prepare('SELECT * FROM Inventory WHERE stock <= :threshold ORDER BY stock ASC');
    $stmt->execute([':threshold' => $threshold]);
    return $stmt->fetchAll();
}

// ── CREATE: Add new medicine ─────────────────────────────────
function addMedicine(array $data): int|false {
    $required = ['medicine_name', 'price', 'stock'];
    foreach ($required as $field) {
        if (empty($data[$field]) && $data[$field] !== 0) {
            respond(false, error: "Missing required field: $field");
        }
    }

    if (!is_numeric($data['price']) || $data['price'] < 0) {
        respond(false, error: 'Price must be a non-negative number.');
    }
    if (!is_numeric($data['stock']) || $data['stock'] < 0) {
        respond(false, error: 'Stock must be a non-negative integer.');
    }

    // Handle Image Upload
    $imagePath = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        
        $fileName = time() . '_' . basename($_FILES['image']['name']);
        $targetFile = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $imagePath = 'uploads/' . $fileName;
        }
    }

    $pdo  = getConnection();
    $stmt = $pdo->prepare('
        INSERT INTO Inventory
            (medicine_name, generic_name, atc_code, drug_type, category, source, price, stock, image_path)
        VALUES
            (:medicine_name, :generic_name, :atc_code, :drug_type, :category, :source, :price, :stock, :image_path)
    ');

    $stmt->execute([
        ':medicine_name' => trim($data['medicine_name']),
        ':generic_name'  => trim($data['generic_name']  ?? ''),
        ':atc_code'      => trim($data['atc_code']      ?? ''),
        ':drug_type'     => trim($data['drug_type']     ?? ''),
        ':category'      => trim($data['category']      ?? ''),
        ':source'        => trim($data['source']        ?? 'Local'),
        ':price'         => (float)  $data['price'],
        ':stock'         => (int)    $data['stock'],
        ':image_path'    => $imagePath,
    ]);

    return (int) $pdo->lastInsertId();
}

// ── UPDATE: Edit medicine ─────────────────────────────────────
function updateMedicine(int $id, array $data): bool {
    $existing = getMedicineById($id);
    if (!$existing) {
        respond(false, error: 'Medicine not found.');
    }

    if (isset($data['price']) && (!is_numeric($data['price']) || $data['price'] < 0)) {
        respond(false, error: 'Price must be a non-negative number.');
    }
    if (isset($data['stock']) && (!is_numeric($data['stock']) || $data['stock'] < 0)) {
        respond(false, error: 'Stock must be a non-negative integer.');
    }

    // Handle Image Upload
    $imagePath = $existing['image_path']; // Keep existing by default
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        
        $fileName = time() . '_' . basename($_FILES['image']['name']);
        $targetFile = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            // Delete old image if it exists and is not the placeholder
            if ($imagePath && file_exists(__DIR__ . '/' . $imagePath)) {
                unlink(__DIR__ . '/' . $imagePath);
            }
            $imagePath = 'uploads/' . $fileName;
        }
    }

    $pdo  = getConnection();
    $stmt = $pdo->prepare('
        UPDATE Inventory SET
            medicine_name = :medicine_name,
            generic_name  = :generic_name,
            atc_code      = :atc_code,
            drug_type     = :drug_type,
            category      = :category,
            source        = :source,
            price         = :price,
            stock         = :stock,
            image_path    = :image_path,
            updated_at    = CURRENT_TIMESTAMP
        WHERE id = :id
    ');

    return $stmt->execute([
        ':id'            => $id,
        ':medicine_name' => trim($data['medicine_name']),
        ':generic_name'  => trim($data['generic_name']  ?? ''),
        ':atc_code'      => trim($data['atc_code']      ?? ''),
        ':drug_type'     => trim($data['drug_type']     ?? ''),
        ':category'      => trim($data['category']      ?? ''),
        ':source'        => trim($data['source']        ?? 'Local'),
        ':price'         => (float) $data['price'],
        ':stock'         => (int)   $data['stock'],
        ':image_path'    => $imagePath,
    ]);
}

// ── UPDATE: Adjust stock only (for quick stock operations) ───
function adjustStock(int $id, int $delta): bool {
    $pdo  = getConnection();
    // Prevents stock going below 0
    $stmt = $pdo->prepare('
        UPDATE Inventory
        SET stock = GREATEST(0, stock + :delta), updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
    ');
    return $stmt->execute([':delta' => $delta, ':id' => $id]);
}

// ── DELETE: Remove medicine ───────────────────────────────────
function deleteMedicine(int $id): bool {
    if (!getMedicineById($id)) {
        respond(false, error: 'Medicine not found.');
    }
    $pdo  = getConnection();
    $stmt = $pdo->prepare('DELETE FROM Inventory WHERE id = :id');
    return $stmt->execute([':id' => $id]);
}

// ── READ: Inventory summary stats ────────────────────────────
function getInventoryStats(): array {
    $pdo  = getConnection();
    $stmt = $pdo->query('
        SELECT
            COUNT(*)                          AS total_medicines,
            SUM(stock)                        AS total_stock,
            SUM(price * stock)                AS total_inventory_value,
            COUNT(CASE WHEN stock = 0 THEN 1 END)  AS out_of_stock,
            COUNT(CASE WHEN stock <= 10 THEN 1 END) AS low_stock
        FROM Inventory
    ');
    return $stmt->fetch();
}

// ============================================================
//  UPLOADS OPERATIONS
// ============================================================

// ── CREATE: Save upload record ────────────────────────────────
function saveUploadRecord(string $fileName, string $filePath, string $fileType, int $fileSize): int {
    $pdo  = getConnection();
    $stmt = $pdo->prepare('
        INSERT INTO Uploads (file_name, file_path, file_type, file_size)
        VALUES (:file_name, :file_path, :file_type, :file_size)
    ');
    $stmt->execute([
        ':file_name' => $fileName,
        ':file_path' => $filePath,
        ':file_type' => $fileType,
        ':file_size' => $fileSize,
    ]);
    return (int) $pdo->lastInsertId();
}

// ── READ: Get all uploads (with optional type filter) ────────
function getAllUploads(string $fileType = '', int $limit = 50, int $offset = 0): array {
    $pdo    = getConnection();
    $params = [];
    $where  = '';

    if ($fileType !== '') {
        $where          = 'WHERE file_type = :file_type';
        $params[':file_type'] = $fileType;
    }

    $stmt = $pdo->prepare("SELECT * FROM Uploads $where ORDER BY uploaded_at DESC LIMIT :limit OFFSET :offset");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll();
}

// ── READ: Get single upload by ID ────────────────────────────
function getUploadById(int $id): array|false {
    $pdo  = getConnection();
    $stmt = $pdo->prepare('SELECT * FROM Uploads WHERE id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch();
}

// ── DELETE: Remove upload record (and optionally the file) ───
function deleteUpload(int $id, bool $deleteFile = true): bool {
    $upload = getUploadById($id);
    if (!$upload) {
        respond(false, error: 'Upload record not found.');
    }

    if ($deleteFile && file_exists($upload['file_path'])) {
        unlink($upload['file_path']);
    }

    $pdo  = getConnection();
    $stmt = $pdo->prepare('DELETE FROM Uploads WHERE id = :id');
    return $stmt->execute([':id' => $id]);
}

// ============================================================
//  AJAX ROUTER — Called when this file is requested directly
// ============================================================
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json');

    $action = $_POST['action'] ?? $_GET['action'] ?? '';

    switch ($action) {

        // ── Auth ──────────────────────────────────────────────
        case 'login':
            $username = trim((string) ($_POST['username'] ?? ''));
            $password = (string) ($_POST['password'] ?? '');

            if ($username === '' || $password === '') {
                respond(false, error: 'Username and password are required.');
            }

            $user = loginUser($username, $password);
            if (!$user) {
                http_response_code(401);
                respond(false, error: 'Invalid username or password.');
            }

            $_SESSION['user'] = $user;
            respond(true, ['user' => $user]);
            break;

        case 'register':
            $fullName = (string) ($_POST['full_name'] ?? '');
            $username = (string) ($_POST['username'] ?? '');
            $password = (string) ($_POST['password'] ?? '');
            $role = (string) ($_POST['role'] ?? 'customer');

            $user = registerUser($fullName, $username, $password, $role);
            $_SESSION['user'] = $user;
            respond(true, ['user' => $user]);
            break;

        case 'logout':
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params['path'], $params['domain'],
                    $params['secure'], $params['httponly']
                );
            }
            session_destroy();
            respond(true, ['logged_out' => true]);
            break;

        case 'get_session':
            respond(true, ['user' => getSessionUser()]);
            break;

        // ── Inventory ──────────────────────────────────────────
        case 'get_all_medicines':
            requireAuth();
            // Capture the search query from the URL if it exists
            $search = $_GET['search'] ?? ''; 
            respond(true, getAllMedicines($search));
            break;

        case 'get_medicine':
            requireAuth();
            $id = (int)($_GET['id'] ?? 0);
            $result = getMedicineById($id);
            $result ? respond(true, $result) : respond(false, error: 'Not found.');
            break;

        case 'add_medicine':
            requireRole(['pharmacy']);
            $id = addMedicine($_POST);
            $id ? respond(true, ['id' => $id]) : respond(false, error: 'Insert failed.');
            break;

        case 'update_medicine':
            requireRole(['pharmacy']);
            $id = (int)($_POST['id'] ?? 0);
            updateMedicine($id, $_POST) ? respond(true) : respond(false, error: 'Update failed.');
            break;

        case 'adjust_stock':
            requireRole(['pharmacy']);
            $id    = (int)($_POST['id']    ?? 0);
            $delta = (int)($_POST['delta'] ?? 0);
            adjustStock($id, $delta) ? respond(true) : respond(false, error: 'Stock update failed.');
            break;

        case 'delete_medicine':
            requireRole(['pharmacy']);
            $id = (int)($_POST['id'] ?? 0);
            deleteMedicine($id) ? respond(true) : respond(false, error: 'Delete failed.');
            break;

        case 'get_inventory_stats':
            requireAuth();
            respond(true, getInventoryStats());
            break;

        case 'get_low_stock':
            requireAuth();
            $threshold = (int)($_GET['threshold'] ?? 10);
            respond(true, getLowStockMedicines($threshold));
            break;

        // ── Uploads ───────────────────────────────────────────
        case 'get_all_uploads':
            requireRole(['pharmacy']);
            respond(true, getAllUploads(
                $_GET['file_type'] ?? '',
                (int)($_GET['limit']  ?? 50),
                (int)($_GET['offset'] ?? 0)
            ));
            break;

        case 'get_upload':
            requireRole(['pharmacy']);
            $id     = (int)($_GET['id'] ?? 0);
            $result = getUploadById($id);
            $result ? respond(true, $result) : respond(false, error: 'Not found.');
            break;

        case 'delete_upload':
            requireRole(['pharmacy']);
            $id = (int)($_POST['id'] ?? 0);
            deleteUpload($id) ? respond(true) : respond(false, error: 'Delete failed.');
            break;

        default:
            respond(false, error: 'Unknown action.');
    }
}