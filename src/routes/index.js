import session from './session';
import user from './user';
import message from './message';
import honeybadger from 'honeybadger';

export default {
  session,
  user,
  message,
};


var express = require('express');
var router = express.Router();
try{
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
}catch(err){
  honeybadger.notify(err);

  throw(err);
}

module.exports = router;
