import config from "../config";
import IEmailPayload from "../interfaces/emailpayload";
function getCurrentDateTime() {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  } as Intl.DateTimeFormatOptions;

  const currentDateTime = new Date().toLocaleDateString("en-US", options);
  return currentDateTime;
}
const emailTemplate = (target: string, payload?: IEmailPayload) => {
  let website = config.frontend;
  let html;
  if (target === "contactForm") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Contact Information</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h2 {
      color: #333;
    }

    .info-item {
      margin-bottom: 20px;
    }

    .info-item label {
      font-weight: bold;
    }

    .info-item p {
      margin: 5px 0;
    }

    .button {
      display: inline-block;
      padding: 10px 20px;
      text-decoration: none;
      background-color: #007bff;
      color: #fff;
      border-radius: 4px;
    }

    .button:hover {
      background-color: #0056b3;
    }
  </style>
</head>

<body>
  <div class="container">
    <h2>Contact Information</h2>
    <div class="info-item">
      <label>First Name:</label>
      <p>${payload?.firstName}</p>
    </div>
    <div class="info-item">
      <label>Last Name:</label>
      <p>${payload?.lastName}</p>
    </div>
    <div class="info-item">
      <label>Email:</label>
      <p>${payload?.email}</p>
    </div>
    <div class="info-item">
      <label>Phone:</label>
      <p>${payload?.phone}</p>
    </div>
    <div class="info-item">
      <label>Message:</label>
      <p>${payload?.message}</p>
    </div>
    <p style="text-align: center; margin-top: 20px; color: #666;">&copy; 2026 EduDrop Foundation</p>
    
  </div>
</body>

</html>

`;
  } else if (target === "bursarAccount") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Bursar Account Created</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      width: 80%;
      margin: auto;
      overflow: hidden;
    }

    header {
      background: #2c3e50;
      color: #ffffff;
      padding-top: 30px;
      min-height: 70px;
      border-bottom: #e8491d 3px solid;
    }

    header h1 {
      padding: 5px 0;
    }

    main {
      padding: 20px 0;
    }

    .content {
      background: #fff;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    footer {
      background: #2c3e50;
      color: #fff;
      padding: 20px 0;
      text-align: center;
    }
  </style>
</head>

<body>
  <header>
    <div class="container">
      <h1>Bursar Account Created</h1>
    </div>
  </header>
  <main>
    <div class="container">
      <div class="content">
        <p>Dear Bursar,</p>
        <p>Your account has been successfully created. Here are your login details:</p>
        <ul>
          <li><strong>Username:</strong> ${payload?.username}</li>
          <li><strong>Password:</strong> ${payload?.password}</li>
        </ul>
        <p>
          <strong>Login URL:</strong> <a target="_blank" rel="noopener noreferrer" href="${website}/bursar-login">Login Here</a>
        </p>
        <p><strong>Important:</strong> Please remember to always use this login URL to access your account and do not share your login credentials with anyone.</p>
      </div>
    </div>
  </main>
  <footer>
    <div class="container">
      <p>&copy; 2026 EduDrop Bursar Management System</p>
    </div>
  </footer>
</body>

</html>
`;
  } else if (target === "bursarAccountStatus") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Account Status Update</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      width: 80%;
      margin: auto;
      overflow: hidden;
    }

    header {
      background: #2c3e50;
      color: #ffffff;
      padding-top: 30px;
      min-height: 70px;
      border-bottom: #e8491d 3px solid;
    }

    header h1 {
      padding: 5px 0;
    }

    main {
      padding: 20px 0;
    }

    .content {
      background: #fff;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    footer {
      background: #2c3e50;
      color: #fff;
      padding: 20px 0;
      text-align: center;
    }
  </style>
</head>

<body>
  <header>
    <div class="container">
      <h1>Account Status Update</h1>
    </div>
  </header>
  <main>
    <div class="container">
      <div class="content">
        <p>Dear User,</p>
        <p>Your account has been <strong>${
          payload?.active ? "ACTIVATED" : "DEACTIVATED"
        }</strong>.</p>
        <p>If you have any questions or concerns, please contact our support team.</p>
        <p>Thank you.</p>
      </div>
    </div>
  </main>
  <footer>
    <div class="container">
      <p>&copy; 2026 EduDrop Account Management System</p>
    </div>
  </footer>
</body>

