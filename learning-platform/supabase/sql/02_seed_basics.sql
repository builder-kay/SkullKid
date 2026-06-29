begin;

-- Subjects
insert into public.subjects (code, title, description)
values
  ('MATHEMATICS', 'Mathematics', 'Everyday math using market, transport, and school-life examples.'),
  ('ENGLISH', 'English', 'Reading, comprehension, and writing for confident communication.'),
  ('SCIENCE', 'Science', 'Practical science connected to farming, weather, health, and daily life.')
on conflict (code) do update set
  title = excluded.title,
  description = excluded.description;

-- Badges
insert into public.badges (name, description, icon)
values
  ('Perfect Score', 'Score 100% in a quiz.', 'Sparkles'),
  ('Math Wizard', 'Complete 5 mathematics lessons.', 'Calculator'),
  ('Science Explorer', 'Master a science learning path.', 'FlaskConical'),
  ('7-Day Streak', 'Learn every day for one week.', 'Flame'),
  ('Fast Learner', 'Complete 3 lessons in quick succession.', 'Zap')
on conflict (name) do update set
  description = excluded.description,
  icon = excluded.icon;

-- Optional starter classroom
insert into public.classrooms (name, grade)
values ('P6A', 6)
on conflict do nothing;

commit;
