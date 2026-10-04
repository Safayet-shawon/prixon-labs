package com.praxivon.api.contact;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

class ContactRequestTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsInvalidContactDetails() {
        var invalid = new ContactRequest("A", "not-an-email", "", "short", "");
        assertFalse(validator.validate(invalid).isEmpty());
    }

    @Test
    void acceptsACompleteEnquiry() {
        var valid = new ContactRequest("Alex Rivera", "alex@example.com", "Custom software",
            "We need a new customer platform.", "");
        assertTrue(validator.validate(valid).isEmpty());
    }
}
