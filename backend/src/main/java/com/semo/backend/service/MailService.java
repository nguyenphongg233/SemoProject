package com.semo.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã xác thực tài khoản SEMO của bạn");
            message.setText("Chào bạn,\n\n"
                    + "Cảm ơn bạn đã đăng ký tài khoản tại hệ thống SEMO.\n\n"
                    + "Mã xác thực (OTP) của bạn là: " + otp + "\n"
                    + "Mã này sẽ hết hạn trong vòng 5 phút.\n\n"
                    + "Trân trọng,\nĐội ngũ SEMO.");

            mailSender.send(message);
            System.out.println("Đã gửi email OTP thành công tới: " + toEmail);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email tới " + toEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendTransactionStatusEmail(String toEmail, String status, Double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            String action = "COMPLETED".equals(status) ? "đã được DUYỆT" : "đã bị TỪ CHỐI";
            message.setSubject("Thông báo kết quả giao dịch nạp tiền SEMO");
            message.setText("Chào bạn,\n\n"
                    + "Giao dịch nạp tiền trị giá " + amount + " VNĐ của bạn " + action + ".\n\n"
                    + ("COMPLETED".equals(status) ? "Số tiền đã được cộng vào số dư ví của bạn.\n\n" : "Vui lòng liên hệ bộ phận hỗ trợ nếu có thắc mắc.\n\n")
                    + "Trân trọng,\nĐội ngũ SEMO.");

            mailSender.send(message);
            System.out.println("Đã gửi email thông báo giao dịch thành công tới: " + toEmail);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email tới " + toEmail + ": " + e.getMessage());
        }
    }
}