//var app = require('express')();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{path: '/node2/lft/socket.io',pingInterval: 25000,pingTimeout: 20000,transports: ['websocket']});
var net = require('net');
var fs = require('fs');
var util = require('util');
var conf = require('./config/server.json');
var threshold = 0;
var baseline_ave = 0;
var baseline_sd = 0;
var sdnn = 0;
var status = false;
var status_count = 0;
var start = false;
var changed = false;

const mysql = require('mysql');
const pool = mysql.createPool(conf.MYSQL);

async function sql(sqlStatement, placeholder, isLog = true) {
//function sql(sqlStatement, placeholder, isLog = true) {
  if (isLog) console.log('[mysql.query] ' + sqlStatement + ',' + placeholder); // 投げられた文をトレース
  pool.query = util.promisify(pool.query);
  try {
    const result = await pool.query(sqlStatement, placeholder);
    //const result = pool.query(sqlStatement, placeholder);
    if (isLog) console.log('[mysql.result] ' + JSON.stringify(result)); // 実行結果を返す。そのまま連結すると中身が見れなくなるのでJSON.stringify()を使用
    return result;
  } catch (err) {
    throw err;
  }
}

async function getBaseline() {
  const res = (await sql('SELECT * FROM baseline', [], false));
  const length = Object.keys(res).length;
  console.log(length);

  var baseline = new Array();
  for(let i=0; i<length; i++){
    //console.log(res[i]['rri1']);
    if(rriFilter(res[i]['rri1'],res[i]['rri2'],res[i]['rri3'])){
      baseline.push(res[i]['rri1']);
      baseline.push(res[i]['rri2']);
      baseline.push(res[i]['rri3']);
    }
  }

  var baseline_sdnn = new Array();
  for(let i=0; i<baseline.length-60; i=i+3){
    baseline_sdnn.push(standardDeviation(baseline.slice(i, i+60)));
  }
  const sum = baseline_sdnn.reduce((a, b) => {
   return a + b;
  });
  baseline_ave = sum / baseline_sdnn.length;

  baseline_sd = standardDeviation(baseline_sdnn);

  console.log('*************************************');
  console.log(baseline_sdnn);
  console.log(baseline_ave);
  console.log(baseline_sd);

}

async function getRRI() {
  const res = (await sql('SELECT * FROM exp1 ORDER BY count DESC LIMIT 1;', [], false));
  const rri = [res[0]['rri1'], res[0]['rri2'], res[0]['rri3']];
  if(rriFilter(res[0]['rri1'],res[0]['rri2'],res[0]['rri3'])){
    sdnn = standardDeviation(rri);
  }

  //sdnnが大きいとマインドワンダリング
  if(baseline_ave+baseline_sd < sdnn){
    status_count += 1;
  }else{
    status_count += 1;
    //status_count = 0;
  }
  console.log('****count*****');
  console.log(status_count);
  console.log(status);
  if(9<status_count){
    status = true;
    socket.emit('status', status);
    /*
    io.on('connection', function(socket){
      socket.emit('status', status);
    });
    */
  }
}

//sql('INSERT INTO demo values (0, 0, 0, 0)');
getBaseline();

/*
console.log('Baseline: ' + JSON.stringify(result));
console.log(typeof(result));
console.log(JSON.parse(result));
*/
var expio = io.of('/expwindow');
var envio = io.of('/environment');
app.get('/node2/lft/signup.html', function(req, res) {
  res.sendFile(__dirname + '/signup.html');
});
app.get('/node2/lft/explanation_check.html', function(req, res) {
  res.sendFile(__dirname + '/explanation_check.html');
});
app.get('/node2/lft/expwindow.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow.html');
})
//条件分追加する
app.get('/node2/lft/expwindow1.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow1.html');
});
app.get('/node2/lft/expwindow2.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow2.html');
});
app.get('/node2/lft/expwindow3.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow3.html');
});
app.get('/node2/lft/expwindow4.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow4.html');
});
app.get('/node2/lft/expwindow5.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow5.html');
});
app.get('/node2/lft/expwindow6.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow6.html');
});
app.get('/node2/lft/expwindow7.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow7.html');
});
app.get('/node2/lft/expwindow8.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow8.html');
});
app.get('/node2/lft/expwindow9.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow9.html');
});
app.get('/node2/lft/expwindow_rf.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_rf.html');
});
app.get('/node2/lft/expwindow_rs.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_rs.html');
});
app.get('/node2/lft/expwindow_bf.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_bf.html');
});
app.get('/node2/lft/expwindow_bs.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_bs.html');
});
app.get('/node2/lft/expwindow_r.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_r.html');
});
app.get('/node2/lft/expwindow_b.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_b.html');
});
app.get('/node2/lft/expwindow_f.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_f.html');
});
app.get('/node2/lft/expwindow_s.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_s.html');
});
app.get('/node2/lft/expwindow_c.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_c.html');
});
app.get('/node2/lft/expwindow_hl.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_hl.html');
});
app.get('/node2/lft/expwindow_lh.html', function(req,res) {
  res.sendFile(__dirname + '/expwindow_lh.html');
});
app.get('/node2/lft/synchro.html', function(req,res) {
  res.sendFile(__dirname + '/synchro.html');
});

