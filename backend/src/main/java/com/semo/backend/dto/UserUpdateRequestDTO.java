package com.semo.backend.dto;

import jakarta.validation.constraints.Email;

public class UserUpdateRequestDTO {
    @Email(message = "Email không hợp lệ")
    private String email;

    private String fullName;

    private String phoneNumber;

    public UserUpdateRequestDTO() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}