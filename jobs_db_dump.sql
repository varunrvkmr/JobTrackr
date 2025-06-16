--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:HxDLEyQgoS/w9AdKMTvXcQ==$UVkjXGJrcBa66XFNKx/jFEljUDicJn+9+dCnfnbiEeM=:5udPJSu8cpGDC+KpuqV6u9Vh2k5O36kCnWxiZljmmbQ=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- Database "jobs_db" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: jobs_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE jobs_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE jobs_db OWNER TO postgres;

\connect jobs_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: auth_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_users (
    id integer NOT NULL,
    username character varying(255) DEFAULT 'Unknown'::character varying NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL
);


ALTER TABLE public.auth_users OWNER TO postgres;

--
-- Name: auth_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_users_id_seq OWNER TO postgres;

--
-- Name: auth_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_users_id_seq OWNED BY public.auth_users.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    path text NOT NULL,
    uploaded_at timestamp without time zone
);


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_id_seq OWNER TO postgres;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: gender; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gender (
    id integer NOT NULL,
    name character varying(256) NOT NULL
);


ALTER TABLE public.gender OWNER TO postgres;

--
-- Name: gender_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gender_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gender_id_seq OWNER TO postgres;

--
-- Name: gender_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gender_id_seq OWNED BY public.gender.id;


--
-- Name: job_posting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_posting (
    id integer NOT NULL,
    user_auth_id integer NOT NULL,
    company character varying(255) NOT NULL,
    job_title character varying(255) NOT NULL,
    job_description text,
    job_link text,
    location character varying(255),
    country character varying(100),
    posting_status character varying(100)
);


ALTER TABLE public.job_posting OWNER TO postgres;

--
-- Name: job_posting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_posting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_posting_id_seq OWNER TO postgres;

--
-- Name: job_posting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_posting_id_seq OWNED BY public.job_posting.id;


--
-- Name: jobs_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs_table (
    id integer NOT NULL,
    company character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    date_applied date,
    link text,
    location character varying(255),
    job_description text
);


ALTER TABLE public.jobs_table OWNER TO postgres;

--
-- Name: jobs_table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_table_id_seq OWNER TO postgres;

--
-- Name: jobs_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_table_id_seq OWNED BY public.jobs_table.id;


--
-- Name: race; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.race (
    id integer NOT NULL,
    name character varying(256) NOT NULL
);


ALTER TABLE public.race OWNER TO postgres;

--
-- Name: race_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.race_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.race_id_seq OWNER TO postgres;

--
-- Name: race_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.race_id_seq OWNED BY public.race.id;


