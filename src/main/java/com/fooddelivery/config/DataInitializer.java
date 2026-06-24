package com.fooddelivery.config;

import com.fooddelivery.entity.Role;
import com.fooddelivery.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        if (roleRepository.count() > 0) {
            return;
        }

        List<Role> defaultRoles = List.of(
                Role.builder().roleName("ADMIN").description("Quản trị hệ thống").build(),
                Role.builder().roleName("CUSTOMER").description("Khách hàng").build(),
                Role.builder().roleName("RESTAURANT").description("Chủ nhà hàng").build(),
                Role.builder().roleName("SHIPPER").description("Người giao hàng").build()
        );

        roleRepository.saveAll(defaultRoles);
        log.info("Đã khởi tạo {} role mặc định", defaultRoles.size());
    }
}
