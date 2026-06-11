package com.freelance.backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.freelance.backend.model.Order;
import com.freelance.backend.model.OrderFile;
import com.freelance.backend.model.User;
import com.freelance.backend.repository.OrderFileRepository;
import com.freelance.backend.repository.OrderRepository;
import com.freelance.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/order-files")
@RequiredArgsConstructor
public class OrderFileController {

    private final OrderFileRepository orderFileRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping("/{orderId}/upload")
    public ResponseEntity<?> uploadFile(@PathVariable Long orderId,
                                        @RequestParam("file") MultipartFile file,
                                        Authentication auth) {
        try {
            User uploader = userRepository.findByEmail(auth.getName()).orElseThrow();
            Order order = orderRepository.findById(orderId).orElseThrow();

            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + "/" + filename);
            Files.write(path, file.getBytes());

            OrderFile orderFile = new OrderFile();
            orderFile.setOrder(order);
            orderFile.setUploader(uploader);
            orderFile.setFileName(file.getOriginalFilename());
            orderFile.setFileUrl("/api/files/" + filename);
            orderFile.setFileType(file.getContentType());

            orderFileRepository.save(orderFile);

            return ResponseEntity.ok(orderFile);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Upload failed");
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<List<OrderFile>> getFiles(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderFileRepository.findByOrderId(orderId));
    }
}