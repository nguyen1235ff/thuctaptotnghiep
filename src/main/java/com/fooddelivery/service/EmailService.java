package com.fooddelivery.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String fullName, String resetToken);
    void sendWelcomeEmail(String toEmail, String fullName);
    void sendOrderStatusEmail(String toEmail, String fullName, String orderCode, String status);
}
