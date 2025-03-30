package santos.luis.boatmanagerapp.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import santos.luis.boatmanagerapp.controller.dto.AuthRequest;
import santos.luis.boatmanagerapp.controller.dto.AuthResponse;
import santos.luis.boatmanagerapp.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest loginRequest) {
        String token = authService.authenticate(loginRequest.username(), loginRequest.password());
        if (token != null) {
            return ResponseEntity.ok(new AuthResponse(token, null));
        } else {
            return ResponseEntity.status(401).body(new AuthResponse(null, "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest signupRequest) {
        boolean registered = authService.register(signupRequest.username(), signupRequest.password());
        if (registered) {
            return ResponseEntity.ok(new AuthResponse(null, "User registered successfully"));
        } else {
            return ResponseEntity.badRequest().body(new AuthResponse(null, "Registration failed: Username already exists"));
        }
    }
}
