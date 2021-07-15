const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
var mongodb = require("mongodb");
const { restart } = require('nodemon');
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< SECURITY ADD ON INIT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //
const jwt = require('jsonwebtoken');

// <<<<<<<<<<<<<<<< TESTS >>>>>>>>>>>>>>>>> //
router.get('/test', (req, res) => {
	res.send("test");
});
// <<<<<<<<<<<<<<<< ADD NEW >>>>>>>>>>>>>>>>> //
router.post('/new', async (req, res) => {
	console.log("RUN ADD NEW");
	const newContact = new Contact(req.body);
	const savedContact = await newContact.save();
	res.json(savedContact);
});
// <<<<<<<<<<<<<<<< SEARCH VIA ID >>>>>>>>>>>>>>>>> //
router.get("/get/:id", async (req, res) => {
	console.log("RUN SEARCH VIA ID");
    const foundContact = await Contact.findById({ _id: req.params.id });
    res.json(foundContact);
});
// <<<<<<<<<<<<<<<< DELETE VIA ID >>>>>>>>>>>>>>>>> //
router.delete('/delete/:id', async (req, res) => {
	console.log("RUN DELETE VIA ID");
	const foundContact = await Contact.findByIdAndDelete({ _id: req.params.id });
    res.json(foundContact);
});
// <<<<<<<<<<<<<<<< UPDATE VIA ID >>>>>>>>>>>>>>>>> //
router.patch('/update/:id', async (req, res) => {
	console.log("RUN UPDATE VIA ID");
	const q = await Contact.updateOne({_id: req.params.id}, {$set: req.body});
	res.json(q);
});
// <<<<<<<<<<<<<<<< FIND ALL >>>>>>>>>>>>>>>>> //
router.get('/all', async (req, res) => {
	console.log("RUN FIND ALL");
	const contact = await Contact.find();
	res.json(contact);
});
// <<<<<<<<<<<<<<<< SEARCH NAMES >>>>>>>>>>>>>>>>> //
router.get('/search/:via', function(req,res){
	console.log("RUN SEARCH NAMES");
    var regex = new RegExp(req.params.via, 'i');  // 'i' makes it case insensitive
    return Contact.find( { $or: [ {first_name: regex} , {last_name: regex} ] }, function(err,contact){
        return res.send(contact);
    });
});
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< SECURITY ADD ON ROUTES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> //


// <<<<<<<<<<<<<<<< LOGIN SUPPOSEDLY >>>>>>>>>>>>>>>>> //
router.post('/login/:user/:password', function(req,res){
	var user = { id: req.params.user };
	var token = jwt.sign({user},'1');
	res.json({token:token});
});

// <<<<<<<<<<<<<<<< SECURED ROUTE SUPPOSEDLY >>>>>>>>>>>>>>>>> //
router.get('/secure/:message',verifyToken, function(req,res){
	jwt.verify(req.token,"1",function(err,data){
		if(err){ 
			res.sendStatus(403);
		} else {
			console.log("SECURE LOG: " + req.params.message);
			res.json({text: req.params.message, data: data });
		}
	})
});
// <<<<<<<<<<<<<<<< THIS FUNCTION CHECKS THE TOKEN >>>>>>>>>>>>>>>>> //
function verifyToken(req,res,next){
	const bearerHeader = req.headers["authorization"];
	if(typeof bearerHeader !== 'undefined'){
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	} else {
		res.sendStatus(403);
	}
	
}

module.exports = router;