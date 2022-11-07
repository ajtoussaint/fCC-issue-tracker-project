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

  const createAndSaveIssue = (done) =>{
    let myIssue = new Issue({
      project: "test",
      issue_title: "test_issue",
      issue_text: "Please work",
      created_on: Date(),
      updated_on: Date(),
      created_by: "ajt",
      open:true
    });
    myIssue.save((err, data) =>{
      err?
      done(err) :
      done(null, data);
    });
  };

  console.log("routing");

    app.route('/api/test').get(function (req,res){
      console.log("test route entered");

      createAndSaveIssue(function (err, data) {
        if(err) {
          return next(err);
        }
        if(!data){
          console.log("Missing 'done()' argument");
          return next()
        }
        Issue.findById(data._id, function (err, issue) {
          if(err){
            return next(err);
          }
          res.json(issue);
          issue.remove();
        })
      })

    });


    app.route('/api/issues/:project')

      .get(function (req, res){
        let project = req.params.project;
        console.log("routed get " + project);
        res.send(project);
      })

      .post(function (req, res){
        let project = req.params.project;

      })

      .put(function (req, res){
        let project = req.params.project;

      })

      .delete(function (req, res){
        let project = req.params.project;

      });

};
