import { createClient } from '@supabase/supabase-js';

// 直接写死正确的 URL 和 Key（仅测试用，后续改回 .env）
const supabaseUrl = "https://dcapochlqkjxowttemsf.supabase.co";
const supabaseKey = "sb_publishable_-wDxk2W2kOYKsbPwyipuMQ_piO1JBVD";

// 强制校验
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('URL 必须以 https:// 开头');
}

// 创建客户端
export const supabase = createClient(supabaseUrl, supabaseKey);