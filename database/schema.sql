-- ============================================================================
-- EduNexus Database Schema
-- MySQL 8.0+ | 3NF | Foreign Keys | Constraints | Triggers
-- ============================================================================
-- NOTE ON ROLES (design assumption, stated explicitly):
-- The brief uses "Founder" two different ways: (1) a registration option
-- for someone who founds a *startup*, and (2) a single super-admin
-- "Founder System" account with the highest platform authority.
-- To remove that ambiguity, this schema uses:
--   users.role = 'platform_founder' | 'admin' | 'mentor' | 'investor' | 'member'
--   - 'platform_founder' -> the ONE super-admin account (seed.sql), never
--                            selectable at public registration.
--   - 'admin'            -> approved manually by the platform_founder.
--   - 'member'            -> default signup role; a member becomes a
--                            "startup founder" simply by creating/joining a
--                            startup (see startup_founders). No separate
--                            registration option is needed for this.
--   - 'mentor' / 'investor' -> selectable at signup, but stay pending
--                            (role_approvals) until an admin/platform_founder
--                            approves them; only then do they become public.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS patents;
DROP TABLE IF EXISTS research_authors;
DROP TABLE IF EXISTS research;
DROP TABLE IF EXISTS funding_rounds;
DROP TABLE IF EXISTS startup_investors;
DROP TABLE IF EXISTS startup_mentors;
DROP TABLE IF EXISTS startup_founders;
DROP TABLE IF EXISTS startups;
DROP TABLE IF EXISTS role_approvals;
DROP TABLE IF EXISTS investors;
DROP TABLE IF EXISTS mentors;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- USERS  (core identity table for Founder(platform)/Admin/Mentor/Investor/Member)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name         VARCHAR(150)    NOT NULL,
  email             VARCHAR(190)    NOT NULL,
  password_hash     VARCHAR(255)    NOT NULL,
  phone             VARCHAR(20)     NULL,
  organization      VARCHAR(200)    NULL,
  profile_image     VARCHAR(255)    NULL,
  role              ENUM('platform_founder','admin','mentor','investor','member')
                                    NOT NULL DEFAULT 'member',
  is_email_verified TINYINT(1)      NOT NULL DEFAULT 0,
  is_active         TINYINT(1)      NOT NULL DEFAULT 1,
  token_version     INT UNSIGNED    NOT NULL DEFAULT 0,  -- bump to invalidate refresh tokens
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_phone CHECK (phone IS NULL OR CHAR_LENGTH(phone) >= 7)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_role ON users (role);

