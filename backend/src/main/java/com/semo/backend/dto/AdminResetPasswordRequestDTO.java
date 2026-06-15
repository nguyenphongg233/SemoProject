package com.semo.backend.dto;

public class AdminResetPasswordRequestDTO {

    // optional: admin can provide a new password, otherwise backend will generate
    // one
    private String newPassword;

    public AdminResetPasswordRequestDTO() {
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
