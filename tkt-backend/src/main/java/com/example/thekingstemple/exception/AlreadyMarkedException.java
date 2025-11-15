package com.example.thekingstemple.exception;

import java.time.LocalDate;

public class AlreadyMarkedException extends RuntimeException {
    public AlreadyMarkedException(String message) {
        super(message);
    }

    public AlreadyMarkedException(String vehicleNumber, LocalDate date) {
        super(String.format("Vehicle %s has already been marked for date: %s", vehicleNumber, date));
    }
}
