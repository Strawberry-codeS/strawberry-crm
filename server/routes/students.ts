import { Router, Request, Response } from 'express';
import { supabase } from '../supabase.js';

const router = Router();

// GET /api/students - 获取学生列表（支持搜索）
router.get('/', async (req: Request, res: Response) => {
    try {
        const { search, stage, status } = req.query;

        let query = supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (search && typeof search === 'string' && search.trim()) {
            query = query.or(`name.ilike.%${search}%,id.ilike.%${search}%`);
        }

        if (stage && typeof stage === 'string') {
            query = query.eq('stage', stage);
        }

        if (status && typeof status === 'string') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        // 将 snake_case 字段映射回前端期望的 camelCase 格式
        const students = (data || []).map(mapDbToStudent);
        return res.json(students);
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/students - 新增学生
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, phone, age, tags, status, pauseTime, currentTask, stage, avatar } = req.body;

        if (!name) {
            return res.status(400).json({ error: '姓名不能为空' });
        }

        const { data, error } = await supabase
            .from('students')
            .insert([{
                name,
                phone: phone || null,
                age: age ? Number(age) : null,
                tags: tags || [],
                status: status || 'explore_3',
                pause_time: pauseTime || null,
                current_task: currentTask || null,
                stage: stage || 'opportunity',
                avatar: avatar || null,
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(mapDbToStudent(data));
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/students/:id - 更新学生
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, phone, age, tags, status, pauseTime, currentTask, stage, avatar } = req.body;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (age !== undefined) updateData.age = Number(age);
        if (tags !== undefined) updateData.tags = tags;
        if (status !== undefined) updateData.status = status;
        if (pauseTime !== undefined) updateData.pause_time = pauseTime;
        if (currentTask !== undefined) updateData.current_task = currentTask;
        if (stage !== undefined) updateData.stage = stage;
        if (avatar !== undefined) updateData.avatar = avatar;

        const { data, error } = await supabase
            .from('students')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: '学生不存在' });
        }

        return res.json(mapDbToStudent(data));
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/students/:id - 删除学生
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, message: '学生已删除' });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 数据库字段（snake_case）映射为前端格式（camelCase）
function mapDbToStudent(row: Record<string, unknown>) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        age: row.age,
        tags: row.tags || [],
        status: row.status,
        pauseTime: row.pause_time,
        currentTask: row.current_task,
        stage: row.stage,
        avatar: row.avatar,
        createdAt: row.created_at
            ? new Date(row.created_at as string).toLocaleString('zh-CN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            }).replace(/\//g, '-')
            : '',
    };
}

export default router;
