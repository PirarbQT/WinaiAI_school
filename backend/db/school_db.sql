--
-- PostgreSQL database dump
--

\restrict eKeQ7Ys3fdQUqz535lYP0slQbC7a5vFNtC8iaed1S41elvcFqjRsVmbxF79wceH

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-03 08:15:14

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
-- TOC entry 2 (class 3079 OID 25360)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 251 (class 1259 OID 25281)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    student_id integer,
    section_id integer,
    date date,
    status character varying(10)
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 25280)
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;

--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 250
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- TOC entry 229 (class 1259 OID 24909)
-- Name: competency_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competency_results (
    id integer NOT NULL,
    student_id integer,
    name text NOT NULL,
    score integer,
    year integer,
    semester integer
);


ALTER TABLE public.competency_results OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24908)
-- Name: competency_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.competency_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.competency_results_id_seq OWNER TO postgres;

--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 228
-- Name: competency_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.competency_results_id_seq OWNED BY public.competency_results.id;


--
-- TOC entry 225 (class 1259 OID 24880)
-- Name: conduct_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conduct_logs (
    id integer NOT NULL,
    student_id integer,
    log_date date NOT NULL,
    event text NOT NULL,
    point integer NOT NULL
);


ALTER TABLE public.conduct_logs OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24879)
-- Name: conduct_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conduct_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conduct_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 224
-- Name: conduct_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conduct_logs_id_seq OWNED BY public.conduct_logs.id;


--
-- TOC entry 261 (class 1259 OID 25399)
-- Name: directors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directors (
    id integer NOT NULL,
    director_code character varying(20) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    password_hash text NOT NULL,
    photo_url text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.directors OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 25398)
-- Name: directors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directors_id_seq OWNER TO postgres;

--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 260
-- Name: directors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directors_id_seq OWNED BY public.directors.id;


--
-- TOC entry 221 (class 1259 OID 24833)
-- Name: exam_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_schedule (
    id integer NOT NULL,
    section_id integer,
    exam_type character varying(20),
    exam_date date,
    time_range character varying(50),
    room character varying(50)
);


ALTER TABLE public.exam_schedule OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24832)
-- Name: exam_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_schedule_id_seq OWNER TO postgres;

--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 220
-- Name: exam_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_schedule_id_seq OWNED BY public.exam_schedule.id;


--
-- TOC entry 263 (class 1259 OID 25414)
-- Name: finance_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.finance_records (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    category character varying(100),
    amount numeric(12,2) NOT NULL,
    type character varying(10) NOT NULL,
    record_date date NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT finance_records_type_check CHECK (((type)::text = ANY ((ARRAY['income'::character varying, 'expense'::character varying])::text[])))
);


ALTER TABLE public.finance_records OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 25413)
-- Name: finance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finance_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finance_records_id_seq OWNER TO postgres;

--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 262
-- Name: finance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finance_records_id_seq OWNED BY public.finance_records.id;


--
-- TOC entry 245 (class 1259 OID 25230)
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    student_id integer,
    section_id integer,
    total_score numeric,
    grade character varying(2)
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 25229)
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_id_seq OWNER TO postgres;

--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 244
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- TOC entry 223 (class 1259 OID 24864)
-- Name: health_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_records (
    id integer NOT NULL,
    student_id integer,
    weight numeric,
    height numeric,
    blood_pressure character varying(20),
    blood_type character varying(10),
    allergies text,
    chronic_illness text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.health_records OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24863)
-- Name: health_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.health_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_records_id_seq OWNER TO postgres;

--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 222
-- Name: health_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.health_records_id_seq OWNED BY public.health_records.id;


--
-- TOC entry 243 (class 1259 OID 25212)
-- Name: registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrations (
    id integer NOT NULL,
    student_id integer,
    section_id integer,
    year integer,
    semester integer
);


ALTER TABLE public.registrations OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 25211)
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registrations_id_seq OWNER TO postgres;

--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 242
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- TOC entry 227 (class 1259 OID 24898)
-- Name: school_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_activities (
    id integer NOT NULL,
    name text NOT NULL,
    date character varying(50),
    location text
);


