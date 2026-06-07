package com.freelance.backend.controller;

import com.freelance.backend.model.Order;
import com.freelance.backend.model.Service;
import com.freelance.backend.model.User;
import com.freelance.backend.repository.OrderRepository;
import com.freelance.backend.repository.ServiceRepository;
import com.freelance.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    @GetMapping("/client")
    public ResponseEntity<List<Order>> getClientOrders(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByClientId(user.getId()));
    }

    @GetMapping("/freelancer")
    public ResponseEntity<List<Order>> getFreelancerOrders(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByServiceFreelancerId(user.getId()));
    }

    @PostMapping("/{serviceId}")
    public ResponseEntity<Order> createOrder(@PathVariable Long serviceId,
                                             @RequestBody Order order,
                                             Authentication auth) {
        User client = userRepository.findByEmail(auth.getName()).orElseThrow();
        Service service = serviceRepository.findById(serviceId).orElseThrow();
        order.setClient(client);
        order.setService(service);
        order.setPrice(service.getPrice());
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id,
                                              @RequestParam String status) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus(Order.OrderStatus.valueOf(status));
        return ResponseEntity.ok(orderRepository.save(order));
    }
}