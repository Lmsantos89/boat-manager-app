package service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import santos.luis.boatmanagerapp.controller.dto.BoatDTO;
import santos.luis.boatmanagerapp.model.Boat;
import santos.luis.boatmanagerapp.model.User;
import santos.luis.boatmanagerapp.repository.BoatRepository;
import santos.luis.boatmanagerapp.service.AuthService;
import santos.luis.boatmanagerapp.service.BoatService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BoatServiceTest {

    @Mock
    private BoatRepository boatRepository;

    @Mock
    private AuthService authService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private BoatService boatService;

    private User testUser;
    private final Long userId = 1L;
    private final String username = "testuser";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        boatService = new BoatService(boatRepository, authService);

        // Set up SecurityContextHolder mock
        testUser = new User(username, "hashedpass");
        testUser.setId(userId);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        SecurityContextHolder.setContext(securityContext);

        when(authService.getUserIdByUsername(username)).thenReturn(userId);
        when(authService.getUserById(userId)).thenReturn(testUser);
    }

    @Test
    void testGetAllBoats() {
        // Arrange
        Boat boat1 = new Boat(1L, "Boat 1", "Desc 1", testUser);
        Boat boat2 = new Boat(2L, "Boat 2", "Desc 2", testUser);
        List<Boat> boats = List.of(boat1, boat2);
        when(boatRepository.findByUserId(userId)).thenReturn(boats);

        // Act
        List<BoatDTO> result = boatService.getAllBoats();

        // Assert
        assertEquals(2, result.size(), "Should return 2 boats");
        assertEquals("Boat 1", result.get(0).name(), "First boat name should match");
        assertEquals("Desc 2", result.get(1).description(), "Second boat description should match");
        verify(boatRepository, times(1)).findByUserId(userId);
        verify(authService, times(1)).getUserIdByUsername(username);
    }

    @Test
    void testCreateBoat() {
        // Arrange
        Boat inputBoat = new Boat(null, "New Boat", "New Desc", null);
        Boat savedBoat = new Boat(1L, "New Boat", "New Desc", testUser);
        when(boatRepository.save(any(Boat.class))).thenReturn(savedBoat);

        // Act
        BoatDTO result = boatService.createBoat(inputBoat);

        // Assert
        assertNotNull(result, "Result should not be null");
        assertEquals(1L, result.id(), "ID should be set");
        assertEquals("New Boat", result.name(), "Name should match");
        assertEquals("New Desc", result.description(), "Description should match");
        verify(authService, times(1)).getUserById(userId);
        verify(boatRepository, times(1)).save(argThat(boat ->
                boat.getName().equals("New Boat") &&
                        boat.getDescription().equals("New Desc") &&
                        boat.getUser().equals(testUser)
        ));
    }

    @Test
    void testGetBoatByIdSuccess() {
        // Arrange
        Boat boat = new Boat(1L, "Boat 1", "Desc 1", testUser);
        when(boatRepository.findByIdAndUserId(1L, userId)).thenReturn(Optional.of(boat));

        // Act
        Optional<BoatDTO> result = boatService.getBoatById(1L);

        // Assert
        assertTrue(result.isPresent(), "Boat should be found");
        assertEquals(1L, result.get().id(), "ID should match");
        assertEquals("Boat 1", result.get().name(), "Name should match");
        verify(boatRepository, times(1)).findByIdAndUserId(1L, userId);
    }

    @Test
    void testGetBoatByIdNotFound() {
        // Arrange
        when(boatRepository.findByIdAndUserId(1L, userId)).thenReturn(Optional.empty());

        // Act
        Optional<BoatDTO> result = boatService.getBoatById(1L);

        // Assert
        assertFalse(result.isPresent(), "Boat should not be found");
        verify(boatRepository, times(1)).findByIdAndUserId(1L, userId);
    }

    @Test
    void testUpdateBoatSuccess() {
        // Arrange
        Boat existingBoat = new Boat(1L, "Old Boat", "Old Desc", testUser);
        Boat updatedDetails = new Boat(null, "Updated Boat", "Updated Desc", null);
        Boat updatedBoat = new Boat(1L, "Updated Boat", "Updated Desc", testUser);
        when(boatRepository.findByIdAndUserId(1L, userId)).thenReturn(Optional.of(existingBoat));
        when(boatRepository.save(any(Boat.class))).thenReturn(updatedBoat);

        // Act
        Optional<BoatDTO> result = boatService.updateBoat(1L, updatedDetails);

        // Assert
        assertTrue(result.isPresent(), "Boat should be updated");
        assertEquals("Updated Boat", result.get().name(), "Name should be updated");
        assertEquals("Updated Desc", result.get().description(), "Description should be updated");
        verify(boatRepository, times(1)).findByIdAndUserId(1L, userId);
        verify(boatRepository, times(1)).save(argThat(boat ->
                boat.getId().equals(1L) &&
                        boat.getName().equals("Updated Boat") &&
                        boat.getDescription().equals("Updated Desc") &&
                        boat.getUser().equals(testUser)
        ));
    }

    @Test
    void testUpdateBoatNotFound() {
        // Arrange
        Boat updatedDetails = new Boat(null, "Updated Boat", "Updated Desc", null);
        when(boatRepository.findByIdAndUserId(1L, userId)).thenReturn(Optional.empty());

        // Act
        Optional<BoatDTO> result = boatService.updateBoat(1L, updatedDetails);

        // Assert
        assertFalse(result.isPresent(), "Boat should not be found");
        verify(boatRepository, times(1)).findByIdAndUserId(1L, userId);
        verify(boatRepository, never()).save(any(Boat.class));
    }

    @Test
    void testDeleteBoatSuccess() {
        // Arrange
        Boat boat = new Boat(1L, "Boat 1", "Desc 1", testUser);
        when(boatRepository.findByIdAndUserId(1L, userId)).thenReturn(Optional.of(boat));
        doNothing().when(boatRepository).delete(boat);

        // Act
        boolean result = boatService.deleteBoat(1L);

        // Assert
        assertTrue(result, "Deletion should succeed");
        verify(boatRepository, times(1)).findByIdAndUserId(1L, userId);
        verify(boatRepository, times(1)).delete(boat);
    }

    @Test
    void testDeleteBoatNotFound() {
        // Arrange
        when(boatRepository.findByIdAndUserId(1L, userId)).thenReturn(Optional.empty());

        // Act
        boolean result = boatService.deleteBoat(1L);

        // Assert
        assertFalse(result, "Deletion should fail if boat not found");
        verify(boatRepository, times(1)).findByIdAndUserId(1L, userId);
        verify(boatRepository, never()).delete(any(Boat.class));
    }

}