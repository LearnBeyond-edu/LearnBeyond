--
-- PostgreSQL database dump
--

\restrict vYIwGXeXRdYHRgRJm5CYn008emXKpjQZ5AvXGhABfa7WPSgwV3xBgjPAjBFPw5e

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

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

ALTER TABLE IF EXISTS ONLY public.therapist_profiles DROP CONSTRAINT IF EXISTS therapist_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.therapist_profiles DROP CONSTRAINT IF EXISTS therapist_profiles_institution_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_institution_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_institution_id_fkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rewards DROP CONSTRAINT IF EXISTS rewards_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.rewards DROP CONSTRAINT IF EXISTS rewards_badge_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reports DROP CONSTRAINT IF EXISTS reports_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reports DROP CONSTRAINT IF EXISTS reports_generated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.quizzes DROP CONSTRAINT IF EXISTS quizzes_lesson_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quizzes DROP CONSTRAINT IF EXISTS quizzes_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.quizzes DROP CONSTRAINT IF EXISTS quizzes_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_quiz_id_fkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_module_id_fkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_lesson_id_fkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.parent_profiles DROP CONSTRAINT IF EXISTS parent_profiles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.parent_profiles DROP CONSTRAINT IF EXISTS parent_profiles_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.parent_profiles DROP CONSTRAINT IF EXISTS parent_profiles_institution_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.learning_style DROP CONSTRAINT IF EXISTS learning_style_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.learning_modules DROP CONSTRAINT IF EXISTS learning_modules_lesson_id_fkey;
ALTER TABLE IF EXISTS ONLY public.laura_memory DROP CONSTRAINT IF EXISTS laura_memory_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goals DROP CONSTRAINT IF EXISTS goals_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fk_users_institution;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fk_users_created_by;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fk_role;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS fk_class_teacher;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS fk_class_institution;
ALTER TABLE IF EXISTS ONLY public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_marked_by_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS assignments_lesson_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS assignments_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS assignments_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_module_id_fkey;
ALTER TABLE IF EXISTS ONLY public.achievements DROP CONSTRAINT IF EXISTS achievements_student_id_fkey;
DROP INDEX IF EXISTS public.users_username_unique_idx;
DROP INDEX IF EXISTS public.users_email_unique_idx;
DROP INDEX IF EXISTS public.institutions_email_unique_idx;
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_phone;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_therapist_user;
DROP INDEX IF EXISTS public.idx_student_user;
DROP INDEX IF EXISTS public.idx_staff_user;
DROP INDEX IF EXISTS public.idx_reports_student;
DROP INDEX IF EXISTS public.idx_quiz_student;
DROP INDEX IF EXISTS public.idx_progress_student;
DROP INDEX IF EXISTS public.idx_parent_user;
DROP INDEX IF EXISTS public.idx_notification_user;
DROP INDEX IF EXISTS public.idx_messages_conversation;
DROP INDEX IF EXISTS public.idx_lesson_class;
DROP INDEX IF EXISTS public.idx_class_institution;
DROP INDEX IF EXISTS public.idx_attendance_student;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS unique_class;
ALTER TABLE IF EXISTS ONLY public.therapist_profiles DROP CONSTRAINT IF EXISTS therapist_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.therapist_profiles DROP CONSTRAINT IF EXISTS therapist_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_admission_number_key;
ALTER TABLE IF EXISTS ONLY public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_employee_id_key;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_user_id_key;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE IF EXISTS ONLY public.rewards DROP CONSTRAINT IF EXISTS rewards_pkey;
ALTER TABLE IF EXISTS ONLY public.reports DROP CONSTRAINT IF EXISTS reports_pkey;
ALTER TABLE IF EXISTS ONLY public.quizzes DROP CONSTRAINT IF EXISTS quizzes_pkey;
ALTER TABLE IF EXISTS ONLY public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_pkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_role_id_permission_name_key;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.parent_profiles DROP CONSTRAINT IF EXISTS parent_profiles_user_id_key;
ALTER TABLE IF EXISTS ONLY public.parent_profiles DROP CONSTRAINT IF EXISTS parent_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_pkey;
ALTER TABLE IF EXISTS ONLY public.learning_style DROP CONSTRAINT IF EXISTS learning_style_student_id_key;
ALTER TABLE IF EXISTS ONLY public.learning_style DROP CONSTRAINT IF EXISTS learning_style_pkey;
ALTER TABLE IF EXISTS ONLY public.learning_modules DROP CONSTRAINT IF EXISTS learning_modules_pkey;
ALTER TABLE IF EXISTS ONLY public.laura_memory DROP CONSTRAINT IF EXISTS laura_memory_pkey;
ALTER TABLE IF EXISTS ONLY public.institutions DROP CONSTRAINT IF EXISTS institutions_pkey;
ALTER TABLE IF EXISTS ONLY public.goals DROP CONSTRAINT IF EXISTS goals_pkey;
ALTER TABLE IF EXISTS ONLY public.feedback DROP CONSTRAINT IF EXISTS feedback_pkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_class_id_key;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_pkey;
ALTER TABLE IF EXISTS ONLY public.badges DROP CONSTRAINT IF EXISTS badges_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_attendance_date_key;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_pkey;
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_pkey;
ALTER TABLE IF EXISTS ONLY public.achievements DROP CONSTRAINT IF EXISTS achievements_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.therapist_profiles;
DROP TABLE IF EXISTS public.submissions;
DROP TABLE IF EXISTS public.student_profiles;
DROP TABLE IF EXISTS public.staff_profiles;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.rewards;
DROP TABLE IF EXISTS public.reports;
DROP TABLE IF EXISTS public.quizzes;
DROP TABLE IF EXISTS public.quiz_attempts;
DROP TABLE IF EXISTS public.progress;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.parent_profiles;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.lessons;
DROP TABLE IF EXISTS public.learning_style;
DROP TABLE IF EXISTS public.learning_modules;
DROP TABLE IF EXISTS public.laura_memory;
DROP TABLE IF EXISTS public.institutions;
DROP TABLE IF EXISTS public.goals;
DROP TABLE IF EXISTS public.feedback;
DROP TABLE IF EXISTS public.enrollments;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.badges;
DROP TABLE IF EXISTS public.attendance;
DROP TABLE IF EXISTS public.assignments;
DROP TABLE IF EXISTS public.activities;
DROP TABLE IF EXISTS public.achievements;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    earned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    activity_type character varying(50),
    title character varying(255),
    description text,
    max_score integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    lesson_id uuid,
    created_by uuid NOT NULL,
    title text NOT NULL,
    instructions text,
    due_date timestamp without time zone,
    total_marks integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    attendance_date date NOT NULL,
    status character varying(20) DEFAULT 'Present'::character varying,
    marked_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    institution_id uuid NOT NULL,
    grade smallint NOT NULL,
    section character varying(10) NOT NULL,
    academic_year character varying(20) NOT NULL,
    class_teacher_id uuid,
    room_number character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT classes_grade_check CHECK (((grade >= 1) AND (grade <= 12)))
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255),
    conversation_type character varying(50) DEFAULT 'Laura'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    enrolled_on date DEFAULT CURRENT_DATE,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    rating integer,
    feedback text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    target_date date,
    progress_percentage integer DEFAULT 0,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: institutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    institution_type character varying(50) NOT NULL,
    email character varying(255),
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    logo_url text,
    subscription_status character varying(20) DEFAULT 'Trial'::character varying,
    subscription_start date,
    subscription_end date,
    account_status character varying(20) DEFAULT 'Active'::character varying,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone,
    subscription_plan character varying(50) DEFAULT 'Starter'::character varying
);


