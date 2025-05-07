# دليل نشر التطبيق على Render.com

## المتطلبات الأساسية

1. حساب على موقع [Render.com](https://render.com)
2. حساب على [GitHub](https://github.com) لاستضافة الكود
3. قاعدة بيانات PostgreSQL (يمكن إنشاؤها على Render.com)

## الخطوات

### 1. إعداد قاعدة البيانات

1. من لوحة التحكم في Render.com، اختر "New +"
2. اختر "PostgreSQL"
3. املأ المعلومات التالية:
   - Name: `compsdb-postgres` (أو أي اسم آخر)
   - Database: `compsdb`
   - User: `compsdb_user`
   - Region: اختر المنطقة الأقرب لموقعك
4. انقر على "Create Database"
5. احفظ معلومات الاتصال التي ستظهر لك:
   - Internal Database URL
   - External Database URL
   - PSQL Command

### 2. إعداد متغيرات البيئة

قم بإنشاء ملف `.env` في مجلد المشروع (إذا لم يكن موجوداً) وأضف المتغيرات التالية:

```env
# بيئة التشغيل
NODE_ENV=production

# منفذ التطبيق
PORT=3000

# رابط قاعدة البيانات (استبدل بالرابط الخاص بك)
DATABASE_URL=postgres://user:password@host:port/database

# المفتاح السري للجلسات
SESSION_SECRET=your_secret_key_here
```

### 3. إعداد ملف التكوين للنشر

قم بإنشاء ملف `render.yaml` في المجلد الرئيسي للمشروع:

```yaml
services:
  - type: web
    name: compsdb
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        fromDatabase:
          name: compsdb-postgres
          property: connectionString
      - key: SESSION_SECRET
        generateValue: true
    autoDeploy: true
```

### 4. تحضير المشروع للنشر

1. تأكد من وجود السكربتات التالية في `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "postinstall": "npm run db:migrate"
  }
}
```

2. تأكد من أن ملف `server.js` يستخدم المنفذ من متغيرات البيئة:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 5. نشر التطبيق

1. ارفع المشروع إلى GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <رابط_المستودع>
git push -u origin main
```

2. في لوحة تحكم Render.com:
   - انقر على "New +"
   - اختر "Web Service"
   - اختر مستودع GitHub الخاص بالمشروع
   - املأ المعلومات التالية:
     - Name: `compsdb`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - في قسم "Environment Variables":
     - أضف متغيرات البيئة من ملف `.env`
     - اربط `DATABASE_URL` بقاعدة البيانات التي أنشأتها
   - انقر على "Create Web Service"

### 6. تهيئة قاعدة البيانات

بعد اكتمال النشر، قم بتشغيل الترحيل الأولي لقاعدة البيانات:

1. من لوحة تحكم Render.com، افتح الـ Shell للخدمة
2. نفذ الأمر التالي:
```bash
npm run db:migrate
```

### 7. التحقق من النشر

1. انتظر حتى يكتمل النشر (سيظهر "Deploy successful")
2. انقر على رابط التطبيق للتحقق من عمله
3. تأكد من:
   - عمل الصفحة الرئيسية
   - الاتصال بقاعدة البيانات
   - عمل جميع الوظائف

### 8. الصيانة والتحديث

- التحديثات التالية ستتم تلقائياً عند الدفع إلى الفرع الرئيسي
- يمكنك مراقبة السجلات من لوحة التحكم
- يمكنك إعادة تشغيل الخدمة يدوياً إذا لزم الأمر

### 9. الأمان

1. تأكد من حماية المتغيرات الحساسة:
   - لا تضع ملف `.env` في Git
   - استخدم متغيرات بيئة Render.com للإعدادات الحساسة

2. قم بتفعيل HTTPS:
   - Render يوفر HTTPS تلقائياً
   - تأكد من تحويل جميع طلبات HTTP إلى HTTPS

### 10. حل المشاكل الشائعة

1. مشاكل الاتصال بقاعدة البيانات:
   - تحقق من صحة رابط الاتصال
   - تأكد من إضافة IP الخدمة إلى قائمة السماح

2. مشاكل النشر:
   - راجع سجلات البناء والتشغيل
   - تأكد من صحة أوامر البناء والتشغيل

3. مشاكل الأداء:
   - راقب استخدام الموارد
   - اضبط إعدادات PM2 إذا كنت تستخدمه

### روابط مفيدة

- [وثائق Render](https://render.com/docs)
- [وثائق Node.js على Render](https://render.com/docs/deploy-node-express-app)
- [إعداد قواعد البيانات](https://render.com/docs/databases)