ALTER TABLE public.school_activities OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24897)
-- Name: school_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.school_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.school_activities_id_seq OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 226
-- Name: school_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.school_activities_id_seq OWNED BY public.school_activities.id;


--
-- TOC entry 233 (class 1259 OID 25102)
-- Name: score_headers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.score_headers (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    subject_id integer NOT NULL,
    class_level character varying(20),
    room character varying(10),
    header_name character varying(255),
    max_score integer NOT NULL,
    year integer NOT NULL,
    semester integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.score_headers OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 25101)
-- Name: score_headers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.score_headers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.score_headers_id_seq OWNER TO postgres;

--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 232
-- Name: score_headers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.score_headers_id_seq OWNED BY public.score_headers.id;


--
-- TOC entry 253 (class 1259 OID 25299)
-- Name: score_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.score_items (
    id integer NOT NULL,
    section_id integer,
    title character varying(255),
    max_score numeric,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.score_items OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 25298)
-- Name: score_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.score_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.score_items_id_seq OWNER TO postgres;

--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 252
-- Name: score_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.score_items_id_seq OWNED BY public.score_items.id;


--
-- TOC entry 255 (class 1259 OID 25315)
-- Name: scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scores (
    id integer NOT NULL,
    student_id integer,
    item_id integer,
    score numeric
);


ALTER TABLE public.scores OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 25314)
-- Name: scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scores_id_seq OWNER TO postgres;

--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 254
-- Name: scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scores_id_seq OWNED BY public.scores.id;


--
-- TOC entry 249 (class 1259 OID 25266)
-- Name: student_conduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_conduct (
    id integer NOT NULL,
    student_id integer,
    log_date date,
    event text,
    point integer
);


ALTER TABLE public.student_conduct OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 25265)
-- Name: student_conduct_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_conduct_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_conduct_id_seq OWNER TO postgres;

--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 248
-- Name: student_conduct_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_conduct_id_seq OWNED BY public.student_conduct.id;


--
-- TOC entry 247 (class 1259 OID 25250)
-- Name: student_health; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_health (
    id integer NOT NULL,
    student_id integer,
    weight numeric,
    height numeric,
    blood_pressure character varying(20),
    blood_type character varying(10),
    allergies text,
    chronic_illness text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_health OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 25249)
-- Name: student_health_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_health_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_health_id_seq OWNER TO postgres;

--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 246
-- Name: student_health_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_health_id_seq OWNED BY public.student_health.id;


--
-- TOC entry 237 (class 1259 OID 25166)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    student_code character varying(20) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    password_hash text NOT NULL,
    class_level character varying(10),
    classroom character varying(10),
    created_at timestamp without time zone DEFAULT now(),
    birthday date,
    phone character varying(30),
    address text,
    room character varying(10),
    photo_url text
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 25165)
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 236
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- TOC entry 241 (class 1259 OID 25194)
-- Name: subject_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_sections (
    id integer NOT NULL,
    subject_id integer,
    teacher_id integer,
    year integer,
    semester integer,
    class_level character varying(10),
    classroom character varying(10),
    day_of_week character varying(20),
    time_range character varying(50),
    room character varying(10)
);


ALTER TABLE public.subject_sections OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 25193)
-- Name: subject_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subject_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subject_sections_id_seq OWNER TO postgres;

--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 240
-- Name: subject_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subject_sections_id_seq OWNED BY public.subject_sections.id;


--
-- TOC entry 239 (class 1259 OID 25181)
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    subject_code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    credit integer NOT NULL
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 25180)
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO postgres;

--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 238
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- TOC entry 231 (class 1259 OID 25086)
-- Name: teacher_attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_attendance (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    student_id integer NOT NULL,
    subject_id integer NOT NULL,
    class_level character varying(20) NOT NULL,
    room character varying(10) NOT NULL,
    status character varying(10) NOT NULL,
    date date NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_attendance OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 25085)
-- Name: teacher_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_attendance_id_seq OWNER TO postgres;

--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 230
-- Name: teacher_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_attendance_id_seq OWNED BY public.teacher_attendance.id;


