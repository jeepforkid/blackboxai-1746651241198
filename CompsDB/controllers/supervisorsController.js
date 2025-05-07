// استيراد النموذج
const Supervisor = require('../models/Supervisor');
const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const fastcsv = require('fast-csv');
const fs = require('fs');

class SupervisorsController {
    // عرض صفحة المشرفات
    static async index(req, res) {
        try {
            const supervisors = await Supervisor.getAllSupervisors();
            res.render('supervisors/index', {
                supervisors,
                title: 'المشرفات',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض المشرفات:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل بيانات المشرفات');
            res.redirect('/');
        }
    }

    // عرض نموذج إضافة مشرفة جديدة
    static async showAddForm(req, res) {
        try {
            res.render('supervisors/add', {
                title: 'إضافة مشرفة جديدة',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض نموذج الإضافة:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل نموذج الإضافة');
            res.redirect('/supervisors');
        }
    }

    // إضافة مشرفة جديدة
    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', 'يرجى التحقق من البيانات المدخلة');
                return res.redirect('/supervisors/add');
            }

            await Supervisor.create(req.body);
            req.flash('success', 'تمت إضافة المشرفة بنجاح');
            res.redirect('/supervisors');
        } catch (error) {
            console.error('خطأ في إضافة مشرفة:', error);
            req.flash('error', 'حدث خطأ أثناء إضافة المشرفة');
            res.redirect('/supervisors/add');
        }
    }

    // عرض نموذج تعديل مشرفة
    static async showEditForm(req, res) {
        try {
            const supervisor = await Supervisor.getSupervisorStats(req.params.id);
            if (!supervisor) {
                req.flash('error', 'المشرفة غير موجودة');
                return res.redirect('/supervisors');
            }

            const contestants = await Supervisor.getSupervisorContestants(req.params.id);

            res.render('supervisors/edit', {
                supervisor,
                contestants,
                title: 'تعديل بيانات المشرفة',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض نموذج التعديل:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل بيانات المشرفة');
            res.redirect('/supervisors');
        }
    }

    // تحديث بيانات مشرفة
    static async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', 'يرجى التحقق من البيانات المدخلة');
                return res.redirect(`/supervisors/edit/${req.params.id}`);
            }

            await Supervisor.update(req.params.id, req.body);
            req.flash('success', 'تم تحديث بيانات المشرفة بنجاح');
            res.redirect('/supervisors');
        } catch (error) {
            console.error('خطأ في تحديث المشرفة:', error);
            req.flash('error', 'حدث خطأ أثناء تحديث بيانات المشرفة');
            res.redirect(`/supervisors/edit/${req.params.id}`);
        }
    }

    // حذف مشرفة
    static async delete(req, res) {
        try {
            await Supervisor.delete(req.params.id);
            req.flash('success', 'تم حذف المشرفة بنجاح');
            res.redirect('/supervisors');
        } catch (error) {
            console.error('خطأ في حذف المشرفة:', error);
            req.flash('error', 'حدث خطأ أثناء حذف المشرفة');
            res.redirect('/supervisors');
        }
    }

    // تصدير بيانات المشرفات
    static async export(req, res) {
        try {
            const format = req.query.format || 'excel';
            const supervisors = await Supervisor.getAllSupervisors();

            if (format === 'excel') {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('المشرفات');

                // تعريف الأعمدة
                worksheet.columns = [
                    { header: 'الاسم', key: 'name', width: 30 },
                    { header: 'تاريخ البدء', key: 'start_date', width: 15 },
                    { header: 'المنطقة', key: 'region', width: 20 },
                    { header: 'عدد المتسابقات', key: 'contestants_count', width: 15 },
                    { header: 'عدد الدرجات', key: 'scores_count', width: 15 },
                    { header: 'متوسط الدرجات', key: 'average_score', width: 15 }
                ];

                // إضافة البيانات
                worksheet.addRows(supervisors);

                // تنسيق الملف
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).alignment = { horizontal: 'right' };

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=supervisors.xlsx');

                await workbook.xlsx.write(res);
                res.end();
            } else if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=supervisors.csv');

                const csvStream = fastcsv.format({ headers: true });
                csvStream.pipe(res);

                supervisors.forEach(supervisor => {
                    csvStream.write({
                        'الاسم': supervisor.name,
                        'تاريخ البدء': supervisor.start_date,
                        'المنطقة': supervisor.region,
                        'عدد المتسابقات': supervisor.contestants_count,
                        'عدد الدرجات': supervisor.scores_count,
                        'متوسط الدرجات': supervisor.average_score
                    });
                });

                csvStream.end();
            } else {
                throw new Error('صيغة التصدير غير مدعومة');
            }
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            req.flash('error', 'حدث خطأ أثناء تصدير البيانات');
            res.redirect('/supervisors');
        }
    }

    // استيراد بيانات المشرفات
    static async import(req, res) {
        try {
            if (!req.file) {
                req.flash('error', 'يرجى اختيار ملف للاستيراد');
                return res.redirect('/supervisors');
            }

            const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
            let supervisors = [];

            if (fileExtension === 'xlsx') {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(req.file.path);
                const worksheet = workbook.getWorksheet(1);

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // تجاوز صف العناوين
                        supervisors.push({
                            name: row.getCell(1).value,
                            start_date: row.getCell(2).value,
                            region: row.getCell(3).value
                        });
                    }
                });
            } else if (fileExtension === 'csv') {
                const fileContent = fs.readFileSync(req.file.path, 'utf-8');
                await new Promise((resolve, reject) => {
                    fastcsv.parseString(fileContent, { headers: true })
                        .on('data', (row) => {
                            supervisors.push({
                                name: row['الاسم'],
                                start_date: row['تاريخ البدء'],
                                region: row['المنطقة']
                            });
                        })
                        .on('end', resolve)
                        .on('error', reject);
                });
            }

            // حذف الملف المؤقت
            fs.unlinkSync(req.file.path);

            // إضافة المشرفات إلى قاعدة البيانات
            for (const supervisor of supervisors) {
                await Supervisor.create(supervisor);
            }

            req.flash('success', `تم استيراد ${supervisors.length} مشرفة بنجاح`);
            res.redirect('/supervisors');
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            req.flash('error', 'حدث خطأ أثناء استيراد البيانات');
            res.redirect('/supervisors');
        }
    }

    // البحث عن المشرفات
    static async search(req, res) {
        try {
            const searchTerm = req.query.term;
            const supervisors = await Supervisor.search(searchTerm);
            res.json(supervisors);
        } catch (error) {
            console.error('خطأ في البحث عن المشرفات:', error);
            res.status(500).json({ error: 'حدث خطأ أثناء البحث' });
        }
    }
}

module.exports = SupervisorsController;
