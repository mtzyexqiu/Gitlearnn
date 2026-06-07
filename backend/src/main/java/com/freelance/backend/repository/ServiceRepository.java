package com.freelance.backend.repository;

import com.freelance.backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByFreelancerId(Long freelancerId);
    List<Service> findByTitleContainingIgnoreCase(String title);
    List<Service> findByCategoryIgnoreCase(String category);
}