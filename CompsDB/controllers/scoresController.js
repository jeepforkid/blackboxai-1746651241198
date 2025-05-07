// استيراد النموذج
const Score = require('../models/Score');
const Contestant = require('../models/Contestant');
const Competition = require('../models/Competition');
const Supervisor = require('../models/Supervisor');
const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const fastcsv = require('fast-csv');
const fs = require('fs');

class ScoresController {
    // عرض صفحة الدرجات الرئيسية
    static async index(req, res) {
        try {
            const scores = await Score.getAllScores();
            const contestants = await Contestant.getAllContestants();
            const competitions = await Competition.getAllCompetitions();
            const supervisors = await Supervisor.getAllSupervisors();

            res.render('scores/index', {
                scores,
                contestants,
                competitions,
                supervisors,
                title: 'إدخال وعرض الدرجات',
                messages: req.flash()
            });
        } catch (error) {
            console.error('خطأ في عرض صفحة الدرجات:', error);
            req.flash('error', 'حدث خطأ أثناء تحميل بيانات الدرجات');
            res.redirect('/');
        }
    }

    // إضافة درجة جديدة
    static async create(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', 'يرجى التحقق من البيانات المدخلة');
                return res.redirect('/scores');
            }

            await Score.create(req.body);
            req.flash('success', 'تمت إضافة الدرجة بنجاح');
            res.redirect('/scores');
        } catch (error) {
            console.error('خطأ في إضافة درجة:', error);
            req.flash('error', 'حدث خطأ أثناء إضافة الدرجة');
            res.redirect('/scores');
        }
    }

    // تحديث درجة
    static async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const updatedScore = await Score.update(req.params.id, req.body);
            res.json({ 
                success: true, 
                message: 'تم تحديث الدرجة بنجاح',
                score: updatedScore 
            });
        } catch (error) {
            console.error('خطأ في تحديث الدرجة:', error);
            res.status(500).json({ 
                success: false, 
                message: 'حدث خطأ أثناء تحديث الدرجة' 
            });
        }
    }

    // حذف درجة
    static async delete(req, res) {
        try {
            await Score.delete(req.params.id);
            req.flash('success', 'تم حذف الدرجة بنجاح');
            res.redirect('/scores');
        } catch (error) {
            console.error('خطأ في حذف الدرجة:', error);
            req.flash('error', 'حدث خطأ أثناء حذف الدرجة');
            res.redirect('/scores');
        }
    }

    // البحث المتقدم في الدرجات
    static async advancedSearch(req, res) {
        try {
            const scores = await Score.advancedSearch(req.query);
            res.json(scores);
        } catch (error) {
            console.error('خطأ في البحث عن الدرجات:', error);
            res.status(500).json({ error: 'حدث خطأ أثناء البحث' });
        }
    }

    // تصدير الدرجات
    static async export(req, res) {
        try {
            const format = req.query.format || 'excel';
            const criteria = req.query; // معايير التصفية
            const scores = await Score.exportScores(criteria);

            if (format === 'excel') {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('الدرجات');

                // تعريف الأعمدة
                worksheet.columns = [
                    { header: 'اسم المتسابقة', key: 'contestant_name', width: 30 },
                    { header: 'المسابقة', key: 'competition_name', width: 30 },
                    { header: 'تاريخ المسابقة', key: 'competition_date', width: 15 },
                    { header: 'الدرجة', key: 'score', width: 10 },
                    { header: 'المشرفة', key: 'supervisor_name', width: 30 },
                    { header: 'تاريخ الإدخال', key: 'entry_date', width: 20 },
                    { header: 'ملاحظات', key: 'notes', width: 40 }
                ];

                // إضافة البيانات
                worksheet.addRows(scores);

                // تنسيق الملف
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).alignment = { horizontal: 'right' };

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=scores.xlsx');

                await workbook.xlsx.write(res);
                res.end();
            } else if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=scores.csv');

                const csvStream = fastcsv.format({ headers: true });
                csvStream.pipe(res);

                scores.forEach(score => {
                    csvStream.write({
                        'اسم المتسابقة': score.contestant_name,
                        'المسابقة': score.competition_name,
                        'تاريخ المسابقة': score.competition_date,
                        'الدرجة': score.score,
                        'المشرفة': score.supervisor_name,
                        'تاريخ الإدخال': score.entry_date,
                        'ملاحظات': score.notes
                    });
                });

                csvStream.end();
            } else {
                throw new Error('صيغة التصدير غير مدعومة');
            }
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            req.flash('error', 'حدث خطأ أثناء تصدير البيانات');
            res.redirect('/scores');
        }
    }

    // استيراد درجات
    static async import(req, res) {
        try {
            if (!req.file) {
                req.flash('error', 'يرجى اختيار ملف للاستيراد');
                return res.redirect('/scores');
            }

            const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
            let scores = [];

            if (fileExtension === 'xlsx') {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(req.file.path);
                const worksheet = workbook.getWorksheet(1);

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // تجاوز صف العناوين
                        scores.push({
                            contestant_id: row.getCell(1).value,
                            competition_id: row.getCell(2).value,
                            supervisor_id: row.getCell(3).value,
                            score: row.getCell(4).value,
                            notes: row.getCell(5).value
                        });
                    }
                });
            } else if (fileExtension === 'csv') {
                const fileContent = fs.readFileSync(req.file.path, 'utf-8');
                await new Promise((resolve, reject) => {
                    fastcsv.parseString(fileContent, { headers: true })
                        .on('data', (row) => {
                            scores.push({
                                contestant_id: row['رقم المتسابقة'],
                                competition_id: row['رقم المسابقة'],
                                supervisor_id: row['رقم المشرفة'],
                                score: row['الدرجة'],
                                notes: row['ملاحظات']
                            });
                        })
                        .on('end', resolve)
                        .on('error', reject);
                });
            }

            // حذف الملف المؤقت
            fs.unlinkSync(req.file.path);

            // إضافة الدرجات إلى قاعدة البيانات
            await Score.bulkImport(scores);

            req.flash('success', `تم استيراد ${scores.length} درجة بنجاح`);
            res.redirect('/scores');
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            req.flash('error', 'حدث خطأ أثناء استيراد البيانات');
            res.redirect('/scores');
        }
    }
}

module.exports = ScoresController;