app.get('/node2/lft/course-4.csv', function(req,res) {
  res.sendFile(__dirname + '/course-4.csv');
});
app.get('/node2/lft/course-5.csv', function(req,res) {
  res.sendFile(__dirname + '/course-5.csv');
});
app.get('/node2/lft/course-4-simple.csv', function(req,res) {
  res.sendFile(__dirname + '/course-4-simple.csv');
});
app.get('/node2/lft/straight09_60.csv', function(req,res) {
  res.sendFile(__dirname + '/straight09_60.csv');
});
app.get('/node2/lft/straight09_30.csv', function(req,res) {
  res.sendFile(__dirname + '/straight09_30.csv');
});
app.get('/node2/lft/straight09_20.csv', function(req,res) {
  res.sendFile(__dirname + '/straight09_20.csv');
});
app.get('/node2/lft/straight08_60.csv', function(req,res) {
  res.sendFile(__dirname + '/straight08_60.csv');
});
app.get('/node2/lft/straight08_30.csv', function(req,res) {
  res.sendFile(__dirname + '/straight08_30.csv');
});
app.get('/node2/lft/straight08_20.csv', function(req,res) {
  res.sendFile(__dirname + '/straight08_20.csv');
});
app.get('/node2/lft/course-5-simple.csv', function(req,res) {
  res.sendFile(__dirname + '/course-5-simple.csv');
});
app.use('/node2/lft/images/playing.png', function(req,res) {
  res.sendFile(__dirname + '/images/playing.png');
});
app.use('/node2/lft/images/playing_error.png', function(req,res) {
  res.sendFile(__dirname + '/images/playing_error.png');
});
app.use('/node2/lft/images/probe.png', function(req,res) {
  res.sendFile(__dirname + '/images/probe.png');
});
app.use('/node2/lft/images/error.png', function(req,res) {
  res.sendFile(__dirname + '/images/error.png');
});
app.use('/node2/lft/images/safe1.png', function(req,res) {
  res.sendFile(__dirname + '/images/safe1.png');
});
app.use('/node2/lft/images/safe2.png', function(req,res) {
  res.sendFile(__dirname + '/images/safe2.png');
});

app.use('/node2/lft/audio/bgm.mp3', function(req,res) {
  res.sendFile(__dirname + '/audio/bgm.mp3');
});
app.use('/node2/lft/audio/audio_test.mp3', function(req,res) {
  res.sendFile(__dirname + '/audio/audio_test.mp3');
});

function appendFile(path, data) {
  fs.appendFileSync(path, data, function (err) {
    if (err) {
        throw err;
    }
  });
}

function countFile(path){
  var fileNames = fs.readdirSync(path, function (err) {
    if (err) {
        throw err;
    };
  });
  var fileNum = fileNames.length;
  return fileNum;
}


var name = null;
var vehicleRow = "Time,OnLine,Vpos,Gpos,InputKey,Start\n";
var probeRow = "answer,start,end\n";
var vehiclePath = "";
var probePath = "";

