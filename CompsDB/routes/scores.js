// استيراد المكتبات المطلوبة
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const ScoresController = require('../controllers/scoresController');

// إعداد multer لرفع الملفات
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('نوع الملف غير مدعوم. يرجى استخدام ملف Excel أو CSV'));
        }
    }
});

// التحقق من صحة بيانات الدرجة
const validateScore = [
    check('contestant_id')
        .notEmpty()
        .withMessage('يجب اختيار المتسابقة')
        .isInt()
        .withMessage('معرف المتسابقة غير صحيح'),
    check('competition_id')
        .notEmpty()
        .withMessage('يجب اختيار المسابقة')
        .isInt()
        .withMessage('معرف المسابقة غير صحيح'),
    check('supervisor_id')
        .notEmpty()
        .withMessage('يجب اختيار المشرفة')
        .isInt()
        .withMessage('معرف المشرفة غير صحيح'),
    check('score')
        .notEmpty()
        .withMessage('الدرجة مطلوبة')
        .isFloat({ min: 0, max: 100 })
        .withMessage('يجب أن تكون الدرجة بين 0 و 100'),
    check('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('يجب أن لا تتجاوز الملاحظات 500 حرف')
];

// عرض صفحة الدرجات الرئيسية
router.get('/', ScoresController.index);

// إضافة درجة جديدة
router.post('/add', validateScore, ScoresController.create);

// تحديث درجة
router.post('/edit/:id', validateScore, ScoresController.update);

// حذف درجة
router.post('/delete/:id', ScoresController.delete);

// البحث المتقدم في الدرجات
router.get('/search', [
    check('contestant_name').optional().trim(),
    check('competition_name').optional().trim(),
    check('supervisor_name').optional().trim(),
    check('min_score').optional().isFloat({ min: 0 }),
    check('max_score').optional().isFloat({ max: 100 }),
    check('date_from').optional().isDate(),
    check('date_to').optional().isDate()
], ScoresController.advancedSearch);

// تصدير الدرجات
router.get('/export', ScoresController.export);

// استيراد درجات
router.post('/import', upload.single('file'), ScoresController.import);

// البحث في الوقت الحقيقي
router.get('/live-search', async (req, res) => {
    try {
        const searchParams = {
            contestant_name: req.query.contestant_name,
            competition_name: req.query.competition_name,
            supervisor_name: req.query.supervisor_name
        };
        const results = await ScoresController.advancedSearch(searchParams);
        res.json(results);
    } catch (error) {
        console.error('خطأ في البحث المباشر:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء البحث' });
    }
});

// جلب إحصائيات الدرجات
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalScores: await ScoresController.getTotalScores(),
            averageScore: await ScoresController.getAverageScore(),
            topPerformers: await ScoresController.getTopPerformers(),
            recentScores: await ScoresController.getRecentScores()
        };
        res.json(stats);
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات' });
    }
});

// معالجة الأخطاء لرفع الملفات
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        req.flash('error', 'حدث خطأ أثناء رفع الملف');
    } else {
        req.flash('error', error.message);
    }
    res.redirect('/scores');
});

module.exports = router;
