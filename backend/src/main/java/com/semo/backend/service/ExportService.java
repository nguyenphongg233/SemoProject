package com.semo.backend.service;

import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ByteArrayInputStream exportUsersToExcel(List<User> users) {
        String[] columns = {"ID", "Email", "Full Name", "Phone", "Role", "Balance", "Active", "Verified", "Created At"};
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Users");

            // Header Font
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLUE.getIndex());

            // Header Style
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Row for Header
            Row headerRow = sheet.createRow(0);

            // Header
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Data
            int rowIdx = 1;
            for (User user : users) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(user.getId());
                row.createCell(1).setCellValue(user.getEmail());
                row.createCell(2).setCellValue(user.getFullName());
                row.createCell(3).setCellValue(user.getPhoneNumber());
                row.createCell(4).setCellValue(user.getRole());
                row.createCell(5).setCellValue(user.getBalance() != null ? user.getBalance() : 0.0);
                row.createCell(6).setCellValue(Boolean.TRUE.equals(user.getIsActive()) ? "Yes" : "No");
                row.createCell(7).setCellValue(Boolean.TRUE.equals(user.getIsVerified()) ? "Yes" : "No");
                row.createCell(8).setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().format(formatter) : "");
            }

            // Auto-size columns
            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to export users data to Excel file", e);
        }
    }

    public ByteArrayInputStream exportScootersToExcel(List<Scooter> scooters) {
        String[] columns = {"ID", "Name", "Status", "Battery Level (%)", "Cycle Count", "Health (%)", "Temperature (°C)", "Lat", "Lng", "Updated At"};
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Scooters");

            // Header Font
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.DARK_GREEN.getIndex());

            // Header Style
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Row for Header
            Row headerRow = sheet.createRow(0);

            // Header
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Data
            int rowIdx = 1;
            for (Scooter scooter : scooters) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(scooter.getId());
                row.createCell(1).setCellValue(scooter.getName() != null ? scooter.getName() : "");
                row.createCell(2).setCellValue(scooter.getStatus() != null ? scooter.getStatus() : "");
                row.createCell(3).setCellValue(scooter.getBatteryLevel() != null ? scooter.getBatteryLevel() : 0);
                row.createCell(4).setCellValue(scooter.getCycleCount() != null ? scooter.getCycleCount() : 0);
                row.createCell(5).setCellValue(scooter.getStateOfHealth() != null ? scooter.getStateOfHealth() : 0.0);
                row.createCell(6).setCellValue(scooter.getTemperature() != null ? scooter.getTemperature() : 0.0);
                row.createCell(7).setCellValue(scooter.getCurrentLat() != null ? scooter.getCurrentLat() : 0.0);
                row.createCell(8).setCellValue(scooter.getCurrentLng() != null ? scooter.getCurrentLng() : 0.0);
                row.createCell(9).setCellValue(scooter.getUpdatedAt() != null ? scooter.getUpdatedAt().format(formatter) : 
                                               (scooter.getCreatedAt() != null ? scooter.getCreatedAt().format(formatter) : ""));
            }

            // Auto-size columns
            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to export scooters data to Excel file", e);
        }
    }
}
