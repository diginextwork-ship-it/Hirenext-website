-- Run this file after selecting the target database/schema.
-- Example (MySQL): USE hirenext;

CREATE TABLE IF NOT EXISTS recruiter (
  rid VARCHAR(20) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'recruiter',
  addjob BOOLEAN NOT NULL DEFAULT FALSE,
  success INT NOT NULL DEFAULT 0
);

UPDATE recruiter
SET role = CASE WHEN addjob = TRUE THEN 'job creator' ELSE 'recruiter' END
WHERE role IS NULL OR TRIM(role) = '';

CREATE TABLE IF NOT EXISTS jobs (
  jid INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_rid VARCHAR(20) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  company_name VARCHAR(190) NOT NULL,
  role_name VARCHAR(190) NOT NULL,
  skills TEXT NULL,
  job_description TEXT NULL,
  experience VARCHAR(80) NULL,
  salary VARCHAR(120) NULL,
  qualification VARCHAR(120) NULL,
  benefits TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_recruiter
    FOREIGN KEY (recruiter_rid) REFERENCES recruiter(rid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_jid INT NOT NULL,
  candidate_name VARCHAR(190) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL,
  latest_education_level VARCHAR(100) NOT NULL,
  board_university VARCHAR(190) NOT NULL,
  institution_name VARCHAR(190) NOT NULL,
  grading_system VARCHAR(40) NOT NULL,
  score VARCHAR(40) NOT NULL,
  age INT NOT NULL,
  resume_filename VARCHAR(255) NULL,
  resume_parsed_data JSON NULL,
  ats_score DECIMAL(5,2) NULL,
  ats_match_percentage DECIMAL(5,2) NULL,
  ats_raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_applications_job
    FOREIGN KEY (job_jid) REFERENCES jobs(jid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruiter_candidate_clicks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_rid VARCHAR(20) NOT NULL,
  candidate_name VARCHAR(190) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recruiter_clicks_rid_created (recruiter_rid, created_at),
  CONSTRAINT fk_clicks_recruiter
    FOREIGN KEY (recruiter_rid) REFERENCES recruiter(rid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resumes_data (
  res_id VARCHAR(30) PRIMARY KEY,
  rid VARCHAR(20) NOT NULL,
  job_jid INT NULL,
  resume LONGBLOB NOT NULL,
  resume_filename VARCHAR(255) NOT NULL,
  resume_type VARCHAR(10) NOT NULL,
  ats_score DECIMAL(5,2) NULL,
  ats_match_percentage DECIMAL(5,2) NULL,
  ats_raw_json JSON NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resumes_data_rid (rid),
  INDEX idx_resumes_data_job_jid (job_jid),
  INDEX idx_resumes_data_uploaded_at (uploaded_at),
  CONSTRAINT fk_resumes_data_recruiter
    FOREIGN KEY (rid) REFERENCES recruiter(rid)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_resumes_data_job
    FOREIGN KEY (job_jid) REFERENCES jobs(jid)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resume_id_sequence (
  seq_id BIGINT AUTO_INCREMENT PRIMARY KEY
);
