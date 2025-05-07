// استيراد تكوين قاعدة البيانات
const db = require('../config/database');

class Competition {
    // جلب جميع المسابقات مع إحصائياتها
    static async getAllCompetitions() {
        try {
            const query = `
                SELECT 
                    c.*,
                    COUNT(DISTINCT s.contestant_id) as participants_count,
                    ROUND(AVG(s.score), 2) as average_score,
                    MAX(s.score) as highest_score,
                    MIN(s.score) as lowest_score
                FROM competitions c
                LEFT JOIN scores s ON c.id = s.competition_id
                GROUP BY c.id
                ORDER BY c.competition_date DESC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في جلب المسابقات: ${error.message}`);
        }
    }

    // إضافة مسابقة جديدة
    static async create(competitionData) {
        try {
            const query = `
                INSERT INTO competitions (name, description, competition_date, location)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const values = [
                competitionData.name,
                competitionData.description,
                competitionData.competition_date,
                competitionData.location
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في إضافة مسابقة جديدة: ${error.message}`);
        }
    }

    // تحديث بيانات مسابقة
    static async update(id, competitionData) {
        try {
            const query = `
                UPDATE competitions
                SET name = $1, description = $2, competition_date = $3, location = $4
                WHERE id = $5
                RETURNING *
            `;
            const values = [
                competitionData.name,
                competitionData.description,
                competitionData.competition_date,
                competitionData.location,
                id
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في تحديث بيانات المسابقة: ${error.message}`);
        }
    }

    // حذف مسابقة
    static async delete(id) {
        try {
            const query = 'DELETE FROM competitions WHERE id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في حذف المسابقة: ${error.message}`);
        }
    }

    // جلب تفاصيل مسابقة معينة مع المشاركات
    static async getCompetitionDetails(competitionId) {
        try {
            const query = `
                SELECT 
                    c.*,
                    json_agg(
                        json_build_object(
                            'contestant_id', cont.id,
                            'contestant_name', cont.name,
                            'score', s.score,
                            'supervisor_name', sup.name
                        )
                    ) as participants
                FROM competitions c
                LEFT JOIN scores s ON c.id = s.competition_id
                LEFT JOIN contestants cont ON s.contestant_id = cont.id
                LEFT JOIN supervisors sup ON s.supervisor_id = sup.id
                WHERE c.id = $1
                GROUP BY c.id
            `;
            const result = await db.query(query, [competitionId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`خطأ في جلب تفاصيل المسابقة: ${error.message}`);
        }
    }

    // إضافة درجات لمجموعة من المتسابقات في مسابقة معينة
    static async addBulkScores(competitionId, scoresData) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const insertScoreQuery = `
                INSERT INTO scores (competition_id, contestant_id, supervisor_id, score)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (contestant_id, competition_id) 
                DO UPDATE SET score = EXCLUDED.score, supervisor_id = EXCLUDED.supervisor_id
            `;

            for (const score of scoresData) {
                await client.query(insertScoreQuery, [
                    competitionId,
                    score.contestant_id,
                    score.supervisor_id,
                    score.score
                ]);
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`خطأ في إضافة الدرجات: ${error.message}`);
        } finally {
            client.release();
        }
    }

    // البحث عن مسابقات
    static async search(searchTerm) {
        try {
            const query = `
                SELECT 
                    c.*,
                    COUNT(DISTINCT s.contestant_id) as participants_count
                FROM competitions c
                LEFT JOIN scores s ON c.id = s.competition_id
                WHERE 
                    c.name ILIKE $1 OR
                    c.description ILIKE $1 OR
                    c.location ILIKE $1
                GROUP BY c.id
                ORDER BY c.competition_date DESC
            `;
            const result = await db.query(query, [`%${searchTerm}%`]);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في البحث عن المسابقات: ${error.message}`);
        }
    }

    // جلب المتسابقات غير المسجلات في مسابقة معينة
    static async getUnregisteredContestants(competitionId) {
        try {
            const query = `
                SELECT 
                    c.*,
                    s.name as supervisor_name
                FROM contestants c
                LEFT JOIN supervisors s ON c.supervisor_id = s.id
                WHERE c.id NOT IN (
                    SELECT contestant_id 
                    FROM scores 
                    WHERE competition_id = $1
                )
                ORDER BY c.name
            `;
            const result = await db.query(query, [competitionId]);
            return result.rows;
        } catch (error) {
            throw new Error(`خطأ في جلب المتسابقات غير المسجلات: ${error.message}`);
        }
    }
}

module.exports = Competition;
