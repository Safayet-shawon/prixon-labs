package com.praxivon.api.contact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class ContactDeliveryServiceTest {
    @Test
    void sendsAReplyableEnquiryAndSanitizesHeaderFields() {
        JavaMailSender sender = mock(JavaMailSender.class);
        StaticListableBeanFactory beans = new StaticListableBeanFactory();
        beans.addBean("mailSender", sender);
        ObjectProvider<JavaMailSender> provider = beans.getBeanProvider(JavaMailSender.class);
        ContactDeliveryService delivery = new ContactDeliveryService(
            provider,
            "smtp.example.test",
            "inbox@example.test",
            "site@example.test"
        );

        delivery.deliver(new ContactRequest(
            "Alex\nBcc: someone@example.test",
            "alex@example.test",
            "Custom software\r\nBcc: someone@example.test",
            "We need a new customer platform.",
            ""
        ));

        var message = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(message.capture());
        assertThat(message.getValue().getTo()).containsExactly("inbox@example.test");
        assertThat(message.getValue().getFrom()).isEqualTo("site@example.test");
        assertThat(message.getValue().getReplyTo()).isEqualTo("alex@example.test");
        assertThat(message.getValue().getSubject()).isEqualTo("Praxivon enquiry: Custom software Bcc: someone@example.test");
        assertThat(message.getValue().getText()).contains("Name: Alex Bcc: someone@example.test");
    }

    @Test
    void failsExplicitlyWhenMailDeliveryIsNotConfigured() {
        StaticListableBeanFactory beans = new StaticListableBeanFactory();
        ObjectProvider<JavaMailSender> provider = beans.getBeanProvider(JavaMailSender.class);
        ContactDeliveryService delivery = new ContactDeliveryService(
            provider,
            "",
            "",
            ""
        );

        assertThatThrownBy(() -> delivery.deliver(new ContactRequest(
            "Alex Rivera",
            "alex@example.com",
            "Custom software",
            "We need a new customer platform.",
            ""
        ))).isInstanceOf(ContactUnavailableException.class)
            .hasMessageContaining("temporarily unavailable");
    }

    @Test
    void includesPhoneAndCompanyWithoutAnInvalidReplyToHeader() {
        JavaMailSender sender = mock(JavaMailSender.class);
        StaticListableBeanFactory beans = new StaticListableBeanFactory();
        beans.addBean("mailSender", sender);
        ContactDeliveryService delivery = new ContactDeliveryService(
            beans.getBeanProvider(JavaMailSender.class), "smtp.example.test", "inbox@example.test", "site@example.test"
        );
        delivery.deliver(new ContactRequest("Alex Rivera", null, "Business workflow demo",
            "Sales and stock records do not match.", "", "Example Company", "+8801712345678"));
        var message = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(message.capture());
        assertThat(message.getValue().getReplyTo()).isNull();
        assertThat(message.getValue().getText()).contains("Company: Example Company", "Phone: +8801712345678");
    }
}
