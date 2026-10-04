package com.praxivon.api.contact;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContactDeliveryService {
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
        if (smtpHost.isBlank() || to.isBlank() || from.isBlank() || mailSender.getIfAvailable() == null) {
            throw new ContactUnavailableException("The contact service is temporarily unavailable. Please email us directly.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(from);
        message.setReplyTo(request.email());
        message.setSubject("Praxivon enquiry: " + sanitize(request.service()));
        message.setText("Name: " + sanitize(request.name()) + "\nEmail: " + request.email()
            + "\nService: " + sanitize(request.service()) + "\n\n" + request.message());
        try {
            mailSender.getObject().send(message);
        } catch (MailException exception) {
            throw new ContactUnavailableException("The contact service is temporarily unavailable. Please email us directly.");
        }
    }

    private String sanitize(String value) { return value.replaceAll("[\\r\\n]+", " ").trim(); }
}
