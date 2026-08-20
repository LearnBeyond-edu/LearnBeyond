--
-- PostgreSQL database dump
--

\restrict aISDcPoXad1RrtF7Hnkrha5a8rbFRotUZRD9qSdrdQ2CrmXdC1XIXDrMK8GHAXj

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    earned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.achievements OWNER TO postgres;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.assignments OWNER TO postgres;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.badges OWNER TO postgres;

--
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255),
    conversation_type character varying(50) DEFAULT 'Laura'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    enrolled_on date DEFAULT CURRENT_DATE,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    rating integer,
    feedback text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.feedback OWNER TO postgres;

--
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.goals OWNER TO postgres;

--
-- Name: institutions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.institutions OWNER TO postgres;

--
-- Name: laura_memory; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.laura_memory OWNER TO postgres;

--
-- Name: learning_modules; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.learning_modules OWNER TO postgres;

--
-- Name: learning_style; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.learning_style OWNER TO postgres;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: parent_profiles; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.parent_profiles OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: progress; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.progress OWNER TO postgres;

--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.quizzes OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: rewards; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.rewards OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: staff_profiles; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.staff_profiles OWNER TO postgres;

--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: therapist_profiles; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.therapist_profiles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_student_id_attendance_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_attendance_date_key UNIQUE (student_id, attendance_date);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_student_id_class_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_class_id_key UNIQUE (student_id, class_id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: institutions institutions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.institutions
    ADD CONSTRAINT institutions_pkey PRIMARY KEY (id);


--
-- Name: laura_memory laura_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laura_memory
    ADD CONSTRAINT laura_memory_pkey PRIMARY KEY (id);


--
-- Name: learning_modules learning_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_modules
    ADD CONSTRAINT learning_modules_pkey PRIMARY KEY (id);


--
-- Name: learning_style learning_style_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_style
    ADD CONSTRAINT learning_style_pkey PRIMARY KEY (id);


--
-- Name: learning_style learning_style_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_style
    ADD CONSTRAINT learning_style_student_id_key UNIQUE (student_id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parent_profiles parent_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_pkey PRIMARY KEY (id);


--
-- Name: parent_profiles parent_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_user_id_key UNIQUE (user_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_role_id_permission_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_permission_name_key UNIQUE (role_id, permission_name);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (role_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: settings settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_key UNIQUE (user_id);


--
-- Name: staff_profiles staff_profiles_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_employee_id_key UNIQUE (employee_id);


--
-- Name: staff_profiles staff_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_key UNIQUE (user_id);


--
-- Name: student_profiles student_profiles_admission_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_admission_number_key UNIQUE (admission_number);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: therapist_profiles therapist_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_pkey PRIMARY KEY (id);


--
-- Name: therapist_profiles therapist_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_user_id_key UNIQUE (user_id);


--
-- Name: classes unique_class; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT unique_class UNIQUE (institution_id, grade, section, academic_year);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_attendance_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_student ON public.attendance USING btree (student_id);


--
-- Name: idx_class_institution; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_class_institution ON public.classes USING btree (institution_id);


--
-- Name: idx_lesson_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesson_class ON public.lessons USING btree (class_id);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_notification_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_user ON public.notifications USING btree (user_id);


--
-- Name: idx_parent_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parent_user ON public.parent_profiles USING btree (user_id);


--
-- Name: idx_progress_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_student ON public.progress USING btree (student_id);


--
-- Name: idx_quiz_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quiz_student ON public.quiz_attempts USING btree (student_id);


--
-- Name: idx_reports_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_student ON public.reports USING btree (student_id);


--
-- Name: idx_staff_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_user ON public.staff_profiles USING btree (user_id);


--
-- Name: idx_student_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_user ON public.student_profiles USING btree (user_id);


--
-- Name: idx_therapist_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_therapist_user ON public.therapist_profiles USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: institutions_email_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX institutions_email_unique_idx ON public.institutions USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: users_email_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_unique_idx ON public.users USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: users_username_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_unique_idx ON public.users USING btree (username) WHERE (deleted_at IS NULL);


--
-- Name: achievements achievements_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: activities activities_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.learning_modules(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: assignments assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: assignments assignments_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: attendance attendance_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id);


--
-- Name: attendance attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: classes fk_class_institution; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT fk_class_institution FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: classes fk_class_teacher; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT fk_class_teacher FOREIGN KEY (class_teacher_id) REFERENCES public.users(id);


--
-- Name: users fk_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: users fk_users_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users fk_users_institution; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_institution FOREIGN KEY (institution_id) REFERENCES public.institutions(id);


--
-- Name: goals goals_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: laura_memory laura_memory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laura_memory
    ADD CONSTRAINT laura_memory_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: learning_modules learning_modules_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_modules
    ADD CONSTRAINT learning_modules_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: learning_style learning_style_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_style
    ADD CONSTRAINT learning_style_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parent_profiles parent_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: parent_profiles parent_profiles_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: parent_profiles parent_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_profiles
    ADD CONSTRAINT parent_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: permissions permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: progress progress_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id);


--
-- Name: progress progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: progress progress_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.learning_modules(id);


--
-- Name: progress progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: quizzes quizzes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: quizzes quizzes_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: reports reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(id);


--
-- Name: reports reports_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: rewards rewards_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id);


--
-- Name: rewards rewards_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: settings settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: staff_profiles staff_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: staff_profiles staff_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- Name: student_profiles student_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student_profiles(id) ON DELETE CASCADE;


--
-- Name: therapist_profiles therapist_profiles_institution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;


--
-- Name: therapist_profiles therapist_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.therapist_profiles
    ADD CONSTRAINT therapist_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict aISDcPoXad1RrtF7Hnkrha5a8rbFRotUZRD9qSdrdQ2CrmXdC1XIXDrMK8GHAXj