--
-- Name: laura_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.laura_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    memory_key character varying(255) NOT NULL,
    memory_value text,
    memory_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: learning_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    module_order integer NOT NULL,
    content_type character varying(50),
    content text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: learning_style; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_style (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    visual boolean DEFAULT false,
    auditory boolean DEFAULT false,
    reading_writing boolean DEFAULT false,
    kinesthetic boolean DEFAULT false,
    tactile boolean DEFAULT false,
    ai_confidence numeric(5,2),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    created_by uuid NOT NULL,
    title text NOT NULL,
    description text,
    lesson_type character varying(50),
    difficulty character varying(20),
    estimated_duration integer,
    status character varying(20) DEFAULT 'Draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    content text,
    scheduled_time timestamp without time zone
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid,
    sender_type character varying(30),
    message text NOT NULL,
    message_type character varying(30) DEFAULT 'text'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    notification_type character varying(50),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: parent_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    occupation character varying(100),
    relation character varying(30) NOT NULL,
    alternate_phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    student_id uuid
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    lesson_id uuid,
    module_id uuid,
    activity_id uuid,
    completion_percentage integer DEFAULT 0,
    status character varying(30) DEFAULT 'Not Started'::character varying,
    last_accessed timestamp without time zone,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL,
    student_id uuid NOT NULL,
    score integer,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    attempt_number integer DEFAULT 1
);


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid,
    created_by uuid,
    title text NOT NULL,
    description text,
    total_marks integer DEFAULT 100,
    duration_minutes integer,
    attempts_allowed integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    class_id uuid,
    due_date timestamp without time zone,
    time_limit integer,
    questions jsonb,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    generated_by uuid,
    report_type character varying(100),
    report_url text,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    badge_id uuid,
    reward_name character varying(255),
    reward_type character varying(50),
    reward_value character varying(100),
    awarded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    theme character varying(30) DEFAULT 'system'::character varying,
    language character varying(50) DEFAULT 'English'::character varying,
    notifications_enabled boolean DEFAULT true,
    dark_mode boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: staff_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    employee_id character varying(50) NOT NULL,
    designation character varying(100),
    qualification character varying(100),
    experience integer DEFAULT 0,
    joined_on date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid,
    admission_number character varying(50) NOT NULL,
    roll_number character varying(20),
    learning_style_id uuid,
    joined_on date DEFAULT CURRENT_DATE,
    emergency_contact character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid,
    student_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submission_url text,
    score integer,
    feedback text,
    status character varying(30) DEFAULT 'Submitted'::character varying,
    assessment_id uuid,
    assessment_type character varying(50),
    content text,
    files jsonb,
    answers jsonb
);


--
-- Name: therapist_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.therapist_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_id uuid,
    specialization character varying(150),
    qualification character varying(150),
    experience integer DEFAULT 0,
    license_number character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    institution_id uuid,
    created_by uuid,
    first_name character varying(100) NOT NULL,
    last_name character varying(100),
    username character varying(50) NOT NULL,
    email character varying(255),
    phone character varying(20),
    password_hash text NOT NULL,
    profile_photo text,
    date_of_birth date,
    gender character varying(20),
    account_status character varying(20) DEFAULT 'Active'::character varying NOT NULL,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    is_active boolean DEFAULT true,
    bio text,
    address text,
    cover_image text,
    laura_state jsonb,
    app_state jsonb DEFAULT '{}'::jsonb
);


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.achievements (id, student_id, title, description, earned_at) FROM stdin;
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activities (id, module_id, activity_type, title, description, max_score, created_at) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignments (id, class_id, lesson_id, created_by, title, instructions, due_date, total_marks, created_at, updated_at, description) FROM stdin;
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance (id, student_id, class_id, attendance_date, status, marked_by, created_at) FROM stdin;
\.


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.badges (id, name, description, icon_url, created_at) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.classes (id, institution_id, grade, section, academic_year, class_teacher_id, room_number, created_at, updated_at) FROM stdin;
c22e71d3-5130-4e74-9c8f-27d16466b7a0	92599bdf-d00e-4f1a-abb2-8d2d899b2240	8	V	2026-2027	960c27c3-f305-4e53-bd47-9ecd4ff3145c	\N	2026-10-09 21:39:47.884713	2026-10-09 21:39:47.884713
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, user_id, title, conversation_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enrollments (id, student_id, class_id, enrolled_on, status, created_at) FROM stdin;
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feedback (id, user_id, rating, feedback, created_at) FROM stdin;
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goals (id, student_id, title, description, target_date, progress_percentage, status, created_at) FROM stdin;
\.


--
-- Data for Name: institutions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutions (id, name, institution_type, email, phone, address, city, state, country, postal_code, logo_url, subscription_status, subscription_start, subscription_end, account_status, created_by, created_at, updated_at, deleted_at, subscription_plan) FROM stdin;
92599bdf-d00e-4f1a-abb2-8d2d899b2240	LearnBeyond Institute	School	schooladmin@gmail.com	+91 1234567890	\N	\N	\N	\N	\N	\N	active	\N	\N	Active	\N	2026-10-09 21:36:54.94056	2026-10-09 21:36:54.94056	\N	Starter
\.


