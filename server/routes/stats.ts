import { Router, Request, Response } from 'express';
import { supabase } from '../supabase.js';

const router = Router();

// GET /api/stats - 获取 Dashboard 统计数据
router.get('/', async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('dashboard_stats')
            .select('*')
            .order('id', { ascending: true })
            .limit(1)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        const stats = {
            classEnrollment: {
                current: data.class_current ?? 0,
                target: data.class_target ?? 25,
            },
            refunds: {
                current: data.refunds_current ?? 0,
                limit: data.refunds_limit ?? 5,
            },
            recruitment: {
                current: data.recruitment_current ?? 0,
                target: data.recruitment_target ?? 20,
            },
            cash: {
                current: data.cash_current ?? 0,
                target: data.cash_target ?? 60000,
            },
        };

        return res.json(stats);
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/stats - 更新统计数据
router.put('/', async (req: Request, res: Response) => {
    try {
        const { classEnrollment, refunds, recruitment, cash } = req.body;

        const updateData: Record<string, unknown> = {};
        if (classEnrollment?.current !== undefined) updateData.class_current = classEnrollment.current;
        if (classEnrollment?.target !== undefined) updateData.class_target = classEnrollment.target;
        if (refunds?.current !== undefined) updateData.refunds_current = refunds.current;
        if (refunds?.limit !== undefined) updateData.refunds_limit = refunds.limit;
        if (recruitment?.current !== undefined) updateData.recruitment_current = recruitment.current;
        if (recruitment?.target !== undefined) updateData.recruitment_target = recruitment.target;
        if (cash?.current !== undefined) updateData.cash_current = cash.current;
        if (cash?.target !== undefined) updateData.cash_target = cash.target;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('dashboard_stats')
            .update(updateData)
            .eq('id', 1)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
