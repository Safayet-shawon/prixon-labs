package com.praxivon.api.contact;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ContactDeliveryService {
    private static final Logger logger = LoggerFactory.getLogger(ContactDeliveryService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String smtpHost;
    private final String to;
    private final String from;

    public ContactDeliveryService(ObjectProvider<JavaMailSender> mailSender,
                                  @Value("${spring.mail.host:}") String smtpHost,
                                  @Value("${praxivon.contact.to:}") String to,
                                  @Value("${praxivon.contact.from:}") String from) {
        this.mailSender = mailSender;
        this.smtpHost = smtpHost;
        this.to = to;
        this.from = from;
    }

    public void deliver(ContactRequest request) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (smtpHost.isBlank() || to.isBlank() || from.isBlank() || sender == null) {
            throw new ContactUnavailableException("The contact service is temporarily unavailable. Please email us directly.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(from);
        if (request.email() != null && !request.email().isBlank()) {
            message.setReplyTo(request.email());
        }
        message.setSubject("Praxivon enquiry: " + sanitize(request.service()));
        message.setText("Name: " + sanitize(request.name()) + "\nEmail: " + sanitize(request.email())
            + "\nCompany: " + sanitize(request.company()) + "\nPhone: " + sanitize(request.phone())
            + "\nService: " + sanitize(request.service()) + "\n\n" + request.message());
        try {
            sender.send(message);
        } catch (MailException exception) {
            logger.warn("Contact message delivery failed", exception);
            throw new ContactUnavailableException("The contact service is temporarily unavailable. Please email us directly.");
        }
    }

    private String sanitize(String value) { return value == null ? "—" : value.replaceAll("[\\r\\n]+", " ").trim(); }
}
