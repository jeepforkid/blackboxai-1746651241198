// استيراد تكوين قاعدة البيانات
const db = require('../config/database');

class Contestant {
    // جلب جميع المتسابقات مع معلومات المشرفة
    static async getAllContestants() {
        try {
            const query = `
                SELECT 
                    c.*,
                    s.name as supervisor_name,
                    s.region as supervisor_region,
                    COUNT(DISTINCT sc.competition_id) as competitions_count,
                    ROUND(AVG(sc.score), 2) as average_score
                FROM contestants c
                LEFT JOIN supervisors s ON c.supervisor_id = s.id
                LEFT JOIN scores sc ON c.id = sc.contestant_id
                GROUP BY c.id, s.name, s.region
                ORDER BY c.created_at DESC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في جلب المتسابقات: ${error.message}`);
        }
    }

    // إضافة متسابقة جديدة
    static async create(contestantData) {
        try {
            const query = `
                INSERT INTO contestants (name, age, birth_date, address, supervisor_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const values = [
                contestantData.name,
                contestantData.age,
                contestantData.birth_date,
                contestantData.address,
                contestantData.supervisor_id
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في إضافة متسابقة جديدة: ${error.message}`);
        }
    }

    // تحديث بيانات متسابقة
    static async update(id, contestantData) {
        try {
            const query = `
                UPDATE contestants
                SET name = $1, age = $2, birth_date = $3, address = $4, supervisor_id = $5
                WHERE id = $6
                RETURNING *
            `;
            const values = [
                contestantData.name,
                contestantData.age,
                contestantData.birth_date,
                contestantData.address,
                contestantData.supervisor_id,
                id
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في تحديث بيانات المتسابقة: ${error.message}`);
        }
    }

    // حذف متسابقة
    static async delete(id) {
        try {
            const query = 'DELETE FROM contestants WHERE id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في حذف المتسابقة: ${error.message}`);
        }
    }

    // البحث عن متسابقات
    static async search(searchTerm) {
        try {
            const query = `
                SELECT 
                    c.*,
                    s.name as supervisor_name
                FROM contestants c
                LEFT JOIN supervisors s ON c.supervisor_id = s.id
                WHERE 
                    c.name ILIKE $1 OR
                    s.name ILIKE $1
                ORDER BY c.name
            `;
            const result = await db.query(query, [`%${searchTerm}%`]);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في البحث عن المتسابقات: ${error.message}`);
        }
    }

    // تحديث المشرفة للمتسابقات المحددة
    static async updateSupervisor(contestantIds, supervisorId) {
        try {
            const query = `
                UPDATE contestants
                SET supervisor_id = $1
                WHERE id = ANY($2)
                RETURNING *
            `;
            const result = await db.query(query, [supervisorId, contestantIds]);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في تحديث المشرفة للمتسابقات: ${error.message}`);
        }
    }

    // جلب درجات متسابقة معينة
    static async getContestantScores(contestantId) {
        try {
            const query = `
                SELECT 
                    s.score,
                    s.entry_date,
                    c.name as competition_name,
                    c.competition_date,
                    sup.name as supervisor_name
                FROM scores s
                JOIN competitions c ON s.competition_id = c.id
                LEFT JOIN supervisors sup ON s.supervisor_id = sup.id
                WHERE s.contestant_id = $1
                ORDER BY c.competition_date DESC
            `;
            const result = await db.query(query, [contestantId]);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في جلب درجات المتسابقة: ${error.message}`);
        }
    }
}

module.exports = Contestant;
