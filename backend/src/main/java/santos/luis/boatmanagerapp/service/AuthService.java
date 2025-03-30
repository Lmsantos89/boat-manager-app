package santos.luis.boatmanagerapp.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import santos.luis.boatmanagerapp.model.User;
import santos.luis.boatmanagerapp.repository.UserRepository;

import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    public String authenticate(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return generateToken(username);
        }
        return null;
    }

    public boolean register(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            return false;
        }
        User newUser = new User(username, passwordEncoder.encode(password));
        userRepository.save(newUser);
        return true;
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), Jwts.SIG.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));
    }

}
