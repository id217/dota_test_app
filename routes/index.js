var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Dota 2 Profiler' });
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
router.post('/getMatchList', function(req, res) {
  console.log(req.body.user_key);
  //TODO set cookie value for subsequent requests
  var reqUrl = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=" + req.body.user_key

  request({ url: reqUrl, json: true}, function(error, response, body){
     if (!error && response.statusCode == 200) {
        console.log(body.result.matches[0].match_id);
        res.render('matches', { matches: body.result.matches });
     }
  });
});

module.exports = router;
