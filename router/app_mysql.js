/**
 * Created by hyw on 2016-11-08.
 */
var express = require("express");
var bodyParser = require("bodyParser");
var mysql = require('mysql');
//multer : file upload
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.locals.pretty = true;

