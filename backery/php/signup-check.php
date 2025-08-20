<?php 
session_start(); 
include "db_conn.php";

if (isset($_POST['uname']) && isset($_POST['password']) 
    && isset($_POST['re_password']) && isset($_POST['email'])) {

	function validate($data){
       $data = trim($data);
	   $data = stripslashes($data);
	   $data = htmlspecialchars($data);
	   return $data;
	}

	$uname = validate($_POST['uname']);
	$email = validate($_POST['email']);
	$pass = validate($_POST['password']);
	$re_pass = validate($_POST['re_password']);

	$user_data = 'uname='. $uname. '&email='. $email;

	if (empty($email)) {
		header("Location: signup.php?error=Email is required&$user_data");
	    exit();
	} else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		header("Location: signup.php?error=Invalid email format&$user_data");
	    exit();
	} else if (empty($uname)) {
		header("Location: signup.php?error=Username is required&$user_data");
	    exit();
	} else if (empty($pass)) {
        header("Location: signup.php?error=Password is required&$user_data");
	    exit();
	} else if (empty($re_pass)) {
        header("Location: signup.php?error=Confirm Password is required&$user_data");
	    exit();
	} else if ($pass !== $re_pass) {
        header("Location: signup.php?error=Passwords do not match&$user_data");
	    exit();
	} else {
		// hash the password securely
        $hashed_pass = password_hash($pass, PASSWORD_DEFAULT);

	    // check username or email already exists
	    // NEW: checks only email
		$sql = "SELECT * FROM users WHERE email='$email'";

		$result = mysqli_query($conn, $sql);

		if ($result && mysqli_num_rows($result) > 0) {
			header("Location: signup.php?error=Username or Email already taken&$user_data");
	        exit();
		} else {
           $sql2 = "INSERT INTO users(username, email, password) 
                    VALUES('$uname', '$email', '$hashed_pass')";
           $result2 = mysqli_query($conn, $sql2);
           if ($result2) {
           	 header("Location: signup.php?success=🎉 Account created successfully! You can log in now.");
	         exit();
           } else {
	           	header("Location: signup.php?error=Unknown error occurred&$user_data");
		        exit();
           }
		}
	}
	
} else {
	header("Location: signup.php");
	exit();
}
?>
