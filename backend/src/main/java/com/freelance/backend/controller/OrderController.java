package com.freelance.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.freelance.backend.model.Order;
import com.freelance.backend.model.Service;
import com.freelance.backend.model.User;
import com.freelance.backend.repository.OrderRepository;
import com.freelance.backend.repository.ServiceRepository;
import com.freelance.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

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
public ResponseEntity<?> createOrder(@PathVariable Long serviceId,
                                      @RequestBody Order order,
                                      Authentication auth) {
    User client = userRepository.findByEmail(auth.getName()).orElseThrow();
    Service service = serviceRepository.findById(serviceId).orElseThrow();

    double price = order.getOfferedPrice() != null ? order.getOfferedPrice() : service.getPrice();
    double downPayment = price * 0.5;

    if (client.getBalance() < downPayment) {
        return ResponseEntity.badRequest().body("Saldo tidak cukup! Saldo kamu: Rp " + client.getBalance().longValue() + ", Dibutuhkan: Rp " + (long) downPayment);
    }

    client.setBalance(client.getBalance() - downPayment);
    userRepository.save(client);

    order.setClient(client);
    order.setService(service);
    order.setPrice(price);
    order.setDownPayment(downPayment);

    return ResponseEntity.ok(orderRepository.save(order));
}

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id,
                                              @RequestParam String status) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus(Order.OrderStatus.valueOf(status));
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PostMapping("/{id}/pay-remaining")
public ResponseEntity<?> payRemaining(@PathVariable Long id, Authentication auth) {
    User client = userRepository.findByEmail(auth.getName()).orElseThrow();
    Order order = orderRepository.findById(id).orElseThrow();

    double remaining = order.getPrice() * 0.5;

    if (client.getBalance() < remaining) {
        return ResponseEntity.badRequest().body("Saldo tidak cukup!");
    }

    client.setBalance(client.getBalance() - remaining);
    userRepository.save(client);

    order.setStatus(Order.OrderStatus.COMPLETED_BY_FREELANCER);
    orderRepository.save(order);

    return ResponseEntity.ok(order);
}
}