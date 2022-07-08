const PORT = 8000;
const FORUHOST = "http://localhost:3000";
const FORUTOKEN = "UI3sVyzKtTvq1CCgu0j2cASQbQvJpDUqZW8goTJse6iG";

var express = require("express");
var axios = require("axios");
var app = express();
var cors = require('cors');
const { Worker } = require("worker_threads");
// var tasks = [];

app.use(cors());

app.post("/:figma_token/:project_id/:node_id/:task_id", async function (req, res) {

  var taskId =  req.params.task_id;

  var workerData = {
    figma_token: req.params.figma_token,
    project_id: req.params.project_id,
    node_id: req.params.node_id,
    task_id: taskId,
    finished: false,
    result: null,
    status: 0
  }

  // tasks.push(workerData);

  var worker = new Worker("./figma-import-worker.js", {workerData: workerData});

  worker.postMessage(workerData);

  worker.on("message", async function (result) {

    var taskId = result.task_id;


    try {

      const { data } = await axios({
        method: "put",
        url: FORUHOST + "/api/v1/figmaimports/updatejobstatus",
        headers: { "X-Access-Token": FORUTOKEN },
        data: {
          jobid: taskId,
          percent: result.status,
          finished: result.finished,
          content: result.result
        }
      });
  
      console.log(data);

    } catch (err) {

        if (err.response.status === 404) {
            console.log('Resource could not be found!');
        } else {
            console.log(err.message);
        }
        
    }

    // var task = tasks.filter(function(obj) {
    //   return obj.task_id == taskId;
    // })[0];

    // task.result = result.result;
    // task.state = result.state;
    // task.status = result.status;

  });

  worker.on("error", function (error) {
    res.send(error);
  });

  // worker.on("exit", function (exitCode) {
  //   console.log(`It exited with code ${exitCode}`);
  // })

  res.status(200).send(workerData);

});

app.get("/:task_id", async function (req, res) {

  var taskId = req.params.task_id;

  var task = tasks.filter(function(obj) {
    return obj.task_id == taskId;
  })[0];

  res.status(200).send(task);

});


app.listen(PORT, function () {
  console.log("Express is listening at port: " + PORT);
});
