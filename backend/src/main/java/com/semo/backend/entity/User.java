package com.semo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Dev 1 sẽ tự code thêm fullName, email... vào đây sau.
    // Giờ mình chỉ cần cái ID để làm khoá ngoại là đủ.

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}