--
-- Data for Name: laura_memory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.laura_memory (id, user_id, memory_key, memory_value, memory_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: learning_modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.learning_modules (id, lesson_id, title, module_order, content_type, content, created_at) FROM stdin;
\.


--
-- Data for Name: learning_style; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.learning_style (id, student_id, visual, auditory, reading_writing, kinesthetic, tactile, ai_confidence, updated_at) FROM stdin;
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lessons (id, class_id, created_by, title, description, lesson_type, difficulty, estimated_duration, status, created_at, updated_at, content, scheduled_time) FROM stdin;
13f1ebaf-c756-474c-8a87-a925216988ea	c22e71d3-5130-4e74-9c8f-27d16466b7a0	960c27c3-f305-4e53-bd47-9ecd4ff3145c	Mastering the Three Laws of Thermodynamics: A Journey Through Heat and Energy	Learn how heat moves and why energy can never be created or destroyed—perfect for curious middle‑school scientists!	\N	\N	\N	Draft	2026-10-10 07:08:09.553	2026-10-10 07:08:09.553	Learning Objectives:\n- Identify the first, second, and third laws of thermodynamics.\n- Explain how energy conservation and entropy govern real‑world processes.\n- Apply the laws to everyday examples like engines, refrigerators, and the Earth’s climate.\n- Predict the outcome of heat transfer scenarios using the laws.\n\nNotes:\nThe first law of thermodynamics, often called the law of energy conservation, states that energy can neither be created nor destroyed, only converted from one form to another. In a closed system, the total internal energy remains constant unless work is done on or by the system, or heat is transferred in or out. This principle is the backbone of all engineering, from simple steam engines to complex power plants, and it explains why a car’s fuel must be burned to produce the work that moves the vehicle.\n\nThe second law introduces the concept of entropy, a measure of disorder or randomness. It tells us that in any natural process, the total entropy of a closed system plus its surroundings will increase over time. This law explains why heat flows from hot to cold and why perpetual motion machines are impossible. In everyday life, it governs why refrigerators must consume electricity to keep food cold and why the Earth’s climate changes as the Sun’s energy is dispersed.\n\nThe third law sets the baseline for absolute zero temperature, stating that the entropy of a perfect crystal approaches zero as the temperature approaches absolute zero. This provides a reference point for measuring entropy changes and explains why it becomes increasingly difficult to remove heat from a system as it gets colder. In practical terms, it tells engineers that there is a fundamental limit to how cold a system can get, which is why cryogenic technology requires extreme cooling techniques.\n\nBy understanding these three laws, students can analyze how energy flows in engines, how refrigerators keep food fresh, and even how the universe’s large‑scale structure evolves. The laws also highlight the importance of efficiency and the inevitable trade‑offs between work and waste heat.\n\nSimulation Calibration Target:\nMass: 50kg, Force: 80N, Friction: 10N\n\n<!-- TACTILE_DATA: {"title":"Interactive Teardown: Thermodynamics 3 Laws","layers":[{"id":"l1","name":"Engine Casing","prompt":"A highly accurate, scientifically correct, photorealistic educational image of the outer physical shell of a gasoline engine, showing the real structure exactly as it exists in reality, studio lighting, hyperrealistic, 8k","hotspots":[{"x":30,"y":40,"label":"Cooling fins"},{"x":70,"y":60,"label":"Valve cover"}]},{"id":"l2","name":"Piston and Cylinder Assembly","prompt":"A highly accurate, scientifically correct, photorealistic educational image showing the precise exposed internal mechanisms and real internal components of a gasoline engine, hyperrealistic","hotspots":[{"x":50,"y":50,"label":"Piston ring"}]},{"id":"l3","name":"Combustion Chamber","prompt":"A highly accurate, scientifically correct, photorealistic educational image showing the absolute innermost core, physics, or microscopic foundation of a gasoline engine, hyperrealistic","hotspots":[{"x":50,"y":50,"label":"Spark plug"}]}],"kinesthetic":{"title":"Simulate Thermodynamics 3 Laws","items":[{"id":"item0","label":"Place Engine Casing","color":"blue"},{"id":"item1","label":"Install Piston and Cylinder Assembly","color":"amber"},{"id":"item2","label":"Activate Combustion Chamber","color":"emerald"}],"success":"Thermodynamics 3 Laws ACHIEVED","instructions":["1. Place the Engine Casing on the base platform.","2. Attach the Piston and Cylinder Assembly to the Engine Casing.","3. Connect the Spark plug to activate the Combustion Chamber."]}} -->	2026-10-10 01:38:00
bf8484f8-15af-4834-b242-98d5ca551426	c22e71d3-5130-4e74-9c8f-27d16466b7a0	960c27c3-f305-4e53-bd47-9ecd4ff3145c	Orbiting Giants: A Deep Dive into Our Solar Neighborhood	Discover the planets, moons, and mysterious objects that share our cosmic home. Learn how gravity keeps everything in motion and why our Sun is the heart of it all.	\N	\N	\N	Draft	2026-10-10 09:52:08.621	2026-10-10 09:52:08.621	Learning Objectives:\n1. Identify and describe the eight planets of the solar system, including their key physical characteristics.\n2. Explain the role of the Sun and gravity in maintaining the stability of the solar system.\n3. Distinguish between terrestrial and gas giant planets, as well as dwarf planets and small solar system bodies.\n4. Understand the formation of the solar system from the solar nebula.\n\nDetailed Notes:\nOur solar system is a vast and dynamic collection of objects bound together by the gravitational pull of the Sun. At the center lies the Sun, a G-type main-sequence star that accounts for approximately 99.86% of the total mass of the solar system. The Sun is a massive ball of plasma, primarily hydrogen and helium, undergoing nuclear fusion in its core. This process releases enormous amounts of energy in the form of light and heat, which sustains life on Earth and drives the weather systems of other planets. The Sun’s magnetic field also plays a crucial role, extending out into space as the heliosphere, which protects the solar system from high-energy particles from interstellar space.\n\nThe planets in our solar system are divided into two main categories: terrestrial planets and gas giants. The terrestrial planets, which include Mercury, Venus, Earth, and Mars, are located closer to the Sun and are composed primarily of rock and metal. They have solid surfaces, relatively dense compositions, and few or no moons. In contrast, the gas giants, Jupiter, Saturn, Uranus, and Neptune, are much larger, located farther from the Sun, and are composed mostly of hydrogen and helium. These planets do not have well-defined solid surfaces; instead, they have thick atmospheres that gradually transition into liquid or metallic hydrogen layers deep within. Jupiter, the largest planet, has a Great Red Spot, a massive storm larger than Earth that has been raging for centuries, while Saturn is famous for its spectacular ring system made of ice and rock particles.\n\nBeyond the orbit of Neptune lies the Kuiper Belt, a region populated by icy bodies, including dwarf planets like Pluto, Eris, and Makemake. Further out, at the edge of the solar system, is the Oort Cloud, a theoretical spherical shell of icy objects that is believed to be the source of long-period comets. These small bodies are remnants from the early formation of the solar system and provide valuable clues about its history. The solar system formed about 4.6 billion years ago from the gravitational collapse of a giant molecular cloud. As the cloud collapsed, it formed a rotating disk of gas and dust around the young Sun. Over time, dust particles collided and stuck together, forming planetesimals, which eventually grew into planets through accretion.\n\nUnderstanding the solar system helps us appreciate our place in the universe. Each planet has unique features, from Mercury’s cratered surface to Venus’s thick, toxic atmosphere that creates a runaway greenhouse effect. Earth remains the only known planet to harbor life, thanks to its stable climate, liquid water, and protective magnetic field. By studying these celestial bodies, scientists can learn about the processes that shape planets and potentially identify other habitable worlds in the galaxy. The exploration of the solar system continues with robotic missions and telescopes, revealing new details about the geology, atmospheres, and potential for life on other worlds.\n\nSimulation Calibration Target:\nGravity: 9.8 m/s², Velocity: 75 km/s, Thruster: ON\n\n<!-- TACTILE_DATA: {"title":"Interactive Teardown: Solar System","layers":[{"id":"l1","name":"Heliopause and Interstellar Boundary","prompt":"A highly accurate, scientifically correct, photorealistic educational image of the outer boundary of the solar system, showing the heliopause where the solar wind meets the interstellar medium, with a faint glow from the Sun's influence fading into the dark of space, studio lighting, hyperrealistic, 8k","hotspots":[{"x":20,"y":30,"label":"Heliopause Boundary"},{"x":80,"y":70,"label":"Interstellar Medium"},{"x":50,"y":50,"label":"Termination Shock"}]},{"id":"l2","name":"Planetary Orbits and Asteroid Belt","prompt":"A highly accurate, scientifically correct, photorealistic educational image showing the precise exposed internal structure of the solar system, focusing on the orbital paths of the planets and the dense field of asteroids between Mars and Jupiter, with visible gravitational lines, hyperrealistic","hotspots":[{"x":40,"y":40,"label":"Asteroid Belt"},{"x":60,"y":60,"label":"Jupiter's Orbit"},{"x":30,"y":70,"label":"Earth's Orbit"}]},{"id":"l3","name":"Solar Core and Fusion Chamber","prompt":"A highly accurate, scientifically correct, photorealistic educational image showing the absolute innermost core of the Sun, with intense glowing plasma, nuclear fusion reactions visible as bright flashes, and the dense metallic hydrogen layer surrounding it, hyperrealistic","hotspots":[{"x":50,"y":50,"label":"Nuclear Fusion Core"},{"x":30,"y":30,"label":"Radiative Zone"},{"x":70,"y":70,"label":"Convection Zone"}]}],"kinesthetic":{"title":"Simulate Solar System","items":[{"id":"item0","label":"Place the Sun","color":"blue"},{"id":"item1","label":"Add Planetary Orbits","color":"amber"},{"id":"item2","label":"Enable Gravity","color":"emerald"}],"success":"SOLAR SYSTEM ACHIEVED","instructions":["1. Place the Sun at the center of the simulation area.","2. Add the planetary orbits around the Sun in the correct order.","3. Enable gravity to start the orbital motion of the planets."]}} -->	2026-10-15 04:21:00
70545a09-ec78-4ea3-8382-30416e3a80dd	c22e71d3-5130-4e74-9c8f-27d16466b7a0	960c27c3-f305-4e53-bd47-9ecd4ff3145c	The Puppet Master: How Your Brain Controls Movement	Discover the incredible journey of a single thought transforming into muscle action, exploring how your nervous system coordinates every step, jump, and gesture you make.	\N	\N	\N	Draft	2026-10-10 11:05:31.52	2026-10-10 11:05:31.52	Learning Objectives: By the end of this lesson, students will be able to define motor control and explain the pathway of a motor signal from the brain to the muscles. Students will identify the key roles of the motor cortex, basal ganglia, and cerebellum in movement coordination. Finally, students will describe the concept of feedback loops and how the body corrects errors in real-time to maintain balance and precision.\n\nDetailed Notes: Motor control is the fundamental biological process that allows your body to move intentionally, such as raising your hand to answer a question or kicking a soccer ball. It is not a simple on-and-off switch; rather, it is a complex, hierarchical system involving multiple brain regions working in perfect unison. The process begins in the motor cortex, a strip of tissue located on the surface of your brain just behind the central sulcus. This area acts as the command center, mapping out the specific muscles needed for a task. When you decide to move, the motor cortex sends electrical impulses down through the brainstem and into the spinal cord. These signals travel via motor neurons, which are the final common pathway connecting the nervous system to the muscles. Without this precise wiring, voluntary movement would be impossible, highlighting the critical importance of the upper motor neurons located in the brain and lower motor neurons located in the spinal cord.\n\nHowever, the motor cortex does not work alone. For smooth, fluid movements, the brain relies on the basal ganglia and the cerebellum, which act as the body's quality control departments. The basal ganglia help select the right movement and suppress unwanted ones, ensuring that when you reach for a glass, your other hand doesn't flail around. The cerebellum, located at the back of the brain, is responsible for balance, coordination, and timing. It constantly compares the movement you intended with the movement actually happening. If you slip on a banana peel, your cerebellum detects the imbalance immediately and sends rapid correction signals to your legs and core to prevent you from falling. This constant monitoring and adjustment happen so quickly that they are completely automatic, requiring no conscious thought.\n\nThe communication between the brain and muscles is a continuous loop known as feedback control. Sensory receptors in your muscles, joints, and skin act like tiny sensors that report back to the brain about your current position and the force being applied. This information is processed by the somatosensory cortex, which updates the motor plan in real-time. For example, when you lift a heavy box, your initial estimate of the required force might be wrong. Your muscles will sense the strain, and your brain will instantly adjust the signal to recruit more muscle fibers, preventing injury. This adaptive capability is what distinguishes human motor control from simple robotic movements, allowing us to learn new skills, adapt to changing environments, and perform delicate tasks with remarkable precision. Understanding this system helps us appreciate the complexity of the human body and the vulnerability of these pathways when damaged by injury or disease.\n\nSimulation Calibration Target: Interactive Teardown Target: Successfully dissect the outer layers to reveal the internal mechanisms and core.\n\n<!-- TACTILE_DATA: {"title":"Interactive Teardown: Motor Control","layers":[{"id":"l1","name":"Cranial Vault and Motor Cortex Surface","prompt":"A highly accurate, scientifically correct, photorealistic educational image of the outer physical shell of the human head, specifically showing the exposed motor cortex area of the brain with the skull removed, revealing the gyri and sulci of the frontal lobe, studio lighting, hyperrealistic, 8k","hotspots":[{"x":45,"y":35,"label":"Primary Motor Cortex (Precentral Gyrus)"},{"x":60,"y":50,"label":"Central Sulcus"},{"x":30,"y":60,"label":"Frontal Lobe Boundary"}]},{"id":"l2","name":"Subcortical Coordination Centers","prompt":"A highly accurate, scientifically correct, photorealistic educational image showing the precise exposed internal mechanisms of the brain, specifically a sagittal view revealing the basal ganglia and the cerebellum, with surrounding white matter tracts visible, hyperrealistic","hotspots":[{"x":40,"y":45,"label":"Basal Ganglia Cluster"},{"x":70,"y":65,"label":"Cerebellum"},{"x":50,"y":80,"label":"Brainstem (Pons and Medulla)"}]},{"id":"l3","name":"Neuromuscular Junction Interface","prompt":"A highly accurate, scientifically correct, photorealistic educational image showing the absolute innermost microscopic foundation of motor control, depicting a motor neuron axon terminating at a muscle fiber, highlighting the synaptic cleft and acetylcholine vesicles, hyperrealistic","hotspots":[{"x":30,"y":50,"label":"Motor Neuron Axon Terminal"},{"x":50,"y":50,"label":"Synaptic Cleft"},{"x":70,"y":50,"label":"Muscle Fiber Membrane (Neuromuscular Junction)"}]}],"kinesthetic":{"title":"Simulate Motor Control","items":[{"id":"item0","label":"Motor Command Signal","color":"blue"},{"id":"item1","label":"Sensory Feedback Loop","color":"amber"},{"id":"item2","label":"Muscle Contraction Response","color":"emerald"}],"success":"MOTOR CONTROL ACHIEVED","instructions":["1. Place the Motor Command Signal at the brainstem node to initiate the voluntary movement impulse.","2. Connect the Sensory Feedback Loop from the proprioceptors back to the cerebellum to enable real-time error correction.","3. Activate the Muscle Contraction Response at the neuromuscular junction to complete the movement cycle."]}} -->	2026-10-14 05:35:00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, sender_id, sender_type, message, message_type, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, notification_type, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: parent_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parent_profiles (id, user_id, institution_id, occupation, relation, alternate_phone, created_at, updated_at, student_id) FROM stdin;
bc417ffa-6a57-4705-a38a-70673f5c0930	610f6712-7125-475f-b011-16bda886f6df	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	Mother	\N	2026-10-09 21:42:46.154793	2026-10-09 21:42:46.154793	f5959a93-9bca-490f-b20f-efbded482d16
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, role_id, permission_name, description, created_at) FROM stdin;
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.progress (id, student_id, lesson_id, module_id, activity_id, completion_percentage, status, last_accessed, updated_at) FROM stdin;
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quiz_attempts (id, quiz_id, student_id, score, started_at, completed_at, attempt_number) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quizzes (id, lesson_id, created_by, title, description, total_marks, duration_minutes, attempts_allowed, created_at, class_id, due_date, time_limit, questions, updated_at) FROM stdin;
f55c7110-e357-49ff-8321-6476ba4b0b03	\N	960c27c3-f305-4e53-bd47-9ecd4ff3145c	thermodynamics 3 laws Assessmentlaws of thermodynamics	\N	100	\N	1	2026-10-10 07:10:38.979	c22e71d3-5130-4e74-9c8f-27d16466b7a0	2026-10-10 00:00:00	30	[{"id": "1791596412001", "type": "multiple_choice", "options": ["ΔU = Q + W", "ΔU = Q - W", "ΔU = W - Q", "ΔU = 0"], "questionText": "Which of the following best represents the first law of thermodynamics?", "correctAnswer": "B"}, {"id": "1791596412002", "type": "true_false", "options": ["A", "B", "C", "D"], "questionText": "The second law of thermodynamics states that entropy of an isolated system can never decrease.", "correctAnswer": "True"}, {"id": "1791596412003", "type": "multiple_choice", "options": ["Infinite", "Zero", "Negative", "Undefined"], "questionText": "According to the third law of thermodynamics, the entropy of a perfect crystal at absolute zero is:", "correctAnswer": "B"}, {"id": "1791596412004", "type": "true_false", "options": ["A", "B", "C", "D"], "questionText": "At absolute zero temperature, all molecular motion ceases.", "correctAnswer": "True"}, {"id": "1791596412005", "type": "multiple_choice", "options": ["Heat engines can operate with 100% efficiency", "The entropy of a system approaches zero as temperature approaches absolute zero", "Energy cannot be created or destroyed", "Heat flows spontaneously from cold to hot"], "questionText": "Which of the following is a direct consequence of the third law?", "correctAnswer": "B"}]	2026-10-10 07:10:38.979
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (id, student_id, generated_by, report_type, report_url, remarks, created_at) FROM stdin;
\.


