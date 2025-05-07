// استيراد المكتبات المطلوبة
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const SupervisorsController = require('../controllers/supervisorsController');

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
const validateSupervisor = [
    check('name')
        .notEmpty()
        .withMessage('اسم المشرفة مطلوب')
        .isLength({ min: 2 })
        .withMessage('يجب أن يكون اسم المشرفة أكثر من حرفين'),
    check('start_date')
        .notEmpty()
        .withMessage('تاريخ البدء مطلوب')
        .isDate()
        .withMessage('يجب أن يكون تاريخ البدء صحيحاً'),
    check('region')
        .optional()
        .isLength({ min: 2 })
        .withMessage('يجب أن تكون المنطقة أكثر من حرفين')
];

// عرض قائمة المشرفات
router.get('/', SupervisorsController.index);

// عرض نموذج إضافة مشرفة جديدة
router.get('/add', SupervisorsController.showAddForm);

// إضافة مشرفة جديدة
router.post('/add', validateSupervisor, SupervisorsController.create);

// عرض نموذج تعديل مشرفة
router.get('/edit/:id', SupervisorsController.showEditForm);

// تحديث بيانات مشرفة
router.post('/edit/:id', validateSupervisor, SupervisorsController.update);

// حذف مشرفة
router.post('/delete/:id', SupervisorsController.delete);

// تصدير بيانات المشرفات
router.get('/export', SupervisorsController.export);

// استيراد بيانات المشرفات
router.post('/import', upload.single('file'), SupervisorsController.import);

// البحث عن المشرفات
router.get('/search', SupervisorsController.search);

// جلب المتسابقات التابعات لمشرفة معينة
router.get('/:id/contestants', async (req, res) => {
    try {
        const contestants = await SupervisorsController.getSupervisorContestants(req.params.id);
        res.json(contestants);
    } catch (error) {
        console.error('خطأ في جلب متسابقات المشرفة:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء جلب بيانات المتسابقات' 
        });
    }
});

// جلب إحصائيات المشرفة
router.get('/:id/stats', async (req, res) => {
    try {
        const stats = await SupervisorsController.getSupervisorStats(req.params.id);
        res.json(stats);
    } catch (error) {
        console.error('خطأ في جلب إحصائيات المشرفة:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء جلب الإحصائيات' 
        });
    }
});

// معالجة الأخطاء لرفع الملفات
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        req.flash('error', 'حدث خطأ أثناء رفع الملف');
    } else {
        req.flash('error', error.message);
    }
    res.redirect('/supervisors');
});

module.exports = router;
