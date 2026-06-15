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
            message.setSubject("Your SEMO account verification code");
            message.setText("Hello,\n\n"
                    + "Thank you for registering an account at SEMO system.\n\n"
                    + "Your verification code (OTP) is: " + otp + "\n"
                    + "This code will expire in 5 minutes.\n\n"
                    + "Best regards,\nSEMO Team.");

            mailSender.send(message);
            System.out.println("Sent OTP email successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Error sending email to " + toEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendTransactionStatusEmail(String toEmail, String status, Double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            boolean isApproved = "COMPLETED".equals(status);
            String action = isApproved ? "has been APPROVED" : "has been REJECTED";
            message.setSubject("SEMO top-up transaction result notification");
            message.setText("Hello,\n\n"
                    + "Top-up transaction of " + amount + " VND of yours " + action + ".\n\n"
                    + (isApproved ? "The amount has been added to your wallet balance.\n\n" : "Please contact support if you have questions.\n\n")
                    + "Best regards,\nSEMO Team.");

            mailSender.send(message);
            System.out.println("Sent transaction notification email successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Error sending email to " + toEmail + ": " + e.getMessage());
        }
    }
}