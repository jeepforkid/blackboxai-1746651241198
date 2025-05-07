// استيراد المكتبات المطلوبة
const express = require('express');
const router = express.Router();

// استيراد المسارات الفرعية
const contestantsRouter = require('./contestants');
const supervisorsRouter = require('./supervisors');
const competitionsRouter = require('./competitions');
const scoresRouter = require('./scores');

// تسجيل المسارات الفرعية
router.use('/contestants', contestantsRouter);
router.use('/supervisors', supervisorsRouter);
router.use('/competitions', competitionsRouter);
router.use('/scores', scoresRouter);

// توجيه الصفحة الرئيسية إلى صفحة الدرجات
router.get('/', (req, res) => {
    res.redirect('/scores');
});

// معالجة الصفحات غير الموجودة
router.use((req, res) => {
    res.status(404).render('error', {
        title: 'صفحة غير موجودة',
        message: 'عذراً، الصفحة التي تبحث عنها غير موجودة',
        error: {
            status: 404,
            stack: process.env.NODE_ENV === 'development' ? 'الصفحة غير موجودة' : ''
        }
    });
});

// معالجة الأخطاء
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        title: 'خطأ في الخادم',
        message: 'عذراً، حدث خطأ في الخادم',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = router;
