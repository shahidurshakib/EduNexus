-- ============================================================================
-- EduNexus Phase 3 Migration (additive only — run AFTER schema.sql and
-- migration_phase2.sql). Adds:
--   1. `applications` — the generic apply / collaboration-request system used by:
--        - members & mentors applying to a startup (target_type = 'startup')
--        - members sending a collaboration request to a mentor (target_type = 'mentor')
--        - mentors & members sending a request/proposal to an investor (target_type = 'investor')
--      All three flows share the same pending -> approved / revised -> (resubmit) -> reject lifecycle.
--   2. `research_mentors` — links mentors to a research record so its detail
--      page can show who is guiding it.
--   3. `documents.doc_type` / `documents.is_locked` — lets a draft proposal or
--      full paper attached to a research record be marked secure (locked),
--      gated behind a permission-checked download endpoint instead of the
--      public /uploads static route.
--   4. Registration no longer requires OTP email verification — accounts are
--      active immediately, so `is_email_verified` now defaults to 1.
-- ============================================================================

CREATE TABLE IF NOT EXISTS applications (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  applicant_id    BIGINT UNSIGNED NOT NULL,
  target_type     ENUM('startup','mentor','investor') NOT NULL,
  target_id       BIGINT UNSIGNED NOT NULL,
  title           VARCHAR(200) NULL,
  message         TEXT NULL,
  proposal_file   VARCHAR(255) NULL,
  is_locked       TINYINT(1) NOT NULL DEFAULT 0,
  status          ENUM('pending','approved','revised','rejected') NOT NULL DEFAULT 'pending',
  review_note     VARCHAR(1000) NULL,
  reviewed_by     BIGINT UNSIGNED NULL,
  reviewed_at     DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_applicant FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_applications_target ON applications (target_type, target_id);
CREATE INDEX idx_applications_applicant ON applications (applicant_id);

CREATE TABLE IF NOT EXISTS research_mentors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  research_id   BIGINT UNSIGNED NOT NULL,
  mentor_id     BIGINT UNSIGNED NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rm_research FOREIGN KEY (research_id) REFERENCES research(id) ON DELETE CASCADE,
  CONSTRAINT fk_rm_mentor FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
  UNIQUE KEY uq_research_mentor (research_id, mentor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE documents
  ADD COLUMN doc_type VARCHAR(50) NULL AFTER file_path,
  ADD COLUMN is_locked TINYINT(1) NOT NULL DEFAULT 0 AFTER doc_type;
