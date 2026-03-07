import nodemailer from "nodemailer";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

const createTransporter = async () => {
  const useEthereal = process.env.EMAIL_USE_ETHEREAL === "true";
  const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!useEthereal && !hasCredentials) {
    return null;
  }

  if (useEthereal) {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return { transporter, fromEmail: testAccount.user, useEthereal: true };
  }

  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").trim();
  const emailHost = (process.env.EMAIL_HOST || "smtp.gmail.com").trim();
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: emailUser, pass: emailPass },
  });
  return { transporter, fromEmail: emailUser, useEthereal: false };
};

export const sendOrderConfirmationEmail = async (orderId) => {
  const useEthereal = process.env.EMAIL_USE_ETHEREAL === "true";
  const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!useEthereal && !hasCredentials) {
    console.warn(
      "[Email] Bỏ qua gửi email: chưa cấu hình EMAIL_USER hoặc EMAIL_PASS. Để test, thêm EMAIL_USE_ETHEREAL=true vào .env"
    );
    return { success: false, error: "Email not configured" };
  }

  try {
    const order = await Order.findById(orderId)
      .populate("user", "email name")
      .lean();

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const recipientEmail = order.email || order.user?.email;
    if (!recipientEmail) {
      return { success: false, error: "No recipient email" };
    }

    const orderItems = await OrderItem.find({ order: orderId })
      .populate("product", "name")
      .lean();

    const itemsRows = orderItems
      .map(
        (item, index) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || "N/A"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatVND(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatVND(item.quantity * item.price)}</td>
      </tr>
    `
      )
      .join("");

    const addr = order.shippingAddress || {};
    const fullAddress = [addr.address, addr.district, addr.city]
      .filter(Boolean)
      .join(", ");
    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(" ");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Xác nhận đơn hàng</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">✓ Thanh toán thành công</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Đơn hàng của bạn đã được xác nhận</p>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Xin chào <strong>${fullName || order.user?.name || "Khách hàng"}</strong>,</p>
    <p>Cảm ơn bạn đã thanh toán. Đơn hàng <strong>#${orderId}</strong> đã được xác nhận thành công qua VNPay.</p>
    
    <h3 style="margin-top: 24px; color: #1a1a1a;">Thông tin đơn hàng</h3>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: #1a1a1a; color: white;">
          <th style="padding: 10px; text-align: left;">STT</th>
          <th style="padding: 10px; text-align: left;">Sản phẩm</th>
          <th style="padding: 10px;">SL</th>
          <th style="padding: 10px; text-align: right;">Đơn giá</th>
          <th style="padding: 10px; text-align: right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
    
    <p style="margin-top: 16px; font-size: 18px;"><strong>Tổng cộng: ${formatVND(order.totalAmount)}</strong></p>
    
    <h3 style="margin-top: 24px; color: #1a1a1a;">Địa chỉ giao hàng</h3>
    <p style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #eee;">
      ${fullName ? `<strong>${fullName}</strong><br>` : ""}
      ${addr.phone ? `Điện thoại: ${addr.phone}<br>` : ""}
      ${fullAddress || "—"}
    </p>
    
    <p style="margin-top: 24px; color: #666; font-size: 14px;">
      Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.
    </p>
  </div>
</body>
</html>
    `.trim();

    let transporter;
    let fromEmail;

    if (useEthereal) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      fromEmail = testAccount.user;
    } else {
      const emailUser = (process.env.EMAIL_USER || "").trim();
      const emailPass = (process.env.EMAIL_PASS || "").trim();
      const emailHost = (process.env.EMAIL_HOST || "smtp.gmail.com").trim();
      transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        secure: process.env.EMAIL_SECURE === "true",
        auth: { user: emailUser, pass: emailPass },
      });
      fromEmail = emailUser;
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Cửa hàng"}" <${fromEmail}>`,
      to: recipientEmail,
      subject: `Xác nhận đơn hàng #${orderId} - Thanh toán thành công`,
      html,
      text: `Đơn hàng #${orderId} đã được thanh toán thành công. Tổng: ${formatVND(order.totalAmount)}`,
    });

    if (useEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email] Đã gửi xác nhận đơn hàng ${orderId} (Ethereal test). Xem tại: ${previewUrl}`);
    } else {
      console.log(`[Email] Đã gửi xác nhận đơn hàng ${orderId} tới ${recipientEmail}`);
    }
    return { success: true };
  } catch (error) {
    const isGmailAuth = error.code === "EAUTH" && ((process.env.EMAIL_HOST || "smtp.gmail.com").includes("gmail") || (process.env.EMAIL_USER || "").includes("gmail.com"));
    const hint = isGmailAuth ? "\n[Gợi ý] Gmail yêu cầu App Password (không dùng mật khẩu đăng nhập). Bật 2FA rồi tạo App Password tại: https://myaccount.google.com/apppasswords" : "";
    console.error("[Email] Lỗi gửi email:", error.message + hint);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (user) => {
  const { name, email, username } = user || {};
  if (!email) {
    return { success: false, error: "No recipient email" };
  }

  const transportResult = await createTransporter();
  if (!transportResult) {
    console.warn(
      "[Email] Bỏ qua gửi welcome: chưa cấu hình EMAIL_USER hoặc EMAIL_PASS. Để test, thêm EMAIL_USE_ETHEREAL=true vào .env"
    );
    return { success: false, error: "Email not configured" };
  }

  const { transporter, fromEmail, useEthereal } = transportResult;
  const displayName = name || username || "Khách hàng";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chào mừng bạn đã đăng ký</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">✓ Đăng ký thành công</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Chào mừng bạn đến với cửa hàng của chúng tôi</p>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Xin chào <strong>${displayName}</strong>,</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản. Bạn có thể đăng nhập và bắt đầu mua sắm ngay.</p>
    <p style="margin-top: 24px; color: #666; font-size: 14px;">
      Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.
    </p>
  </div>
</body>
</html>
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Cửa hàng"}" <${fromEmail}>`,
      to: email,
      subject: "Chào mừng bạn đã đăng ký tài khoản",
      html,
      text: `Chào ${displayName}, cảm ơn bạn đã đăng ký tài khoản. Chúc bạn mua sắm vui vẻ!`,
    });

    if (useEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email] Đã gửi welcome tới ${email} (Ethereal test). Xem tại: ${previewUrl}`);
    } else {
      console.log(`[Email] Đã gửi welcome tới ${email}`);
    }
    return { success: true };
  } catch (error) {
    const isGmailAuth =
      error.code === "EAUTH" &&
      ((process.env.EMAIL_HOST || "smtp.gmail.com").includes("gmail") ||
        (process.env.EMAIL_USER || "").includes("gmail.com"));
    const hint = isGmailAuth
      ? "\n[Gợi ý] Gmail yêu cầu App Password (không dùng mật khẩu đăng nhập). Bật 2FA rồi tạo App Password tại: https://myaccount.google.com/apppasswords"
      : "";
    console.error("[Email] Lỗi gửi welcome:", error.message + hint);
    return { success: false, error: error.message };
  }
};