--
-- TOC entry 257 (class 1259 OID 25336)
-- Name: teacher_calendar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_calendar (
    id integer NOT NULL,
    title character varying(255),
    description text,
    event_date date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teacher_calendar OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 25335)
-- Name: teacher_calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_calendar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_calendar_id_seq OWNER TO postgres;

--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 256
-- Name: teacher_calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_calendar_id_seq OWNED BY public.teacher_calendar.id;


--
-- TOC entry 259 (class 1259 OID 25347)
-- Name: teacher_homeroom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_homeroom (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    level character varying(10),
    room character varying(10)
);


ALTER TABLE public.teacher_homeroom OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 25346)
-- Name: teacher_homeroom_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_homeroom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_homeroom_id_seq OWNER TO postgres;

--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 258
-- Name: teacher_homeroom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_homeroom_id_seq OWNED BY public.teacher_homeroom.id;


--
-- TOC entry 235 (class 1259 OID 25151)
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    teacher_code character varying(20) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    photo_url text
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 25150)
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teachers_id_seq OWNER TO postgres;

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 234
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- TOC entry 5020 (class 2604 OID 25284)
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- TOC entry 5004 (class 2604 OID 24912)
-- Name: competency_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competency_results ALTER COLUMN id SET DEFAULT nextval('public.competency_results_id_seq'::regclass);


--
-- TOC entry 5002 (class 2604 OID 24883)
-- Name: conduct_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conduct_logs ALTER COLUMN id SET DEFAULT nextval('public.conduct_logs_id_seq'::regclass);


--
-- TOC entry 5027 (class 2604 OID 25402)
-- Name: directors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directors ALTER COLUMN id SET DEFAULT nextval('public.directors_id_seq'::regclass);


--
-- TOC entry 4999 (class 2604 OID 24836)
-- Name: exam_schedule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedule ALTER COLUMN id SET DEFAULT nextval('public.exam_schedule_id_seq'::regclass);


--
-- TOC entry 5029 (class 2604 OID 25417)
-- Name: finance_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finance_records ALTER COLUMN id SET DEFAULT nextval('public.finance_records_id_seq'::regclass);


--
-- TOC entry 5016 (class 2604 OID 25233)
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- TOC entry 5000 (class 2604 OID 24867)
-- Name: health_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_records ALTER COLUMN id SET DEFAULT nextval('public.health_records_id_seq'::regclass);


--
-- TOC entry 5015 (class 2604 OID 25215)
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- TOC entry 5003 (class 2604 OID 24901)
-- Name: school_activities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_activities ALTER COLUMN id SET DEFAULT nextval('public.school_activities_id_seq'::regclass);


--
-- TOC entry 5007 (class 2604 OID 25105)
-- Name: score_headers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_headers ALTER COLUMN id SET DEFAULT nextval('public.score_headers_id_seq'::regclass);


--
-- TOC entry 5021 (class 2604 OID 25302)
-- Name: score_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_items ALTER COLUMN id SET DEFAULT nextval('public.score_items_id_seq'::regclass);


--
-- TOC entry 5023 (class 2604 OID 25318)
-- Name: scores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores ALTER COLUMN id SET DEFAULT nextval('public.scores_id_seq'::regclass);


--
-- TOC entry 5019 (class 2604 OID 25269)
-- Name: student_conduct id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_conduct ALTER COLUMN id SET DEFAULT nextval('public.student_conduct_id_seq'::regclass);


--
-- TOC entry 5017 (class 2604 OID 25253)
-- Name: student_health id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_health ALTER COLUMN id SET DEFAULT nextval('public.student_health_id_seq'::regclass);


--
-- TOC entry 5011 (class 2604 OID 25169)
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- TOC entry 5014 (class 2604 OID 25197)
-- Name: subject_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_sections ALTER COLUMN id SET DEFAULT nextval('public.subject_sections_id_seq'::regclass);


--
-- TOC entry 5013 (class 2604 OID 25184)
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 25089)
-- Name: teacher_attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_attendance ALTER COLUMN id SET DEFAULT nextval('public.teacher_attendance_id_seq'::regclass);


