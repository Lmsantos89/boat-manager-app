package santos.luis.boatmanagerapp.controller.dto;

import jakarta.validation.constraints.NotNull;

public record AuthRequest(@NotNull(message = "Username is required") String username,
                          @NotNull(message = "Password is required") String password) {}