const PORT = 8000;

var express = require("express");
var app = express();
var cors = require('cors');
const { Worker } = require("worker_threads");

app.use(cors());

app.post("/:figma_token/:project_id/:node_id/:task_id", async function (req, res) {

  var workerData = {
    figma_token: req.params.figma_token,
    project_id: req.params.project_id,
    node_id: req.params.node_id,
    task_id: req.params.task_id,
    finished: false,
    result: null,
    status: 0
  }

  var worker = new Worker("./figma-import-worker.js", {workerData: workerData});

  worker.postMessage(workerData);

  worker.on("error", function (error) {
    res.send(error);
  });

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
