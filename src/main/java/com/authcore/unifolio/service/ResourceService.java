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

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource createResource(Resource resource) {
        if (resource.getStatus() == null) {
            resource.setStatus(Resource.ResourceStatus.ACTIVE);
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

        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setAvailableFrom(updatedResource.getAvailableFrom());
        existingResource.setAvailableTo(updatedResource.getAvailableTo());
        existingResource.setStatus(updatedResource.getStatus());
        existingResource.setDescription(updatedResource.getDescription());

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }
    public List<Resource> getFilteredResources(Resource.ResourceType type, String location, Integer minCapacity) {
        boolean hasType = type != null;
        boolean hasLocation = location != null && !location.trim().isEmpty();
        boolean hasMinCapacity = minCapacity != null;

        if (hasType && hasLocation && hasMinCapacity) {
            return resourceRepository.findAll().stream()
                    .filter(resource -> resource.getType() == type)
                    .filter(resource -> resource.getLocation() != null &&
                            resource.getLocation().toLowerCase().contains(location.toLowerCase()))
                    .filter(resource -> resource.getCapacity() != null &&
                            resource.getCapacity() >= minCapacity)
                    .toList();
        }

        if (hasType && hasLocation) {
            return resourceRepository.findByTypeAndLocationContainingIgnoreCase(type, location);
        }

        if (hasType && hasMinCapacity) {
            return resourceRepository.findByTypeAndCapacityGreaterThanEqual(type, minCapacity);
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

    private void validateResource(Resource resource) {
        if (resource.getName() == null || resource.getName().trim().isEmpty()) {
            throw new RuntimeException("Resource name is required");
        }

        if (resource.getType() == null) {
            throw new RuntimeException("Resource type is required");
        }

        if (resource.getLocation() == null || resource.getLocation().trim().isEmpty()) {
            throw new RuntimeException("Location is required");
        }

        if (resource.getAvailableFrom() == null) {
            throw new RuntimeException("Available from time is required");
        }

        if (resource.getAvailableTo() == null) {
            throw new RuntimeException("Available to time is required");
        }

        if (resource.getAvailableFrom().compareTo(resource.getAvailableTo()) >= 0) {
            throw new RuntimeException("Available from time must be earlier than available to time");
        }

        if (resource.getStatus() == null) {
            throw new RuntimeException("Resource status is required");
        }

        boolean isSpaceResource =
                resource.getType() == Resource.ResourceType.LECTURE_HALL ||
                        resource.getType() == Resource.ResourceType.LAB ||
                        resource.getType() == Resource.ResourceType.MEETING_ROOM;

        if (isSpaceResource) {
            if (resource.getCapacity() == null || resource.getCapacity() < 1) {
                throw new RuntimeException("Capacity must be at least 1 for halls, labs, and meeting rooms");
            }
        } else if (resource.getType() == Resource.ResourceType.EQUIPMENT) {
            if (resource.getCapacity() != null && resource.getCapacity() < 1) {
                throw new RuntimeException("If provided, equipment capacity must be at least 1");
            }
        }
    }
}