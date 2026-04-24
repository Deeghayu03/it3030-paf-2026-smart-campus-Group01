package com.authcore.unifolio.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:*"})
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/tickets/";
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file to disk
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);
            
            // Return file information
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);
            response.put("contentType", file.getContentType());
            response.put("size", String.valueOf(file.getSize()));
            response.put("url", "/api/files/download/" + uniqueFilename);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            response.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            byte[] fileContent = Files.readAllBytes(filePath);
            
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(fileContent);
                
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/view/{filename}")
    public ResponseEntity<byte[]> viewFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            byte[] fileContent = Files.readAllBytes(filePath);
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(fileContent);
                
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