--
-- TOC entry 5024 (class 2604 OID 25339)
-- Name: teacher_calendar id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_calendar ALTER COLUMN id SET DEFAULT nextval('public.teacher_calendar_id_seq'::regclass);


--
-- TOC entry 5026 (class 2604 OID 25350)
-- Name: teacher_homeroom id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_homeroom ALTER COLUMN id SET DEFAULT nextval('public.teacher_homeroom_id_seq'::regclass);


--
-- TOC entry 5009 (class 2604 OID 25154)
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- TOC entry 5276 (class 0 OID 25281)
-- Dependencies: 251
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, student_id, section_id, date, status) FROM stdin;
\.


--
-- TOC entry 5254 (class 0 OID 24909)
-- Dependencies: 229
-- Data for Name: competency_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.competency_results (id, student_id, name, score, year, semester) FROM stdin;
1	1	การสื่อสาร	4	2568	1
2	1	การคิดวิเคราะห์	3	2568	1
3	5	ครูมีการเตรียมการสอน และเข้าสอนตรงเวลา	5	2568	1
4	5	อธิบายเนื้อหาได้ชัดเจน ยกตัวอย่างเข้าใจง่าย	5	2568	1
5	5	ใช้สื่อการสอนได้เหมาะสม	5	2568	1
6	5	เปิดโอกาสให้นักเรียนถาม/แสดงความคิดเห็น	5	2568	1
7	5	ให้คำแนะนำ/ช่วยเหลือเมื่อมีปัญหา	5	2568	1
8	5	ตรวจงานและให้ผลย้อนกลับอย่างเหมาะสม	5	2568	1
\.


--
-- TOC entry 5250 (class 0 OID 24880)
-- Dependencies: 225
-- Data for Name: conduct_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conduct_logs (id, student_id, log_date, event, point) FROM stdin;
1	1	2026-02-01	ช่วยงานโรงเรียน	5
2	1	2026-02-02	มาสาย	-2
3	2	2026-02-01	ร่วมกิจกรรม	3
\.


--
-- TOC entry 5286 (class 0 OID 25399)
-- Dependencies: 261
-- Data for Name: directors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directors (id, director_code, first_name, last_name, password_hash, photo_url, created_at) FROM stdin;
1	D001	ผอ	โรงเรียน	$2a$06$zJbki7Y5mqXnFlub4JPcAeRLM/9XtDkT4IF5oOKOr0mSS1w.Ka/bu	\N	2026-02-03 05:27:37.298159
\.


--
-- TOC entry 5246 (class 0 OID 24833)
-- Dependencies: 221
-- Data for Name: exam_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_schedule (id, section_id, exam_type, exam_date, time_range, room) FROM stdin;
\.


--
-- TOC entry 5288 (class 0 OID 25414)
-- Dependencies: 263
-- Data for Name: finance_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finance_records (id, title, category, amount, type, record_date, note, created_at) FROM stdin;
1	ค่างานกีฬาสี	จิปาถะ	20000.00	expense	2026-02-03		2026-02-03 05:53:04.267349
\.


--
-- TOC entry 5270 (class 0 OID 25230)
-- Dependencies: 245
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, student_id, section_id, total_score, grade) FROM stdin;
4	4	1	0	F
2	2	1	3800	A
3	3	1	4700	A
1	1	1	4200	A
\.


--
-- TOC entry 5248 (class 0 OID 24864)
-- Dependencies: 223
-- Data for Name: health_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_records (id, student_id, weight, height, blood_pressure, blood_type, allergies, chronic_illness, updated_at) FROM stdin;
2	3	150	178	120	o	-	-	2026-02-01 16:49:05.110055
3	4	123	123	123	123	123	123	2026-02-03 01:58:58.414289
4	1	45	150	120/80	O	ฝุ่น	-	2026-02-03 02:08:14.700095
5	2	42	148	118/75	A	-	-	2026-02-03 02:08:14.700095
6	5	\N	\N	\N	\N	\N	\N	2026-02-03 03:06:40.777663
\.