io.on('connection', function(socket){

  socket.on('setting',function(data){
    //名前登録
    name = data["name"];
  });
  socket.on('routing',function(data){
    //ファイル数をカウントしてURL返す
    let condition1 = countFile("./Log/VehicleLog_b/");
    let condition2 = countFile("./Log/VehicleLog_bf/");
    let condition3 = countFile("./Log/VehicleLog_bs/");
    let condition4 = countFile("./Log/VehicleLog_c/");
    let condition5 = countFile("./Log/VehicleLog_f/");
    let condition6 = countFile("./Log/VehicleLog_r/");
    let condition7 = countFile("./Log/VehicleLog_rf/");
    let condition8 = countFile("./Log/VehicleLog_rs/");
    let condition9 = countFile("./Log/VehicleLog_s/");

    let fileCount = [condition1, condition2, condition3, condition4, condition5, condition6, condition7, condition8, condition9];
    console.log(fileCount);
    let min = 100000000;
    sendUrl = 0;
    for(let i=0; i<fileCount.length; i++){
      if(fileCount[i]<min){
        min = fileCount[i];
        sendUrl = i;
      }
    }
    console.log(sendUrl);
    if (sendUrl==0) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_b.html");
    }else if (sendUrl==1) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_bf.html");
    }else if (sendUrl==2) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_bs.html");
    }else if (sendUrl==3) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_c.html");
    }else if (sendUrl==4) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_f.html");
    }else if (sendUrl==5) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_r.html");
    }else if (sendUrl==6) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_rf.html");
    }else if (sendUrl==7) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_rs.html");
    }else if (sendUrl==8) {
      socket.emit('URL', "http://133.70.173.112/node2/lft/expwindow_s.html");
    }
  });

  //クライアントからファイル数を求められたらemit
  socket.on('getUrl',function(data){

  });

  //クライアントからユーザ名を求められたらemit
  socket.on('getUserName',function(data){
    socket.emit('userName', name);
    name="";
  });

  socket.on('fileName',function(data){

    vehiclePath = data["vehiclePath"];
    probePath = data["probePath"];

    app.get("/node2/lft"+vehiclePath, function(req,res) {
      res.sendFile(__dirname + vehiclePath);
    });

    app.get("/node2/lft"+probePath, function(req,res) {
      res.sendFile(__dirname + probePath);
    });

    fs.writeFileSync("."+vehiclePath, vehicleRow, function (err) {
      if (err) {
        throw err;
      }
    });

    fs.writeFileSync("."+probePath, probeRow, function (err) {
      if (err) {
        throw err;
      }
    });
	});

  socket.on('vehicle',function(data){
    var vehicleLog = data["Time"] + "," + data["OnLine"] + "," + data["Vpos"] + "," + data["Gpos"] + "," + data["InputKey"] + "," + data["Stimuli"] + "	\n";
    appendFile("."+data["path"], vehicleLog);
	});

  socket.on('probe',function(data){
    var probeLog = data["answer"] + "," + data["start"] + "," + data["end"] + "," + data["Stimuli"] + "	\n";
    appendFile("."+data["path"], probeLog);
	});

  socket.on('status',async function(data){
    if(data){
      const res = (await sql('SELECT * FROM exp1 ORDER BY count DESC LIMIT 20;', [], true));
      const length = Object.keys(res).length;
      console.log(length);
      if(length == 20){
        var rri = new Array();
        for(let i=0; i<length; i++){
          //console.log(res[i]['rri1']);
          if(rriFilter(res[i]['rri1'],res[i]['rri2'],res[i]['rri3'])){
            rri.push(res[i]['rri1']);
            rri.push(res[i]['rri2']);
            rri.push(res[i]['rri3']);
            //console.log('ooooooooook');
          }else{
            //console.log('noooooooooo');
          }
        }

        sdnn = standardDeviation(rri);
        console.log(baseline_ave+baseline_sd);
        console.log(sdnn);
        if(!changed){
          //test用
          //status_count += 1;
          //sdnnが大きいとマインドワンダリング
          if(baseline_ave+baseline_sd < sdnn){
            status_count += 1;
            console.log('MW');
          }else{
            status_count = 0;
            console.log('Normal');
          }
        }
        console.log(changed);
        console.log(status_count);
        if(9<status_count){
          socket.emit('change', true)
          changed = true;
        }
      }
    }
	});
});


function rriFilter(rri1, rri2, rri3){
  var max = 1500;
  var min = 500;
  if(rri1<=max && rri2<=max && rri3<=max){
    if(min<=rri1 && min<=rri2 && min<=rri3){
      return true;
    }else{
      return false;
    }
  }else{
    return false;
  }
}

function standardDeviation(dataset){
  const sum = dataset.reduce((a, b) => {
   return a + b;
  });
  const average = sum / dataset.length;
  const deviation = dataset.map((a) => {
   const subtract = a - average;
   return subtract ** 2;
  });
  const deviationSum = deviation.reduce((a, b) => {
   return a + b
  });
  const variance = deviationSum / (dataset.length - 1);
  const standardDiviation = Math.sqrt(variance);
  return standardDiviation;
}

http.listen("0.0.0.0",8080);

console.log("Experiment Window viewer ready.");
