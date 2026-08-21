-- ============================================================================
-- EduNexus Phase 2 Migration (additive only — run AFTER schema.sql)
-- Adds columns/table needed for Research PDF upload, Funding notes, and the
-- generic "Documents" upload requirement. Nothing here drops or alters any
-- existing column, so it is safe to run on a DB that already has data.
-- ============================================================================

ALTER TABLE research
  ADD COLUMN pdf_file VARCHAR(255) NULL AFTER patent_status;

ALTER TABLE funding_rounds
  ADD COLUMN notes VARCHAR(1000) NULL AFTER funding_date;

-- Generic document attachments (e.g. startup pitch decks, extra research
-- files) beyond the single "logo" / "pdf_file" columns already on their
-- owning tables.
CREATE TABLE IF NOT EXISTS documents (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type  ENUM('startup','research','user') NOT NULL,
  entity_id    BIGINT UNSIGNED NOT NULL,
  file_path    VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NULL,
  uploaded_by  BIGINT UNSIGNED NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_documents_entity ON documents (entity_type, entity_id);
