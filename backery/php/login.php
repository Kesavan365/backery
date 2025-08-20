<?php
session_start();
$host = "localhost";
$user = "root";
$pass = "";
$db   = "cake_shop";
$conn = new mysqli($host, $user, $pass, $db);

$msg = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $role     = $_POST['role']; // admin or user

    if ($role === "admin") {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE username=?");
        $stmt->bind_param("s", $username);
    } else {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email=?");
        $stmt->bind_param("s", $username);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['password'])) {
            if ($role === "admin") {
                $_SESSION['admin'] = $row['username'];
                header("Location: admin_dashboard.php");
                exit;
            } else {
                $_SESSION['user'] = $row['email'];
                header("Location: ../index.html");
                exit;
            }
        } else {
            $msg = "❌ Invalid password";
        }
    } else {
        $msg = "❌ Account not found";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login | Birthdaycake</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #ff9a9e, #fad0c4);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .login-container {
      background: #fff;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.1);
      width: 350px;
      text-align: center;
    }

    .login-container h2 {
      margin-bottom: 20px;
      color: #ff4081;
    }

    .login-container select,
    .login-container input {
      width: 100%;
      padding: 12px;
      margin-top: 12px;
      border-radius: 12px;
      border: 1px solid #ddd;
      outline: none;
      transition: 0.3s;
    }

    .login-container input:focus,
    .login-container select:focus {
      border-color: #ff4081;
      box-shadow: 0px 0px 5px rgba(255, 64, 129, 0.3);
    }

    .login-container button {
      margin-top: 20px;
      width: 100%;
      padding: 12px;
      background: #ff4081;
      border: none;
      border-radius: 15px;
      color: #fff;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: 0.3s;
    }

    .login-container button:hover {
      background: #e91e63;
    }

    .login-container p.message {
      margin-top: 15px;
      font-size: 14px;
      color: red;
    }

    .login-container .ca {
      display: block;
      margin-top: 15px;
      color: #555;
      text-decoration: none;
      font-size: 14px;
    }

    .login-container .ca:hover {
      color: #ff4081;
      text-decoration: underline;
    }
  </style>  
</head>
<body>
  <form method="POST" class="login-container">
    <h2>🔑 Login</h2>
    <?php if ($msg): ?>
      <p class="message"><?= $msg ?></p>
    <?php endif; ?>

    <select name="role" required>
      <option value="user">👤 User</option>
      <option value="admin">🔑 Admin</option>
    </select>

    <input type="text" name="username" placeholder="Email (User) / Username (Admin)" required>
    <input type="password" name="password" placeholder="Password" required>

    <button type="submit">Login</button>
    <a href="signup.php" class="ca">Don’t have an account? Sign Up</a>
  </form>
</body>
</html>
