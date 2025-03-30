package santos.luis.boatmanagerapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    private Long id;
    private String username;
    @JsonIgnore
    private String password;

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }
}
