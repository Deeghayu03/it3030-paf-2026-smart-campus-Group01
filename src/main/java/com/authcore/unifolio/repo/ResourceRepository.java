package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(Resource.ResourceType type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByTypeAndLocationContainingIgnoreCase(Resource.ResourceType type, String location);

    List<Resource> findByTypeAndCapacityGreaterThanEqual(Resource.ResourceType type, Integer capacity);
}