package com.praxivon.api.contact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class ContactControllerTest {
    @Test
    void acceptsAContactRequestAfterDeliverySucceeds() {
        ContactDeliveryService delivery = mock(ContactDeliveryService.class);
        ContactController controller = new ContactController(delivery);
        ContactRequest request = new ContactRequest(
            "Alex Rivera",
            "alex@example.com",
            "Custom software",
            "We need a new customer platform.",
            ""
        );

        var response = controller.contact(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
        assertThat(response.getBody()).containsEntry("message", "Your message has been sent.");
        verify(delivery).deliver(request);
    }
}
