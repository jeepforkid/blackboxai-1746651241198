// استيراد النموذج
const Contestant = require('../models/Contestant');
const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const fastcsv = require('fast-csv');
const fs = require('fs');

class ContestantsController {
    // عرض صفحة المتسابقات
    static async index(req, res) {
        try {
            const contestants = await Contestant.getAllContestants();
            res.render('contestants/index', {
                contestants,
                title: 'المتسابقات',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض المتسابقات:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل بيانات المتسابقات');
            res.redirect('/');
        }
    }

    // عرض نموذج إضافة متسابقة جديدة
    static async showAddForm(req, res) {
        try {
            res.render('contestants/add', {
                title: 'إضافة متسابقة جديدة',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض نموذج الإضافة:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل نموذج الإضافة');
            res.redirect('/contestants');
        }
    }

    // إضافة متسابقة جديدة
    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', 'يرجى التحقق من البيانات المدخلة');
                return res.redirect('/contestants/add');
            }

            await Contestant.create(req.body);
            req.flash('success', 'تمت إضافة المتسابقة بنجاح');
            res.redirect('/contestants');
        } catch (error) {
            console.error('خطأ في إضافة متسابقة:', error);
            req.flash('error', 'حدث خطأ أثناء إضافة المتسابقة');
            res.redirect('/contestants/add');
        }
    }

    // عرض نموذج تعديل متسابقة
    static async showEditForm(req, res) {
        try {
            const contestant = await Contestant.getContestantById(req.params.id);
            if (!contestant) {
                req.flash('error', 'المتسابقة غير موجودة');
                return res.redirect('/contestants');
            }
            res.render('contestants/edit', {
                contestant,
                title: 'تعديل بيانات المتسابقة',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض نموذج التعديل:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل بيانات المتسابقة');
            res.redirect('/contestants');
        }
    }

    // تحديث بيانات متسابقة
    static async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', 'يرجى التحقق من البيانات المدخلة');
                return res.redirect(`/contestants/edit/${req.params.id}`);
            }

            await Contestant.update(req.params.id, req.body);
            req.flash('success', 'تم تحديث بيانات المتسابقة بنجاح');
            res.redirect('/contestants');
        } catch (error) {
            console.error('خطأ في تحديث المتسابقة:', error);
            req.flash('error', 'حدث خطأ أثناء تحديث بيانات المتسابقة');
            res.redirect(`/contestants/edit/${req.params.id}`);
        }
    }

    // حذف متسابقة
    static async delete(req, res) {
        try {
            await Contestant.delete(req.params.id);
            req.flash('success', 'تم حذف المتسابقة بنجاح');
            res.redirect('/contestants');
        } catch (error) {
            console.error('خطأ في حذف المتسابقة:', error);
            req.flash('error', 'حدث خطأ أثناء حذف المتسابقة');
            res.redirect('/contestants');
        }
    }

    // تصدير بيانات المتسابقات
    static async export(req, res) {
        try {
            const format = req.query.format || 'excel';
            const contestants = await Contestant.getAllContestants();

            if (format === 'excel') {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('المتسابقات');

                // تعريف الأعمدة
                worksheet.columns = [
                    { header: 'الاسم', key: 'name', width: 30 },
                    { header: 'العمر', key: 'age', width: 10 },
                    { header: 'تاريخ الميلاد', key: 'birth_date', width: 15 },
                    { header: 'العنوان', key: 'address', width: 40 },
                    { header: 'المشرفة', key: 'supervisor_name', width: 30 },
                    { header: 'عدد المسابقات', key: 'competitions_count', width: 15 },
                    { header: 'متوسط الدرجات', key: 'average_score', width: 15 }
                ];

                // إضافة البيانات
                worksheet.addRows(contestants);

                // تنسيق الملف
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).alignment = { horizontal: 'right' };

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=contestants.xlsx');

                await workbook.xlsx.write(res);
                res.end();
            } else if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=contestants.csv');

                const csvStream = fastcsv.format({ headers: true });
                csvStream.pipe(res);

                contestants.forEach(contestant => {
                    csvStream.write({
                        'الاسم': contestant.name,
                        'العمر': contestant.age,
                        'تاريخ الميلاد': contestant.birth_date,
                        'العنوان': contestant.address,
                        'المشرفة': contestant.supervisor_name,
                        'عدد المسابقات': contestant.competitions_count,
                        'متوسط الدرجات': contestant.average_score
                    });
                });

                csvStream.end();
            } else {
                throw new Error('صيغة التصدير غير مدعومة');
            }
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            req.flash('error', 'حدث خطأ أثناء تصدير البيانات');
            res.redirect('/contestants');
        }
    }

    // استيراد بيانات المتسابقات
    static async import(req, res) {
        try {
            if (!req.file) {
                req.flash('error', 'يرجى اختيار ملف للاستيراد');
                return res.redirect('/contestants');
            }

            const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
            let contestants = [];

            if (fileExtension === 'xlsx') {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(req.file.path);
                const worksheet = workbook.getWorksheet(1);

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // تجاوز صف العناوين
                        contestants.push({
                            name: row.getCell(1).value,
                            age: row.getCell(2).value,
                            birth_date: row.getCell(3).value,
                            address: row.getCell(4).value
                        });
                    }
                });
            } else if (fileExtension === 'csv') {
                const fileContent = fs.readFileSync(req.file.path, 'utf-8');
                await new Promise((resolve, reject) => {
                    fastcsv.parseString(fileContent, { headers: true })
                        .on('data', (row) => {
                            contestants.push({
                                name: row['الاسم'],
                                age: row['العمر'],
                                birth_date: row['تاريخ الميلاد'],
                                address: row['العنوان']
                            });
                        })
                        .on('end', resolve)
                        .on('error', reject);
                });
            }

            // حذف الملف المؤقت
            fs.unlinkSync(req.file.path);

            // إضافة المتسابقات إلى قاعدة البيانات
            for (const contestant of contestants) {
                await Contestant.create(contestant);
            }

            req.flash('success', `تم استيراد ${contestants.length} متسابقة بنجاح`);
            res.redirect('/contestants');
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            req.flash('error', 'حدث خطأ أثناء استيراد البيانات');
            res.redirect('/contestants');
        }
    }

    // البحث عن المتسابقات
    static async search(req, res) {
        try {
            const searchTerm = req.query.term;
            const contestants = await Contestant.search(searchTerm);
            res.json(contestants);
        } catch (error) {
            console.error('خطأ في البحث عن المتسابقات:', error);
            res.status(500).json({ error: 'حدث خطأ أثناء البحث' });
        }
    }
}

module.exports = ContestantsController;
