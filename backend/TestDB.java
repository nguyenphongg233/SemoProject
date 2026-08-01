import java.sql.*;

public class TestDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://semo-db-cloud-nnta.e.aivencloud.com:24154/semo_db?useSSL=true&serverTimezone=Asia/Ho_Chi_Minh";
        String user = "avnadmin";
        String pass = System.getenv("DB_PASSWORD");
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            try (Statement stmt = conn.createStatement()) {
                ResultSet rs = stmt.executeQuery("SELECT station_id, COUNT(*) as cnt FROM scooters WHERE status='AVAILABLE' GROUP BY station_id");
                while(rs.next()) {
                    System.out.println("Station " + rs.getInt("station_id") + " has " + rs.getInt("cnt") + " AVAILABLE scooters");
                }
                
                ResultSet rs2 = stmt.executeQuery("SELECT status, COUNT(*) as cnt FROM scooters GROUP BY status");
                System.out.println("--- Scooters by status ---");
                while(rs2.next()) {
                    System.out.println(rs2.getString("status") + ": " + rs2.getInt("cnt"));
                }
            }
        }
    }
}
