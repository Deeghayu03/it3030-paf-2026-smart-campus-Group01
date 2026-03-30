package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Student;
import com.authcore.unifolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    Boolean existsByStudentId(String studentId);
}