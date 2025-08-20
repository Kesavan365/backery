<?php
$plain_password = "admin"; // your admin password
$hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);
echo $hashed_password;
?>
