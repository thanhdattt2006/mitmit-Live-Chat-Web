package com.mitmit.repository;

import com.mitmit.entity.Ban;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BanRepository extends JpaRepository<Ban, Long> {
    boolean existsByUser_Id(String userId);
    Optional<Ban> findByUser_Id(String userId);
}
