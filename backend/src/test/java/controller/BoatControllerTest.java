package controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import santos.luis.boatmanagerapp.BoatmanagerappApplication;
import santos.luis.boatmanagerapp.model.Boat;
import santos.luis.boatmanagerapp.model.User;
import santos.luis.boatmanagerapp.repository.BoatRepository;
import santos.luis.boatmanagerapp.repository.UserRepository;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(classes = BoatmanagerappApplication.class)
@AutoConfigureMockMvc
@Testcontainers
class BoatControllerTest {

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
    private BoatRepository boatRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        registry.add("spring.flyway.enabled", () -> "false");
    }

    @BeforeEach
    void setUp() {
        boatRepository.deleteAll();
        userRepository.deleteAll();

        // Create a test user and set up authentication
        testUser = new User("testuser", "$2a$10$hashedpassword"); // Use a pre-hashed password or register via endpoint
        testUser = userRepository.save(testUser);

        // Mock authenticated user
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("testuser", null, null);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void shouldGetAllBoatsEmptyList() throws Exception {
        mockMvc.perform(get("/api/boats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", is(empty())));
    }

    @Test
    void shouldGetAllBoatsWithData() throws Exception {
        Boat boat1 = new Boat(null, "Boat 1", "Desc 1", testUser);
        Boat boat2 = new Boat(null, "Boat 2", "Desc 2", testUser);
        boatRepository.save(boat1);
        boatRepository.save(boat2);

        mockMvc.perform(get("/api/boats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Boat 1")))
                .andExpect(jsonPath("$[1].name", is("Boat 2")));
    }

    @Test
    void shouldCreateBoatSuccessfully() throws Exception {
        Boat boat = new Boat(null, "New Boat", "New Desc", null); // User set by service

        mockMvc.perform(post("/api/boats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(boat)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("New Boat")))
                .andExpect(jsonPath("$.description", is("New Desc")));
    }

    @Test
    void shouldFailCreateBoatWithInvalidData() throws Exception {
        Boat invalidBoat = new Boat(null, "", "Desc", null); // Missing name

        mockMvc.perform(post("/api/boats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidBoat)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Validation failed")))
                .andExpect(jsonPath("$.message", containsString("name=Name is required")))
                .andExpect(jsonPath("$.token", is(nullValue())));
    }

    @Test
    void shouldGetBoatByIdSuccessfully() throws Exception {
        Boat boat = new Boat(null, "Boat 1", "Desc 1", testUser);
        boat = boatRepository.save(boat);

        mockMvc.perform(get("/api/boats/{id}", boat.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(boat.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Boat 1")))
                .andExpect(jsonPath("$.description", is("Desc 1")));
    }

    @Test
    void shouldFailGetBoatByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/boats/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdateBoatSuccessfully() throws Exception {
        Boat boat = new Boat(null, "Old Boat", "Old Desc", testUser);
        boat = boatRepository.save(boat);

        Boat updatedBoat = new Boat(null, "Updated Boat", "Updated Desc", null);

        mockMvc.perform(put("/api/boats/{id}", boat.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBoat)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Boat")))
                .andExpect(jsonPath("$.description", is("Updated Desc")));
    }

    @Test
    void shouldFailUpdateBoatNotFound() throws Exception {
        Boat updatedBoat = new Boat(null, "Updated Boat", "Updated Desc", null);

        mockMvc.perform(put("/api/boats/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBoat)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldDeleteBoatSuccessfully() throws Exception {
        Boat boat = new Boat(null, "Boat 1", "Desc 1", testUser);
        boat = boatRepository.save(boat);

        mockMvc.perform(delete("/api/boats/{id}", boat.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void shouldFailDeleteBoatNotFound() throws Exception {
        mockMvc.perform(delete("/api/boats/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

}