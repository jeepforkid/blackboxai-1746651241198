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
   Root Directory: [اتركه فارغاً]
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

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

### ❌ خطأ: فشل البناء
1. تأكد من وجود:
   - `package.json`
   - `package-lock.json`
2. راجع سجلات البناء في "Events"

### ❌ خطأ: التطبيق لا يعمل
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
