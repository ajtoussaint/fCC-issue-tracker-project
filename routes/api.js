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
      stauts_text: dataObject.status_text
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

  const findByProject = (projectName, done) =>{
    Issue.find({project:projectName}, (err,data) => {
      err ?
      done(err) :
      done(null,data);
    })
  };


    app.route('/api/issues/:project')

      .get(function (req, res){
        let project = req.params.project;
        findByProject(project, function(err, data){
          if(err){return next(err);}
          if(!data){
            console.log("missing done()");
            return next()
          }
          let dataArr = []
          data.forEach( i => {
            dataArr.push(formatData(i))
          })
          res.json(dataArr);
        })
      })

      .post(function (req, res){
        let project = req.params.project;
        console.log("routed post for project:" + project);
        console.log(
          "project",project,
          "title:",req.body.issue_title,
          "text:", req.body.issue_text,
          "created:", Date(),
          "updated:",Date(),
          "author:",req.body.created_by,
          "assigned_to",req.body.assigned_to,
          "status_text", req.body.status_text,
          "open",true);

          //make sure all fields are filled out
          if(req.body.issue_title == "" || req.body.issue_text == "" || req.body.created_by == "" ){
            res.json({ error: 'required field(s) missing' });
          }

        createAndSaveIssue(project, req.body, function(err,data) {
          if(err){return next(err);}
          if(!data){
            console.log("missing done()");
            return next()
          }
          Issue.findById(data._id, function(err,issue) {
            if(err){return next(err);}
            res.json(formatData(issue));
          })
        })

      })

      .put(function (req, res){
        let project = req.params.project;
        Issue.findById(req.body._id, (err, data) => {
          if(err){
            console.log(err);
          }else{
            //make the update using data object
            data.issue_title = req.body.issue_title == "" ? data.issue_title : req.body.issue_title;
            data.issue_text = req.body.issue_text == "" ? data.issue_text : req.body.issue_text;
            data.created_by = req.body.created_by == "" ? data.issue_title : req.body.created_by;
            data.assigned_to = req.body.assigned_to == "" ? data.assigned_to : req.body.assigned_to;
            data.status_text = req.body.status_text == "" ? data.status_text : req.body.status_text;
            data.open = !req.body.open;
            data.updated_on = Date();
            data.save((err, updatedData) => {
              err ?
              console.log(err):
              res.json({result:"successfully updated",_id: req.body._id});
            })
          }
        })



      })

      .delete(function (req, res){
        let project = req.params.project;
        Issue.findByIdAndRemove(req.body._id, (err,data) => {
          if(err){
            console.log(err);
          }else{
            res.json({result:"successfully deleted",_id: req.body._id})
          }
        })

      });

};
