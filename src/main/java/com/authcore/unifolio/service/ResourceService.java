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
        validateResource(resource);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        validateResource(updatedResource);

        Resource existingResource = getResourceById(id);

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

    private void validateResource(Resource resource) {
        if (resource.getName() == null || resource.getName().trim().isEmpty()) {
            throw new RuntimeException("Resource name is required");
        }

        if (resource.getType() == null) {
            throw new RuntimeException("Resource type is required");
        }

        if (resource.getCapacity() == null || resource.getCapacity() < 1) {
            throw new RuntimeException("Capacity must be at least 1");
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
    }
}