// 导入数据库操作模块
const db = require('../db/index')

exports.allschedules = (req, res) => {
    const sql = `select * from schedule_info`
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
      
        if (results.length !== 1) return res.cc('获取信息失败！')
      
        res.send({
          status: 0,
          message: 'success',
          data: results,
        })
      })
}

exports.add = (req, res) => {
    const scheduleIns = req.body

    const sql = 'insert into schedule_info set ?'
    db.query(sql, { 
        title: scheduleIns.title, 
        date: scheduleIns.date,
        host: scheduleIns.host,
        persons: scheduleIns.persons,
        detail: scheduleIns.detail,
        level: scheduleIns.level }, function (err, results) {

    if (err) return res.cc(err)

    if (results.affectedRows !== 1) {
        return res.cc('添加日程失败，请稍后再试！')
    }

    return res.cc('添加日程成功！', 0)
    })


}