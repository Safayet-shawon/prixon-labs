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

    @Test
    void acceptsAPhoneBasedDemoWithoutEmail() {
        var valid = new ContactRequest("Alex Rivera", null, "Business workflow demo",
            "Sales and stock records do not match.", "", "Example Company", "+880 1712-345678");
        assertTrue(validator.validate(valid).isEmpty());
    }

    @Test
    void rejectsMissingReplyDetailsInvalidPhonesAndMissingDemoCompany() {
        assertFalse(validator.validate(new ContactRequest("Alex Rivera", null, "Custom software",
            "Sales and stock records do not match.", "", null, null)).isEmpty());
        for (String phone : new String[] {"123", "call me tomorrow", "1234567890123456", "......."}) {
            assertFalse(validator.validate(new ContactRequest("Alex Rivera", null, "Business workflow demo",
                "Sales and stock records do not match.", "", "Example Company", phone)).isEmpty());
        }
        assertFalse(validator.validate(new ContactRequest("Alex Rivera", null, "Business workflow demo",
            "Sales and stock records do not match.", "", "   ", "+8801712345678")).isEmpty());
    }
}
