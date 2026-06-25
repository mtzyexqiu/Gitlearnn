package com.freelance.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.freelance.backend.model.User;
import com.freelance.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userRepository.findById(id).orElseThrow());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> body, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("bio")) user.setBio(body.get("bio"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/me")
public ResponseEntity<User> getMe(Authentication auth) {
    User user = userRepository.findByEmail(auth.getName()).orElseThrow();
    return ResponseEntity.ok(user);
}

@PostMapping("/topup")
public ResponseEntity<User> topUp(@RequestBody Map<String, Double> body, Authentication auth) {
    User user = userRepository.findByEmail(auth.getName()).orElseThrow();
    Double currentBalance = user.getBalance() != null ? user.getBalance() : 0.0;
    user.setBalance(currentBalance + body.get("amount"));
    return ResponseEntity.ok(userRepository.save(user));
}

@PostMapping("/verify-password")
public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> body, Authentication auth) {
    User user = userRepository.findByEmail(auth.getName()).orElseThrow();
    String rawPassword = body.get("password");
    if (passwordEncoder.matches(rawPassword, user.getPassword())) {
        return ResponseEntity.ok(Map.of("verified", true));
    } else {
        return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
    }
}
}