</html>
`;
  } else if (target === "bursarAccountEnable") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Account Status Update</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      width: 80%;
      margin: auto;
      overflow: hidden;
    }

    header {
      background: #2c3e50;
      color: #ffffff;
      padding-top: 30px;
      min-height: 70px;
      border-bottom: #e8491d 3px solid;
    }

    header h1 {
      padding: 5px 0;
    }

    main {
      padding: 20px 0;
    }

    .content {
      background: #fff;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    footer {
      background: #2c3e50;
      color: #fff;
      padding: 20px 0;
      text-align: center;
    }
  </style>
</head>

<body>
  <header>
    <div class="container">
      <h1>Account Status Update</h1>
    </div>
  </header>
  <main>
    <div class="container">
      <div class="content">
        <p>Dear User,</p>
        <p>Your account has been <strong>${
          payload?.enabled ? "Enabled" : "Disabled"
        }</strong>.</p>
        <p>If you have any questions or concerns, please contact our support team.</p>
        <p>Thank you.</p>
      </div>
    </div>
  </main>
  <footer>
    <div class="container">
      <p>&copy; 2026 EduDrop Account Management System</p>
    </div>
  </footer>
</body>

</html>
`;
  } else if (target === "donarAccount") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Donar Account Created</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      width: 80%;
      margin: auto;
      overflow: hidden;
    }

    header {
      background: #2c3e50;
      color: #ffffff;
      padding-top: 30px;
      min-height: 70px;
      border-bottom: #e8491d 3px solid;
    }

    header h1 {
      padding: 5px 0;
    }

    main {
      padding: 20px 0;
    }

    .content {
      background: #fff;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    footer {
      background: #2c3e50;
      color: #fff;
      padding: 20px 0;
      text-align: center;
    }
  </style>
</head>

<body>
  <header>
    <div class="container">
      <h1>Donar Account Created</h1>
    </div>
  </header>
  <main>
    <div class="container">
      <div class="content">
        <p>Dear Donar,</p>
        <p>Your account has been successfully created. Here are your login details:</p>
        <ul>
          <li><strong>Username:</strong> ${payload?.username}</li>
          <li><strong>Password:</strong> ${payload?.password}</li>
        </ul>
        <p>
          <strong>Login URL:</strong> <a target="_blank" rel="noopener noreferrer" href="${website}/login">Login Here</a>
        </p>
        <p><strong>Important:</strong> Please don't forget to change your password</p>
      </div>
    </div>
  </main>
  <footer>
    <div class="container">
      <p>&copy; 2026 EduDrop Bursar Management System</p>
    </div>
  </footer>
</body>

</html>
`;
  } else if (target === "resetToken") {
    html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Password Reset</h1>
      <p>You have requested to reset your password. Here is your password reset token:</p>
      <p><strong>${payload?.resetToken}</strong></p>
      <p>Visit this link and enter your token</p>
      <a href="${website}/forget-reset" target="_blank" rel="noopener noreferrer"><strong>${website}/forget-reset</strong></a>
      <p>If you did not request this change, you can safely ignore this email.</p>
      <p>Thank you!</p>
    </body>
    </html>
  `;
  } else if (target === "orderStatus") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
    }

    p {
      color: #555;
    }

    .order-id {
      font-weight: bold;
      color: #009688;
    }

    .footer {
      margin-top: 20px;
      color: #777;
    }
  </style>
</head>

<body>

  <div class="container">
    <h1>Order Status Update</h1>
    <p>Your order with ID <span class="order-id">${payload?.orderId}</span> has been updated.</p>
    <p>New Status: ${payload?.orderStatus}</p>
    <p>Thank you for choosing our services!</p>

    <div class="footer">
      <p>If you have any questions, please contact our customer support.</p>
    </div>
  </div>

</body>

</html>
`;
  } else if (target === "paymentStatus") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
    }

    p {
      color: #555;
    }

    .order-id {
      font-weight: bold;
      color: #009688;
    }

    .footer {
      margin-top: 20px;
      color: #777;
    }
  </style>
</head>

<body>

  <div class="container">
    <h1>Payment Status Update</h1>
    <p>Payment status for your order with ID <span class="order-id">${payload?.orderId}</span> has been updated.</p>
    <p>New Status: ${payload?.paymentStatus}</p>
    <p>Thank you for choosing our services!</p>

    <div class="footer">
      <p>If you have any questions, please contact our customer support.</p>
    </div>
  </div>

</body>

</html>
`;
  } else if (target === "newOrder") {
    html = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Confirmation</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
    }

    p {
      color: #555;
    }

    .order-details {
      margin-top: 20px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }

    .order-id {
      font-weight: bold;
      color: #009688;
    }

    .footer {
      margin-top: 20px;
      color: #777;
    }
  </style>
</head>

<body>

  <div class="container">
    <h1>New Order Confirmation</h1>
    <p>Thank you for placing a new order with us. We appreciate your business!</p>

    <div class="order-details">
      <p>Your order details:</p>
      <p><span class="order-id">Order ID:</span> ${payload?.order?.orderId}</p>
      <p>Order Date: ${getCurrentDateTime()}</p>
      <!-- Add more order details as needed -->
    </div>

    <p>We will process your order and provide updates on its status. If you have any questions, feel free to contact our customer support.</p>

    <div class="footer">
      <p>Thank you for choosing our services!</p>
    </div>
  </div>

</body>

</html>
`;
  }
  return html;
};

export default emailTemplate;
