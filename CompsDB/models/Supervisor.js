// استيراد تكوين قاعدة البيانات
const db = require('../config/database');

class Supervisor {
    // جلب جميع المشرفات مع إحصائيات المتسابقات
    static async getAllSupervisors() {
        try {
            const query = `
                SELECT 
                    s.*,
                    COUNT(DISTINCT c.id) as contestants_count,
                    COUNT(DISTINCT sc.id) as scores_count,
                    ROUND(AVG(sc.score), 2) as average_score
                FROM supervisors s
                LEFT JOIN contestants c ON s.id = c.supervisor_id
                LEFT JOIN scores sc ON s.id = sc.supervisor_id
                GROUP BY s.id
                ORDER BY s.created_at DESC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في جلب المشرفات: ${error.message}`);
        }
    }

    // إضافة مشرفة جديدة
    static async create(supervisorData) {
        try {
            const query = `
                INSERT INTO supervisors (name, start_date, region)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const values = [
                supervisorData.name,
                supervisorData.start_date,
                supervisorData.region
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في إضافة مشرفة جديدة: ${error.message}`);
        }
    }

    // تحديث بيانات مشرفة
    static async update(id, supervisorData) {
        try {
            const query = `
                UPDATE supervisors
                SET name = $1, start_date = $2, region = $3
                WHERE id = $4
                RETURNING *
            `;
            const values = [
                supervisorData.name,
                supervisorData.start_date,
                supervisorData.region,
                id
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في تحديث بيانات المشرفة: ${error.message}`);
        }
    }

    // حذف مشرفة
    static async delete(id) {
        try {
            const query = 'DELETE FROM supervisors WHERE id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في حذف المشرفة: ${error.message}`);
        }
    }

    // جلب المتسابقات التابعات لمشرفة معينة
    static async getSupervisorContestants(supervisorId) {
        try {
            const query = `
                SELECT 
                    c.*,
                    COUNT(DISTINCT s.competition_id) as competitions_count,
                    ROUND(AVG(s.score), 2) as average_score
                FROM contestants c
                LEFT JOIN scores s ON c.id = s.contestant_id
                WHERE c.supervisor_id = $1
                GROUP BY c.id
                ORDER BY c.name
            `;
            const result = await db.query(query, [supervisorId]);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في جلب متسابقات المشرفة: ${error.message}`);
        }
    }

    // البحث عن مشرفات
    static async search(searchTerm) {
        try {
            const query = `
                SELECT 
                    s.*,
                    COUNT(c.id) as contestants_count
                FROM supervisors s
                LEFT JOIN contestants c ON s.id = c.supervisor_id
                WHERE 
                    s.name ILIKE $1 OR
                    s.region ILIKE $1
                GROUP BY s.id
                ORDER BY s.name
            `;
            const result = await db.query(query, [`%${searchTerm}%`]);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في البحث عن المشرفات: ${error.message}`);
        }
    }

    // جلب إحصائيات المشرفة
    static async getSupervisorStats(supervisorId) {
        try {
            const query = `
                SELECT 
                    s.id,
                    s.name,
                    COUNT(DISTINCT c.id) as total_contestants,
                    COUNT(DISTINCT sc.competition_id) as total_competitions,
                    COUNT(sc.id) as total_scores,
                    ROUND(AVG(sc.score), 2) as average_score
                FROM supervisors s
                LEFT JOIN contestants c ON s.id = c.supervisor_id
                LEFT JOIN scores sc ON s.id = sc.supervisor_id
                WHERE s.id = $1
                GROUP BY s.id, s.name
            `;
            const result = await db.query(query, [supervisorId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في جلب إحصائيات المشرفة: ${error.message}`);
        }
    }
}

module.exports = Supervisor;
