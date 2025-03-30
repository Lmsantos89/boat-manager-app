package santos.luis.boatmanagerapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import santos.luis.boatmanagerapp.controller.dto.BoatDTO;
import santos.luis.boatmanagerapp.model.Boat;
import santos.luis.boatmanagerapp.model.User;
import santos.luis.boatmanagerapp.repository.BoatRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoatService {

    private final BoatRepository boatRepository;
    private final AuthService authService;

    public List<BoatDTO> getAllBoats() {
        return boatRepository.findByUserId(getCurrentUserId()).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public BoatDTO  createBoat(Boat boat) {
        Long userId = getCurrentUserId();
        User user = authService.getUserById(userId);
        boat.setUser(user);
        Boat savedBoat = boatRepository.save(boat);
        return convertToDTO(savedBoat);
    }

    public Optional<BoatDTO> getBoatById(Long id) {
        return boatRepository.findByIdAndUserId(id, getCurrentUserId())
                .map(this::convertToDTO);
    }

    public Optional<BoatDTO> updateBoat(Long id, Boat boatDetails) {
        return boatRepository.findByIdAndUserId(id, getCurrentUserId()).map(boat -> {
            boat.setName(boatDetails.getName());
            boat.setDescription(boatDetails.getDescription());
            Boat updatedBoat = boatRepository.save(boat);
            return convertToDTO(updatedBoat);
        });
    }

    public boolean deleteBoat(Long id) {
        Long userId = getCurrentUserId();
        return boatRepository.findByIdAndUserId(id, userId).map(boat -> {
            boatRepository.delete(boat);
            return true;
        }).orElse(false);
    }


    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return authService.getUserIdByUsername(username);
    }

    private BoatDTO convertToDTO(Boat boat) {
        return new BoatDTO(boat.getId(), boat.getName(), boat.getDescription());
    }

}
