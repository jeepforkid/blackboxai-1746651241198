// استيراد النموذج
const Competition = require('../models/Competition');
const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const fastcsv = require('fast-csv');
const fs = require('fs');

class CompetitionsController {
    // عرض صفحة المسابقات
    static async index(req, res) {
        try {
            const competitions = await Competition.getAllCompetitions();
            res.render('competitions/index', {
                competitions,
                title: 'المسابقات',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض المسابقات:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل بيانات المسابقات');
            res.redirect('/');
        }
    }

    // عرض نموذج إضافة مسابقة جديدة
    static async showAddForm(req, res) {
        try {
            res.render('competitions/add', {
                title: 'إضافة مسابقة جديدة',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض نموذج الإضافة:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل نموذج الإضافة');
            res.redirect('/competitions');
        }
    }

    // إضافة مسابقة جديدة
    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', 'يرجى التحقق من البيانات المدخلة');
                return res.redirect('/competitions/add');
            }

            await Competition.create(req.body);
            req.flash('success', 'تمت إضافة المسابقة بنجاح');
            res.redirect('/competitions');
        } catch (error) {
            console.error('خطأ في إضافة مسابقة:', error);
            req.flash('error', 'حدث خطأ أثناء إضافة المسابقة');
            res.redirect('/competitions/add');
        }
    }

    // عرض تفاصيل مسابقة
    static async showDetails(req, res) {
        try {
            const competition = await Competition.getCompetitionDetails(req.params.id);
            if (!competition) {
                req.flash('error', 'المسابقة غير موجودة');
                return res.redirect('/competitions');
            }

            const unregisteredContestants = await Competition.getUnregisteredContestants(req.params.id);

            res.render('competitions/details', {
                competition,
                unregisteredContestants,
                title: 'تفاصيل المسابقة',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض تفاصيل المسابقة:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل تفاصيل المسابقة');
            res.redirect('/competitions');
        }
    }

    // عرض نموذج تعديل مسابقة
    static async showEditForm(req, res) {
        try {
            const competition = await Competition.getCompetitionDetails(req.params.id);
            if (!competition) {
                req.flash('error', 'المسابقة غير موجودة');
                return res.redirect('/competitions');
            }

            res.render('competitions/edit', {
                competition,
                title: 'تعديل بيانات المسابقة',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض نموذج التعديل:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل بيانات المسابقة');
            res.redirect('/competitions');
        }
    }

    // تحديث بيانات مسابقة
    static async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', 'يرجى التحقق من البيانات المدخلة');
                return res.redirect(`/competitions/edit/${req.params.id}`);
            }

            await Competition.update(req.params.id, req.body);
            req.flash('success', 'تم تحديث بيانات المسابقة بنجاح');
            res.redirect('/competitions');
        } catch (error) {
            console.error('خطأ في تحديث المسابقة:', error);
            req.flash('error', 'حدث خطأ أثناء تحديث بيانات المسابقة');
            res.redirect(`/competitions/edit/${req.params.id}`);
        }
    }

    // حذف مسابقة
    static async delete(req, res) {
        try {
            await Competition.delete(req.params.id);
            req.flash('success', 'تم حذف المسابقة بنجاح');
            res.redirect('/competitions');
        } catch (error) {
            console.error('خطأ في حذف المسابقة:', error);
            req.flash('error', 'حدث خطأ أثناء حذف المسابقة');
            res.redirect('/competitions');
        }
    }

    // إضافة درجات متعددة للمسابقة
    static async addBulkScores(req, res) {
        try {
            const { competitionId, scores } = req.body;
            await Competition.addBulkScores(competitionId, scores);
            res.json({ success: true, message: 'تم إضافة الدرجات بنجاح' });
        } catch (error) {
            console.error('خطأ في إضافة الدرجات:', error);
            res.status(500).json({ 
                success: false, 
                message: 'حدث خطأ أثناء إضافة الدرجات',
                error: error.message 
            });
        }
    }

    // تصدير بيانات المسابقات
    static async export(req, res) {
        try {
            const format = req.query.format || 'excel';
            const competitions = await Competition.getAllCompetitions();

            if (format === 'excel') {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('المسابقات');

                // تعريف الأعمدة
                worksheet.columns = [
                    { header: 'اسم المسابقة', key: 'name', width: 30 },
                    { header: 'الوصف', key: 'description', width: 40 },
                    { header: 'تاريخ المسابقة', key: 'competition_date', width: 15 },
                    { header: 'المكان', key: 'location', width: 30 },
                    { header: 'عدد المشاركات', key: 'participants_count', width: 15 },
                    { header: 'متوسط الدرجات', key: 'average_score', width: 15 },
                    { header: 'أعلى درجة', key: 'highest_score', width: 15 },
                    { header: 'أدنى درجة', key: 'lowest_score', width: 15 }
                ];

                // إضافة البيانات
                worksheet.addRows(competitions);

                // تنسيق الملف
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).alignment = { horizontal: 'right' };

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=competitions.xlsx');

                await workbook.xlsx.write(res);
                res.end();
            } else if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=competitions.csv');

                const csvStream = fastcsv.format({ headers: true });
                csvStream.pipe(res);

                competitions.forEach(competition => {
                    csvStream.write({
                        'اسم المسابقة': competition.name,
                        'الوصف': competition.description,
                        'تاريخ المسابقة': competition.competition_date,
                        'المكان': competition.location,
                        'عدد المشاركات': competition.participants_count,
                        'متوسط الدرجات': competition.average_score,
                        'أعلى درجة': competition.highest_score,
                        'أدنى درجة': competition.lowest_score
                    });
                });

                csvStream.end();
            } else {
                throw new Error('صيغة التصدير غير مدعومة');
            }
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            req.flash('error', 'حدث خطأ أثناء تصدير البيانات');
            res.redirect('/competitions');
        }
    }

    // البحث عن المسابقات
    static async search(req, res) {
        try {
            const searchTerm = req.query.term;
            const competitions = await Competition.search(searchTerm);
            res.json(competitions);
        } catch (error) {
            console.error('خطأ في البحث عن المسابقات:', error);
            res.status(500).json({ error: 'حدث خطأ أثناء البحث' });
        }
    }
}

module.exports = CompetitionsController;
