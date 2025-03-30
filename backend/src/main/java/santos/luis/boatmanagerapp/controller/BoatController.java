package santos.luis.boatmanagerapp.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import santos.luis.boatmanagerapp.controller.dto.BoatDTO;
import santos.luis.boatmanagerapp.model.Boat;
import santos.luis.boatmanagerapp.service.BoatService;

import java.util.List;

@RestController
@RequestMapping("/api/boats")
@AllArgsConstructor
public class BoatController {

    private BoatService boatService;

    @GetMapping
    public ResponseEntity<List<BoatDTO>> getAllBoats() {
        return ResponseEntity.ok(boatService.getAllBoats());
    }

    @PostMapping
    public ResponseEntity<BoatDTO> createBoat(@Valid @RequestBody Boat boat) {
        BoatDTO createdBoat = boatService.createBoat(boat);
        return ResponseEntity.status(201).body(createdBoat);
    }


    @GetMapping("/{id}")
    public ResponseEntity<BoatDTO> getBoatById(@PathVariable Long id) {
        return boatService.getBoatById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoatDTO> updateBoat(@PathVariable Long id, @Valid @RequestBody Boat boatDetails) {
        return boatService.updateBoat(id, boatDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoat(@PathVariable Long id) {
        return boatService.deleteBoat(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}
