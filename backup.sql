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
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) DEFAULT 'Unknown'::character varying NOT NULL
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
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    city character varying(100),
    state character varying(100),
    bio text,
    linkedin character varying(255),
    github character varying(255),
    race character varying(50),
    ethnicity character varying(50),
    gender character varying(50),
    disability_status character varying(50),
    veteran_status character varying(50)
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
-- Name: auth_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users ALTER COLUMN id SET DEFAULT nextval('public.auth_users_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: jobs_table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_table ALTER COLUMN id SET DEFAULT nextval('public.jobs_table_id_seq'::regclass);


--
-- Name: snippets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snippets ALTER COLUMN id SET DEFAULT nextval('public.snippets_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
eac1bb724f71
\.


--
-- Data for Name: auth_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_users (id, email, password_hash, name) FROM stdin;
3	annaglass@a.com	$2b$12$sAjip6LiF66Jdih75.RQ1uCuW.jee8WAP4.RjAeGfs2iKiS/WGCwW	Anna Glass
2	justtrevor@gmail.com	$2b$12$VLVKFMs66R90gL2sQkC7P.5yRhO/dl5ZQcRm8/tC6oabOFSOGZF8.	Trevor Just
1	johndoe@gail.com	$2b$12$RJ8IJNyUyJR5eihQqH.1QeySGxhCcCh86PPIuYdJoXDr30qktO29.	John Doe
4	Larry Salter	$2b$12$BGO2OqaLU7pumUs2PD7kEutAq5VkDnkp2D2OVLGjrtf9J3XB9pFLi	Unknown
5	rgallindo@gmail.com	$2b$12$XbH4YuOPWiQPY4x6.sAOv./QHx2PYf2UIUUchJz.hV.b4iShYDBa6	Robert Gallindo
6	jaugustin@g.com	$2b$12$uYm9ocFztyfgevGVX4sglujI/x.ykVUbdh3f7.T1HdLueDee9nTBi	Joseph Augustin
7	varshini_tester@gmail.com	$2b$12$/H9cQOkbZUL86qzMr66xGeMME19TemTX3CfpBVdfaDwUZzhBYZ40C	Varshini Tester 1
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, name, path, uploaded_at) FROM stdin;
\.


--
-- Data for Name: jobs_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs_table (id, company, "position", status, date_applied, link, location, job_description) FROM stdin;
1	Avathon	Software Engineer I Intern	Saved	2025-03-15	https://www.linkedin.com/jobs/view/4144744269/?alternateChannel=search&refId=urWn1ORgPiEp9iIu0690Gw%3D%3D&trackingId=1XTs0%2Fd0mvq6zn9T2HhqeA%3D%3D	Pleasanton, CA	Who are we and why this opportunity?\n\nAvathon, Inc. delivers world-class AI solutions that allow a business to solve their most critical problems, empowering them to run a more sustainable, safer, and profitable business. Our award-winning AI solutions predict future outcomes, optimize processes, and prevent cyberattacks. We partner with the world’s industry leaders to analyze, optimize, and learn from data. We augment human intelligence, drive profitable growth, and achieve operational excellence.\n\nDrive change and create a footprint. Learn more at: Avathon\n\nJoin Us In\n\n\nWorking on the various elements of the platform and developing new components for our solutions\nParticipating in defining design and coding best practices for the team\nWriting robust, maintainable, and future-proof code, including unit and integration tests\n\n\nYou'll Have\n\n\nA solid understanding of object-oriented programming design (preferably with Python)\nFamiliarity with writing unit and integration tests\nFamiliarity with REST APIs\nA desire to continually learn about new technologies and determine whether they should be used and what the best approach is for a particular project\nA passion for user-centered design and usability\n\n\nNice To Have\n\n\nFamiliarity with cloud computing ecosystems (Azure, AWS, Google Cloud)\nFamiliarity with message queues (Kafka, Pulsar, etc)\nFamiliarity with micro-service architecture\nExperience with Agile development practices\n\n\nAvathon is an equal opportunity employer, dedicated to diversity, equality, and inclusion, and provides equal employment opportunities to all employees and applicants for employment.\n\nAvathon prohibits discrimination and harassment of any type without regard to race, color, religion, age, sex, national origin, disability status, genetics, protected veteran status, sexual orientation, gender identity or expression, or any other characteristic protected by federal, state, or local laws.\n\nAvathon is committed to providing reasonable accommodations throughout the recruiting process. If you need a reasonable accommodation, please contact us to discuss how we can assist you.
\.


--
-- Data for Name: snippets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snippets (id, content, created_at) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, first_name, last_name, email, phone, city, state, bio, linkedin, github, race, ethnicity, gender, disability_status, veteran_status) FROM stdin;
1	John	Doe	johndoe@gmail.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	Johnathon	Doe	johnndoe@gmail.co	8274279570	jgsdfg	\N	\N			non-hispanic	asian	male	no	no
\.


--
-- Name: auth_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_users_id_seq', 7, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_id_seq', 1, false);


--
-- Name: jobs_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_table_id_seq', 1, true);


--
-- Name: snippets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.snippets_id_seq', 1, false);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profiles_id_seq', 8, true);


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
-- Name: jobs_table jobs_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs_table
    ADD CONSTRAINT jobs_table_pkey PRIMARY KEY (id);


--
-- Name: snippets snippets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snippets
    ADD CONSTRAINT snippets_pkey PRIMARY KEY (id);


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
-- PostgreSQL database dump complete
--