-- ----------------------------------------------------------------------------
-- OTPS  (email verification + password reset)
-- ----------------------------------------------------------------------------
CREATE TABLE otps (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  otp_code    CHAR(6)         NOT NULL,
  purpose     ENUM('registration','password_reset') NOT NULL DEFAULT 'registration',
  expires_at  DATETIME        NOT NULL,
  is_used     TINYINT(1)      NOT NULL DEFAULT 0,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_otps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_otps_user_purpose ON otps (user_id, purpose);

-- ----------------------------------------------------------------------------
-- ROLE_APPROVALS  (Become Mentor / Become Investor / Become Admin requests)
-- ----------------------------------------------------------------------------
CREATE TABLE role_approvals (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  requested_role  ENUM('mentor','investor','admin') NOT NULL,
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by     BIGINT UNSIGNED NULL,
  review_note     VARCHAR(500) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_roleapproval_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_roleapproval_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_roleapprovals_status ON role_approvals (status, requested_role);

-- ----------------------------------------------------------------------------
-- MENTORS  (public profile once approved)
-- ----------------------------------------------------------------------------
CREATE TABLE mentors (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  expertise         VARCHAR(255) NULL,
  bio               TEXT NULL,
  linkedin_url      VARCHAR(255) NULL,
  is_public         TINYINT(1) NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_mentors_user UNIQUE (user_id),
  CONSTRAINT fk_mentors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- INVESTORS  (public profile once approved)
-- ----------------------------------------------------------------------------
CREATE TABLE investors (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  investment_focus    VARCHAR(255) NULL,
  min_ticket_size     DECIMAL(15,2) NULL,
  max_ticket_size     DECIMAL(15,2) NULL,
  bio                 TEXT NULL,
  is_public           TINYINT(1) NOT NULL DEFAULT 0,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_investors_user UNIQUE (user_id),
  CONSTRAINT fk_investors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_investors_ticket CHECK (
    min_ticket_size IS NULL OR max_ticket_size IS NULL OR min_ticket_size <= max_ticket_size
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- STARTUPS
-- ----------------------------------------------------------------------------
CREATE TABLE startups (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  description     TEXT NULL,
  industry        VARCHAR(120) NULL,
  domain          VARCHAR(120) NULL,
  current_stage   ENUM('idea','prototype','mvp','early_traction','growth','scale')
                                  NOT NULL DEFAULT 'idea',
  website         VARCHAR(255) NULL,
  location        VARCHAR(200) NULL,
  logo            VARCHAR(255) NULL,
  funding_needed  DECIMAL(15,2) NULL,
  status          ENUM('active','inactive','archived') NOT NULL DEFAULT 'active',
  created_by      BIGINT UNSIGNED NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_startups_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_startups_funding CHECK (funding_needed IS NULL OR funding_needed >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_startups_stage ON startups (current_stage);
CREATE INDEX idx_startups_industry ON startups (industry);

-- ----------------------------------------------------------------------------
-- STARTUP_FOUNDERS  (M:N users <-> startups, as founders)
-- ----------------------------------------------------------------------------
CREATE TABLE startup_founders (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  startup_id    BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  role_title    VARCHAR(100) NULL DEFAULT 'Founder',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_startup_founder UNIQUE (startup_id, user_id),
  CONSTRAINT fk_sf_startup FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
  CONSTRAINT fk_sf_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- STARTUP_MENTORS  (M:N startups <-> mentors)
-- ----------------------------------------------------------------------------
CREATE TABLE startup_mentors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  startup_id    BIGINT UNSIGNED NOT NULL,
  mentor_id     BIGINT UNSIGNED NOT NULL,
  assigned_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_startup_mentor UNIQUE (startup_id, mentor_id),
  CONSTRAINT fk_sm_startup FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_mentor FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- STARTUP_INVESTORS  (M:N startups <-> investors, interest/commitment,
-- separate from the historical funding_rounds ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE startup_investors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  startup_id    BIGINT UNSIGNED NOT NULL,
  investor_id   BIGINT UNSIGNED NOT NULL,
  linked_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_startup_investor UNIQUE (startup_id, investor_id),
  CONSTRAINT fk_si_startup FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
  CONSTRAINT fk_si_investor FOREIGN KEY (investor_id) REFERENCES investors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- FUNDING_ROUNDS
-- ----------------------------------------------------------------------------
CREATE TABLE funding_rounds (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  startup_id    BIGINT UNSIGNED NOT NULL,
  investor_id   BIGINT UNSIGNED NULL,
  amount        DECIMAL(15,2) NOT NULL,
  round_type    ENUM('pre_seed','seed','series_a','series_b','series_c','bridge','grant')
                                NOT NULL,
  funding_date  DATE NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fr_startup FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
  CONSTRAINT fk_fr_investor FOREIGN KEY (investor_id) REFERENCES investors(id) ON DELETE SET NULL,
  CONSTRAINT chk_fr_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_fundingrounds_startup ON funding_rounds (startup_id, funding_date);

-- ----------------------------------------------------------------------------
-- RESEARCH
-- ----------------------------------------------------------------------------
CREATE TABLE research (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title               VARCHAR(255) NOT NULL,
  abstract            TEXT NULL,
  department          VARCHAR(150) NULL,
  supervisor          VARCHAR(150) NULL,
  publication_status  ENUM('draft','submitted','published') NOT NULL DEFAULT 'draft',
  patent_status       ENUM('none','filed','granted') NOT NULL DEFAULT 'none',
  created_by          BIGINT UNSIGNED NOT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_research_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- RESEARCH_AUTHORS  (supports multiple authors, platform user or free text)
-- ----------------------------------------------------------------------------
CREATE TABLE research_authors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  research_id   BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NULL,
  author_name   VARCHAR(150) NOT NULL,
  CONSTRAINT fk_ra_research FOREIGN KEY (research_id) REFERENCES research(id) ON DELETE CASCADE,
  CONSTRAINT fk_ra_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- PATENTS
-- ----------------------------------------------------------------------------
CREATE TABLE patents (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  research_id     BIGINT UNSIGNED NULL,
  title           VARCHAR(255) NOT NULL,
  patent_number   VARCHAR(100) NULL,
  filing_date     DATE NULL,
  status          ENUM('pending','filed','granted','rejected') NOT NULL DEFAULT 'pending',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patents_research FOREIGN KEY (research_id) REFERENCES research(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);

-- ----------------------------------------------------------------------------
-- ACTIVITY_LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE activity_logs (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NULL,
  action       VARCHAR(255) NOT NULL,
  entity_type  VARCHAR(100) NULL,
  entity_id    BIGINT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activitylogs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_activitylogs_entity ON activity_logs (entity_type, entity_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
DELIMITER $$

-- Auto-advance a startup's current_stage whenever a new funding round lands,
-- but never move it backwards (e.g. a later 'grant' after 'series_a' won't
-- downgrade the stage).
CREATE TRIGGER trg_funding_rounds_after_insert
AFTER INSERT ON funding_rounds
FOR EACH ROW
BEGIN
  DECLARE new_stage ENUM('idea','prototype','mvp','early_traction','growth','scale');
  DECLARE current_rank INT;
  DECLARE new_rank INT;

  SET new_stage = CASE NEW.round_type
    WHEN 'pre_seed'  THEN 'prototype'
    WHEN 'seed'       THEN 'mvp'
    WHEN 'grant'      THEN 'mvp'
    WHEN 'bridge'     THEN 'early_traction'
    WHEN 'series_a'   THEN 'early_traction'
    WHEN 'series_b'   THEN 'growth'
    WHEN 'series_c'   THEN 'scale'
    ELSE NULL
  END;

  SELECT CASE current_stage
    WHEN 'idea' THEN 1 WHEN 'prototype' THEN 2 WHEN 'mvp' THEN 3
    WHEN 'early_traction' THEN 4 WHEN 'growth' THEN 5 WHEN 'scale' THEN 6 END
  INTO current_rank FROM startups WHERE id = NEW.startup_id;

  SET new_rank = CASE new_stage
    WHEN 'idea' THEN 1 WHEN 'prototype' THEN 2 WHEN 'mvp' THEN 3
    WHEN 'early_traction' THEN 4 WHEN 'growth' THEN 5 WHEN 'scale' THEN 6 END;

  IF new_stage IS NOT NULL AND new_rank > current_rank THEN
    UPDATE startups SET current_stage = new_stage WHERE id = NEW.startup_id;
  END IF;

  INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
  VALUES (NULL, CONCAT('Funding round (', NEW.round_type, ') recorded'), 'startup', NEW.startup_id);
END$$

-- Log every role change on users (e.g. member -> admin, pending mentor -> mentor)
CREATE TRIGGER trg_users_role_change
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF OLD.role <> NEW.role THEN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
    VALUES (NEW.id, CONCAT('Role changed from ', OLD.role, ' to ', NEW.role), 'user', NEW.id);
  END IF;
END$$

-- Log a startup's creation
CREATE TRIGGER trg_startups_after_insert
AFTER INSERT ON startups
FOR EACH ROW
BEGIN
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
  VALUES (NEW.created_by, CONCAT('Created startup "', NEW.name, '"'), 'startup', NEW.id);
END$$

DELIMITER ;
