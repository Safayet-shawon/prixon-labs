package com.praxivon.api.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactRequest(
    @NotBlank @Size(min = 2, max = 100) String name,
    @Email @Size(max = 254) String email,
    @NotBlank @Size(max = 100) String service,
    @NotBlank @Size(min = 10, max = 5000) String message,
    @Size(max = 500) String website,
    @Size(max = 100) String company,
    @Size(max = 40) @Pattern(regexp = "^\\+?[0-9() .-]*$") String phone
) {
    // Keep existing Java callers and email-only enquiries compatible.
    public ContactRequest(String name, String email, String service, String message, String website) {
        this(name, email, service, message, website, null, null);
    }

    @AssertTrue(message = "An email address or phone number is required.")
    public boolean isReplyChannelProvided() {
        return (email != null && !email.isBlank()) || (phone != null && !phone.isBlank());
    }

    @AssertTrue(message = "Phone numbers must contain 7 to 15 digits.")
    public boolean isPhoneNumberValid() {
        if (phone == null || phone.isBlank()) return true;
        int digits = phone.replaceAll("[^0-9]", "").length();
        return digits >= 7 && digits <= 15;
    }

    @AssertTrue(message = "Please provide the company for a business workflow demo.")
    public boolean isDemoCompanyProvided() {
        return !"Business workflow demo".equals(service) || (company != null && !company.isBlank());
    }
}
