package com.anthony.todo.configurations;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PublicToolsAccessTest {
    @Value("${local.server.port}")
    private int port;

    private final HttpClient client = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private int getStatus(String path) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(20))
                .GET().build();
        return client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
    }

    @Test
    void swaggerAndOpenApiArePublic() throws Exception {
        assertEquals(200, getStatus("/swagger-ui/index.html"));
        assertEquals(200, getStatus("/swagger-ui.html"));
        assertEquals(200, getStatus("/v3/api-docs"));
        assertEquals(200, getStatus("/v3/api-docs/swagger-config"));
    }

    @Test
    void h2ConsoleIsPublic() throws Exception {
        assertEquals(200, getStatus("/h2-console/"));
    }

    @Test
    void taskAndUserEndpointsStillRequireAuthentication() throws Exception {
        assertEquals(401, getStatus("/api/tasks"));
        assertEquals(401, getStatus("/api/users"));
    }
}
