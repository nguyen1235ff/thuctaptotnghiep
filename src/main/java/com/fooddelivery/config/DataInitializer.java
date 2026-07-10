package com.fooddelivery.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataInitializer - Đã disable vì dữ liệu khởi tạo được quản lý bởi Flyway migration V1.
 * Flyway seed data trong V1__Initialize_Database.sql đã bao gồm roles và admin user mặc định.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        log.info("DataInitializer: Dữ liệu khởi tạo được quản lý bởi Flyway migration.");
    }
}