--
-- Name: snippets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snippets (
    id integer NOT NULL,
    content character varying(255) NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.snippets OWNER TO postgres;

--
-- Name: snippets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.snippets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.snippets_id_seq OWNER TO postgres;

--
-- Name: snippets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.snippets_id_seq OWNED BY public.snippets.id;


--
-- Name: user_education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_education (
    id integer NOT NULL,
    user_id integer NOT NULL,
    school character varying(255) NOT NULL,
    degree character varying(255),
    gpa character varying(10),
    date character varying(100),
    descriptions text
);


ALTER TABLE public.user_education OWNER TO postgres;

--
-- Name: user_education_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_education_id_seq OWNER TO postgres;

--
-- Name: user_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_education_id_seq OWNED BY public.user_education.id;


--
-- Name: user_job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_job (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_posting_id integer NOT NULL,
    applied_on timestamp without time zone,
    application_status character varying(100),
    notes character varying(4000)
);


ALTER TABLE public.user_job OWNER TO postgres;

--
-- Name: user_job_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_job_id_seq OWNER TO postgres;

--
-- Name: user_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_job_id_seq OWNED BY public.user_job.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    bio text,
    linkedin character varying(255),
    github character varying(255),
    race character varying(50),
    ethnicity character varying(50),
    gender character varying(50),
    disability_status character varying(50),
    veteran_status character varying(50),
    user_auth_id integer NOT NULL,
    location character varying(100)
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profiles_id_seq OWNER TO postgres;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    user_auth_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(50),
    location character varying(255),
    bio text,
    linkedin character varying(255),
    github character varying(255),
    race_id integer,
    gender_id integer,
    disability_status boolean,
    veteran_status boolean
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: work_experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_experience (
    id integer NOT NULL,
    user_id integer NOT NULL,
    company character varying(255) NOT NULL,
    job_title character varying(255) NOT NULL,
    date character varying(100),
    descriptions text
);


ALTER TABLE public.work_experience OWNER TO postgres;

--
-- Name: work_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_experience_id_seq OWNER TO postgres;

--
-- Name: work_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_experience_id_seq OWNED BY public.work_experience.id;


--
-- Name: auth_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users ALTER COLUMN id SET DEFAULT nextval('public.auth_users_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: gender id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gender ALTER COLUMN id SET DEFAULT nextval('public.gender_id_seq'::regclass);


--
-- Name: job_posting id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posting ALTER COLUMN id SET DEFAULT nextval('public.job_posting_id_seq'::regclass);


--
-- Name: jobs_table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_table ALTER COLUMN id SET DEFAULT nextval('public.jobs_table_id_seq'::regclass);


--
-- Name: race id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.race ALTER COLUMN id SET DEFAULT nextval('public.race_id_seq'::regclass);


--
-- Name: snippets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snippets ALTER COLUMN id SET DEFAULT nextval('public.snippets_id_seq'::regclass);


--
-- Name: user_education id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_education ALTER COLUMN id SET DEFAULT nextval('public.user_education_id_seq'::regclass);


--
-- Name: user_job id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job ALTER COLUMN id SET DEFAULT nextval('public.user_job_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: work_experience id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_experience ALTER COLUMN id SET DEFAULT nextval('public.work_experience_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
f6546c2af364
\.


--
-- Data for Name: auth_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_users (id, username, email, password_hash) FROM stdin;
6	jklynn	jklynn@email.com	$2b$12$CbScWmL00qCUbi8BqOK4ROTfxzU7HkFsiHWIydvzFw//Qv8w1FI6y
7	johndoe	johndoe@email.com	$2b$12$tdU81hVnWAyo9Cd4udv4/OAq4FWXp8aXRcsWyV3xmTFoZ1aed848O
8	janedoey	janedoey@email.com	$2b$12$oNqogtXWKDw1lIsPjXrbJervqfsyWFosZsmgmqVs7snbO.iYFdDz.
9	johndoe	johndoe1@email.com	$2b$12$XT5iZMTl.oMu9SKG54Ne0ebI5ePsv2etEiPRF.tFOxf2x.nr4ATba
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, name, path, uploaded_at) FROM stdin;
\.


--
-- Data for Name: gender; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gender (id, name) FROM stdin;
\.


--
-- Data for Name: job_posting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_posting (id, user_auth_id, company, job_title, job_description, job_link, location, country, posting_status) FROM stdin;
1	7	Pave	Software Engineer - Fullstack	Who We Are\n\nAt Pave, we're combining the world's largest real-time compensation dataset with deep expertise in AI and Machine Learning to reimagine how our clients make compensation decisions. By building the operating system for compensation, we're perfecting the art and science of pay to give 8,500+ companies unparalleled confidence in every compensation decision.\n\nOpenAI, Instacart, Ramp, Snowflake, Stripe, Databricks, Okta, Perplexity, and 8,500+ companies use Pave to power their compensation ecosystems and transform every pay decision into a competitive advantage.\n\nThe future of pay is real-time & predictive, and Pave has raised $160M in funding to lead the way. Backed by Andreessen Horowitz, Index Ventures, Y Combinator, Bessemer Venture Partners, and Craft Ventures, we are transforming the compensation landscape.\n\nPave By The Numbers \n\n\n$190+ Billion in Total compensation spend managed in Pave workflows\n8,500+ Companies using Pave \n1+ Million Unique employees auto-matched into Pave's real-time dataset\n135X Increase in equity benchmarks delivered with machine learning\n58% of Forbes AI 50 use Pave to benchmark compensation\n\n\nThe Research & Design Org @ Pave \n\nPave's R&D pillar includes our data science, engineering, information technology, product design, product management, and security teams. This organization builds, maintains, and secures a platform used by more than 8,500+ client organizations.\n\nOur engineering team moves between ideation, scoping, and execution in a matter of days while closely iterating with cross-functional partners on requirements. At Pave, we use TypeScript, Node.js, and React, hosted on GCP.\n\nProduct Engineering Teams\n\nOur roadmap is built around four core jobs that compensation leaders need to accomplish:\n\nMarket Data: We enable compensation professionals to access reliable, comprehensive compensation data to make informed decisions.\n\nMarket Pricing: We help compensation teams efficiently price jobs against market data and construct appropriate salary ranges.\n\nComp Planning: We empower compensation teams, leaders, and managers to plan and allocate compensation budgets with confidence.\n\nCommunication: We help HR and managers effectively explain compensation decisions to employees and candidates.\n\nOver the next year, our roadmap focuses on enhancing the entire compensation lifecycle to help Total Rewards leaders take charge of their organizations' largest expense, confidently make decisions, and earn org-wide trust. From philosophy definition to market trend analysis, range management, merit cycles, and employee communications, we're building solutions for every phase of the compensation calendar. We're seeking passionate engineers who are excited about building robust, data-rich systems that simplify complex compensation processes at scale.\n\nWhat You'll Bring\n\n\nNew grads with significant internship experience or 1-2 years of fullstack engineering experience, ideally using modern web technologies such as TypeScript/Node.js/React, with at least some experience building data-intensive applications.\nGrowing product intuition: You understand the value of building for user impact. You seek context from product partners and balance speed with thoughtful technical decisions\nExecution-driven mindset: You thrive in fast-paced environments, bias toward action, and ship thoughtful solutions without overengineering.\nAdaptability in ambiguity: You’re comfortable filling in gaps, validating direction through prototypes, and evolving your approach as you learn.\nCollaborative working style: You work well with product managers, designers, and fellow engineers, and care deeply about delivering value to users.\nNice to have: Experience at B2B SaaS companies, especially during periods of rapid growth or platform expansion.\n\n\nCompensation, It's What We Do.\n\nSalary is just one component of Pave's total compensation package for employees. Your total rewards package at Pave will include equity, top-notch medical, dental, and vision coverage, an unlimited PTO policy, and many other region-specific benefits. Your level is based on our assessment of your interview performance and experience, which you can always ask the hiring manager about to understand in more detail.\n\nSalary Range for this role: $140,000 - $196,000\n\nLife @ Pave \n\nSince being founded in 2019 Pave has grown globally. We’re based across our HQ in San Francisco’s FiDi neighborhood, Flatiron in NYC and regional hubs in Salt Lake City and the United Kingdom. We embrace a high-energy, collaborative in-person work environment at these locations, operating on a hybrid schedule that brings teams together in-office on Mondays, Tuesdays, and Fridays.\n\nBenefits\n\nAt Pave roles, responsibilities, and compensation grow as you do, reflecting our commitment to your professional development.\n\n\nComprehensive Medical, Dental and vision coverage for you and your family, with plenty of options to suit your needs \nFlexible PTO and the ability to work from anywhere in the world for a month \nLunch & dinner stipends as well as fully stocked kitchens to fuel you\nQuarterly education stipend to continuously grow\nRobust parental leave to bond with your new family\nA commuter stipend to help you collaborate in person \n\n\nVision\n\nOur vision is to unlock a labor market built on trust.\n\nMission \n\nOur team's mission is to build confidence in every compensation decision.\n\nValues\n\nOur four values are intellectual honesty, playing to win, upholding the Pave platinum standard, and hug of jawn!\n\nAre you ready to help our clients make smarter, more effective compensation decisions?	https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4565818005?gh_src=652a67895us	San Francisco Bay Area	Not specified	Saved
2	9	Pave	Software Engineer - Fullstack	Who We Are\n\nAt Pave, we're combining the world's largest real-time compensation dataset with deep expertise in AI and Machine Learning to reimagine how our clients make compensation decisions. By building the operating system for compensation, we're perfecting the art and science of pay to give 8,500+ companies unparalleled confidence in every compensation decision.\n\nOpenAI, Instacart, Ramp, Snowflake, Stripe, Databricks, Okta, Perplexity, and 8,500+ companies use Pave to power their compensation ecosystems and transform every pay decision into a competitive advantage.\n\nThe future of pay is real-time & predictive, and Pave has raised $160M in funding to lead the way. Backed by Andreessen Horowitz, Index Ventures, Y Combinator, Bessemer Venture Partners, and Craft Ventures, we are transforming the compensation landscape.\n\nPave By The Numbers \n\n\n$190+ Billion in Total compensation spend managed in Pave workflows\n8,500+ Companies using Pave \n1+ Million Unique employees auto-matched into Pave's real-time dataset\n135X Increase in equity benchmarks delivered with machine learning\n58% of Forbes AI 50 use Pave to benchmark compensation\n\n\nThe Research & Design Org @ Pave \n\nPave's R&D pillar includes our data science, engineering, information technology, product design, product management, and security teams. This organization builds, maintains, and secures a platform used by more than 8,500+ client organizations.\n\nOur engineering team moves between ideation, scoping, and execution in a matter of days while closely iterating with cross-functional partners on requirements. At Pave, we use TypeScript, Node.js, and React, hosted on GCP.\n\nProduct Engineering Teams\n\nOur roadmap is built around four core jobs that compensation leaders need to accomplish:\n\nMarket Data: We enable compensation professionals to access reliable, comprehensive compensation data to make informed decisions.\n\nMarket Pricing: We help compensation teams efficiently price jobs against market data and construct appropriate salary ranges.\n\nComp Planning: We empower compensation teams, leaders, and managers to plan and allocate compensation budgets with confidence.\n\nCommunication: We help HR and managers effectively explain compensation decisions to employees and candidates.\n\nOver the next year, our roadmap focuses on enhancing the entire compensation lifecycle to help Total Rewards leaders take charge of their organizations' largest expense, confidently make decisions, and earn org-wide trust. From philosophy definition to market trend analysis, range management, merit cycles, and employee communications, we're building solutions for every phase of the compensation calendar. We're seeking passionate engineers who are excited about building robust, data-rich systems that simplify complex compensation processes at scale.\n\nWhat You'll Bring\n\n\nNew grads with significant internship experience or 1-2 years of fullstack engineering experience, ideally using modern web technologies such as TypeScript/Node.js/React, with at least some experience building data-intensive applications.\nGrowing product intuition: You understand the value of building for user impact. You seek context from product partners and balance speed with thoughtful technical decisions\nExecution-driven mindset: You thrive in fast-paced environments, bias toward action, and ship thoughtful solutions without overengineering.\nAdaptability in ambiguity: You’re comfortable filling in gaps, validating direction through prototypes, and evolving your approach as you learn.\nCollaborative working style: You work well with product managers, designers, and fellow engineers, and care deeply about delivering value to users.\nNice to have: Experience at B2B SaaS companies, especially during periods of rapid growth or platform expansion.\n\n\nCompensation, It's What We Do.\n\nSalary is just one component of Pave's total compensation package for employees. Your total rewards package at Pave will include equity, top-notch medical, dental, and vision coverage, an unlimited PTO policy, and many other region-specific benefits. Your level is based on our assessment of your interview performance and experience, which you can always ask the hiring manager about to understand in more detail.\n\nSalary Range for this role: $140,000 - $196,000\n\nLife @ Pave \n\nSince being founded in 2019 Pave has grown globally. We’re based across our HQ in San Francisco’s FiDi neighborhood, Flatiron in NYC and regional hubs in Salt Lake City and the United Kingdom. We embrace a high-energy, collaborative in-person work environment at these locations, operating on a hybrid schedule that brings teams together in-office on Mondays, Tuesdays, and Fridays.\n\nBenefits\n\nAt Pave roles, responsibilities, and compensation grow as you do, reflecting our commitment to your professional development.\n\n\nComprehensive Medical, Dental and vision coverage for you and your family, with plenty of options to suit your needs \nFlexible PTO and the ability to work from anywhere in the world for a month \nLunch & dinner stipends as well as fully stocked kitchens to fuel you\nQuarterly education stipend to continuously grow\nRobust parental leave to bond with your new family\nA commuter stipend to help you collaborate in person \n\n\nVision\n\nOur vision is to unlock a labor market built on trust.\n\nMission \n\nOur team's mission is to build confidence in every compensation decision.\n\nValues\n\nOur four values are intellectual honesty, playing to win, upholding the Pave platinum standard, and hug of jawn!\n\nAre you ready to help our clients make smarter, more effective compensation decisions?	https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4565818005?gh_src=652a67895us	San Francisco Bay Area	Not specified	Saved
\.


--
-- Data for Name: jobs_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs_table (id, company, "position", status, date_applied, link, location, job_description) FROM stdin;
\.


--
-- Data for Name: race; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.race (id, name) FROM stdin;
\.


--
-- Data for Name: snippets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snippets (id, content, created_at) FROM stdin;
\.


--
-- Data for Name: user_education; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_education (id, user_id, school, degree, gpa, date, descriptions) FROM stdin;
\.


--
-- Data for Name: user_job; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_job (id, user_id, job_posting_id, applied_on, application_status, notes) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, first_name, last_name, email, phone, bio, linkedin, github, race, ethnicity, gender, disability_status, veteran_status, user_auth_id, location) FROM stdin;
4	john	lynn	jklynn@email.com	123345567733	\N	\N	\N	\N	\N	\N	\N	\N	6	SF
5	JOhn	Doe	johndoe@email.com	1232343254325	\N	\N	\N	\N	\N	\N	\N	\N	7	PHX
6	jane	doey	janedoey@email.com	1233423443242	\N	\N	\N	\N	\N	\N	\N	\N	8	Tempe
7	John	Doe	johndoe1@email.com	1234567891	\N	\N	\N	\N	\N	\N	\N	\N	9	SF
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, user_auth_id, first_name, last_name, phone, location, bio, linkedin, github, race_id, gender_id, disability_status, veteran_status) FROM stdin;
\.


