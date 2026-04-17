package com.semo.backend.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "rentals")
@EntityListeners(AuditingEntityListener.class) // Kế thừa luôn cái Auditing lúc nãy bạn vừa setup
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Quan hệ: Nhiều chuyến đi thuộc về 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Quan hệ: Nhiều chuyến đi thực hiện trên 1 Scooter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scooter_id", nullable = false)
    private Scooter scooter;

    @Column(name = "start_time", nullable = false)
    @CreatedDate // Tự động lấy giờ hiện tại khi bắt đầu thuê
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "total_price")
    private Double totalPrice;

    // Trạng thái chuyến đi: ACTIVE (Đang thuê), COMPLETED (Đã trả)
    @Column(nullable = false)
    private String status = "ACTIVE";

    // Các hàm Constructor
    public Rental() {
    }

    public Rental(User user, Scooter scooter) {
        this.user = user;
        this.scooter = scooter;
        this.status = "ACTIVE";
        this.startTime = LocalDateTime.now(); // Tự động lấy thời gian hiện tại khi tạo rental
    }

    // --- Getters & Setters ---
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Scooter getScooter() {
        return scooter;
    }

    public void setScooter(Scooter scooter) {
        this.scooter = scooter;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}