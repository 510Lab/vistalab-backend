const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios')
const db = require('../db/index')

exports.add = async (req, res) => {
    const url = 'http://invoice.heycore.com/invoice/extrat'
    const form = new FormData();

    const pdffile = fs.createReadStream(req.file.path);

    form.append('file', pdffile, req.file.originalname);

    const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
        },
      });

    const invoiceIns = response.data

    const sql_user = `select name from user_info where id= ? `
    db.query(sql_user, req.auth.id, function (err, results) {
        if (err) return res.cc(err)
        const sql = 'insert into invoice_info set ?'
        db.query(sql, { 
            invoicename: invoiceIns.detailList[0].name + invoiceIns.detailList[0].model, 
            applicant: results[0].name, 
            applicant_id: req.auth.id, 
            amount: invoiceIns.totalAmount, 
            remark: req.body.remark, 
            category: req.body.category,
            path : req.file.path
        }, function (err, results) {
            if (err){
                return res.cc(err)
            } 
            if (results.affectedRows !== 1) {
                return res.cc("插入数据库invoice_info失败!")
            }
            return res.cc({
                amount: invoiceIns.totalAmount
            }, true)
        })
    })

    
}

exports.getall = (req, res) => {
    const sql = `select * from invoice_info`
    db.query(sql, function (err, results) {
      if (err) return res.cc(err)
      res.send({
        status: true,
        data: results,
      })
    })
}

exports.delete = (req, res) => {
    const sql_user = `select applicant_id, path from invoice_info where id= ?`
    db.query(sql_user, req.body.id, function (err, results) {
        if (err) return res.cc(err)
        const file_path = results[0].path
        if (results.length !== 1) return res.cc('id错误!')
        const sql_level = `select level from user_info where id= ?`
        db.query(sql_level, req.auth.id, function (err, results) {
            if(err) return res.cc(err)
            if(results[0].level!=0 && results[0].applicant_id != req.auth.id) return res.cc('您没有权限删除!')
            const sql = `delete from invoice_info WHERE id=?`
            db.query(sql, [req.body.id],function(err, results) {
                if (err) return res.cc(err)
                fs.unlink(file_path,function(err){
                    if(err) return res.cc(err)
                    return res.cc('发票删除成功!', true)
                })
            })
        })
    })
}

exports.unstate = (req, res) => {
    const sql_user = `select applicant_id, path from invoice_info where id= ?`
    db.query(sql_user, req.body.id, function (err, results) {
        if (err) return res.cc(err)
        const file_path = results[0].path
        if (results.length !== 1) return res.cc('id错误!')
        const sql_level = `select level from user_info where id= ?`
        db.query(sql_level, req.auth.id, function (err, results) {
            if(err) return res.cc(err)
            if(results[0].level!=0 && results[0].applicant_id != req.auth.id) return res.cc('您没有权限修改!')

            const sql_state = `select state from invoice_info WHERE id = ?`
            db.query(sql_state, req.body.id, function (err, results) {
                if (err) return res.cc(err)
                const state = results[0].state
                const sql = `UPDATE invoice_info SET state = ? WHERE id = ?`
                db.query(sql, [(state == 1) ? 0 : 1, req.body.id], function (err, results) {
                    if (err)return res.cc(err)
                    if (results.affectedRows !== 1) return res.cc("更新数据库invoice_info失败!")
                    return res.cc('更新成功!', true)
                })
            })
        })
    })
}