--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rewards (id, student_id, badge_id, reward_name, reward_type, reward_value, awarded_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, role_name, description, created_at) FROM stdin;
f297510f-2182-4cc8-a523-226c232d3da3	Platform Admin	Owner of the LearnBeyond platform	2026-07-18 13:26:02.170477
58523491-ca37-4958-b78d-70d7af3419ee	Institution Admin	Administrator of a school or institution	2026-07-18 13:26:02.170477
624cb6f2-4254-42cb-8c75-84e0ffde3a45	Student	Learner using the platform	2026-07-18 13:26:02.170477
a9da68ad-b2c6-44be-9d23-2ae0e5f85329	Parent	Parent or guardian	2026-07-18 13:26:02.170477
6a31aefb-6f42-4c1b-986d-0391c6cced74	Therapist	Learning or behavioral therapist	2026-07-18 13:26:02.170477
b150eed3-274c-4b79-a883-c0c2440cf570	Teacher	Teacher or institution staff	2026-07-18 13:26:02.170477
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, user_id, theme, language, notifications_enabled, dark_mode, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_profiles (id, user_id, institution_id, employee_id, designation, qualification, experience, joined_on, created_at, updated_at) FROM stdin;
65bce3f9-96f7-42f1-b8a4-a62d36146ba3	960c27c3-f305-4e53-bd47-9ecd4ff3145c	92599bdf-d00e-4f1a-abb2-8d2d899b2240	T-7f68ca	\N	\N	0	\N	2026-10-09 21:39:47.884713	2026-10-09 21:39:47.884713
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_profiles (id, user_id, institution_id, class_id, admission_number, roll_number, learning_style_id, joined_on, emergency_contact, created_at, updated_at) FROM stdin;
ad923dc0-aab2-42a5-8db9-aa5ef2f4bc80	f5959a93-9bca-490f-b20f-efbded482d16	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	S-a795d2	\N	\N	2026-10-09	\N	2026-10-09 21:41:23.002753	2026-10-09 21:41:23.002753
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.submissions (id, assignment_id, student_id, created_at, submission_url, score, feedback, status, assessment_id, assessment_type, content, files, answers) FROM stdin;
\.


