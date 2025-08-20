<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SIGN UP | Birthdaycake</title>
  <link rel="stylesheet" href="../css/style.css">

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

    .signup-container {
      background: #fff;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.1);
      width: 350px;
      text-align: center;
    }

    .signup-container h2 {
      margin-bottom: 20px;
      color: #ff4081;
    }

    .signup-container label {
      display: block;
      margin-top: 10px;
      text-align: left;
      font-weight: bold;
      color: #444;
    }

    .signup-container input {
      width: 100%;
      padding: 10px;
      margin-top: 5px;
      border-radius: 12px;
      border: 1px solid #ddd;
      outline: none;
      transition: 0.3s;
    }

    .signup-container input:focus {
      border-color: #ff4081;
      box-shadow: 0px 0px 5px rgba(255, 64, 129, 0.3);
    }

    .signup-container button {
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

    .signup-container button:hover {
      background: #e91e63;
    }

    .signup-container .ca {
      display: block;
      margin-top: 15px;
      color: #555;
      text-decoration: none;
      font-size: 14px;
    }

    .signup-container .ca:hover {
      color: #ff4081;
      text-decoration: underline;
    }

    .error {
      color: #fff;
      background: #ff5252;
      padding: 10px;
      margin: 10px 0;
      border-radius: 10px;
    }

    .success {
      color: #fff;
      background: #4CAF50;
      padding: 10px;
      margin: 10px 0;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <form action="signup-check.php" method="post" class="signup-container">
    <h2>🍰 SIGN UP</h2>

    <?php if (isset($_GET['error'])) { ?>
      <p class="error"><?php echo $_GET['error']; ?></p>
    <?php } ?>

    <?php if (isset($_GET['success'])) { ?>
      <p class="success"><?php echo $_GET['success']; ?></p>
    <?php } ?>

    <label>Email</label>
    <input type="email" name="email" placeholder="Enter your email"
      value="<?php echo isset($_GET['email']) ? $_GET['email'] : ''; ?>">

    <label>Username</label>
    <input type="text" name="uname" placeholder="Choose a username"
      value="<?php echo isset($_GET['uname']) ? $_GET['uname'] : ''; ?>">

    <label>Password</label>
    <input type="password" name="password" placeholder="Enter password">

    <label>Confirm Password</label>
    <input type="password" name="re_password" placeholder="Re-enter password">

    <button type="submit">Sign Up</button>
    <a href="login.php" class="ca">Already have an account? Log In</a>
  </form>
</body>
</html>
