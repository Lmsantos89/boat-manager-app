package service; // Ensure this matches your AuthService package or adjust accordingly

import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import santos.luis.boatmanagerapp.model.User;
import santos.luis.boatmanagerapp.repository.UserRepository;
import santos.luis.boatmanagerapp.service.AuthService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @InjectMocks
    private AuthService authService;

    private final String SECRET_KEY = "ThisIsASecureKeyThatIsAtLeast32CharactersLong";

    @BeforeEach
    void setUp() throws NoSuchFieldException, IllegalAccessException {
        MockitoAnnotations.openMocks(this);
        authService = new AuthService(userRepository);

        // Inject SECRET_KEY via reflection
        java.lang.reflect.Field secretField = AuthService.class.getDeclaredField("SECRET_KEY");
        secretField.setAccessible(true);
        secretField.set(authService, SECRET_KEY);
    }

    @Test
    void testAuthenticateSuccess() {
        String username = "testuser";
        String password = "testpass";
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(username, hashedPassword);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        String token = authService.authenticate(username, password);

        System.out.println("testAuthenticateSuccess: Token generated - " + token);
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertEquals(username, authService.getUsernameFromToken(token));
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void testAuthenticateFailureWrongPassword() {
        String username = "testuser";
        String password = "wrongpass";
        String hashedPassword = passwordEncoder.encode("testpass");
        User user = new User(username, hashedPassword);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        String token = authService.authenticate(username, password);

        System.out.println("testAuthenticateFailureWrongPassword: Token - " + token);
        assertNull(token);
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void testAuthenticateFailureUserNotFound() {
        String username = "nonexistent";
        String password = "testpass";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        String token = authService.authenticate(username, password);

        System.out.println("testAuthenticateFailureUserNotFound: Token - " + token);
        assertNull(token);
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void testRegisterSuccess() {
        String username = "newuser";
        String password = "newpass";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean result = authService.register(username, password);

        System.out.println("testRegisterSuccess: Result - " + result);
        assertTrue(result);
        verify(userRepository, times(1)).findByUsername(username);
        verify(userRepository, times(1)).save(argThat(user ->
                user.getUsername().equals(username) && passwordEncoder.matches(password, user.getPassword())
        ));
    }

    @Test
    void testRegisterFailureUsernameExists() {
        String username = "existinguser";
        String password = "newpass";
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(new User(username, "hashedpass")));

        boolean result = authService.register(username, password);

        System.out.println("testRegisterFailureUsernameExists: Result - " + result);
        assertFalse(result);
        verify(userRepository, times(1)).findByUsername(username);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testGenerateToken() {
        String username = "testuser";

        String token = authService.generateToken(username);

        System.out.println("testGenerateToken: Token - " + token);
        assertNotNull(token);
        assertFalse(token.isEmpty());
        String extractedUsername = authService.getUsernameFromToken(token);
        assertEquals(username, extractedUsername);
    }

    @Test
    void testGetUsernameFromTokenValid() {
        String username = "testuser";
        String token = authService.generateToken(username);

        String extractedUsername = authService.getUsernameFromToken(token);

        System.out.println("testGetUsernameFromTokenValid: Extracted - " + extractedUsername);
        assertEquals(username, extractedUsername);
    }

    @Test
    void testGetUsernameFromTokenInvalid() {
        String invalidToken = "invalid.token.here";

        assertThrows(MalformedJwtException.class, () -> {
            authService.getUsernameFromToken(invalidToken);
        });
        System.out.println("testGetUsernameFromTokenInvalid: Exception thrown as expected");
    }

    @Test
    void testGetUserIdByUsernameSuccess() {
        String username = "testuser";
        Long userId = 1L;
        User user = new User(username, "hashedpass");
        user.setId(userId);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        Long retrievedId = authService.getUserIdByUsername(username);

        System.out.println("testGetUserIdByUsernameSuccess: ID - " + retrievedId);
        assertEquals(userId, retrievedId);
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void testGetUserIdByUsernameNotFound() {
        String username = "nonexistent";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            authService.getUserIdByUsername(username);
        });
        System.out.println("testGetUserIdByUsernameNotFound: Exception thrown as expected");
    }

    @Test
    void testGetUserByIdSuccess() {
        Long userId = 1L;
        User user = new User("testuser", "hashedpass");
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User retrievedUser = authService.getUserById(userId);

        System.out.println("testGetUserByIdSuccess: User - " + retrievedUser.getUsername());
        assertEquals(user, retrievedUser);
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    void testGetUserByIdNotFound() {
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            authService.getUserById(userId);
        });
        System.out.println("testGetUserByIdNotFound: Exception thrown as expected");
    }
}