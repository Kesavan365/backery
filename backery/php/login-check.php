<?php 
session_start(); 
include "db_conn.php";

if (isset($_POST['username']) && isset($_POST['password']) && isset($_POST['role'])) {

    function validate($data){
       $data = trim($data);
       $data = stripslashes($data);
       $data = htmlspecialchars($data);
       return $data;
    }

    $username = validate($_POST['username']);
    $password = validate($_POST['password']);
    $role     = validate($_POST['role']); // admin or user

    if (empty($username)) {
        header("Location: login.php?error=Username/Email is required");
        exit();
    } else if (empty($password)) {
        header("Location: login.php?error=Password is required");
        exit();
    } else {
        if ($role === "admin") {
            $stmt = $conn->prepare("SELECT * FROM admins WHERE username=?");
        } else {
            $stmt = $conn->prepare("SELECT * FROM users WHERE email=?");
        }
        
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if (password_verify($password, $row['password'])) {
                if ($role === "admin") {
                    $_SESSION['admin'] = $row['username'];
                    header("Location: admin_dashboard.php");
                    exit();
                } else {
                    $_SESSION['user'] = $row['email'];
                    header("Location: ../index.html");
                    exit();
                }
            } else {
                header("Location: login.php?error=Invalid password");
                exit();
            }
        } else {
            header("Location: login.php?error=Account not found");
            exit();
        }
    }
    
} else {
    header("Location: login.php");
    exit();
}
?>