--
-- TOC entry 5268 (class 0 OID 25212)
-- Dependencies: 243
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, student_id, section_id, year, semester) FROM stdin;
1	1	1	2568	1
2	2	1	2568	1
3	3	1	2568	1
4	1	2	2568	1
5	2	2	2568	1
6	3	2	2568	1
7	1	1	2568	1
8	2	1	2568	1
9	3	1	2568	1
10	1	2	2568	1
11	2	2	2568	1
12	3	2	2568	1
14	4	1	2568	1
15	5	4	2568	1
16	5	5	2568	1
\.


--
-- TOC entry 5252 (class 0 OID 24898)
-- Dependencies: 227
-- Data for Name: school_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school_activities (id, name, date, location) FROM stdin;
1	กีฬาสี	2026-03-10	สนามกีฬา
2	วันวิทยาศาสตร์	2026-03-20	หอประชุม
\.


--
-- TOC entry 5258 (class 0 OID 25102)
-- Dependencies: 233
-- Data for Name: score_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.score_headers (id, teacher_id, subject_id, class_level, room, header_name, max_score, year, semester, created_at) FROM stdin;
\.


--
-- TOC entry 5278 (class 0 OID 25299)
-- Dependencies: 253
-- Data for Name: score_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.score_items (id, section_id, title, max_score, created_at) FROM stdin;
1	\N	asd	123	2026-02-03 02:00:50.626252
2	1	กลางภาค	50	2026-02-03 02:08:03.084873
4	2	แบบฝึกหัด	20	2026-02-03 02:08:03.084873
5	1	QUIZ1	20	2026-02-03 02:22:18.589872
7	1	ปลายภาค	30	2026-02-03 02:40:46.969902
8	2	เพศศึกษา	20	2026-02-03 02:41:44.397392
\.


--
-- TOC entry 5280 (class 0 OID 25315)
-- Dependencies: 255
-- Data for Name: scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scores (id, student_id, item_id, score) FROM stdin;
1	1	1	40
2	2	1	35
3	3	1	45
14	4	2	\N
16	2	2	38
18	3	2	47
20	1	2	42
28	2	8	14
30	3	8	15
32	1	8	20
\.


--
-- TOC entry 5274 (class 0 OID 25266)
-- Dependencies: 249
-- Data for Name: student_conduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_conduct (id, student_id, log_date, event, point) FROM stdin;
\.


--
-- TOC entry 5272 (class 0 OID 25250)
-- Dependencies: 247
-- Data for Name: student_health; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_health (id, student_id, weight, height, blood_pressure, blood_type, allergies, chronic_illness, updated_at) FROM stdin;
\.


--
-- TOC entry 5262 (class 0 OID 25166)
-- Dependencies: 237
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, student_code, first_name, last_name, password_hash, class_level, classroom, created_at, birthday, phone, address, room, photo_url) FROM stdin;
4	6500	สมชาย	ใจดี	$2b$10$ZnHyiDIB7etmoFwZo1wz4O6m5QfJAEQGPZxeorJvMfV/5Hud2.x0O	\N	\N	2026-02-02 22:16:09.965845	\N	\N	\N	\N	\N
2	6501002	น้ำฝน	สดใส	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	ม.1	1	2026-02-02 21:22:53.275157	\N	\N	\N	1	\N
3	6501003	ปาล์ม	เพชรดี	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	ม.1	1	2026-02-02 21:22:53.275157	\N	\N	\N	1	\N
1	6501004	เมฆ	ทองดี	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	ม.1	1	2026-02-02 21:22:53.275157	\N	\N	\N	1	\N
6	S002	น้ำฝน	สดใส	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	ม.1	1	2026-02-03 02:07:30.387198	2012-05-21	0822222222	นนทบุรี	1	\N
7	S003	ปาล์ม	เพชรดี	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	ม.1	1	2026-02-03 02:07:30.387198	2012-08-15	0833333333	ปทุมธานี	1	\N
5	S001	เมฆ	ทองดี	$2a$06$sTX7dV/M3L1gFuOEe1.uRuzZWEsNy3RDaC./F8AXtgMbFp3wRbnea	ม.1	1	2026-02-03 02:07:30.387198	2012-01-10	0812345678	กรุงเทพ	1	\N
\.


