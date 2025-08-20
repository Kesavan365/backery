<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "cake_shop";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

$name    = $_POST['name'] ?? '';
$contact = $_POST['contact'] ?? '';
$address = $_POST['address'] ?? '';
$delivery_date = $_POST['delivery_date'] ?? '';
$cost    = $_POST['cost'] ?? '';

$filePath = null;
if (isset($_FILES['cakeModel']) && $_FILES['cakeModel']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = "ordered_model/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = basename($_FILES["cakeModel"]["name"]);
    $filePath = $uploadDir . $fileName;

    if (!move_uploaded_file($_FILES["cakeModel"]["tmp_name"], $filePath)) {
        die("❌ File upload failed.");
    }
}

// Insert into DB
$sql = "INSERT INTO cake_orders (customer_name, contact, address, delivery_date, cost, model_path) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    die("❌ SQL Error: " . $conn->error);
}

$stmt->bind_param("ssssis", $name, $contact, $address, $delivery_date, $cost, $filePath);

if ($stmt->execute()) {
    echo "✅ Order placed successfully with delivery date!";
} else {
    echo "❌ Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
