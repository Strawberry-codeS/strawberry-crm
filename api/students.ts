import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ── GET /api/students?search=xxx ──────────────────────────
    if (req.method === 'GET') {
        const search = req.query.search as string | undefined;
        let query = supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (search && search.trim()) {
            query = query.ilike('name', `%${search.trim()}%`);
        }

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // ── POST /api/students ────────────────────────────────────
    if (req.method === 'POST') {
        const body = req.body;

        if (!body || !body.name || !body.name.trim()) {
            return res.status(400).json({ error: '姓名不能为空' });
        }

        const newStudent = {
            name: body.name.trim(),
            phone: body.phone?.trim() || null,
            age: body.age ?? null,
            tags: body.tags ?? [],
            status: body.status ?? 'explore_3',
            stage: body.stage ?? 'opportunity',
            pause_time: body.pauseTime || null,
            current_task: body.currentTask?.trim() || null,
            avatar: body.avatar || null,
        };

        const { data, error } = await supabase
            .from('students')
            .insert([newStudent])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    // ── DELETE /api/students?id=xxx ───────────────────────────
    if (req.method === 'DELETE') {
        const id = req.query.id as string | undefined;

        if (!id) {
            return res.status(400).json({ error: '缺少学生 ID' });
        }

        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // ── 不支持的请求方法 ───────────────────────────────────────
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

