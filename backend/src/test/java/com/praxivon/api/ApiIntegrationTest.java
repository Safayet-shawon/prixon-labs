package com.praxivon.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "praxivon.cors.origins=http://127.0.0.1:5173",
    "spring.mail.host="
})
class ApiIntegrationTest {
    private static final HttpClient HTTP = HttpClient.newHttpClient();

    @LocalServerPort
    private int port;

    @Test
    void exposesHealthEndpointForDeploymentChecks() throws Exception {
        HttpResponse<String> response = send(HttpRequest.newBuilder(uri("/api/health")).GET().build());
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains(""status":"ok"");
    }

    @Test
    void servesTheCompleteCatalogAndProjectRoutes() throws Exception {
        HttpResponse<String> services = send(HttpRequest.newBuilder(uri("/api/services")).GET().build());
        HttpResponse<String> projects = send(HttpRequest.newBuilder(uri("/api/projects")).GET().build());
        HttpResponse<String> project = send(HttpRequest.newBuilder(uri("/api/projects/nexora")).GET().build());
        HttpResponse<String> missingProject = send(HttpRequest.newBuilder(uri("/api/projects/not-a-project")).GET().build());

        assertThat(services.statusCode()).isEqualTo(200);
        assertThat(services.body().split("\"title\":").length - 1).isEqualTo(11);
        assertThat(projects.statusCode()).isEqualTo(200);
        assertThat(projects.body().split("\"slug\":").length - 1).isEqualTo(5);
        assertThat(project.statusCode()).isEqualTo(200);
        assertThat(project.body()).contains("\"slug\":\"nexora\"");
        assertThat(missingProject.statusCode()).isEqualTo(404);
    }

    @Test
    void allowsConfiguredCrossOriginCatalogRequests() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/services"))
            .header("Origin", "http://127.0.0.1:5173")
            .GET()
            .build();
        HttpResponse<String> response = send(request);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("Access-Control-Allow-Origin"))
            .hasValue("http://127.0.0.1:5173");
    }

    @Test
    void allowsTheContactFormCorsPreflight() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/contact"))
            .header("Origin", "http://127.0.0.1:5173")
            .header("Access-Control-Request-Method", "POST")
            .header("Access-Control-Request-Headers", "content-type")
            .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
            .build();
        HttpResponse<String> response = send(request);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("Access-Control-Allow-Origin"))
            .hasValue("http://127.0.0.1:5173");
        assertThat(response.headers().firstValue("Access-Control-Allow-Methods"))
            .hasValueSatisfying(methods -> assertThat(methods).contains("POST"));
    }

    @Test
    void reportsContactValidationAndDeliveryUnavailableStates() throws Exception {
        HttpResponse<String> invalid = post(
            "{\"name\":\"A\",\"email\":\"invalid\",\"service\":\"\",\"message\":\"short\"}"
        );
        HttpResponse<String> unavailable = post(
            "{\"name\":\"Alex Rivera\",\"email\":\"alex@example.com\",\"service\":\"Custom software\","
                + "\"message\":\"We need a new customer platform.\",\"website\":\"\"}"
        );

        assertThat(invalid.statusCode()).isEqualTo(400);
        assertThat(invalid.body()).contains("\"message\"");
        assertThat(unavailable.statusCode()).isEqualTo(503);
        assertThat(unavailable.body()).contains("\"message\"");
    }

    @Test
    void validatesPhoneDemoRequestsThroughThePublicApi() throws Exception {
        String demo = "{\"name\":\"Alex Rivera\",\"company\":\"Example Company\","
            + "\"service\":\"Business workflow demo\",\"message\":\"Sales and stock records do not match.\","
            + "\"phone\":\"+8801712345678\",\"website\":\"\"}";
        assertThat(post(demo).statusCode()).isEqualTo(503);
        assertThat(post(demo.replace("+8801712345678", "abc")).statusCode()).isEqualTo(400);
        assertThat(post(demo.replace("Example Company", "")).statusCode()).isEqualTo(400);
        // A bot-filled honeypot never attempts email delivery.
        assertThat(post(demo.replace("\"website\":\"\"", "\"website\":\"spam\"")).statusCode()).isEqualTo(202);
    }

    private HttpResponse<String> post(String body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/contact"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
            .build();
        return send(request);
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return HTTP.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }
}