--
-- TOC entry 5266 (class 0 OID 25194)
-- Dependencies: 241
-- Data for Name: subject_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_sections (id, subject_id, teacher_id, year, semester, class_level, classroom, day_of_week, time_range, room) FROM stdin;
4	1	1	2568	1	ม.1	1	Mon	08:30-10:00	1
5	2	2	2568	1	ม.1	1	Wed	10:00-11:30	1
6	3	1	2568	1	ม.1	1	Fri	13:00-14:30	1
1	1	5	2568	1	ม.1	1	Mon	08:30-10:00	1
2	2	5	2568	1	ม.1	1	\N	\N	1
3	3	5	2024	1	ม.1	1	\N	\N	1
\.


--
-- TOC entry 5264 (class 0 OID 25181)
-- Dependencies: 239
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, subject_code, name, credit) FROM stdin;
1	MATH101	คณิตศาสตร์พื้นฐาน	3
2	SCI102	วิทยาศาสตร์พื้นฐาน	3
3	ENG103	ภาษาอังกฤษพื้นฐาน	2
\.


--
-- TOC entry 5256 (class 0 OID 25086)
-- Dependencies: 231
-- Data for Name: teacher_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_attendance (id, teacher_id, student_id, subject_id, class_level, room, status, date, created_at) FROM stdin;
1	1	1	1	ม.1	1	present	2026-02-03	2026-02-03 02:08:33.264225
2	1	2	1	ม.1	1	absent	2026-02-03	2026-02-03 02:08:33.264225
3	1	3	1	ม.1	1	late	2026-02-03	2026-02-03 02:08:33.264225
4	5	2	1	ม.1	1	absent	2026-02-03	2026-02-03 02:35:39.860936
5	5	3	1	ม.1	1	late	2026-02-03	2026-02-03 02:35:39.862304
6	5	1	1	ม.1	1	leave	2026-02-03	2026-02-03 02:35:39.862617
7	5	5	1	ม.1	1	present	2026-02-03	2026-02-03 02:35:39.862918
8	5	6	1	ม.1	1	present	2026-02-03	2026-02-03 02:35:39.863173
9	5	7	1	ม.1	1	present	2026-02-03	2026-02-03 02:35:39.863407
10	5	2	2	ม.1	1	present	2026-02-03	2026-02-03 03:08:03.523746
11	5	3	2	ม.1	1	present	2026-02-03	2026-02-03 03:08:03.524936
12	5	1	2	ม.1	1	present	2026-02-03	2026-02-03 03:08:03.525184
13	5	5	2	ม.1	1	present	2026-02-03	2026-02-03 03:08:03.525396
14	5	6	2	ม.1	1	present	2026-02-03	2026-02-03 03:08:03.525606
15	5	7	2	ม.1	1	present	2026-02-03	2026-02-03 03:08:03.525825
16	5	2	1	ม.1	1	present	2026-02-03	2026-02-03 03:52:47.66043
17	5	3	1	ม.1	1	present	2026-02-03	2026-02-03 03:52:47.661834
18	5	1	1	ม.1	1	present	2026-02-03	2026-02-03 03:52:47.662097
19	5	5	1	ม.1	1	present	2026-02-03	2026-02-03 03:52:47.66233
20	5	6	1	ม.1	1	present	2026-02-03	2026-02-03 03:52:47.662541
21	5	7	1	ม.1	1	present	2026-02-03	2026-02-03 03:52:47.662789
22	5	2	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:24.554622
23	5	3	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:24.555972
24	5	1	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:24.556264
25	5	5	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:24.556533
26	5	6	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:24.556778
27	5	7	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:24.556993
28	5	2	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:39.996404
29	5	3	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:39.997576
30	5	1	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:39.997793
31	5	5	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:39.998072
32	5	6	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:39.998317
33	5	7	1	ม.1	1	present	2026-02-03	2026-02-03 03:53:39.998596
\.


