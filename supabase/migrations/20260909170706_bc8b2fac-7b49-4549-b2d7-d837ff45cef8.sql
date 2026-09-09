
CREATE TYPE public.app_role AS ENUM ('admin','student');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  city TEXT,
  country TEXT,
  college TEXT,
  degree TEXT,
  branch TEXT,
  current_year TEXT,
  graduation_year TEXT,
  cgpa TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  preferred_types TEXT[] NOT NULL DEFAULT '{}',
  target_role TEXT,
  preferred_industry TEXT,
  work_mode TEXT,
  experience_level TEXT,
  projects TEXT,
  achievements TEXT,
  resume_url TEXT,
  resume_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_deadlines BOOLEAN NOT NULL DEFAULT true,
  profile_public BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT,
  benefits TEXT,
  application_process TEXT,
  apply_url TEXT,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL DEFAULT 'India',
  work_mode TEXT NOT NULL DEFAULT 'Remote',
  experience_level TEXT NOT NULL DEFAULT 'Beginner',
  education_requirement TEXT,
  deadline DATE,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_demo BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published readable" ON public.opportunities FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert" ON public.opportunities FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update" ON public.opportunities FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete" ON public.opportunities FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX opportunities_category_idx ON public.opportunities (category);
CREATE INDEX opportunities_deadline_idx ON public.opportunities (deadline);

CREATE TABLE public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_opportunities TO authenticated;
GRANT ALL ON public.saved_opportunities TO service_role;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved" ON public.saved_opportunities FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Applied',
  notes TEXT,
  next_action TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (NEW.id, 'Welcome to OpportunityX', 'Complete your profile to unlock personalised recommendations.', 'profile');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.opportunities (title, organization, category, description, eligibility, benefits, application_process, apply_url, required_skills, location, work_mode, experience_level, education_requirement, deadline, is_premium) VALUES
