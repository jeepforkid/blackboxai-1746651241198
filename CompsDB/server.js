// استيراد المكتبات المطلوبة
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// إنشاء تطبيق Express
const app = express();

// إعداد المشغلات الوسيطة (Middleware)
app.use(cors());
app.use(morgan('dev')); // تسجيل الطلبات HTTP
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// إعداد محرك العرض EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// استيراد المسارات
const contestantsRouter = require('./routes/contestants');
const supervisorsRouter = require('./routes/supervisors');
const competitionsRouter = require('./routes/competitions');
const scoresRouter = require('./routes/scores');

// تسجيل المسارات
app.use('/contestants', contestantsRouter);
app.use('/supervisors', supervisorsRouter);
app.use('/competitions', competitionsRouter);
app.use('/scores', scoresRouter);

// توجيه الصفحة الرئيسية إلى صفحة الدرجات
app.get('/', (req, res) => {
    res.redirect('/scores');
});

// معالج الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'حدث خطأ في الخادم',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