--
-- TOC entry 5282 (class 0 OID 25336)
-- Dependencies: 257
-- Data for Name: teacher_calendar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_calendar (id, title, description, event_date, created_at) FROM stdin;
2	ประชุมครู	ประชุมประจำเดือน	2026-02-10	2026-02-03 02:08:29.811146
3	ตรวจข้อสอบ	ส่งคะแนนกลางภาค	2026-02-15	2026-02-03 02:08:29.811146
\.


--
-- TOC entry 5284 (class 0 OID 25347)
-- Dependencies: 259
-- Data for Name: teacher_homeroom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_homeroom (id, teacher_id, level, room) FROM stdin;
\.


--
-- TOC entry 5260 (class 0 OID 25151)
-- Dependencies: 235
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teachers (id, teacher_code, first_name, last_name, password_hash, created_at, photo_url) FROM stdin;
1	T001	สมชาย	ใจดี	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	2026-02-02 21:22:53.275157	\N
2	T002	มาลี	สอนเก่ง	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	2026-02-02 21:22:53.275157	\N
3	T003	ประยุทธ์	ขยันสอน	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	2026-02-02 21:22:53.275157	\N
4	T005	สมชาย	ใจดี	$2b$10$VVEQB3OXsboVClRp4ND/7eZ1DipKTxftpJyv8LpKrhQYs3rLJgxQm	2026-02-02 21:55:19.556745	\N
6	T101	มาลี	สอนเก่ง	$2b$10$08E86ywRm01jb0FLS.pip.TS0M9rCMNl24SU0HKFSvBqTDPJXGx6	2026-02-03 02:07:26.650833	\N
5	T100	สมชาย	ใจดี	$2a$06$H2kgAXbKVqk9seJRKUQGSOAMPm2eYr7lUM3iPZZhopqAfFqOPwUIi	2026-02-03 02:07:26.650833	/uploads/teacher_5_1770068425887.png
\.


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 250
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 228
-- Name: competency_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.competency_results_id_seq', 8, true);


--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 224
-- Name: conduct_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conduct_logs_id_seq', 3, true);


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 260
-- Name: directors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directors_id_seq', 1, true);


--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 220
-- Name: exam_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exam_schedule_id_seq', 1, false);


--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 262
-- Name: finance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finance_records_id_seq', 1, true);


--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 244
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 4, true);


--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 222
-- Name: health_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.health_records_id_seq', 6, true);


--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 242
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registrations_id_seq', 16, true);


--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 226
-- Name: school_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.school_activities_id_seq', 2, true);


--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 232
-- Name: score_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.score_headers_id_seq', 1, false);


--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 252
-- Name: score_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.score_items_id_seq', 8, true);


--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 254
-- Name: scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scores_id_seq', 32, true);


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 248
-- Name: student_conduct_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_conduct_id_seq', 1, false);


--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 246
-- Name: student_health_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_health_id_seq', 1, false);


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 236
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 7, true);


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 240
-- Name: subject_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subject_sections_id_seq', 6, true);


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 238
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_id_seq', 4, true);


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 230
-- Name: teacher_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teacher_attendance_id_seq', 33, true);


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 256
-- Name: teacher_calendar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teacher_calendar_id_seq', 3, true);


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 258
-- Name: teacher_homeroom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teacher_homeroom_id_seq', 1, false);


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 234
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teachers_id_seq', 6, true);


--
-- TOC entry 5069 (class 2606 OID 25287)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 24918)
-- Name: competency_results competency_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competency_results
    ADD CONSTRAINT competency_results_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 24891)
-- Name: conduct_logs conduct_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conduct_logs
    ADD CONSTRAINT conduct_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5079 (class 2606 OID 25412)
-- Name: directors directors_director_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directors
    ADD CONSTRAINT directors_director_code_key UNIQUE (director_code);


--
-- TOC entry 5081 (class 2606 OID 25410)
-- Name: directors directors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directors
    ADD CONSTRAINT directors_pkey PRIMARY KEY (id);


--
-- TOC entry 5033 (class 2606 OID 24839)
-- Name: exam_schedule exam_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_schedule
    ADD CONSTRAINT exam_schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 5083 (class 2606 OID 25428)
