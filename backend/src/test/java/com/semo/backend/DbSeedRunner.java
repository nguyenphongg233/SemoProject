package com.semo.backend;

import com.semo.backend.seeder.DatabaseSeeder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;

@SpringBootTest
public class DbSeedRunner {
    @Autowired
    private DatabaseSeeder seeder;

    @Test
    public void seedDb() throws Exception {
        System.out.println("========== RUNNING SEEDER ==========");
        seeder.run();
        System.out.println("====================================");
    }
}
