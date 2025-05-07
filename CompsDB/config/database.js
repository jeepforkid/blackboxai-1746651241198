// تكوين الاتصال بقاعدة البيانات
const { Pool } = require('pg');
require('dotenv').config();

// إنشاء مجمع اتصالات قاعدة البيانات
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // مطلوب للاتصال بقاعدة البيانات على Render.com
    }
});

// اختبار الاتصال
pool.connect((err, client, release) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', err.stack);
    } else {
        console.log('تم الاتصال بقاعدة البيانات بنجاح');
    }
});

// تصدير مجمع الاتصالات
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
