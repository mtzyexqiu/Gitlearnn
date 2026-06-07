package com.freelance.backend.controller;

import com.freelance.backend.model.Review;
import com.freelance.backend.model.Service;
import com.freelance.backend.model.User;
import com.freelance.backend.repository.ReviewRepository;
import com.freelance.backend.repository.ServiceRepository;
import com.freelance.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    @GetMapping("/{serviceId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long serviceId) {
        return ResponseEntity.ok(reviewRepository.findByServiceId(serviceId));
    }

    @PostMapping("/{serviceId}")
    public ResponseEntity<Review> addReview(@PathVariable Long serviceId,
                                            @RequestBody Review review,
                                            Authentication auth) {
        User client = userRepository.findByEmail(auth.getName()).orElseThrow();
        Service service = serviceRepository.findById(serviceId).orElseThrow();
        review.setClient(client);
        review.setService(service);
        return ResponseEntity.ok(reviewRepository.save(review));
    }
}