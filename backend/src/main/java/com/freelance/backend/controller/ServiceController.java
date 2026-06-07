package com.freelance.backend.controller;

import com.freelance.backend.model.Service;
import com.freelance.backend.model.User;
import com.freelance.backend.repository.ServiceRepository;
import com.freelance.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceRepository.findAll();
        log.info("DEBUG: Mengambil semua jasa. Jumlah data ditemukan: {}", services.size());
        return ResponseEntity.ok(services);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Service>> getMyServices(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(serviceRepository.findByFreelancerId(user.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Service>> searchServices(@RequestParam String keyword) {
        return ResponseEntity.ok(serviceRepository.findByTitleContainingIgnoreCase(keyword));
    }

    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        service.setFreelancer(user);
        return ResponseEntity.ok(serviceRepository.save(service));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        serviceRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        Service service = serviceRepository.findById(id).orElseThrow();
        // Force load freelancer
        if (service.getFreelancer() != null) {
            service.getFreelancer().getName();
        }
        return ResponseEntity.ok(service);
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<Service>> getServicesByFreelancer(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(serviceRepository.findByFreelancerId(freelancerId));
    }

    @GetMapping("/category")
    public ResponseEntity<List<Service>> getByCategory(@RequestParam String category) {
        List<Service> all = serviceRepository.findAll();
        List<Service> filtered = all.stream()
                .filter(s -> s.getCategory() != null && s.getCategory().toLowerCase().contains(category.toLowerCase()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }
}