var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Dota 2 Profiler Madafaka' });
});

router.get('/matchDetails', function(req, res) {
  console.log(req.query.match_id);
  
  var reqUrl = 'https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?match_id=' + req.query.match_id + '&key=46C30A666AD7E7E9B2A462A59F22F8AB';
  request({ url: reqUrl, json: true}, function(error, response, body){
     if (!error && response.statusCode == 200) {
        console.log(body.result.radiant_win);
        res.render('match_details', { details: body.result });
     }
  });
});

/* POST get Match History */

router.post('/last25', function(req, res) {

  //TODO set cookie value for subsequent requests
  var reqUrl = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=" + req.body.user_key

  request({ url: reqUrl, json: true}, function(error, response, body){

    if (!error && response.statusCode == 200) {

      var reformatedLast25 = reformatMatchData(body.result.matches);
      updateMatchRecord(reformatedLast25);

      res.render('matches', { matches: reformatedLast25 });

     }
  });

});

router.get('/recordedMatches', function(req, res) {

  var data = fs.readFileSync('matchHistory.json', 'utf8');
  recordedMatchData = JSON.parse(data); 

  res.render('matches', { matches: recordedMatchData });

});



function timeConverter(UNIX_timestamp){

  // create a new javascript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds
  var date = new Date(UNIX_timestamp*1000);
  // hours part from the timestamp
  var hours = date.getHours();
  // minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // seconds part from the timestamp
  var seconds = "0" + date.getSeconds();


  var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return time;
}

function reformatMatchData(DotaAPImatchData){

  var matchData = DotaAPImatchData;
  var matchDataLength = matchData.length; 
  var reformatedMatchData = [];

  for (var i = 0; i < matchDataLength; i++) {

      thisMatch = new Object();
      thisMatch.match_id = matchData[i].match_id;
      thisMatch.start_time = timeConverter(matchData[i].start_time);
      thisMatch.unix_time = matchData[i].start_time;

      reformatedMatchData.push(thisMatch);
  }

  return reformatedMatchData;
}


function updateMatchRecord(matchDataUpdate){


  var data = fs.readFileSync('matchHistory.json', 'utf8');
  recordedMatchData = JSON.parse(data);

  newRecordedMatchData = matchDataUpdate.concat(recordedMatchData);

  var updatedRecord = JSON.stringify(newRecordedMatchData, null, "\t");
  fs.writeFile('matchHistory.json', updatedRecord, function (err) {
  });

}

module.exports = router;
