package controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import santos.luis.boatmanagerapp.BoatmanagerappApplication;
import santos.luis.boatmanagerapp.controller.dto.AuthRequest;
import santos.luis.boatmanagerapp.model.User;
import santos.luis.boatmanagerapp.repository.UserRepository;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = BoatmanagerappApplication.class)
@AutoConfigureMockMvc
@Testcontainers
class AuthControllerTest {

    @Container
    @SuppressWarnings("resource")
    private static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        registry.add("spring.flyway.enabled", () -> "false"); // Disable Flyway if not needed
    }

    @BeforeEach
    void setUp() {
        userRepository.deleteAll(); // Clear DB before each test
    }

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        AuthRequest request = new AuthRequest("newuser", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("User registered successfully")))
                .andExpect(jsonPath("$.token", is(nullValue())));

        User user = userRepository.findByUsername("newuser").orElse(null);
        assertNotNull(user);
        assert user.getUsername().equals("newuser");
    }

    @Test
    void shouldFailRegisterWithExistingUsername() throws Exception {
        // Pre-register user via endpoint
        AuthRequest initialRequest = new AuthRequest("existinguser", "password123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialRequest)))
                .andExpect(status().isOk());

        AuthRequest request = new AuthRequest("existinguser", "newpassword");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Registration failed: Username already exists")))
                .andExpect(jsonPath("$.token", is(nullValue())));
    }

    @Test
    void shouldLoginSuccessfully() throws Exception {
        // Register user via endpoint
        AuthRequest signupRequest = new AuthRequest("loginuser", "password123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        AuthRequest loginRequest = new AuthRequest("loginuser", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is(notNullValue())))
                .andExpect(jsonPath("$.message", is(nullValue())));
    }

    @Test
    void shouldFailLoginWithInvalidPassword() throws Exception {
        // Register user via endpoint
        AuthRequest signupRequest = new AuthRequest("loginuser", "password123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        AuthRequest loginRequest = new AuthRequest("loginuser", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid username or password")))
                .andExpect(jsonPath("$.token", is(nullValue())));
    }

    @Test
    void shouldFailLoginWithNonExistentUser() throws Exception {
        AuthRequest loginRequest = new AuthRequest("nonexistent", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid username or password")))
                .andExpect(jsonPath("$.token", is(nullValue())));
    }

    @Test
    void shouldFailRegisterWithMalformedJson() throws Exception {
        String malformedJson = "{ \"username\": \"malformed\" ";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid request format")))
                .andExpect(jsonPath("$.token", is(nullValue())));
    }

    @Test
    void shouldFailLoginWithMissingFields() throws Exception {
        AuthRequest request = new AuthRequest("onlyusername", null); // Missing password

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}