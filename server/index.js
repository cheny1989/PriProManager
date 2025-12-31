var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();
require('dotenv').config();
/*********************************************************************************************************************/
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors());
app.use('/', router);
app.use('/', require('./router'));
/*********************************************************************************************************************/
var PORT = process.env.PORT;
app.listen(PORT, () => console.log(`SERVER IS RUNNING ON PORT ${PORT}`));
