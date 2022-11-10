'use strict';
const mongoose = require("mongoose");

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true });

  let issueSchema = new mongoose.Schema({
    project: {type:String, required: true},
    issue_title: {type:String, required: true},
    issue_text: {type:String, required: true},
    created_on: {type:String, required: true},
    updated_on: {type:String, required: true},
    created_by: {type:String, required: true},
    assigned_to: String,
    open: {type:Boolean, required:true},
    status_text:String
  });

  let Issue = mongoose.model("Issue",issueSchema);

  const createAndSaveIssue = (project, dataObject, done) =>{
    let myIssue = new Issue({
      project: project,
      issue_title: dataObject.issue_title,
      issue_text: dataObject.issue_text,
      created_on: Date(),
      updated_on: Date(),
      created_by: dataObject.created_by,
      assigned_to: dataObject.assigned_to,
      open:true,
      status_text: dataObject.status_text
    });
    myIssue.save((err, data) =>{
      err?
      done(err) :
      done(null, data);
    });
  };

  function formatData(rawData) {
    let result = {
      assigned_to: rawData.assigned_to,
      status_text: rawData.status_text,
      open: rawData.open,
      _id: rawData.id,
      issue_title: rawData.issue_title,
      issue_text: rawData.issue_text,
      created_by: rawData.created_by,
      created_on: rawData.created_on,
      updated_on: rawData.updated_on
    }
    return result
  };



    app.route('/api/issues/:project')

      .get(function (req, res){
        let project = req.params.project;

        let searchObj = req.query;
        searchObj.project = project

        Issue.find(searchObj,(err,data)=>{
          if(err){
            console.log(err);
          } else{
            let dataArr = []
            data.forEach( i => {
              dataArr.push(formatData(i))
            });
            res.json(dataArr);
          }
        })
      })//end get

      .post(function (req, res){
        let project = req.params.project;
        console.log("routed post for project:" + project);
        /*console.log(
          "project",project,
          "title:",req.body.issue_title,
          "text:", req.body.issue_text,
          "created:", Date(),
          "updated:",Date(),
          "author:",req.body.created_by,
          "assigned_to",req.body.assigned_to,
          "status_text", req.body.status_text,
          "open",true);*/

          //make sure all fields are filled out
          if(req.body.issue_title == undefined || req.body.issue_text == undefined || req.body.created_by == undefined ){
            res.json({ error: 'required field(s) missing' });
          }else{
            createAndSaveIssue(project, req.body, function(err,data) {
              if(err){console.log("MONGOOSE_ERROR", err)}
              if(!data){
                console.log("missing done()");
              }
              Issue.findById(data._id, function(err,issue) {
                if(err){return next(err);}
                res.json(formatData(issue));
              })
            })
          }
      })//end post

      .put(function (req, res){
        let project = req.params.project;
        if(req.body._id == undefined){
          res.json({ error: 'missing _id' });
        }else if(req.body.issue_title == undefined
              && req.body.issue_text == undefined
              && req.body.created_by == undefined
              && req.body.assigned_to == undefined
              && req.body.status_text == undefined
              && req.body.open != false){
                console.log("no fields to update");
          res.json({ error: 'no update field(s) sent', '_id': req.body._id })
        }else{

          Issue.findById(req.body._id, (err, data) => {
            if(err){
              res.json({ error: 'could not update', '_id': req.body._id });
            }else{
              //make the update using data object
              data.issue_title = req.body.issue_title == (undefined || "") ? data.issue_title : req.body.issue_title;
              data.issue_text = req.body.issue_text == (undefined || "") ? data.issue_text : req.body.issue_text;
              data.created_by = req.body.created_by == (undefined || "") ? data.issue_title : req.body.created_by;
              data.assigned_to = req.body.assigned_to == (undefined || "") ? data.assigned_to : req.body.assigned_to;
              data.status_text = req.body.status_text ==(undefined || "") ? data.status_text : req.body.status_text;
              data.open = !req.body.open;
              data.updated_on = Date();
              data.save((err, updatedData) => {
                console.log("could not update: " + req.body._id);
                if(err){console.log(err);}
                err ?
                res.json({ error: 'could not update', '_id': req.body._id }):
                res.json({result:"successfully updated",_id: req.body._id});
              })
            }
          })
        }

      })//end of put

      .delete(function (req, res){
        let project = req.params.project;
        if(req.body._id == undefined){
          res.json({error: 'missing _id'});
        }else{
          Issue.findByIdAndRemove(req.body._id, (err,data) => {
            if(err){
              res.json({error: 'could not delete', _id: req.body._id});
            }else{
              res.json({result:"successfully deleted",_id: req.body._id})
            }
          });
        }
      })//end delete

};
