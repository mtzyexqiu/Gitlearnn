package com.freelance.backend.repository;

import com.freelance.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByClientId(Long clientId);
    List<Order> findByServiceFreelancerId(Long freelancerId);
}