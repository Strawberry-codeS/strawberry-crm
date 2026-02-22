-- ================================================
-- Strawberry CRM - Supabase 数据库建表 SQL
-- 请在 Supabase Dashboard > SQL Editor 中执行
-- ================================================

-- 1. 学生表
CREATE TABLE IF NOT EXISTS students (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  phone        text,
  age          numeric,
  tags         text[]      NOT NULL DEFAULT '{}',
  status       text        NOT NULL DEFAULT 'explore_3'
               CHECK (status IN ('explore_3','explore_2','followed','pending_visit')),
  pause_time   text,
  current_task text,
  stage        text        NOT NULL DEFAULT 'opportunity'
               CHECK (stage IN ('opportunity','leading')),
  avatar       text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 2. 仪表盘统计表
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id                  serial      PRIMARY KEY,
  class_current       int         NOT NULL DEFAULT 0,
  class_target        int         NOT NULL DEFAULT 25,
  refunds_current     int         NOT NULL DEFAULT 0,
  refunds_limit       int         NOT NULL DEFAULT 5,
  recruitment_current int         NOT NULL DEFAULT 0,
  recruitment_target  int         NOT NULL DEFAULT 20,
  cash_current        numeric     NOT NULL DEFAULT 0,
  cash_target         numeric     NOT NULL DEFAULT 60000,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 插入默认统计行（只需要一行）
INSERT INTO dashboard_stats DEFAULT VALUES
  ON CONFLICT DO NOTHING;

-- 3. 为学生表开启 Row Level Security（可选，供生产环境使用）
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

-- 允许所有人读写（开发阶段）：
-- CREATE POLICY "allow all" ON students FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "allow all" ON dashboard_stats FOR ALL USING (true) WITH CHECK (true);
