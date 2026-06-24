package com.fooddelivery.service.impl;

import com.fooddelivery.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@fooddelivery.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔑 Đặt lại mật khẩu - Food Delivery");

            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetHtml(fullName, resetUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Đã gửi email đặt lại mật khẩu đến: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi gửi email đặt lại mật khẩu: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Chào mừng đến với Food Delivery!");

            String htmlContent = buildWelcomeHtml(fullName);
            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Đã gửi email chào mừng đến: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi gửi email chào mừng: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendOrderStatusEmail(String toEmail, String fullName, String orderCode, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("📦 Cập nhật đơn hàng #" + orderCode);

            String htmlContent = buildOrderStatusHtml(fullName, orderCode, status);
            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Đã gửi email cập nhật đơn hàng {} đến: {}", orderCode, toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi gửi email cập nhật đơn hàng: {}", e.getMessage());
        }
    }

    private String buildPasswordResetHtml(String fullName, String resetUrl) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Arial', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #FF6B35, #F7C59F); padding: 40px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; }
                        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; }
                        .body { padding: 40px; }
                        .body h2 { color: #333; margin-bottom: 16px; }
                        .body p { color: #666; line-height: 1.6; margin-bottom: 16px; }
                        .btn { display: inline-block; background: linear-gradient(135deg, #FF6B35, #FF8C42); color: white !important; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 24px 0; }
                        .note { background: #fff8f0; border-left: 4px solid #FF6B35; padding: 16px; border-radius: 8px; color: #666; font-size: 14px; }
                        .footer { background: #f9f9f9; padding: 24px; text-align: center; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍔 Food Delivery</h1>
                            <p>Giao đồ ăn nhanh chóng</p>
                        </div>
                        <div class="body">
                            <h2>Xin chào, %s! 👋</h2>
                            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                            <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
                            <div style="text-align: center;">
                                <a href="%s" class="btn">🔑 Đặt lại mật khẩu</a>
                            </div>
                            <div class="note">
                                ⚠️ <strong>Lưu ý:</strong> Link này sẽ hết hạn sau <strong>15 phút</strong>.<br>
                                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                            </div>
                        </div>
                        <div class="footer">
                            <p>© 2025 Food Delivery. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(fullName, resetUrl);
    }

    private String buildWelcomeHtml(String fullName) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Arial', sans-serif; background: #f5f5f5; margin: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #FF6B35, #F7C59F); padding: 40px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; }
                        .body { padding: 40px; text-align: center; }
                        .emoji { font-size: 64px; margin-bottom: 16px; }
                        .body h2 { color: #333; }
                        .body p { color: #666; line-height: 1.6; }
                        .footer { background: #f9f9f9; padding: 24px; text-align: center; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍔 Food Delivery</h1>
                        </div>
                        <div class="body">
                            <div class="emoji">🎉</div>
                            <h2>Chào mừng %s!</h2>
                            <p>Tài khoản của bạn đã được tạo thành công. Bắt đầu khám phá hàng trăm nhà hàng ngon ngay nào!</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 Food Delivery. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(fullName);
    }

    private String buildOrderStatusHtml(String fullName, String orderCode, String status) {
        String statusText = switch (status) {
            case "CONFIRMED" -> "✅ Đã xác nhận";
            case "PREPARING" -> "👨‍🍳 Đang chuẩn bị";
            case "READY_FOR_PICKUP" -> "🛵 Sẵn sàng giao";
            case "DELIVERING" -> "🚀 Đang giao hàng";
            case "COMPLETED" -> "🎉 Đã giao thành công";
            case "CANCELLED" -> "❌ Đã hủy";
            default -> status;
        };

        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #FF6B35, #F7C59F); padding: 40px; text-align: center; }
                        .header h1 { color: white; margin: 0; }
                        .body { padding: 40px; text-align: center; }
                        .status-badge { display: inline-block; background: #fff8f0; border: 2px solid #FF6B35; color: #FF6B35; padding: 12px 32px; border-radius: 50px; font-size: 20px; font-weight: bold; margin: 16px 0; }
                        .footer { background: #f9f9f9; padding: 24px; text-align: center; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header"><h1>📦 Cập nhật đơn hàng</h1></div>
                        <div class="body">
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Đơn hàng <strong>#%s</strong> của bạn đã được cập nhật:</p>
                            <div class="status-badge">%s</div>
                        </div>
                        <div class="footer"><p>© 2025 Food Delivery</p></div>
                    </div>
                </body>
                </html>
                """.formatted(fullName, orderCode, statusText);
    }
}
