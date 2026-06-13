package com.freelance.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.freelance.backend.model.Message;
import com.freelance.backend.model.User;
import com.freelance.backend.repository.MessageRepository;
import com.freelance.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @GetMapping("/{receiverId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long receiverId, Authentication auth) {
        User sender = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Message> messages = messageRepository.findBySenderIdAndReceiverId(sender.getId(), receiverId);
        List<Message> received = messageRepository.findBySenderIdAndReceiverId(receiverId, sender.getId());
        messages.addAll(received);
        messages.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{receiverId}")
    public ResponseEntity<Message> sendMessage(@PathVariable Long receiverId,
                                               @RequestBody Message message,
                                               Authentication auth) {
        User sender = userRepository.findByEmail(auth.getName()).orElseThrow();
        User receiver = userRepository.findById(receiverId).orElseThrow();
        message.setSender(sender);
        message.setReceiver(receiver);
        return ResponseEntity.ok(messageRepository.save(message));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnread(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(messageRepository.findByReceiverIdAndIsReadFalse(user.getId()));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<User>> getContacts(Authentication auth) {
        User me = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Message> sent = messageRepository.findBySenderIdAndReceiverId(me.getId(), 0L);
        List<Message> allSent = messageRepository.findAll().stream()
                .filter(m -> m.getSender().getId().equals(me.getId()) || m.getReceiver().getId().equals(me.getId()))
                .collect(Collectors.toList());

        List<User> contacts = new ArrayList<>();
        allSent.forEach(m -> {
            User other = m.getSender().getId().equals(me.getId()) ? m.getReceiver() : m.getSender();
            if (contacts.stream().noneMatch(c -> c.getId().equals(other.getId()))) {
                contacts.add(other);
            }
        });
        return ResponseEntity.ok(contacts);
    }

    @PutMapping("/read/{senderId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long senderId, Authentication auth) {
        User receiver = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<Message> messages = messageRepository.findByReceiverIdAndIsReadFalse(receiver.getId());
        messages.stream()
                .filter(m -> m.getSender().getId().equals(senderId))
                .forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(messages);
        return ResponseEntity.ok("Marked as read");
    }
}