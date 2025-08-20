<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "cake_shop";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// ✅ Delete order if requested
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $conn->query("DELETE FROM cake_orders WHERE id=$id");
    header("Location: " . strtok($_SERVER["REQUEST_URI"], '?')); // refresh without query string
    exit;
}

$result = $conn->query("SELECT * FROM cake_orders ORDER BY id DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cake Orders</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #ff4081; }
    .order {
      border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;
      border-radius: 10px; display: flex; gap: 20px; align-items: flex-start;
    }
    .details { flex: 1; }
    model-viewer {
      width: 300px; height: 300px; background: #f9f9f9;
      border-radius: 10px; border: 1px solid #ddd;
    }
    .delete-btn {
      background: #ff4d4d; color: white; border: none; padding: 8px 12px;
      border-radius: 5px; cursor: pointer; font-size: 14px;
    }
    .delete-btn:hover { background: #cc0000; }
  </style>
  <!-- ✅ Google model-viewer library for .glb preview -->
  <script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"></script>
</head>
<body>
  <h1>📦 Cake Orders</h1>

  <?php while($row = $result->fetch_assoc()): ?>
    <div class="order">
      <div class="details">
        <p><b>Customer:</b> <?= htmlspecialchars($row['customer_name']) ?></p>
        <p><b>Contact:</b> <?= htmlspecialchars($row['contact']) ?></p>
        <p><b>Address:</b> <?= htmlspecialchars($row['address']) ?></p>
        <p><b>Cost:</b> ₹<?= htmlspecialchars($row['cost']) ?></p>
        <p><b>Delivery Date:</b> <?= htmlspecialchars($row['delivery_date']) ?></p>
        <p><b>Ordered At:</b> <?= htmlspecialchars($row['created_at']) ?></p>

        <!-- ✅ Delete Button -->
        <form method="get" onsubmit="return confirm('Are you sure you want to delete this order?');">
          <input type="hidden" name="delete" value="<?= $row['id'] ?>">
          <button type="submit" class="delete-btn">🗑 Delete</button>
        </form>
      </div>

      <?php if (!empty($row['model_path'])): ?>
        <model-viewer src="<?= htmlspecialchars($row['model_path']) ?>" 
                      alt="Cake 3D Model"
                      auto-rotate camera-controls ar></model-viewer>
      <?php else: ?>
        <p>No 3D model saved</p>
      <?php endif; ?>
    </div>
  <?php endwhile; ?>

</body>
</html>
<?php $conn->close(); ?>
