// استيراد تكوين قاعدة البيانات
const db = require('../config/database');

class Score {
    // جلب جميع الدرجات مع التفاصيل المرتبطة
    static async getAllScores() {
        try {
            const query = `
                SELECT 
                    s.id,
                    s.score,
                    s.entry_date,
                    s.notes,
                    cont.name as contestant_name,
                    comp.name as competition_name,
                    comp.competition_date,
                    sup.name as supervisor_name
                FROM scores s
                JOIN contestants cont ON s.contestant_id = cont.id
                JOIN competitions comp ON s.competition_id = comp.id
                LEFT JOIN supervisors sup ON s.supervisor_id = sup.id
                ORDER BY s.entry_date DESC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في جلب الدرجات: ${error.message}`);
        }
    }

    // إضافة درجة جديدة
    static async create(scoreData) {
        try {
            const query = `
                INSERT INTO scores (contestant_id, competition_id, supervisor_id, score, notes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const values = [
                scoreData.contestant_id,
                scoreData.competition_id,
                scoreData.supervisor_id,
                scoreData.score,
                scoreData.notes
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في إضافة درجة جديدة: ${error.message}`);
        }
    }

    // تحديث درجة
    static async update(id, scoreData) {
        try {
            const query = `
                UPDATE scores
                SET score = $1, notes = $2, supervisor_id = $3
                WHERE id = $4
                RETURNING *
            `;
            const values = [
                scoreData.score,
                scoreData.notes,
                scoreData.supervisor_id,
                id
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في تحديث الدرجة: ${error.message}`);
        }
    }

    // حذف درجة
    static async delete(id) {
        try {
            const query = 'DELETE FROM scores WHERE id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في حذف الدرجة: ${error.message}`);
        }
    }

    // البحث المتقدم في الدرجات
    static async advancedSearch(searchParams) {
        try {
            let query = `
                SELECT 
                    s.id,
                    s.score,
                    s.entry_date,
                    cont.name as contestant_name,
                    comp.name as competition_name,
                    sup.name as supervisor_name
                FROM scores s
                JOIN contestants cont ON s.contestant_id = cont.id
                JOIN competitions comp ON s.competition_id = comp.id
                LEFT JOIN supervisors sup ON s.supervisor_id = sup.id
                WHERE 1=1
            `;
            const values = [];
            let paramCount = 1;

            if (searchParams.contestant_name) {
                query += ` AND cont.name ILIKE $${paramCount}`;
                values.push(`%${searchParams.contestant_name}%`);
                paramCount++;
            }

            if (searchParams.competition_name) {
                query += ` AND comp.name ILIKE $${paramCount}`;
                values.push(`%${searchParams.competition_name}%`);
                paramCount++;
            }

            if (searchParams.supervisor_name) {
                query += ` AND sup.name ILIKE $${paramCount}`;
                values.push(`%${searchParams.supervisor_name}%`);
                paramCount++;
            }

            if (searchParams.min_score) {
                query += ` AND s.score >= $${paramCount}`;
                values.push(searchParams.min_score);
                paramCount++;
            }

            if (searchParams.max_score) {
                query += ` AND s.score <= $${paramCount}`;
                values.push(searchParams.max_score);
                paramCount++;
            }

            if (searchParams.date_from) {
                query += ` AND s.entry_date >= $${paramCount}`;
                values.push(searchParams.date_from);
                paramCount++;
            }

            if (searchParams.date_to) {
                query += ` AND s.entry_date <= $${paramCount}`;
                values.push(searchParams.date_to);
                paramCount++;
            }

            query += ' ORDER BY s.entry_date DESC';

            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في البحث عن الدرجات: ${error.message}`);
        }
    }

    // استيراد درجات متعددة
    static async bulkImport(scoresData) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const insertQuery = `
                INSERT INTO scores (contestant_id, competition_id, supervisor_id, score, notes)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (contestant_id, competition_id) 
                DO UPDATE SET score = EXCLUDED.score, 
                            supervisor_id = EXCLUDED.supervisor_id,
                            notes = EXCLUDED.notes
            `;

            for (const score of scoresData) {
                await client.query(insertQuery, [
                    score.contestant_id,
                    score.competition_id,
                    score.supervisor_id,
                    score.score,
                    score.notes
                ]);
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`خطأ في استيراد الدرجات: ${error.message}`);
        } finally {
            client.release();
        }
    }

    // تصدير الدرجات حسب معايير محددة
    static async exportScores(criteria = {}) {
        try {
            let query = `
                SELECT 
                    cont.name as contestant_name,
                    comp.name as competition_name,
                    comp.competition_date,
                    s.score,
                    sup.name as supervisor_name,
                    s.entry_date,
                    s.notes
                FROM scores s
                JOIN contestants cont ON s.contestant_id = cont.id
                JOIN competitions comp ON s.competition_id = comp.id
                LEFT JOIN supervisors sup ON s.supervisor_id = sup.id
                WHERE 1=1
            `;
            const values = [];
            let paramCount = 1;

            // إضافة معايير التصفية إذا وجدت
            if (criteria.competition_id) {
                query += ` AND comp.id = $${paramCount}`;
                values.push(criteria.competition_id);
                paramCount++;
            }

            if (criteria.supervisor_id) {
                query += ` AND sup.id = $${paramCount}`;
                values.push(criteria.supervisor_id);
                paramCount++;
            }

            query += ' ORDER BY comp.competition_date DESC, cont.name';

            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في تصدير الدرجات: ${error.message}`);
        }
    }
}

module.exports = Score;