--
-- Data for Name: therapist_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.therapist_profiles (id, user_id, institution_id, specialization, qualification, experience, license_number, created_at, updated_at) FROM stdin;
bf0d92ff-f553-4edd-aaca-f4a345e01fb8	741b4fb5-dc22-4ff4-9723-6fa2b42e0c50	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	\N	0	\N	2026-10-09 21:40:26.065962	2026-10-09 21:40:26.065962
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, role_id, institution_id, created_by, first_name, last_name, username, email, phone, password_hash, profile_photo, date_of_birth, gender, account_status, email_verified, phone_verified, last_login, created_at, updated_at, deleted_at, is_active, bio, address, cover_image, laura_state, app_state) FROM stdin;
0873c08c-3e07-48f8-a065-cac6c1d56144	58523491-ca37-4958-b78d-70d7af3419ee	\N	\N	Institution	Admin	school_admin	school@learnbeyond.edu	\N	$2b$10$7P4ATpnfGlw42vusuaylJOI4vug.rPyUQfmgQUdfQBakUddXRKnOS	\N	\N	\N	Active	f	f	\N	2026-10-09 21:15:02.741232	2026-10-09 21:15:02.741232	\N	t	\N	\N	\N	\N	{}
7426905a-59ca-4d0d-9c67-bc53b07c1425	b150eed3-274c-4b79-a883-c0c2440cf570	\N	\N	Jane	Smith	teacher_jane	teacher@learnbeyond.edu	\N	$2b$10$7P4ATpnfGlw42vusuaylJOI4vug.rPyUQfmgQUdfQBakUddXRKnOS	\N	\N	\N	Active	f	f	\N	2026-10-09 21:15:02.743597	2026-10-09 21:15:02.743597	\N	t	\N	\N	\N	\N	{}
8f668ba3-2dad-4517-89b4-94dd85ceb9e6	624cb6f2-4254-42cb-8c75-84e0ffde3a45	\N	\N	Johnny	Appleseed	student_johnny	student@learnbeyond.edu	\N	$2b$10$7P4ATpnfGlw42vusuaylJOI4vug.rPyUQfmgQUdfQBakUddXRKnOS	\N	\N	\N	Active	f	f	\N	2026-10-09 21:15:02.745152	2026-10-09 21:15:02.745152	\N	t	\N	\N	\N	\N	{}
44368ec0-f64f-401c-98d5-38473a9f59a8	a9da68ad-b2c6-44be-9d23-2ae0e5f85329	\N	\N	Martha	Appleseed	parent_martha	parent@learnbeyond.edu	\N	$2b$10$7P4ATpnfGlw42vusuaylJOI4vug.rPyUQfmgQUdfQBakUddXRKnOS	\N	\N	\N	Active	f	f	\N	2026-10-09 21:15:02.746505	2026-10-09 21:15:02.746505	\N	t	\N	\N	\N	\N	{}
b2cb3331-4df4-4f32-ba3e-94423710495d	6a31aefb-6f42-4c1b-986d-0391c6cced74	\N	\N	Dr. John	Watson	therapist_watson	therapist@learnbeyond.edu	\N	$2b$10$7P4ATpnfGlw42vusuaylJOI4vug.rPyUQfmgQUdfQBakUddXRKnOS	\N	\N	\N	Active	f	f	\N	2026-10-09 21:15:02.747589	2026-10-09 21:15:02.747589	\N	t	\N	\N	\N	\N	{}
f563e448-55b1-42ea-801d-c299be812329	58523491-ca37-4958-b78d-70d7af3419ee	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	School	Admin	schooladmin	schooladmin@gmail.com	\N	$2b$10$RvFzr3QBTp8o.6hEc6HCIOKbOi5CCsOVu/jK.sBktVmTKdRN8DRwm	\N	\N	\N	Active	f	f	\N	2026-10-09 21:36:55.081594	2026-10-09 21:36:55.081594	\N	t	\N	\N	\N	\N	{}
f5959a93-9bca-490f-b20f-efbded482d16	624cb6f2-4254-42cb-8c75-84e0ffde3a45	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	Vishnu	Pranav	student1	student1@gmail.com	\N	$2b$10$QNdW4atL4OLwRhbUhg9i.OVY8UhLKg3F.fvVoetX3kD09hufjS18q	\N	\N	\N	Active	f	f	\N	2026-10-09 21:41:23.002753	2026-10-09 21:41:23.002753	\N	t	\N	\N	\N	\N	{}
610f6712-7125-475f-b011-16bda886f6df	a9da68ad-b2c6-44be-9d23-2ae0e5f85329	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	Gowsika	S	parent1	parent1@gmail.com	\N	$2b$10$Cl3f3qCq2NJMVHx2hyj.8Opci9rs2fq3tFcSH2YMDzlkMBtuw6e6i	\N	\N	\N	Active	f	f	\N	2026-10-09 21:42:46.154793	2026-10-09 21:42:46.154793	\N	t	\N	\N	\N	\N	{}
741b4fb5-dc22-4ff4-9723-6fa2b42e0c50	6a31aefb-6f42-4c1b-986d-0391c6cced74	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	Dharshini	C	therapist1	therapist1@gmail.com	\N	$2b$10$DLneUKNLRcNXVjyZd6a3geupp1B6WFQDEPSPsgYwEONPM0UN7M23y	\N	\N	\N	Active	f	f	\N	2026-10-09 21:40:26.065962	2026-10-10 10:52:23.856645	\N	t	\N	\N	\N	{"insights": {"dailySummary": "Laura supported 4 lessons and helped resolve 2 parent communications today.", "weeklySummary": "This week saw a 15% increase in worksheet downloads and math practice quiz participation.", "monthlySummary": "Total student engagement reached 89% with fine-motor progress showing upward momentum.", "usageAnalytics": [{"date": "Mon", "queries": 8}, {"date": "Tue", "queries": 12}, {"date": "Wed", "queries": 15}, {"date": "Thu", "queries": 9}, {"date": "Fri", "queries": 14}, {"date": "Sat", "queries": 4}, {"date": "Sun", "queries": 6}], "learningAnalytics": [{"label": "Speech & Language", "value": 78}, {"label": "Task Completion", "value": 85}, {"label": "Sensory Integration", "value": 65}, {"label": "Social & Emotional", "value": 90}], "productivityScore": 92}, "memories": [{"id": "mem-1", "key": "Work Style", "value": "Prefers structured step-by-step math guides", "category": "preference", "createdAt": "2026-10-10T05:20:19.361Z"}, {"id": "mem-2", "key": "Core Alert", "value": "Tommy Roberts has sensory processing sensitivities", "category": "fact", "createdAt": "2026-10-10T05:20:19.361Z"}], "sessions": [{"id": "session-1791609724004", "role": "Therapist", "files": [], "title": "what would be the better appro...", "pinned": false, "shared": false, "archived": false, "category": "General", "favorite": false, "messages": [{"id": "msg-1791609736841-v2th52isk", "role": "user", "content": "what would be the better approach to make student learn", "timestamp": "2026-10-10T05:22:16.841Z"}, {"id": "msg-1791609738602-dyd253k0b", "role": "assistant", "content": "## 📚 Strategies for Enhancing Student Learning\\n\\nBelow is a concise, evidence‑based toolkit you can adapt to your therapeutic setting.  \\nFeel free to mix and match techniques to suit each student’s unique profile.\\n\\n| **Goal** | **Approach** | **Key Components** | **Why It Works** |\\n|----------|--------------|--------------------|-----------------|\\n| **Build motivation** | *Goal‑setting & self‑efficacy* | • Short, attainable milestones<br>• Visual progress trackers<br>• Positive reinforcement | Enhances intrinsic motivation and creates a sense of ownership. |\\n| **Improve attention & engagement** | *Chunking + active learning* | • Break tasks into 5‑10 min segments<br>• Use quizzes, games, or role‑play<br>• Incorporate movement or sensory breaks | Keeps cognitive load manageable and prevents fatigue. |\\n| **Strengthen working memory** | *Retrieval practice & spaced repetition* | • Frequent low‑stakes quizzes<br>• Spaced review schedule (e.g., 1 day, 3 days, 7 days)<br>• Use flashcards or spaced‑learning apps | Retrieval consolidates memory traces; spacing reduces forgetting. |\\n| **Develop metacognition** | *Think‑aloud & reflection prompts* | • Model problem‑solving aloud<br>• Ask “What was your strategy?” after tasks<br>• Maintain a learning journal | Students become aware of their own thought processes and can adjust strategies. |\\n| **Foster social learning** | *Collaborative projects & peer tutoring* | • Pair students with complementary strengths<br>• Rotate roles (leader, recorder, questioner)<br>• Provide structured feedback rubrics | Social interaction promotes deeper processing and accountability. |\\n| **Address anxiety & self‑doubt** | *Cognitive‑behavioral techniques* | • Cognitive restructuring (challenge negative thoughts)<br>• Progressive muscle relaxation before tests<br>• Celebrate effort, not just outcome | Reduces test‑related anxiety and builds resilience. |\\n| **Customize for learning styles** | *Multimodal instruction* | • Combine visual (slides, diagrams), auditory (lectures, podcasts), kinesthetic (hands‑on tasks) | Aligns with individual preferences and reinforces content across modalities. |\\n| **Use technology wisely** | *Adaptive learning platforms* | • Software that adjusts difficulty based on performance (e.g., Khan Academy, Duolingo, Anki) | Provides personalized pacing and targeted feedback. |\\n| **Encourage self‑advocacy** | *Goal‑setting & progress monitoring* | • Teach students to set SMART goals<br>• Review progress weekly together<br>• Discuss barriers and solutions | Empowers students to take charge of their learning journey. |\\n\\n---\\n\\n### Quick Implementation Checklist\\n\\n1. **Assess Baseline**  \\n   • Short diagnostic quiz or observation  \\n   • Identify strengths, challenges, and preferred modalities  \\n\\n2. **Set SMART Goals**  \\n   • Specific, Measurable, Achievable, Relevant, Time‑bound  \\n\\n3. **Design a Mixed‑Method Lesson Plan**  \\n   • 20 min lecture → 10 min interactive activity → 5 min reflection  \\n\\n4. **Incorporate Retrieval Practice**  \\n   • End each session with a 3‑question quiz  \\n\\n5. **Schedule Spaced Reviews**  \\n   • Use a calendar or app to remind you of review sessions  \\n\\n6. **Reflect & Adjust**  \\n   • After each cycle, discuss what worked, what didn’t  \\n   • Adapt strategies accordingly  \\n\\n---\\n\\n## 🎯 Takeaway\\n\\nA *holistic*, *student‑centered* approach that blends motivation, cognitive strategies, social interaction, and technology tends to produce the best learning outcomes. Tailor these elements to each student’s needs, keep the process flexible, and celebrate progress along the way.  \\n\\nIf you’d like more detailed templates, sample lesson plans, or research references, just let me know!", "citations": [{"id": "cit-1", "title": "LearnBeyond Core AI Guidelines", "source": "System Documentation"}], "timestamp": "2026-10-10T05:22:18.602Z"}], "createdAt": "2026-10-10T05:22:04.005Z", "updatedAt": "2026-10-10T05:22:22.339Z"}], "settings": {"model": "Gemini 3.5 Flash", "voice": "female", "language": "English", "voiceSpeed": 1, "privacyMode": false, "temperature": 0.7, "responseLength": "balanced", "notificationsEnabled": true}, "activeSessionId": "session-1791609724004"}	{}
130854f9-3343-4d74-9540-9abb034a88d4	f297510f-2182-4cc8-a523-226c232d3da3	\N	\N	Platform	Admin	admin	admin@learnbeyond.edu	\N	$2b$10$7P4ATpnfGlw42vusuaylJOI4vug.rPyUQfmgQUdfQBakUddXRKnOS	\N	\N	\N	Active	f	f	\N	2026-10-09 21:15:02.735859	2026-10-10 11:03:40.81946	\N	t	\N	\N	\N	{"insights": {"dailySummary": "Laura supported 4 lessons and helped resolve 2 parent communications today.", "weeklySummary": "This week saw a 15% increase in worksheet downloads and math practice quiz participation.", "monthlySummary": "Total student engagement reached 89% with fine-motor progress showing upward momentum.", "usageAnalytics": [{"date": "Mon", "queries": 8}, {"date": "Tue", "queries": 12}, {"date": "Wed", "queries": 15}, {"date": "Thu", "queries": 9}, {"date": "Fri", "queries": 14}, {"date": "Sat", "queries": 4}, {"date": "Sun", "queries": 6}], "learningAnalytics": [{"label": "Speech & Language", "value": 78}, {"label": "Task Completion", "value": 85}, {"label": "Sensory Integration", "value": 65}, {"label": "Social & Emotional", "value": 90}], "productivityScore": 92}, "memories": [{"id": "mem-1", "key": "Work Style", "value": "Prefers structured step-by-step math guides", "category": "preference", "createdAt": "2026-10-09T16:05:04.827Z"}, {"id": "mem-2", "key": "Core Alert", "value": "Tommy Roberts has sensory processing sensitivities", "category": "fact", "createdAt": "2026-10-09T16:05:04.827Z"}], "sessions": [{"id": "session-1791561922141", "role": "Platform Admin", "files": [], "title": "hello", "pinned": false, "shared": false, "archived": false, "category": "General", "favorite": false, "messages": [{"id": "msg-1791561926426-816uf8qbq", "role": "user", "content": "hello", "timestamp": "2026-10-09T16:05:26.426Z"}, {"id": "msg-1791561927331-andjzxv08", "role": "assistant", "content": "👋 **Hello!**  \\nI’m **Laura AI**, your friendly educational assistant here on the LearnBeyond platform. Whether you’re looking to:\\n\\n- Manage courses and content  \\n- Track student progress and analytics  \\n- Optimize learning pathways for your users  \\n- Set up new integrations or automations  \\n\\nI’m here to help! Just let me know what you’d like to tackle today, and we’ll dive right in.  \\n\\n---  \\n\\n**Quick Tips for Platform Admins**  \\n| Task | How to Get Started |\\n|------|--------------------|\\n| **Create a new course** | Go to *Courses → Add New*, choose a template, and upload your materials. |\\n| **Set up learner cohorts** | Use the *Cohorts* tab to segment students by skill level, program, or custom tags. |\\n| **Generate analytics reports** | Navigate to *Analytics → Reports*; filter by date, cohort, or course to see engagement metrics. |\\n| **Integrate with external tools** | Head to *Integrations* and follow the step‑by‑step wizard for popular LMS, CRM, or analytics platforms. |\\n\\nFeel free to ask me any specific question or request a walkthrough of a feature!", "citations": [{"id": "cit-1", "title": "LearnBeyond Core AI Guidelines", "source": "System Documentation"}], "timestamp": "2026-10-09T16:05:27.331Z"}], "createdAt": "2026-10-09T16:05:22.142Z", "updatedAt": "2026-10-09T16:05:28.221Z"}], "settings": {"model": "Gemini 3.5 Flash", "voice": "female", "language": "English", "voiceSpeed": 1, "privacyMode": false, "temperature": 0.7, "responseLength": "balanced", "notificationsEnabled": true}, "activeSessionId": "session-1791561922141"}	{}
960c27c3-f305-4e53-bd47-9ecd4ff3145c	b150eed3-274c-4b79-a883-c0c2440cf570	92599bdf-d00e-4f1a-abb2-8d2d899b2240	\N	Ashwin	R M	staff1	staff1@gmail.com	\N	$2b$10$ls7qqiCEVvZKH8d9dkSt2.K5O5Y4fJYn8epoEKKHE3OqciXKJcmWq	\N	\N	\N	Active	f	f	\N	2026-10-09 21:39:47.884713	2026-10-10 11:06:16.150611	\N	t	\N	\N	\N	{"insights": {"dailySummary": "Laura supported 4 lessons and helped resolve 2 parent communications today.", "weeklySummary": "This week saw a 15% increase in worksheet downloads and math practice quiz participation.", "monthlySummary": "Total student engagement reached 89% with fine-motor progress showing upward momentum.", "usageAnalytics": [{"date": "Mon", "queries": 8}, {"date": "Tue", "queries": 12}, {"date": "Wed", "queries": 15}, {"date": "Thu", "queries": 9}, {"date": "Fri", "queries": 14}, {"date": "Sat", "queries": 4}, {"date": "Sun", "queries": 6}], "learningAnalytics": [{"label": "Speech & Language", "value": 78}, {"label": "Task Completion", "value": 85}, {"label": "Sensory Integration", "value": 65}, {"label": "Social & Emotional", "value": 90}], "productivityScore": 92}, "memories": [{"id": "mem-1", "key": "Work Style", "value": "Prefers structured step-by-step math guides", "category": "preference", "createdAt": "2026-10-10T05:35:34.342Z"}, {"id": "mem-2", "key": "Core Alert", "value": "Tommy Roberts has sensory processing sensitivities", "category": "fact", "createdAt": "2026-10-10T05:35:34.342Z"}], "sessions": [{"id": "session-1791610548284", "role": "Teacher", "files": [], "title": "hi laura what is the best way ...", "pinned": false, "shared": false, "archived": false, "category": "General", "favorite": false, "messages": [{"id": "msg-1791610567631-nvmp7u0tt", "role": "user", "content": "hi laura what is the best way to teaching?", "timestamp": "2026-10-10T05:36:07.631Z"}, {"id": "msg-1791610569316-l9iuqosg4", "role": "assistant", "content": "Hi there! 👋  \\nHere are some evidence‑based strategies that tend to work well across subjects and grade levels. Feel free to mix and match to fit your classroom culture and student needs.\\n\\n---\\n\\n## 1️⃣ Start with a Clear Purpose\\n\\n| What | Why | How |\\n|------|-----|-----|\\n| **Learning Goals** | Students know *what* they’re working toward. | Write SMART objectives (Specific, Measurable, Achievable, Relevant, Time‑bound). |\\n| **Success Criteria** | Sets the standard for success. | Create a rubric or a shared checklist that students can refer to during the lesson. |\\n| **Contextual Hook** | Sparks curiosity. | Use a real‑world problem, a short video, or a provocative question to frame the lesson. |\\n\\n---\\n\\n## 2️⃣ Adopt a Student‑Centered, Active‑Learning Approach\\n\\n| Strategy | Typical Activities | Benefits |\\n|----------|--------------------|----------|\\n| **Think‑Pair‑Share** | Students think individually, discuss with a partner, then share with the class. | Encourages reflection, peer learning, and lowers anxiety. |\\n| **Project‑Based Learning (PBL)** | Long‑term inquiry projects that culminate in a tangible product. | Builds critical thinking, collaboration, and real‑world relevance. |\\n| **Flipped Classroom** | Students watch short videos at home, then apply concepts in class. | Maximizes hands‑on time and allows for immediate feedback. |\\n| **Inquiry‑Based Lessons** | Students pose questions, design investigations, and analyze data. | Fosters curiosity and deepens conceptual understanding. |\\n\\n---\\n\\n## 3️⃣ Differentiate to Meet Diverse Learners\\n\\n| Need | Differentiation Tactics |\\n|------|------------------------|\\n| **Learning Styles** | Offer visual, auditory, and kinesthetic materials. |\\n| **Prior Knowledge** | Use pre‑assessments; provide tiered tasks. |\\n| **Language Proficiency** | Scaffold vocabulary, use sentence starters, and pair L2 students with bilingual peers. |\\n| **Accessibility** | Provide captions, large print, and assistive tech options. |\\n\\n---\\n\\n## 4️⃣ Formative Assessment & Feedback Loop\\n\\n| Tool | How to Use |\\n|------|------------|\\n| **Exit Tickets** | Quick 1‑sentence reflection at the end of class. |\\n| **Peer Review** | Structured rubrics for students to critique each other’s work. |\\n| **Digital Portfolios** | Use platforms like Google Sites or Seesaw to track progress over time. |\\n| **Real‑Time Polls** | Tools like Mentimeter or Kahoot! to gauge understanding instantly. |\\n\\n**Pro Tip:** Keep feedback specific, actionable, and timely—aim for a 24‑hour turnaround when possible.\\n\\n---\\n\\n## 5️⃣ Leverage Technology Wisely\\n\\n| Tool | Classroom Use |\\n|------|---------------|\\n| **Learning Management System (LMS)** | Central hub for resources, assignments, and grades. |\\n| **Interactive Simulations** | Physics, chemistry, or math models (e.g., PhET). |\\n| **Collaborative Docs** | Google Docs, Padlet for group brainstorming. |\\n| **Adaptive Learning Platforms** | Khan Academy, ALEKS for individualized practice. |\\n\\n---\\n\\n## 6️⃣ Build a Positive Classroom Culture\\n\\n| Element | Practice |\\n|---------|----------|\\n| **Growth Mindset** | Praise effort, not innate ability. |\\n| **Clear Expectations** | Display classroom rules and procedures. |\\n| **Student Voice** | Give students choices in topics or project formats. |\\n| **Social‑Emotional Learning (SEL)** | Short mindfulness breaks, check‑ins, and empathy circles. |\\n\\n---\\n\\n## 7️⃣ Continuous Professional Growth\\n\\n1. **Reflective Journaling** – Write a quick note after each lesson: what worked, what didn’t, and why.  \\n2. **Peer Observation** – Swap classrooms with a colleague and discuss observations.  \\n3. **Micro‑learning Modules** – Short, focused lessons on pedagogy (e.g., “Effective Questioning Techniques”).  \\n4. **Data‑Driven Decisions** – Review assessment data to identify learning gaps and adjust instruction.\\n\\n---\\n\\n### Quick Starter Checklist\\n\\n- [ ] Set clear, measurable objectives.  \\n- [ ] Plan at least one active‑learning activity per lesson.  \\n- [ ] Differentiate tasks for at least two student groups.  \\n- [ ] Incorporate a formative assessment.  \\n- [ ] Provide targeted feedback within 48 hrs.  \\n- [ ] Reflect on lesson outcomes in a brief journal entry.\\n\\n---\\n\\n**Need more resources?**  \\nExplore the LearnBeyond library for lesson templates, video tutorials, and research articles. If you’d like a customized lesson plan or a deeper dive into any of these strategies, just let me know! 📚✨", "citations": [{"id": "cit-1", "title": "LearnBeyond Core AI Guidelines", "source": "System Documentation"}], "timestamp": "2026-10-10T05:36:09.316Z"}], "createdAt": "2026-10-10T05:35:48.285Z", "updatedAt": "2026-10-10T05:36:14.634Z"}], "settings": {"model": "Gemini 3.5 Flash", "voice": "female", "language": "English", "voiceSpeed": 1, "privacyMode": false, "temperature": 0.7, "responseLength": "balanced", "notificationsEnabled": true}, "activeSessionId": "session-1791610548284"}	{}
\.


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_student_id_attendance_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_attendance_date_key UNIQUE (student_id, attendance_date);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_student_id_class_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_class_id_key UNIQUE (student_id, class_id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: institutions institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);


