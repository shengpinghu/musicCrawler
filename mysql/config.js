const mysql = require('mysql')
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '88888888',
    database : 'hspStudy'
});
exports.InsertSql = function(data) {
    connection.connect()
    var  addSql = 'INSERT INTO album (Id,title,author,rel,describle,commented) VALUES (?,?,?,?,?,?)';
    let arr = []
    for (let k in data) {
        arr.push(data[k])
    }
    console.log(arr)
    connection.query(addSql,arr,function (err, result) {
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }

        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);
        console.log('INSERT ID:',result);
        console.log('-----------------------------------------------------------------\n\n');
    });
    connection.end()
}

exports.selectAll = function() {
    connection.connect()
    var  addSql = 'SELECT * FROM album';
    connection.query(addSql,function (err, result) {
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }

        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);
        console.log('INSERT ID:',result);
        console.log('-----------------------------------------------------------------\n\n');
    });
    connection.end()
}


