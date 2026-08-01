package com.semo.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://semo-db-cloud-nnta.e.aivencloud.com:24154/semo_db?useSSL=true&serverTimezone=Asia/Ho_Chi_Minh";
        String user = "avnadmin";
        String pass = System.getenv("DB_PASSWORD");
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            try (Statement stmt = conn.createStatement()) {
                System.out.println("========== DB STATS ==========");
                ResultSet rs0 = stmt.executeQuery("SELECT COUNT(*) as c FROM stations");
                if (rs0.next()) System.out.println("Stations: " + rs0.getInt("c"));

                ResultSet rs1 = stmt.executeQuery("SELECT COUNT(*) as c FROM scooters");
                if (rs1.next()) System.out.println("Scooters: " + rs1.getInt("c"));

                ResultSet rs = stmt.executeQuery("SELECT station_id, COUNT(*) as cnt FROM scooters WHERE status='AVAILABLE' GROUP BY station_id");
                while(rs.next()) {
                    System.out.println("Station " + rs.getString("station_id") + " has " + rs.getInt("cnt") + " AVAILABLE scooters");
                }
                System.out.println("==============================");
            }
        }
    }
}