--
-- Data for Name: work_experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_experience (id, user_id, company, job_title, date, descriptions) FROM stdin;
\.


--
-- Name: auth_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_users_id_seq', 9, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_id_seq', 1, false);


--
-- Name: gender_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gender_id_seq', 1, false);


--
-- Name: job_posting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_posting_id_seq', 2, true);


--
-- Name: jobs_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_table_id_seq', 1, false);


--
-- Name: race_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.race_id_seq', 1, false);


--
-- Name: snippets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.snippets_id_seq', 1, false);


--
-- Name: user_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_education_id_seq', 1, false);


--
-- Name: user_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_job_id_seq', 1, false);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profiles_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: work_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_experience_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: auth_users auth_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_email_key UNIQUE (email);


--
-- Name: auth_users auth_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: gender gender_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gender
    ADD CONSTRAINT gender_pkey PRIMARY KEY (id);


--
-- Name: job_posting job_posting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posting
    ADD CONSTRAINT job_posting_pkey PRIMARY KEY (id);


--
-- Name: jobs_table jobs_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_table
    ADD CONSTRAINT jobs_table_pkey PRIMARY KEY (id);


--
-- Name: race race_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.race
    ADD CONSTRAINT race_pkey PRIMARY KEY (id);


--
-- Name: snippets snippets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snippets
    ADD CONSTRAINT snippets_pkey PRIMARY KEY (id);