-- Name: finance_records finance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finance_records
    ADD CONSTRAINT finance_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5063 (class 2606 OID 25238)
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 24873)
-- Name: health_records health_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_records
    ADD CONSTRAINT health_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 25218)
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5039 (class 2606 OID 24907)
-- Name: school_activities school_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_activities
    ADD CONSTRAINT school_activities_pkey PRIMARY KEY (id);


--
-- TOC entry 5045 (class 2606 OID 25114)
-- Name: score_headers score_headers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_headers
    ADD CONSTRAINT score_headers_pkey PRIMARY KEY (id);


--
-- TOC entry 5071 (class 2606 OID 25308)
-- Name: score_items score_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_items
    ADD CONSTRAINT score_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5073 (class 2606 OID 25323)
-- Name: scores scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_pkey PRIMARY KEY (id);


--
-- TOC entry 5067 (class 2606 OID 25274)
-- Name: student_conduct student_conduct_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_conduct
    ADD CONSTRAINT student_conduct_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 25259)
-- Name: student_health student_health_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_health
    ADD CONSTRAINT student_health_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 25177)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 25179)
-- Name: students students_student_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_student_code_key UNIQUE (student_code);


--
-- TOC entry 5059 (class 2606 OID 25200)
-- Name: subject_sections subject_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_sections
    ADD CONSTRAINT subject_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 25190)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 25192)
-- Name: subjects subjects_subject_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_subject_code_key UNIQUE (subject_code);


--
-- TOC entry 5043 (class 2606 OID 25100)
-- Name: teacher_attendance teacher_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 5075 (class 2606 OID 25345)
-- Name: teacher_calendar teacher_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_calendar
    ADD CONSTRAINT teacher_calendar_pkey PRIMARY KEY (id);


--
-- TOC entry 5077 (class 2606 OID 25354)
-- Name: teacher_homeroom teacher_homeroom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_homeroom
    ADD CONSTRAINT teacher_homeroom_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 25162)
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- TOC entry 5049 (class 2606 OID 25164)
-- Name: teachers teachers_teacher_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_teacher_code_key UNIQUE (teacher_code);


--
-- TOC entry 5092 (class 2606 OID 25293)
-- Name: attendance attendance_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.subject_sections(id);


--
-- TOC entry 5093 (class 2606 OID 25288)
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 5088 (class 2606 OID 25244)
-- Name: grades grades_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.subject_sections(id);


--
-- TOC entry 5089 (class 2606 OID 25239)
-- Name: grades grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 5086 (class 2606 OID 25224)
-- Name: registrations registrations_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.subject_sections(id);


--
-- TOC entry 5087 (class 2606 OID 25219)
-- Name: registrations registrations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 5094 (class 2606 OID 25309)
-- Name: score_items score_items_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_items
    ADD CONSTRAINT score_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.subject_sections(id);


--
-- TOC entry 5095 (class 2606 OID 25329)
-- Name: scores scores_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.score_items(id);


--
-- TOC entry 5096 (class 2606 OID 25324)
-- Name: scores scores_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 5091 (class 2606 OID 25275)
-- Name: student_conduct student_conduct_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_conduct
    ADD CONSTRAINT student_conduct_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 5090 (class 2606 OID 25260)
-- Name: student_health student_health_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_health
    ADD CONSTRAINT student_health_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- TOC entry 5084 (class 2606 OID 25201)
-- Name: subject_sections subject_sections_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_sections
    ADD CONSTRAINT subject_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- TOC entry 5085 (class 2606 OID 25206)
-- Name: subject_sections subject_sections_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_sections
    ADD CONSTRAINT subject_sections_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- TOC entry 5097 (class 2606 OID 25355)
-- Name: teacher_homeroom teacher_homeroom_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_homeroom
    ADD CONSTRAINT teacher_homeroom_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


-- Completed on 2026-02-03 08:15:14

--
-- PostgreSQL database dump complete
--

\unrestrict eKeQ7Ys3fdQUqz535lYP0slQbC7a5vFNtC8iaed1S41elvcFqjRsVmbxF79wceH