('AI/ML Research Internship','NeuralGrid Labs','Internship','Work with a research team on applied machine learning problems in computer vision and NLP.','Undergraduate students in CS/IT/ECE with strong Python fundamentals.','Stipend, mentorship, certificate, possible pre-placement offer.','Apply online, submit a short task, then a technical interview.','https://example.com/apply','{"Python","AI/ML","Data Science","SQL"}','Bengaluru, India','Remote','Intermediate','B.Tech / B.E. / BSc','2026-11-20',false),
('Full-Stack Web Development Internship','Kavach Technologies','Internship','Build production features across a React frontend and Node.js backend.','Students in 3rd or 4th year with a portfolio of web projects.','Stipend, code review mentorship, letter of recommendation.','Resume screening followed by a live coding round.','https://example.com/apply','{"React","JavaScript","Node.js","MongoDB"}','Pune, India','Hybrid','Beginner','Any engineering degree','2026-10-30',false),
('Cloud Engineering Summer Internship','Stratus Cloud','Internship','Support cloud migration projects and build automation for deployment pipelines.','Students with basic Linux and networking knowledge.','Stipend, cloud certification voucher.','Online assessment and interview.','https://example.com/apply','{"Cloud","SQL","Communication"}','Hyderabad, India','On-site','Intermediate','B.Tech / MCA','2026-12-05',true),
('Cybersecurity Analyst Trainee','SentinelOne Academy','Internship','Assist the security operations team with threat monitoring and incident triage.','Students interested in security with basic networking knowledge.','Stipend, security lab access, certification support.','Apply with a short statement of interest.','https://example.com/apply','{"Cybersecurity","Cloud","Communication"}','Remote','Remote','Beginner','Any degree','2026-11-10',false),
('Product Design (UI/UX) Internship','Fig & Frame Studio','Internship','Design user flows, wireframes and prototypes for client products.','Design portfolio required.','Stipend, portfolio mentorship.','Portfolio review and design challenge.','https://example.com/apply','{"UI/UX","Communication","Leadership"}','Mumbai, India','Hybrid','Beginner','Any degree','2026-10-25',false),
('Data Analyst Internship','InsightWorks','Internship','Build dashboards and analyse product usage data for growth teams.','Comfort with SQL and spreadsheets.','Stipend, analytics tooling training.','Online SQL test and interview.','https://example.com/apply','{"SQL","Data Science","Python"}','Delhi, India','Remote','Beginner','Any degree','2026-12-15',false),
('National Merit Scholarship for Engineering Students','Bharat Education Trust','Scholarship','Merit-based scholarship covering tuition support for engineering undergraduates.','CGPA above 8.0 and family income below the stated threshold.','Up to INR 75,000 per academic year.','Submit academic records and income proof.','https://example.com/apply','{"Communication"}','India','Remote','Beginner','Undergraduate engineering','2026-11-30',false),
('Women in Technology Scholarship','TechRise Foundation','Scholarship','Scholarship supporting women pursuing technology degrees.','Women students enrolled in a technology programme.','Tuition grant, mentorship and internship referrals.','Application form and essay.','https://example.com/apply','{"Communication","Leadership"}','India','Remote','Beginner','Any technology degree','2026-12-20',false),
('Global Research Fellowship Scholarship','Meridian Institute','Scholarship','Scholarship for students pursuing undergraduate research projects.','Students with a research proposal endorsed by a faculty guide.','Research grant and conference travel support.','Proposal submission and faculty review.','https://example.com/apply','{"Research","Data Science","Communication"}','Global','Hybrid','Advanced','Undergraduate or postgraduate','2027-01-15',true),
('AI Innovation Hackathon 2026','CodeStorm','Hackathon','36-hour hackathon focused on building AI-powered products for social impact.','Teams of 2-4 students.','Prize pool, mentorship, incubation support for winners.','Register your team and submit an idea abstract.','https://example.com/apply','{"Python","AI/ML","React","JavaScript"}','Bengaluru, India','On-site','Intermediate','Any degree','2026-10-18',false),
('FinTech Build Sprint','PayNext','Hackathon','Build payment and lending prototypes on an open banking sandbox.','Open to all students.','Cash prizes and internship interviews for top teams.','Team registration online.','https://example.com/apply','{"JavaScript","Node.js","Finance","SQL"}','Remote','Remote','Beginner','Any degree','2026-11-05',false),
('Smart Cities IoT Hackathon','UrbanEdge','Hackathon','Prototype IoT solutions for traffic, energy and waste management.','Students with hardware or embedded interest.','Hardware kits, prizes and pilot opportunities.','Register and submit a concept note.','https://example.com/apply','{"Python","Cloud","Leadership"}','Chennai, India','On-site','Intermediate','Engineering students','2026-12-01',true),
('National Coding Championship','AlgoArena','Competition','Multi-round competitive programming championship for college students.','Currently enrolled students.','Cash prizes, hiring shortlists.','Online qualifier followed by finals.','https://example.com/apply','{"Java","Python","SQL"}','India','Remote','Intermediate','Any degree','2026-10-28',false),
('Business Case Challenge','Apex Consulting','Competition','Solve a real business case and present recommendations to a jury.','Teams of 2-3 students from any discipline.','Prize money and internship interviews.','Submit a case deck online.','https://example.com/apply','{"Business","Finance","Communication","Leadership"}','Mumbai, India','Hybrid','Beginner','Any degree','2026-11-22',false),
('Data Science Prediction Contest','DataForge','Competition','Machine learning competition on a real-world tabular dataset.','Individual or team entries.','Prizes, leaderboard recognition, recruiter visibility.','Sign up and submit predictions.','https://example.com/apply','{"Python","Data Science","AI/ML","SQL"}','Remote','Remote','Advanced','Any degree','2026-12-10',true),
('Google Cloud Associate Engineer Certification Track','CloudPath Academy','Certification','Structured preparation programme for an associate cloud engineer certification.','Basic cloud familiarity recommended.','Study material, practice exams, exam voucher discount.','Enrol online.','https://example.com/apply','{"Cloud","SQL","Python"}','Online','Remote','Beginner','Any degree','2026-11-15',false),
('Full-Stack Developer Certification','DevCraft Institute','Certification','Project-based certification covering React, Node.js and databases.','Basic programming knowledge.','Capstone project, certificate, hiring partner network.','Enrol and complete the entry quiz.','https://example.com/apply','{"React","JavaScript","Node.js","MongoDB"}','Online','Remote','Beginner','Any degree','2026-12-31',false),
('Digital Marketing Professional Certificate','GrowthLab','Certification','Learn SEO, performance marketing and analytics with live campaigns.','Open to all students.','Certificate and live campaign experience.','Enrol online.','https://example.com/apply','{"Digital Marketing","Communication","Business"}','Online','Remote','Beginner','Any degree','2026-11-08',false),
('Deep Learning Bootcamp Workshop','NeuralGrid Labs','Workshop','Three-day intensive workshop on neural networks and model deployment.','Python fundamentals required.','Hands-on labs and completion certificate.','Register online, limited seats.','https://example.com/apply','{"Python","AI/ML","Data Science"}','Bengaluru, India','Hybrid','Intermediate','Any degree','2026-10-22',true),
('Resume and Interview Masterclass','CareerBridge','Workshop','Workshop on resume writing, portfolio building and interview technique.','Open to all students.','Resume review and mock interview.','Free registration.','https://example.com/apply','{"Communication","Leadership"}','Online','Remote','Beginner','Any degree','2026-10-15',false),
('Startup Founders Fellowship','Ignite Ventures','Fellowship','Six-month fellowship supporting student founders building early-stage startups.','Students with a working prototype or strong idea.','Grant funding, mentorship, investor demo day.','Application and pitch interview.','https://example.com/apply','{"Entrepreneurship","Business","Leadership","Communication"}','Bengaluru, India','Hybrid','Intermediate','Any degree','2026-12-12',true),
('Public Policy Research Fellowship','Civic Futures','Fellowship','Fellowship for students researching technology policy and digital governance.','Strong writing and research skills.','Stipend, publication support, policy network access.','Submit a writing sample.','https://example.com/apply','{"Research","Communication","Business"}','New Delhi, India','On-site','Advanced','Undergraduate or postgraduate','2027-01-20',false),
('Undergraduate Research Assistant - NLP Lab','Institute of Computing Sciences','Research','Assist doctoral researchers on natural language processing experiments.','Strong Python and basic ML knowledge.','Research credit, co-authorship opportunity.','Email application with transcript.','https://example.com/apply','{"Python","AI/ML","Research","Data Science"}','Kanpur, India','On-site','Advanced','Undergraduate CS students','2026-11-25',true),
('Part-Time Campus Content Creator','OpportunityX Campus','Part-time','Create campus-focused content and run community programmes part time.','Students available 8-10 hours per week.','Monthly stipend, marketing experience, referral letter.','Apply with sample content.','https://example.com/apply','{"Digital Marketing","Communication","Leadership"}','Remote','Remote','Beginner','Any degree','2026-10-20',false);
