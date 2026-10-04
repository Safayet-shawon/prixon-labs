package com.praxivon.api.contact;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final ContactDeliveryService delivery;

    public ContactController(ContactDeliveryService delivery) { this.delivery = delivery; }

    @PostMapping
    public ResponseEntity<Map<String, String>> contact(@Valid @RequestBody ContactRequest request) {
        if (request.website() != null && !request.website().isBlank()) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("message", "Message received."));
        }
        delivery.deliver(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("message", "Your message has been sent."));
    }
}
