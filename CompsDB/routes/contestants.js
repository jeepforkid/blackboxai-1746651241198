// استيراد المكتبات المطلوبة
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const ContestantsController = require('../controllers/contestantsController');

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
const validateContestant = [
    check('name')
        .notEmpty()
        .withMessage('اسم المتسابقة مطلوب')
        .isLength({ min: 2 })
        .withMessage('يجب أن يكون اسم المتسابقة أكثر من حرفين'),
    check('age')
        .optional()
        .isInt({ min: 1 })
        .withMessage('يجب أن يكون العمر رقماً صحيحاً وأكبر من صفر'),
    check('birth_date')
        .optional()
        .isDate()
        .withMessage('يجب أن يكون تاريخ الميلاد صحيحاً'),
    check('address')
        .optional()
        .isLength({ min: 5 })
        .withMessage('يجب أن يكون العنوان أكثر من 5 أحرف')
];

// عرض قائمة المتسابقات
router.get('/', ContestantsController.index);

// عرض نموذج إضافة متسابقة جديدة
router.get('/add', ContestantsController.showAddForm);

// إضافة متسابقة جديدة
router.post('/add', validateContestant, ContestantsController.create);

// عرض نموذج تعديل متسابقة
router.get('/edit/:id', ContestantsController.showEditForm);

// تحديث بيانات متسابقة
router.post('/edit/:id', validateContestant, ContestantsController.update);

// حذف متسابقة
router.post('/delete/:id', ContestantsController.delete);

// تصدير بيانات المتسابقات
router.get('/export', ContestantsController.export);

// استيراد بيانات المتسابقات
router.post('/import', upload.single('file'), ContestantsController.import);

// البحث عن المتسابقات
router.get('/search', ContestantsController.search);

// تحديث المشرفة للمتسابقات المحددة
router.post('/update-supervisor', [
    check('supervisor_id').isInt().withMessage('معرف المشرفة غير صحيح'),
    check('contestant_ids').isArray().withMessage('يجب تحديد متسابقة واحدة على الأقل')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { supervisor_id, contestant_ids } = req.body;
        await ContestantsController.updateSupervisor(contestant_ids, supervisor_id);
        
        req.flash('success', 'تم تحديث المشرفة للمتسابقات المحددة بنجاح');
        res.redirect('/contestants');
    } catch (error) {
        console.error('خطأ في تحديث المشرفة:', error);
        req.flash('error', 'حدث خطأ أثناء تحديث المشرفة');
        res.redirect('/contestants');
    }
});

// معالجة الأخطاء لرفع الملفات
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        req.flash('error', 'حدث خطأ أثناء رفع الملف');
    } else {
        req.flash('error', error.message);
    }
    res.redirect('/contestants');
});

module.exports = router;
