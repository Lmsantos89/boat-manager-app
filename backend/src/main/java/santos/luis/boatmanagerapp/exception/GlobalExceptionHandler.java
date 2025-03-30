package santos.luis.boatmanagerapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import santos.luis.boatmanagerapp.controller.dto.AuthResponse;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AuthResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        String message = "Validation failed: " + errors.toString();
        return new ResponseEntity<>(new AuthResponse(null, message), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<AuthResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "Invalid request format: " + ex.getMessage();
        return new ResponseEntity<>(new AuthResponse(null, message), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<AuthResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(new AuthResponse(null, ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<AuthResponse> handleGeneralException(Exception ex) {
        String message = "An unexpected error occurred: " + ex.getMessage();
        return new ResponseEntity<>(new AuthResponse(null, message), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}