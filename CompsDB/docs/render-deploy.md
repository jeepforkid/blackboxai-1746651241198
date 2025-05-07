# دليل النشر السريع على Render.com

## الخطوات المصورة بالتفصيل

### 1️⃣ رفع المشروع إلى GitHub

#### أ. إنشاء مستودع جديد
1. افتح [GitHub.com](https://github.com)
2. اضغط على زر "+" في أعلى اليمين
3. اختر "New repository"
4. املأ النموذج:
   - Repository name: `compsdb`
   - Description: نظام إدارة المسابقات
   - Visibility: Public أو Private
5. اضغط "Create repository"

#### ب. رفع الكود
افتح Terminal واكتب:
```bash
# الدخول لمجلد المشروع
cd CompsDB

# تهيئة Git
git init
git add .
git commit -m "Initial commit"

# ربط المستودع المحلي بـ GitHub
git branch -M main
git remote add origin https://github.com/username/compsdb.git
git push -u origin main
```

### 2️⃣ إنشاء قاعدة البيانات

1. سجل دخول إلى [Render.com](https://render.com)
2. من Dashboard، اضغط "New +"
3. اختر "PostgreSQL"
4. املأ النموذج:
   - Name: `compsdb-postgres`
   - Database: `compsdb`
   - User: اتركه فارغاً
   - Region: اختر الأقرب لموقعك
5. اضغط "Create Database"
6. 🔴 **مهم**: انسخ "Internal Database URL" واحفظه

### 3️⃣ إنشاء تطبيق الويب

1. من Dashboard، اضغط "New +" مرة أخرى
2. اختر "Web Service"
3. في صفحة "Create a new Web Service":
   - اختر "Build and deploy from a Git repository"
   - اضغط "Connect GitHub"
   - اختر المستودع `compsdb`

4. في صفحة الإعدادات:
   ```
   Name: compsdb
   Region: [نفس منطقة قاعدة البيانات]
   Branch: main
   Root Directory: CompsDB    # مهم: يجب تحديد المجلد الذي يحتوي على package.json
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

   ⚠️ **ملاحظة مهمة**: إذا ظهر خطأ `ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`:
   - تأكد من تحديد `Root Directory` بشكل صحيح
   - يجب أن يكون المسار هو المجلد الذي يحتوي على ملف `package.json`
   - في حالتنا، المجلد هو `CompsDB`

5. أضف متغيرات البيئة:
   - اضغط "Advanced"
   - اضغط "Add Environment Variable"
   - أضف:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[رابط قاعدة البيانات من الخطوة 2]
   SESSION_SECRET=[قيمة عشوائية]
   ```

6. اضغط "Create Web Service"

### 4️⃣ تهيئة قاعدة البيانات

1. انتظر اكتمال النشر الأول
2. من صفحة الخدمة:
   - اضغط "Shell"
   - نفذ: `npm run db:migrate`

### 5️⃣ التحقق من النشر

1. انتظر ظهور "Deploy successful"
2. اضغط على رابط التطبيق في الأعلى
3. تأكد من:
   - فتح الصفحة الرئيسية
   - عمل قاعدة البيانات
   - تسجيل الدخول

## 🔧 حل المشاكل الشائعة

### 1. خطأ عدم وجود package.json
إذا ظهر خطأ `ENOENT: no such file or directory, package.json`:
- افتح إعدادات الخدمة في Render
- اذهب إلى قسم "Settings"
- ابحث عن "Root Directory"
- أدخل `CompsDB` (أو اسم المجلد الذي يحتوي على package.json)
- اضغط "Save Changes"
- اضغط "Manual Deploy" > "Clear build cache & deploy"

### 2. مشاكل أخرى في البناء
- تأكد من وجود وصحة الملفات:
  ```
  CompsDB/
  ├── package.json         # ملف تكوين المشروع
  ├── package-lock.json    # ملف قفل الإصدارات
  └── server.js           # نقطة البداية
  ```
- راجع سجلات البناء في "Events"
- تأكد من صحة الأوامر في package.json:
  ```json
  {
    "scripts": {
      "start": "node server.js",
      "build": "npm install"
    }
  }
  ```

### 3. مشاكل تشغيل التطبيق
1. افحص "Logs"
2. تأكد من متغيرات البيئة
3. جرب:
   ```bash
   # في Shell
   node -v
   npm -v
   npm install
   npm start
   ```

### ❌ خطأ: قاعدة البيانات
1. تأكد من رابط الاتصال
2. جرب في Shell:
   ```bash
   psql $DATABASE_URL
   ```

## 💡 نصائح مهمة

### 🔄 التحديثات
- كل دفع لـ `main` = نشر تلقائي
- يمكن تعطيل النشر التلقائي
- استخدم Preview للاختبار

### 📊 المراقبة
- راقب Resource Usage
- تابع Logs
- اضبط Alerts

### 💾 النسخ الاحتياطي
- نسخ يومية تلقائية
- يمكن التنزيل يدوياً
- احتفظ بنسخ محلية

## 🔗 روابط مفيدة

- [Render Docs](https://render.com/docs)
- [Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Database Guide](https://render.com/docs/databases)
- [Support](https://render.com/support)
