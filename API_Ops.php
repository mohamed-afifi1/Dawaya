<?php
// ============================================================
//  API_Ops.php — External Drug Data via openFDA
//  Middleman between API_Ops.js and openFDA API
//  No API key required — openFDA is free and open
// ============================================================

define('OPENFDA_BASE', 'https://api.fda.gov/drug/label.json');
define('OPENFDA_LIMIT', 5); // how many results to return

// ── Response Helper ──────────────────────────────────────────
function respond(string $status, mixed $data = null, string $message = ''): void {
    header('Content-Type: application/json');
    echo json_encode([
        'status'  => $status,
        'message' => $message,
        'data'    => $data,
    ]);
    exit;
}

// ── cURL Helper ───────────────────────────────────────────────
function fetchFromFDA(string $url): array|false {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_USERAGENT      => 'Dawaya/1.0',
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($response === false || $httpCode !== 200) {
        return false;
    }

    return json_decode($response, true);
}

// ── Clean & extract useful fields from FDA result ─────────────
function extractDrugInfo(array $result): array {
    $openfda = $result['openfda'] ?? [];

    return [
        'brand_name'   => $openfda['brand_name'][0]    ?? 'N/A',
        'generic_name' => $openfda['generic_name'][0]  ?? 'N/A',
        'manufacturer' => $openfda['manufacturer_name'][0] ?? 'N/A',
        'product_type' => $openfda['product_type'][0]  ?? 'N/A',
        'route'        => $openfda['route'][0]          ?? 'N/A',
        'atc_code'     => $openfda['pharm_class_epc'][0] ?? 'N/A',
        'purpose'      => $result['purpose'][0]         ?? 'N/A',
        'warnings'     => $result['warnings'][0]        ?? 'N/A',
        'dosage'       => $result['dosage_and_administration'][0] ?? 'N/A',
        'indications'  => $result['indications_and_usage'][0] ?? 'N/A',
    ];
}

// ── Search by brand name ──────────────────────────────────────
function searchByBrandName(string $query): void {
    $encoded = urlencode('openfda.brand_name:"' . $query . '"');
    $url     = OPENFDA_BASE . '?search=' . $encoded . '&limit=' . OPENFDA_LIMIT;

    $data = fetchFromFDA($url);

    if (!$data || empty($data['results'])) {
        respond('error', message: "No results found for brand name: $query");
    }

    $results = array_map('extractDrugInfo', $data['results']);
    respond('success', ['results' => $results, 'total' => $data['meta']['results']['total'] ?? 0]);
}

// ── Search by generic name ────────────────────────────────────
function searchByGenericName(string $query): void {
    $encoded = urlencode('openfda.generic_name:"' . $query . '"');
    $url     = OPENFDA_BASE . '?search=' . $encoded . '&limit=' . OPENFDA_LIMIT;

    $data = fetchFromFDA($url);

    if (!$data || empty($data['results'])) {
        respond('error', message: "No results found for generic name: $query");
    }

    $results = array_map('extractDrugInfo', $data['results']);
    respond('success', ['results' => $results, 'total' => $data['meta']['results']['total'] ?? 0]);
}

// ── Search by ATC code ────────────────────────────────────────
function searchByATC(string $atc): void {
    $encoded = urlencode('openfda.pharm_class_epc:"' . $atc . '"');
    $url     = OPENFDA_BASE . '?search=' . $encoded . '&limit=' . OPENFDA_LIMIT;

    $data = fetchFromFDA($url);

    if (!$data || empty($data['results'])) {
        respond('error', message: "No results found for ATC code: $atc");
    }

    $results = array_map('extractDrugInfo', $data['results']);
    respond('success', ['results' => $results, 'total' => $data['meta']['results']['total'] ?? 0]);
}

// ── Smart search (tries brand first, then generic) ────────────
function smartSearch(string $query): void {
    // Try brand name first
    $encoded = urlencode('openfda.brand_name:"' . $query . '"');
    $url     = OPENFDA_BASE . '?search=' . $encoded . '&limit=' . OPENFDA_LIMIT;
    $data    = fetchFromFDA($url);

    // If no results, try generic name
    if (!$data || empty($data['results'])) {
        $encoded = urlencode('openfda.generic_name:"' . $query . '"');
        $url     = OPENFDA_BASE . '?search=' . $encoded . '&limit=' . OPENFDA_LIMIT;
        $data    = fetchFromFDA($url);
    }

    // If still no results, try broad search
    if (!$data || empty($data['results'])) {
        $encoded = urlencode($query);
        $url     = OPENFDA_BASE . '?search=' . $encoded . '&limit=' . OPENFDA_LIMIT;
        $data    = fetchFromFDA($url);
    }

    if (!$data || empty($data['results'])) {
        respond('error', message: "No results found for: $query");
    }

    $results = array_map('extractDrugInfo', $data['results']);
    respond('success', ['results' => $results, 'total' => $data['meta']['results']['total'] ?? 0]);
}

// ============================================================
//  AJAX ROUTER
// ============================================================
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json');

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $query  = trim($_GET['query']  ?? $_POST['query']  ?? '');

    if (empty($query) && $action !== '') {
        respond('error', message: 'Search query is required.');
    }

    switch ($action) {
        case 'search':
            smartSearch($query);
            break;

        case 'search_brand':
            searchByBrandName($query);
            break;

        case 'search_generic':
            searchByGenericName($query);
            break;

        case 'search_atc':
            searchByATC($query);
            break;

        default:
            respond('error', message: 'Unknown action.');
    }
}