--
-- Name: laura_memory laura_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laura_memory
    ADD CONSTRAINT laura_memory_pkey PRIMARY KEY (id);


--
-- Name: learning_modules learning_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_modules
    ADD CONSTRAINT learning_modules_pkey PRIMARY KEY (id);


--
-- Name: learning_style learning_style_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_style
    ADD CONSTRAINT learning_style_pkey PRIMARY KEY (id);


--
-- Name: learning_style learning_style_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_style
    ADD CONSTRAINT learning_style_student_id_key UNIQUE (student_id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parent_profiles parent_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_pkey PRIMARY KEY (id);


--
-- Name: parent_profiles parent_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_user_id_key UNIQUE (user_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_role_id_permission_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_permission_name_key UNIQUE (role_id, permission_name);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (role_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: settings settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_key UNIQUE (user_id);


--
-- Name: staff_profiles staff_profiles_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_employee_id_key UNIQUE (employee_id);


--
-- Name: staff_profiles staff_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_profiles student_profiles_admission_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_admission_number_key UNIQUE (admission_number);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: therapist_profiles therapist_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_pkey PRIMARY KEY (id);


--
-- Name: therapist_profiles therapist_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_user_id_key UNIQUE (user_id);


--
-- Name: classes unique_class; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT unique_class UNIQUE (institution_id, grade, section, academic_year);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_attendance_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_student ON public.attendance USING btree (student_id);


--
-- Name: idx_class_institution; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_class_institution ON public.classes USING btree (institution_id);


--
-- Name: idx_lesson_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_class ON public.lessons USING btree (class_id);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_notification_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_user ON public.notifications USING btree (user_id);


--
-- Name: idx_parent_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_parent_user ON public.parent_profiles USING btree (user_id);


--
-- Name: idx_progress_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progress_student ON public.progress USING btree (student_id);


--
-- Name: idx_quiz_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quiz_student ON public.quiz_attempts USING btree (student_id);


--
-- Name: idx_reports_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_student ON public.reports USING btree (student_id);


--
-- Name: idx_staff_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_user ON public.staff_profiles USING btree (user_id);


--
-- Name: idx_student_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_user ON public.student_profiles USING btree (user_id);


--
-- Name: idx_therapist_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_therapist_user ON public.therapist_profiles USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: institutions_email_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX institutions_email_unique_idx ON public.institutions USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: users_email_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_unique_idx ON public.users USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: users_username_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_unique_idx ON public.users USING btree (username) WHERE (deleted_at IS NULL);


--
-- Name: achievements achievements_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: activities activities_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.learning_modules(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: assignments assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: assignments assignments_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: attendance attendance_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id);


--
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: classes fk_class_institution; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT fk_class_institution FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: classes fk_class_teacher; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT fk_class_teacher FOREIGN KEY (class_teacher_id) REFERENCES public.users(id);


--
-- Name: users fk_role; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: users fk_users_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users fk_users_institution; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_institution FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: goals goals_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: laura_memory laura_memory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.laura_memory
    ADD CONSTRAINT laura_memory_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: learning_modules learning_modules_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_modules
    ADD CONSTRAINT learning_modules_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: learning_style learning_style_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_style
    ADD CONSTRAINT learning_style_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parent_profiles parent_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: parent_profiles parent_profiles_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parent_profiles parent_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: permissions permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: progress progress_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id);


--
-- Name: progress progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: progress progress_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.learning_modules(id);


--
-- Name: progress progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: quizzes quizzes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: quizzes quizzes_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: reports reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(id);


--
-- Name: reports reports_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: rewards rewards_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id);


--
-- Name: rewards rewards_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: settings settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: staff_profiles staff_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: staff_profiles staff_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- Name: student_profiles student_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: therapist_profiles therapist_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: therapist_profiles therapist_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict vYIwGXeXRdYHRgRJm5CYn008emXKpjQZ5AvXGhABfa7WPSgwV3xBgjPAjBFPw5e

