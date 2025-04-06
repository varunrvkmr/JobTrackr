-- DDL Generated from https:/databasediagram.com

CREATE TABLE user_auth (
  id int PRIMARY KEY,
  user_name varchar(256),
  password_hash varchar(256)
);

CREATE TABLE ethnicity (
  id int PRIMARY KEY,
  name varchar(256)
);

CREATE TABLE race (
  id int PRIMARY KEY,
  name varchar(256)
);

CREATE TABLE gender (
  id int PRIMARY KEY,
  name varchar(256)
);

CREATE TABLE file_type (
  id int PRIMARY KEY,
  name varchar(256)
);

CREATE TABLE file (
  id int PRIMARY KEY,
  file_name varchar(256),
  file_location varchar(256)
);

CREATE TABLE user (
  id int PRIMARY KEY,
  user_auth_id int REFERENCES user_auth(id),
  first_name varchar(256),
  last_name varchar(256),
  email varchar(256),
  phone varchar(50),
  bio text,
  linkedin_profile varchar(256),,
  github_profile varchar(256),,
  race_id int REFERENCES race(id),
  ethnicity_id int REFERENCES ethnicity(id),
  gender_id int REFERENCES gender(id),
  disability_status boolean,
  veteran_status boolean
);

CREATE TABLE user_location_preference (
  id int PRIMARY KEY,
  user_id int REFERENCES user(id),
  remote boolean,
  general_area varchar(256),
  city varchar(256),
  state varchar(256),
  country varchar(256),
  pecking_order int
);

CREATE TABLE user_file (
  id int PRIMARY KEY,
  user_id int REFERENCES user(id),
  file_id int REFERENCES file(id),
  file_type_id int REFERENCES file_type(id),
  uploaded_on datetime
);

CREATE TABLE skill (
  id int PRIMARY KEY,
  skill_category varchar(100),
  skill_sub_category varchar(100)
);

CREATE TABLE skill_level (
  id int PRIMARY KEY,
  level_descrption varchar(100)
);

CREATE TABLE user_skill (
  id int PRIMARY KEY,
  user_id int REFERENCES user(id),
  skill_id int REFERENCES skill(id),
  skill_level_id int REFERENCES skill_level(id)
);

CREATE TABLE job_posting (
  id int PRIMARY KEY,
  company varchar(256),
  job_title varchar(256),
  job_description varchar(256),
  posting_link varchar(256),
  remote boolean,
  city varchar(256),
  state varchar(256),
  country varchar(256),
  posting_status varchar(256)
);

CREATE TABLE job_posting_file (
  id int PRIMARY KEY,
  job_posting_id int REFERENCES job_posting(id),
  file_id int REFERENCES file(id),
  file_type_id int REFERENCES file_type(id)
);

CREATE TABLE application_status (
  id int PRIMARY KEY,
  name varchar(256)
);

CREATE TABLE user_job (
  id int PRIMARY KEY,
  user_id int REFERENCES user(id),
  job_posting_id int REFERENCES job_posting(id),
  applied_on datetime,
  application_status_id int REFERENCES application_status(id),
  notes varchar(4000)
);


CREATE TABLE application_event (
  id int PRIMARY KEY,
  name varchar(256)
);

CREATE TABLE user_job_event (
  id int PRIMARY KEY,
  user_job_id int REFERENCES user_job(id),
  application_event_id int REFERENCES application_event(id),
  event_date datetime
);

CREATE TABLE course_vendor (
  id int PRIMARY KEY,
  vendor_name varchar(256),
  vendor_detail varchar(256),
  api_key varchar(256)
);

CREATE TABLE course (
  id int PRIMARY KEY,
  course_title varchar(256),
  course_vendor_id int REFERENCES course_vendor(id),
  course_rating float,
  review_count int
);

CREATE TABLE course_level (
  id int PRIMARY KEY,
  level_description varchar(256)
);

CREATE TABLE course_skill (
  id int PRIMARY KEY,
  course_id int REFERENCES course(id),
  skill_id int REFERENCES skill(id),
  course_level_id int REFERENCES course_level(id)
);
