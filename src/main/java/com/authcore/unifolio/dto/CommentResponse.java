package com.authcore.unifolio.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String userName;
    private String userEmail;
    private String content;
    private LocalDateTime createdAt;
}
