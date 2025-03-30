package santos.luis.boatmanagerapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import santos.luis.boatmanagerapp.model.Boat;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoatRepository extends JpaRepository<Boat, Long> {

    List<Boat> findByUserId(Long userId);
    Optional<Boat> findByIdAndUserId(Long id, Long userId);
}
