CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: quiz_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quiz_category AS ENUM (
    'kepribadian',
    'fun',
    'mbti',
    'karir',
    'hubungan',
    'kesehatan',
    'lainnya'
);


--
-- Name: quiz_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quiz_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text,
    excerpt text,
    thumbnail_url text,
    banner_url text,
    category text DEFAULT 'umum'::text,
    status text DEFAULT 'draft'::text,
    is_featured boolean DEFAULT false,
    views_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT articles_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text])))
);


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    subtitle text,
    image_url text,
    link_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    option_text text NOT NULL,
    personality_scores jsonb DEFAULT '{}'::jsonb,
    option_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL,
    question_text text NOT NULL,
    question_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL,
    personality_type text NOT NULL,
    title text NOT NULL,
    description text,
    strengths text[] DEFAULT '{}'::text[],
    weaknesses text[] DEFAULT '{}'::text[],
    image_url text,
    min_score integer DEFAULT 0,
    max_score integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    short_description text,
    thumbnail_url text,
    banner_url text,
    category public.quiz_category DEFAULT 'kepribadian'::public.quiz_category,
    status public.quiz_status DEFAULT 'draft'::public.quiz_status,
    is_featured boolean DEFAULT false,
    estimated_time integer DEFAULT 5,
    is_iframe boolean DEFAULT false,
    iframe_url text,
    display_order integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    quiz_id uuid NOT NULL,
    result_id uuid,
    answers jsonb DEFAULT '{}'::jsonb,
    scores jsonb DEFAULT '{}'::jsonb,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: articles articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: quiz_options quiz_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_options
    ADD CONSTRAINT quiz_options_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_results quiz_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: user_quiz_attempts user_quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_articles_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_slug ON public.articles USING btree (slug);


--
-- Name: idx_articles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_status ON public.articles USING btree (status);


--
-- Name: articles update_articles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: banners update_banners_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quiz_questions update_quiz_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quiz_results update_quiz_results_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quiz_results_updated_at BEFORE UPDATE ON public.quiz_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quizzes update_quizzes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_settings update_site_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: quiz_options quiz_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_options
    ADD CONSTRAINT quiz_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id) ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_results quiz_results_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: user_quiz_attempts user_quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: user_quiz_attempts user_quiz_attempts_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.quiz_results(id) ON DELETE SET NULL;


--
-- Name: user_quiz_attempts user_quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: banners Admins can delete banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_options Admins can delete options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete options" ON public.quiz_options FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_questions Admins can delete questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete questions" ON public.quiz_questions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quizzes Admins can delete quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete quizzes" ON public.quizzes FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_results Admins can delete results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete results" ON public.quiz_results FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_settings Admins can delete settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete settings" ON public.site_settings FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: banners Admins can insert banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_options Admins can insert options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert options" ON public.quiz_options FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_questions Admins can insert questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert questions" ON public.quiz_questions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quizzes Admins can insert quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_results Admins can insert results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert results" ON public.quiz_results FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_settings Admins can insert settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: articles Admins can manage all articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all articles" ON public.articles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: banners Admins can update banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_options Admins can update options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update options" ON public.quiz_options FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_questions Admins can update questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update questions" ON public.quiz_questions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quizzes Admins can update quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update quizzes" ON public.quizzes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_results Admins can update results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update results" ON public.quiz_results FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_settings Admins can update settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_quiz_attempts Admins can view all attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all attempts" ON public.user_quiz_attempts FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: banners Admins can view all banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all banners" ON public.banners FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_options Admins can view all options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all options" ON public.quiz_options FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_questions Admins can view all questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all questions" ON public.quiz_questions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quizzes Admins can view all quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all quizzes" ON public.quizzes FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: quiz_results Admins can view all results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all results" ON public.quiz_results FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_quiz_attempts Anyone can insert attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert attempts" ON public.user_quiz_attempts FOR INSERT WITH CHECK (true);


--
-- Name: articles Anyone can read published articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read published articles" ON public.articles FOR SELECT USING ((status = 'published'::text));


--
-- Name: banners Anyone can view active banners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active banners" ON public.banners FOR SELECT USING ((is_active = true));


--
-- Name: quiz_options Anyone can view options of published quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view options of published quizzes" ON public.quiz_options FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.quiz_questions q
     JOIN public.quizzes qz ON ((q.quiz_id = qz.id)))
  WHERE ((q.id = quiz_options.question_id) AND (qz.status = 'published'::public.quiz_status)))));


--
-- Name: quizzes Anyone can view published quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published quizzes" ON public.quizzes FOR SELECT USING ((status = 'published'::public.quiz_status));


--
-- Name: quiz_questions Anyone can view questions of published quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view questions of published quizzes" ON public.quiz_questions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.quizzes
  WHERE ((quizzes.id = quiz_questions.quiz_id) AND (quizzes.status = 'published'::public.quiz_status)))));


--
-- Name: quiz_results Anyone can view results of published quizzes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view results of published quizzes" ON public.quiz_results FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.quizzes
  WHERE ((quizzes.id = quiz_results.quiz_id) AND (quizzes.status = 'published'::public.quiz_status)))));


--
-- Name: site_settings Anyone can view settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_quiz_attempts Users can view their own attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own attempts" ON public.user_quiz_attempts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

--
-- Name: banners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

--
-- Name: quizzes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_quiz_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;