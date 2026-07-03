package com.mitmit.repository;

import com.mitmit.document.NsfwEvidence;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NsfwEvidenceRepository extends MongoRepository<NsfwEvidence, String> {
}
