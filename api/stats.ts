import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // 查询进班学生数（stage = 'leading'，即已带领阶段）
        const { count: enrollmentCount, error: e1 } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('stage', 'leading');
        if (e1) throw e1;

        // 查询退费学生数（status = 'followed' 且有 pauseTime，作为退费近似）
        const { count: refundCount, error: e2 } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .not('pauseTime', 'is', null);
        if (e2) throw e2;

        // 查询招聘人数（stage = 'opportunity'，即机会阶段）
        const { count: recruitCount, error: e3 } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('stage', 'opportunity');
        if (e3) throw e3;

        // 返回前端期望的 DashboardStats 结构
        const stats = {
            classEnrollment: {
                current: enrollmentCount ?? 0,
                target: 30,
            },
            refunds: {
                current: refundCount ?? 0,
                limit: 5,
            },
            recruitment: {
                current: recruitCount ?? 0,
                target: 10,
            },
            cash: {
                current: 0,   // 现金数据暂无字段，兜底为 0
                target: 50000,
            },
        };

        return res.status(200).json(stats);
    } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Failed to fetch stats' });
    }
}
