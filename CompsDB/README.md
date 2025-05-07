# نظام إدارة المسابقات (CompsDB)

نظام متكامل لإدارة المسابقات والمتسابقات والمشرفات وتتبع الدرجات.

## المميزات

- إدارة المتسابقات والمشرفات
- إدارة المسابقات والدرجات
- لوحة تحكم إحصائية
- تصدير واستيراد البيانات
- واجهة مستخدم عربية سهلة الاستخدام
- رسوم بيانية تفاعلية
- تصميم متجاوب مع جميع الأجهزة

## التقنيات المستخدمة

- **الواجهة الأمامية**: 
  - EJS
  - Tailwind CSS
  - Bootstrap 5
  - Chart.js
  - Font Awesome
  - DataTables
  - jQuery

- **الخادم**:
  - Node.js
  - Express.js
  - PostgreSQL
  - Sequelize ORM

## المتطلبات

- Node.js v14 أو أحدث
- PostgreSQL 12 أو أحدث
- npm أو yarn

## التثبيت المحلي

1. استنسخ المستودع:
```bash
git clone <رابط_المستودع>
cd CompsDB
```

2. ثبت الاعتماديات:
```bash
npm install
```

3. أنشئ ملف `.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/compsdb
SESSION_SECRET=your_secret_key_here
```

4. أنشئ قاعدة البيانات:
```bash
createdb compsdb
```

5. هيئ قاعدة البيانات:
```bash
npm run db:migrate
```

6. (اختياري) أضف بيانات تجريبية:
```bash
npm run db:seed
```

7. شغل التطبيق:
```bash
npm run dev
```

8. افتح المتصفح على العنوان:
```
http://localhost:3000
```

## 🚀 النشر على Render.com

### خطوات النشر السريعة
1. ارفع المشروع إلى GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <رابط_المستودع>
   git push -u origin main
   ```

2. في Render.com:
   - أنشئ قاعدة بيانات PostgreSQL
   - أنشئ Web Service جديد
   - اربط مستودع GitHub
   - أضف متغيرات البيئة:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=[رابط قاعدة البيانات]
     SESSION_SECRET=[قيمة عشوائية]
     ```
   - اضغط Create Web Service

📖 راجع [دليل النشر المفصل](./docs/render-deploy.md) للحصول على:
- ✨ شرح مفصل خطوة بخطوة مع الصور
- 🔧 حلول للمشاكل الشائعة
- 💡 نصائح وإرشادات مهمة للنشر والصيانة

## هيكل المشروع

```
CompsDB/
├── config/             # ملفات الإعداد
│   ├── database.js    # إعدادات قاعدة البيانات
│   └── schema.sql     # مخطط قاعدة البيانات
│
├── controllers/        # المتحكمات
│   ├── contestants.js # التحكم بالمتسابقات
│   ├── supervisors.js # التحكم بالمشرفات
│   ├── competitions.js# التحكم بالمسابقات
│   └── scores.js      # التحكم بالدرجات
│
├── models/            # النماذج
│   ├── Contestant.js  # نموذج المتسابقة
│   ├── Supervisor.js  # نموذج المشرفة
│   ├── Competition.js # نموذج المسابقة
│   └── Score.js      # نموذج الدرجة
│
├── routes/            # المسارات
│   ├── contestants.js # مسارات المتسابقات
│   ├── supervisors.js # مسارات المشرفات
│   ├── competitions.js# مسارات المسابقات
│   └── scores.js      # مسارات الدرجات
│
├── views/             # قوالب العرض
│   ├── partials/     # الأجزاء المشتركة
│   ├── contestants/  # صفحات المتسابقات
│   ├── supervisors/  # صفحات المشرفات
│   ├── competitions/ # صفحات المسابقات
│   └── scores/       # صفحات الدرجات
│
├── public/            # الملفات الثابتة
│   ├── css/          # أنماط CSS
│   ├── js/           # ملفات JavaScript
│   └── img/          # الصور
│
├── docs/             # الوثائق
│   └── deployment.md # دليل النشر
│
├── .env              # متغيرات البيئة
├── .gitignore       # ملفات مستثناة من Git
├── package.json     # تبعيات المشروع
├── README.md        # الوثائق الرئيسية
└── server.js        # نقطة البداية
```

## الوظائف الرئيسية

### المتسابقات
- إضافة وتعديل وحذف المتسابقات
- عرض درجات المتسابقة
- تتبع المسابقات المشاركة فيها
- إحصائيات وتقارير

### المشرفات
- إدارة المشرفات
- تخصيص متسابقات للمشرفة
- متابعة أداء المتسابقات
- تقارير وإحصائيات

### المسابقات
- إنشاء وتنظيم المسابقات
- تسجيل المشاركات
- إدارة الدرجات
- تقارير تفصيلية

### الدرجات
- تسجيل درجات المتسابقات
- حساب المتوسطات والإحصائيات
- تصدير النتائج
- تقارير الأداء

## المساهمة

1. Fork المستودع
2. أنشئ فرع للميزة: `git checkout -b feature/amazing-feature`
3. Commit التغييرات: `git commit -m 'Add amazing feature'`
4. Push إلى الفرع: `git push origin feature/amazing-feature`
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك اقتراحات، يرجى:
1. مراجعة [قسم المشاكل الشائعة](./docs/render-deploy.md#حل-المشاكل-الشائعة)
2. فتح issue جديد في المستودع
3. التواصل مع فريق الدعم

## شكر خاص

شكر خاص لجميع المساهمين في هذا المشروع والمكتبات المفتوحة المصدر المستخدمة.
