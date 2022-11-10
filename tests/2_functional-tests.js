const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function(done) {

  //Create an issue with every field: POST request to /api/issues/{project}
  test('Create an issue with every field POST', function(done){
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester",
        assigned_to:"tester",
        status_text:"open"
      })
      .end(function (err, res){
        console.log(res.body);
        assert.equal(res.status, 200, "response not ok");
        assert.equal(res.type, "application/json", "response not JSON");
        assert.equal(res.body.issue_title, "chai_test_issue", "title incorrect");
        assert.equal(res.body.issue_text, "chai test text", "text incorrect");
        assert.equal(res.body.created_by, "tester", "creator incorrect");
        assert.equal(res.body.assigned_to, "tester", "assigned_to inocrrect");
        assert.equal(res.body.status_text, "open", "status incorrect");
        done();
      });

      //may want to add a delete to prevent overflow here???

  });

  //Create an issue with only required fields: POST request to /api/issues/{project}
  test('Create an issue with only required fields POST', function(done){

    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        assert.equal(res.status, 200, "response not ok");
        assert.equal(res.type, "application/json", "response not JSON");
        assert.equal(res.body.issue_title, "chai_test_issue", "title incorrect");
        assert.equal(res.body.issue_text, "chai test text", "text incorrect");
        assert.equal(res.body.created_by, "tester", "creator incorrect");
        assert.equal(res.body.assigned_to, undefined, "assigned_to should be blank")
        assert.equal(res.body.status_text, undefined, "status should be blank");
        done();
      });

  });

  //Create an issue with missing required fields: POST request to /api/issues/{project}
  test('Create an issue missing required fields POST', function(done){
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        assert.equal(res.status, 200, "response not ok");
        assert.equal(res.type, "application/json", "response not JSON");
        assert.equal(res.body.error, "required field(s) missing", "title incorrect");
        done();
      });

  });

  //View issues on a project: GET request to /api/issues/{project}
  test('View issues on a project GET', function(done){
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end(function (err, res){
        assert.equal(res.status, 200, "response not ok");
        assert.equal(res.type, "application/json", "response not JSON");
        //not sure what else to put here, check type is array?
        done();
      });

  });

  //View issues on a project with one filter: GET request to /api/issues/{project}
  test('View issues on a project with one filter GET', function(done){
    chai
      .request(server)
      .get("/api/issues/apitest?open=true")
      .end(function (err, res){
        assert.equal(res.status, 200, "response not ok");
        assert.equal(res.type, "application/json", "response not JSON");
        //not sure what else to put here, check type is array?
        //check that all entries match the filter criteria
        done();
      });

  });

  //View issues on a project with multiple filters: GET request to /api/issues/{project}
  test('View issues on a project with multiple filters GET', function(done){
    chai
      .request(server)
      .get('/api/issues/apitest?open=true&status_text=""')
      .end(function (err, res){
        assert.equal(res.status, 200, "response not ok");
        assert.equal(res.type, "application/json", "response not JSON");
        //not sure what else to put here, check type is array?
        //check that all entries match the filter criteria
        done();
      });

  });

  //Update one field on an issue: PUT request to /api/issues/{project}
  test('Update one field on an issue PUT', function(done){
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id:res.body._id,
            issue_title:"updated chai test title"
          })
          .end(function (err, newRes){
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.result, "successfully updated", "title has not updated");
            done();
          });
      });
  });

  //Update multiple fields on an issue: PUT request to /api/issues/{project}
  test('Update multiple fields on an issue PUT', function(done){
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id:res.body._id,
            issue_title:"updated chai test title",
            issue_text:"updated chai test text"
          })
          .end(function (err, newRes){
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.result, "successfully updated", "title and text have not updated");
            done();
          });
      });
  });

  //Update an issue with missing _id: PUT request to /api/issues/{project}
  test('Update an issue with missing _id PUT', function(done){
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            issue_title:"updated chai test title",
            issue_text:"updated chai test text"
          })
          .end(function (err, newRes){
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.error, 'missing _id', "title and text have not updated");
            done();
          });
      });
  });
  //Update an issue with no fields to update: PUT request to /api/issues/{project}
  test('Update an issue with no fields to update PUT', function(done){
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id:res.body._id
          })
          .end(function (err, newRes){
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.error, 'no update field(s) sent');
            done();
          });
      });

      console.log("\n\n\n");
  });

  //Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test("Update an issue with an invalid _id PUT", function(done){
    console.log("\n\n\n");
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send({
            _id:"chicken",
            issue_title:"updated chai test title"
          })
          .end(function (err, newRes){
            console.log(newRes.body.error == 'could not update');
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.error, 'could not update', "no error recieved");
            done();
          });
      });
  });

  //Delete an issue: DELETE request to /api/issues/{project}
  test("Delete an issue DELETE", function(done){
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({
            _id:res.body._id
          })
          .end(function (err, newRes){
            console.log("BODY: ", newRes.body);
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.result, "successfully deleted");
            done();
          });
      });
  });

  //Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
  test("Delete an issue with invalid _id DELETE", function(done){
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({
            _id:"chicken"
          })
          .end(function (err, newRes){
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.error, "could not delete");
            done();
          });
      });
  });
  //Delete an issue with missing _id: DELETE request to /api/issues/{project}
  test("Delete an issue with missing _id DELETE", function(done){
    chai
      .request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title:"chai_test_issue",
        issue_text:"chai test text",
        created_by:"tester"
      })
      .end(function (err, res){
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({

          })
          .end(function (err, newRes){
            assert.equal(newRes.status, 200, "response not ok");
            assert.equal(newRes.type, "application/json", "response not JSON");
            assert.equal(newRes.body.error, 'missing _id');
            done();
          });
      });
  });

});
