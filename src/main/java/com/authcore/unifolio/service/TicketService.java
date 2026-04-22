package com.authcore.unifolio.service;

import com.authcore.unifolio.entity.Ticket;
import com.authcore.unifolio.entity.TicketComment;
import com.authcore.unifolio.entity.TicketAttachment;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.TicketRepository;
import com.authcore.unifolio.repo.TicketCommentRepository;
import com.authcore.unifolio.repo.TicketAttachmentRepository;
import com.authcore.unifolio.dto.TicketDTO;
import com.authcore.unifolio.dto.CommentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;

    public List<Ticket> getUserTickets(String userEmail) {
        return ticketRepository.findByUserEmail(userEmail);
    }

    public Ticket createTicket(TicketDTO ticketDTO, User user) {
        Ticket ticket = new Ticket();
        ticket.setReportedBy(user);
        ticket.setCategory(Ticket.TicketCategory.valueOf(ticketDTO.getCategory().toUpperCase()));
        ticket.setDescription(ticketDTO.getDescription());
        ticket.setPriority(Ticket.TicketPriority.valueOf(ticketDTO.getPriority().toUpperCase()));
        ticket.setResourceName(ticketDTO.getResourceName());
        ticket.setContactEmail(ticketDTO.getContactEmail());
        ticket.setContactPhone(ticketDTO.getContactPhone());
        ticket.setStatus(Ticket.TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    public Ticket addComment(Long ticketId, CommentDTO commentDTO, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Verify user owns the ticket
        if (!ticket.getReportedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(user);
        comment.setMessage(commentDTO.getMessage());

        commentRepository.save(comment);
        
        // Update ticket timestamp
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket getTicket(Long ticketId, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Verify user owns the ticket
        if (!ticket.getReportedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return ticket;
    }

    public Ticket getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public void addAttachment(Long ticketId, MultipartFile file) throws IOException {
        Ticket ticket = getTicketById(ticketId);
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get("uploads/tickets");
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
        
        // Create attachment record
        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(originalFilename);
        attachment.setFilePath("uploads/tickets/" + uniqueFilename);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        
        attachmentRepository.save(attachment);
    }
}
