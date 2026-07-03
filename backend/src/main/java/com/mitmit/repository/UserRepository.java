package com.mitmit.repository;

import com.mitmit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByGithubId(String githubId);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(com.mitmit.entity.Role role);
}
