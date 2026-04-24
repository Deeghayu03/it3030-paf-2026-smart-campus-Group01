package com.authcore.unifolio.service;

import com.authcore.unifolio.entity.Resource;
import com.authcore.unifolio.repo.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> getFilteredResources(Resource.ResourceType type, String location, Integer minCapacity) {
        boolean hasType = type != null;
        boolean hasLocation = location != null && !location.trim().isEmpty();
        boolean hasMinCapacity = minCapacity != null;

        if (hasType && hasLocation && hasMinCapacity) {
            return resourceRepository.findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqual(
                    type, location, minCapacity
            );
        }

        if (hasType && hasLocation) {
            return resourceRepository.findByTypeAndLocationContainingIgnoreCase(type, location);
        }

        if (hasType && hasMinCapacity) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqual(type, minCapacity);
        }

        if (hasLocation && hasMinCapacity) {
            return resourceRepository.findByLocationContainingIgnoreCaseAndCapacityGreaterThanEqual(location, minCapacity);
        }

        if (hasType) {
            return resourceRepository.findByType(type);
        }

        if (hasLocation) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        }

        if (hasMinCapacity) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }

        return resourceRepository.findAll();
    }

    public List<Resource> getFilteredResources(
            Resource.ResourceType type,
            String location,
            Integer minCapacity,
            Resource.ResourceStatus status
    ) {
        boolean hasType = type != null;
        boolean hasLocation = location != null && !location.trim().isEmpty();
        boolean hasMinCapacity = minCapacity != null;
        boolean hasStatus = status != null;

        if (hasType && hasLocation && hasMinCapacity && hasStatus) {
            return resourceRepository
                    .findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqualAndStatus(
                            type, location, minCapacity, status
                    );
        }

        if (hasType && hasStatus) {
            return resourceRepository.findByTypeAndStatus(type, status);
        }

        if (hasLocation && hasStatus) {
            return resourceRepository.findByLocationContainingIgnoreCaseAndStatus(location, status);
        }

        if (hasMinCapacity && hasStatus) {
            return resourceRepository.findByCapacityGreaterThanEqualAndStatus(minCapacity, status);
        }

        if (hasStatus) {
            return resourceRepository.findByStatus(status);
        }

        return getFilteredResources(type, location, minCapacity);
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource createResource(Resource resource) {
        if (resource.getStatus() == null) {
            resource.setStatus(Resource.ResourceStatus.ACTIVE);
        }

        if (resource.getDescription() != null) {
            resource.setDescription(resource.getDescription().trim());
        }

        validateResource(resource);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);

        if (updatedResource.getStatus() == null) {
            updatedResource.setStatus(existingResource.getStatus());
        }

        validateResource(updatedResource);

        existingResource.setName(updatedResource.getName().trim());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation().trim());
        existingResource.setAvailableFrom(updatedResource.getAvailableFrom());
        existingResource.setAvailableTo(updatedResource.getAvailableTo());
        existingResource.setStatus(updatedResource.getStatus());
        existingResource.setDescription(
                updatedResource.getDescription() != null
                        ? updatedResource.getDescription().trim()
                        : null
        );

        return resourceRepository.save(existingResource);
    }

    public Resource updateResourceStatus(Long id, Resource.ResourceStatus status) {
        Resource resource = getResourceById(id);

        if (resource.getStatus() == status) {
            throw new RuntimeException("Resource is already in " + status + " status");
        }

        resource.setStatus(status);
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }

    private void validateResource(Resource resource) {
        if (resource.getName() == null || resource.getName().trim().isEmpty()) {
            throw new RuntimeException("Resource name is required");
        }

        if (resource.getType() == null) {
            throw new RuntimeException("Resource type is required");
        }

        if (resource.getLocation() == null || resource.getLocation().trim().isEmpty()) {
            throw new RuntimeException("Resource location is required");
        }

        if (resource.getAvailableFrom() == null) {
            throw new RuntimeException("Available from time is required");
        }

        if (resource.getAvailableTo() == null) {
            throw new RuntimeException("Available to time is required");
        }

        if (!resource.getAvailableFrom().isBefore(resource.getAvailableTo())) {
            throw new RuntimeException("Available from time must be earlier than available to time");
        }

        boolean isSpaceResource =
                resource.getType() == Resource.ResourceType.LECTURE_HALL ||
                        resource.getType() == Resource.ResourceType.LAB ||
                        resource.getType() == Resource.ResourceType.MEETING_ROOM;

        if (isSpaceResource) {
            if (resource.getCapacity() == null || resource.getCapacity() < 1) {
                throw new RuntimeException("Capacity must be at least 1 for lecture halls, labs, and meeting rooms");
            }
        }

        if (resource.getType() == Resource.ResourceType.EQUIPMENT) {
            if (resource.getCapacity() != null && resource.getCapacity() < 1) {
                throw new RuntimeException("Equipment capacity must be at least 1 if provided");
            }
        }

        if (resource.getDescription() != null && resource.getDescription().length() > 500) {
            throw new RuntimeException("Description cannot exceed 500 characters");
        }
    }
}