<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: admin_login.php");
    exit;
}

$host = "localhost";
$user = "root";
$pass = "";
$db   = "cake_shop";
$conn = new mysqli($host, $user, $pass, $db);

// ✅ Delete order if requested
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $conn->query("DELETE FROM cake_orders WHERE id=$id");
    header("Location: admin_dashboard.php");
    exit;
}

$result = $conn->query("SELECT * FROM cake_orders ORDER BY id DESC");
?>
<!DOCTYPE html>
<html>
<head>
  <title>Admin Dashboard</title>
  <!-- Google Icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    body { font-family: Arial, sans-serif; margin:20px; background:#f9f9f9; }
    h1 { color:#ff4081; margin-bottom:20px; }
    .topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .topbar a { text-decoration:none; margin-left:15px; font-weight:bold; color:#333; padding:8px 12px; border-radius:8px; background:#fff; box-shadow:0 2px 5px rgba(0,0,0,0.1); }
    .topbar a:hover { background:#ffebf2; color:#ff4081; }
    .icon { vertical-align: middle; margin-right:5px; }

    /* Order Cards */
    .orders { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px; }
    .card { background:#fff; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
    .card h3 { margin:0 0 10px; color:#333; }
    .card p { margin:5px 0; color:#555; }
    .card .delete { display:inline-flex; align-items:center; color:red; margin-top:10px; text-decoration:none; font-weight:bold; }
    .card .delete:hover { text-decoration:underline; }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>📊 Admin Dashboard</h1>
    <div>
      <a href="../orders.php" class="order">
        <span class="material-icons icon">assignment</span> View Orders
      </a>
      <a href="logout.php" class="logout">
        <span class="material-icons icon">logout</span> Logout
      </a>
    </div>
  </div>
</body>
</html>