--
-- Name: auth_users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: user_education user_education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_education
    ADD CONSTRAINT user_education_pkey PRIMARY KEY (id);


--
-- Name: user_job user_job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job
    ADD CONSTRAINT user_job_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_email_key UNIQUE (email);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_auth_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_auth_id_key UNIQUE (user_auth_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_auth_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_auth_id_key UNIQUE (user_auth_id);


--
-- Name: work_experience work_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_experience
    ADD CONSTRAINT work_experience_pkey PRIMARY KEY (id);


--
-- Name: job_posting job_posting_user_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_posting
    ADD CONSTRAINT job_posting_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.auth_users(id);


--
-- Name: user_education user_education_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_education
    ADD CONSTRAINT user_education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_job user_job_job_posting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job
    ADD CONSTRAINT user_job_job_posting_id_fkey FOREIGN KEY (job_posting_id) REFERENCES public.job_posting(id);


--
-- Name: user_job user_job_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_job
    ADD CONSTRAINT user_job_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_profiles user_profiles_user_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.auth_users(id);


--
-- Name: users users_gender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_gender_id_fkey FOREIGN KEY (gender_id) REFERENCES public.gender(id);


--
-- Name: users users_race_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_race_id_fkey FOREIGN KEY (race_id) REFERENCES public.race(id);


--
-- Name: users users_user_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.auth_users(id);


--
-- Name: work_experience work_experience_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_experience
    ADD CONSTRAINT work_experience_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

