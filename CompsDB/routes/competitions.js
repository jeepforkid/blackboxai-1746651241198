// استيراد المكتبات المطلوبة
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const CompetitionsController = require('../controllers/competitionsController');

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

// التحقق من صحة البيانات
const validateCompetition = [
    check('name')
        .notEmpty()
        .withMessage('اسم المسابقة مطلوب')
        .isLength({ min: 2 })
        .withMessage('يجب أن يكون اسم المسابقة أكثر من حرفين'),
    check('competition_date')
        .notEmpty()
        .withMessage('تاريخ المسابقة مطلوب')
        .isDate()
        .withMessage('يجب أن يكون تاريخ المسابقة صحيحاً'),
    check('location')
        .optional()
        .isLength({ min: 2 })
        .withMessage('يجب أن يكون المكان أكثر من حرفين'),
    check('description')
        .optional()
        .isLength({ min: 10 })
        .withMessage('يجب أن يكون الوصف أكثر من 10 أحرف')
];

// التحقق من صحة بيانات الدرجات
const validateBulkScores = [
    check('competitionId')
        .isInt()
        .withMessage('معرف المسابقة غير صحيح'),
    check('scores.*.contestant_id')
        .isInt()
        .withMessage('معرف المتسابقة غير صحيح'),
    check('scores.*.supervisor_id')
        .isInt()
        .withMessage('معرف المشرفة غير صحيح'),
    check('scores.*.score')
        .isFloat({ min: 0, max: 100 })
        .withMessage('يجب أن تكون الدرجة بين 0 و 100')
];

// عرض قائمة المسابقات
router.get('/', CompetitionsController.index);

// عرض نموذج إضافة مسابقة جديدة
router.get('/add', CompetitionsController.showAddForm);

// إضافة مسابقة جديدة
router.post('/add', validateCompetition, CompetitionsController.create);

// عرض تفاصيل مسابقة
router.get('/details/:id', CompetitionsController.showDetails);

// عرض نموذج تعديل مسابقة
router.get('/edit/:id', CompetitionsController.showEditForm);

// تحديث بيانات مسابقة
router.post('/edit/:id', validateCompetition, CompetitionsController.update);

// حذف مسابقة
router.post('/delete/:id', CompetitionsController.delete);

// إضافة درجات متعددة للمسابقة
router.post('/bulk-scores', validateBulkScores, CompetitionsController.addBulkScores);

// تصدير بيانات المسابقات
router.get('/export', CompetitionsController.export);

// البحث عن المسابقات
router.get('/search', CompetitionsController.search);

// جلب المتسابقات غير المسجلات في مسابقة معينة
router.get('/:id/unregistered-contestants', async (req, res) => {
    try {
        const contestants = await CompetitionsController.getUnregisteredContestants(req.params.id);
        res.json(contestants);
    } catch (error) {
        console.error('خطأ في جلب المتسابقات غير المسجلات:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء جلب بيانات المتسابقات' 
        });
    }
});

// عرض صفحة إضافة المتسابقات والدرجات دفعة واحدة
router.get('/:id/bulk-add', async (req, res) => {
    try {
        const competition = await CompetitionsController.getCompetitionDetails(req.params.id);
        if (!competition) {
            req.flash('error', 'المسابقة غير موجودة');
            return res.redirect('/competitions');
        }

        const unregisteredContestants = await CompetitionsController.getUnregisteredContestants(req.params.id);
        
        res.render('competitions/bulk-add', {
            competition,
            unregisteredContestants,
            title: 'إضافة متسابقات ودرجات - ' + competition.name,
            messages: req.flash()
        });
    } catch (error) {
        console.error('خطأ في عرض صفحة الإضافة الجماعية:', error);
        req.flash('error', 'حدث خطأ أثناء تحميل الصفحة');
        res.redirect('/competitions');
    }
});

// معالجة الأخطاء لرفع الملفات
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        req.flash('error', 'حدث خطأ أثناء رفع الملف');
    } else {
        req.flash('error', error.message);
    }
    res.redirect('/competitions');
});

module.exports = router;
