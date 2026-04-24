package com.authcore.unifolio.service;

import com.authcore.unifolio.dto.*;
import com.authcore.unifolio.entity.*;
import com.authcore.unifolio.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private TicketAttachmentRepository attachmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ResourceRepository resourceRepository;
    @Autowired
    private NotificationService notificationService;

    private static final String UPLOAD_DIR = "uploads/tickets/";

    public TicketResponse createTicket(TicketRequest request, String email) {
        User reportedBy = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Ticket ticket = new Ticket();
        ticket.setReportedBy(reportedBy);
        ticket.setLocation(request.getLocation());
        ticket.setDescription(request.getDescription());
        
        try {
            ticket.setPriority(Ticket.TicketPriority.valueOf(request.getPriority()));
        } catch(Exception e) {
            ticket.setPriority(Ticket.TicketPriority.MEDIUM);
        }
        
        if (request.getResourceId() != null) {
            resourceRepository.findById(request.getResourceId()).ifPresent(ticket::setResource);
        }
        
        // Field missing in Entity but requested by prompt context mapping skipped: category, contactDetails
        
        Ticket savedTicket = ticketRepository.save(ticket);

        if (savedTicket.getPriority() == Ticket.TicketPriority.CRITICAL) {
            List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(admin, "Critical Ticket Reported: " + savedTicket.getId(),
                        Notification.NotificationType.TICKET_UPDATED, savedTicket.getId(), "TICKET");
            }
        }
        return mapToResponse(savedTicket);
    }

    public List<TicketResponse> getMyTickets(String email) {
        return ticketRepository.findByReportedByEmailOrderByCreatedAtDesc(email)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public TicketResponse getTicketDetail(Long id, String email) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToResponseDetail(ticket);
    }

    public TicketResponse updateStatus(Long id, StatusUpdateRequest request, String email) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
        boolean statusChanged = false;
        
        if (request.getStatus() != null) {
            try {
                ticket.setStatus(Ticket.TicketStatus.valueOf(request.getStatus()));
                statusChanged = true;
            } catch(Exception ignored) {}
        }
        if (request.getResolutionNotes() != null) ticket.setResolutionNotes(request.getResolutionNotes());
        if (request.getRejectionReason() != null) ticket.setRejectionReason(request.getRejectionReason());

        if (request.getAssignedToEmail() != null && !request.getAssignedToEmail().isEmpty()) {
            userRepository.findByEmail(request.getAssignedToEmail()).ifPresent(tech -> {
                ticket.setAssignedTo(tech);
                notificationService.createNotification(tech, "You have been assigned to Ticket: " + ticket.getId(),
                        Notification.NotificationType.TICKET_ASSIGNED, ticket.getId(), "TICKET");
            });
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        if (statusChanged) {
            Ticket.TicketStatus newStatus = savedTicket.getStatus();
            String studentMessage;
            Notification.NotificationType studentType;

            if (newStatus == Ticket.TicketStatus.RESOLVED) {
                String notes = savedTicket.getResolutionNotes() != null ? savedTicket.getResolutionNotes() : "No notes provided.";
                studentMessage = "Your ticket #" + savedTicket.getId() + " has been resolved. Notes: " + notes;
                studentType = Notification.NotificationType.TICKET_RESOLVED;
            } else if (newStatus == Ticket.TicketStatus.REJECTED) {
                String reason = savedTicket.getRejectionReason() != null ? savedTicket.getRejectionReason() : "No reason provided.";
                studentMessage = "Your ticket #" + savedTicket.getId() + " has been rejected. Reason: " + reason;
                studentType = Notification.NotificationType.TICKET_REJECTED;
            } else if (newStatus == Ticket.TicketStatus.IN_PROGRESS) {
                studentMessage = "Your ticket #" + savedTicket.getId() + " is now being worked on.";
                studentType = Notification.NotificationType.TICKET_UPDATED;
            } else if (newStatus == Ticket.TicketStatus.CLOSED) {
                studentMessage = "Your ticket #" + savedTicket.getId() + " has been closed.";
                studentType = Notification.NotificationType.TICKET_UPDATED;
            } else {
                studentMessage = "Ticket #" + savedTicket.getId() + " status updated.";
                studentType = Notification.NotificationType.TICKET_UPDATED;
            }

            notificationService.createNotification(savedTicket.getReportedBy(), studentMessage, studentType, savedTicket.getId(), "TICKET");

            if (savedTicket.getAssignedTo() != null && !savedTicket.getAssignedTo().getEmail().equals(email)) {
                notificationService.createNotification(savedTicket.getAssignedTo(),
                        "Ticket #" + savedTicket.getId() + " status changed to " + newStatus.name().replace('_', ' ').toLowerCase() + ".",
                        Notification.NotificationType.TICKET_UPDATED, savedTicket.getId(), "TICKET");
            }
        }
        return mapToResponse(savedTicket);
    }

    public CommentResponse addComment(Long ticketId, CommentRequest request, String email) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(request.getContent());
        Comment savedComment = commentRepository.save(comment);

        if (!user.getEmail().equals(ticket.getReportedBy().getEmail())) {
            notificationService.createNotification(ticket.getReportedBy(), "New comment on your ticket",
                    Notification.NotificationType.NEW_COMMENT, ticket.getId(), "TICKET");
        }
        
        CommentResponse resp = new CommentResponse();
        resp.setId(savedComment.getId());
        resp.setUserEmail(user.getEmail());
        resp.setUserName(user.getName());
        resp.setContent(savedComment.getContent());
        resp.setCreatedAt(savedComment.getCreatedAt());
        return resp;
    }

    public List<String> uploadAttachments(Long ticketId, MultipartFile[] files, String email) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        long currentCount = attachmentRepository.countByTicketId(ticketId);
        if (currentCount + files.length > 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR);
        try {
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload folder");
        }

        for (MultipartFile file : files) {
            try {
                String originalFilename = file.getOriginalFilename();
                String ext = originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                String uniqueFilename = UUID.randomUUID().toString() + ext;
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), filePath);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicket(ticket);
                attachment.setFilePath("/api/files/download/" + uniqueFilename);
                attachment.setFileName(originalFilename);
                attachment.setFileType(file.getContentType());
                attachmentRepository.save(attachment);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file");
            }
        }
        return attachmentRepository.findByTicketId(ticketId).stream().map(TicketAttachment::getFilePath).collect(Collectors.toList());
    }

    public void deleteAttachment(Long attachmentId, String email) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId).orElseThrow(() -> new RuntimeException("Attachment not found"));
        try {
            String filename = attachment.getFilePath().substring(attachment.getFilePath().lastIndexOf("/") + 1);
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}
        attachmentRepository.delete(attachment);
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse dto = new TicketResponse();
        dto.setId(ticket.getId());
        if (ticket.getReportedBy() != null) {
            dto.setReportedByEmail(ticket.getReportedBy().getEmail());
            dto.setReportedByName(ticket.getReportedBy().getName());
        }
        if (ticket.getAssignedTo() != null) {
            dto.setAssignedToEmail(ticket.getAssignedTo().getEmail());
            dto.setAssignedToName(ticket.getAssignedTo().getName());
        }
        dto.setLocation(ticket.getLocation());
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority() != null ? ticket.getPriority().name() : null);
        dto.setStatus(ticket.getStatus() != null ? ticket.getStatus().name() : null);
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        return dto;
    }

    private TicketResponse mapToResponseDetail(Ticket ticket) {
        TicketResponse dto = mapToResponse(ticket);
        List<CommentResponse> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream().map(c -> {
            CommentResponse cr = new CommentResponse();
            cr.setId(c.getId());
            cr.setUserEmail(c.getUser().getEmail());
            cr.setUserName(c.getUser().getName());
            cr.setContent(c.getContent());
            cr.setCreatedAt(c.getCreatedAt());
            return cr;
        }).collect(Collectors.toList());
        dto.setComments(comments);

        List<String> paths = attachmentRepository.findByTicketId(ticket.getId()).stream()
                .map(TicketAttachment::getFilePath).collect(Collectors.toList());
        dto.setAttachmentPaths(paths);
        return dto;
    }
}
