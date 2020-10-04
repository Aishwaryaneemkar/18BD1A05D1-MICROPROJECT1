var express = require("express");
const app=express();
var middleware=require("./middleware");
var server=require("./server");
var config=require("./config");
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
const MongoClient=require('mongodb').MongoClient;

const url='mongodb://127.0.0.1:27017';
const dbName='HospitalVentilators';
let db;
MongoClient.connect(url,function(err,client){
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected to the database:${url}`);
    console.log(`Database : ${dbName}`);
});
app.get('/HospitalDetails',middleware.checkToken,function(req,res){
    console.log("Fetching details form the hospitalDetails collection");
    db.collection('HospitalDetails').find().toArray(function(err,result){
        if(err) console.log(err);
        res.json(result);
    })
});

app.get('/VentilatorsDetails',middleware.checkToken,function(req,res){
    console.log("Fetching details form the ventilatorsDetails collection");
    db.collection('VentilatorsDetails').find().toArray(function(err,result){
        if(err) console.log(err);
        res.json(result);
    })
});

app.post('/searchventilators',middleware.checkToken,function(req,res){
    console.log("searching ventilator by status");
    var status=req.query.status;
    var query={"status":status};
    console.log(status);
    var VentilatorsDetails=db.collection('VentilatorsDetails').find(query).toArray().then(result=> res.json(result));
});

app.post('/searchospitals',middleware.checkToken,function(req,res){
    console.log("searching hospital by name");
    var Name=req.query.Name;
    var query={"Name": new RegExp(Name, 'i' )};
    console.log(Name);
    var ventilatorsDetails = db.collection('VentilatorsDetails').find(query).toArray().then(result => res.json(result));
});

app.put('/updateventilatorsdetails',middleware.checkToken,function(req,res){
    console.log("Update ventilator details");
    var vid={vid:req.query.vid};
    var status=req.query.status;
    console.log(vid+" "+status);
    var query2={$set:{"status":status}};
    db.collection('VentilatorsDetails').updateOne(vid,query2,function(err,result){
        if(err) console.log("update Unsuccessful");
        res.json("1 document updated");
        //res.json(result);
    });
});

app.post('/addventilators',middleware.checkToken,function(req,res){
    console.log("Adding a ventilator to the ventilatorInfo");
    var HId=req.query.HId;
    var vid=req.query.vid;
    var status=req.query.status;
    var Name=req.query.Name;
    var query1={"vid":"req.query.vid"};
    console.log(HId+" "+vid+" "+status+" "+Name);
    var query={"HId":HId,"vid":req.query.vid,"status":status,"Name":Name};
    db.collection('VentilatorsDetails').insertOne(query,function(err,result){
        if(err) console.log("record not inserted");
        res.json("ventilator added");
        //res.json(result);
    });
});

app.delete('/deleteventilators',middleware.checkToken,function(req,res){
    console.log("deleting a ventilator by Vid");
    var vid=req.query.vid;
    console.log(vid);
    var q1={"vid":vid};
    db.collection('VentilatorsDetails').deleteOne(q1,function(err,result){
        if(err) console.log("error in deleting the document");
        res.json("ventilator deleted");
    });
});
app.listen(1000); 