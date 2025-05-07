# دليل تحويل النظام إلى صورة افتراضية (OVA)

## المتطلبات
1. VirtualBox مثبت على جهازك
2. مساحة كافية على القرص الصلب (على الأقل 20GB)
3. نسخة من Ubuntu Server 22.04 LTS

## الخطوات

### 1. إنشاء الجهاز الافتراضي
1. افتح VirtualBox
2. اضغط على "New"
3. املأ المعلومات:
   - Name: `CompsDB`
   - Type: `Linux`
   - Version: `Ubuntu 22.04 LTS (64-bit)`
   - Memory: `4096 MB`
   - Hard disk: `Create a virtual hard disk now`
   - Hard disk file type: `VDI`
   - Storage on physical hard disk: `Dynamically allocated`
   - File location and size: `20 GB`

### 2. إعداد النظام
1. ثبت Ubuntu Server
2. ثبت المتطلبات الأساسية:
```bash
# تحديث النظام
sudo apt update
sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# تثبيت Git
sudo apt install -y git

# تثبيت PM2
sudo npm install -g pm2
```

### 3. إعداد قاعدة البيانات
```bash
# تبديل إلى مستخدم postgres
sudo -i -u postgres

# إنشاء قاعدة البيانات والمستخدم
createdb compsdb
createuser compsdb_user
psql -c "ALTER USER compsdb_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE compsdb TO compsdb_user;"

# الخروج من مستخدم postgres
exit
```

### 4. تثبيت وإعداد التطبيق
```bash
# استنساخ المشروع
cd /opt
sudo git clone <رابط_المستودع> compsdb
cd compsdb

# تثبيت التبعيات
sudo npm install

# إنشاء ملف البيئة
sudo nano .env
```

محتوى ملف `.env`:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://compsdb_user:your_password@localhost:5432/compsdb
SESSION_SECRET=your_secret_key_here
```

### 5. إعداد التشغيل التلقائي
```bash
# إنشاء خدمة النظام
sudo nano /etc/systemd/system/compsdb.service
```

محتوى الملف:
```ini
[Unit]
Description=CompsDB Application
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/compsdb
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

تفعيل الخدمة:
```bash
sudo systemctl enable compsdb
sudo systemctl start compsdb
```

### 6. تصدير الجهاز الافتراضي
1. أوقف تشغيل الجهاز الافتراضي
2. في VirtualBox:
   - اختر الجهاز الافتراضي
   - اضغط على File > Export Appliance
   - اختر مكان حفظ الملف
   - Format: `Open Virtualization Format 2.0`
   - اضغط Export

### 7. استيراد الصورة على جهاز آخر
1. على الجهاز الجديد، افتح VirtualBox
2. اضغط على File > Import Appliance
3. اختر ملف OVA
4. راجع الإعدادات واضغط Import

## الوصول إلى النظام

1. شغل الجهاز الافتراضي
2. افتح المتصفح على الجهاز المضيف
3. ادخل إلى: `http://[IP_ADDRESS]:3000`

## ملاحظات مهمة

### الأمان
- غير كلمة المرور الافتراضية للنظام
- غير كلمة مرور قاعدة البيانات
- حدث النظام بانتظام

### النسخ الاحتياطي
```bash
# نسخ قاعدة البيانات
pg_dump -U postgres compsdb > backup.sql

# استعادة قاعدة البيانات
psql -U postgres compsdb < backup.sql
```

### المواصفات الموصى بها
- CPU: 2 cores أو أكثر
- RAM: 4GB أو أكثر
- مساحة: 20GB أو أكثر
- شبكة: Bridge Adapter للوصول من الشبكة المحلية
