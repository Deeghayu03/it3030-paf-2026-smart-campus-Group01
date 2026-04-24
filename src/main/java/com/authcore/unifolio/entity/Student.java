package com.authcore.unifolio.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String department;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}