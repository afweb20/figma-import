const PORT = 8000;

var express = require("express");
var app = express();
const { Worker } = require("worker_threads");
var tasks = [];

app.post("/:figma_token/:project_id/:node_id/:type", async function (req, res) {

  var taskId = generateRandomNumber(5);

  var workerData = {
    figma_token: req.params.figma_token,
    project_id: req.params.project_id,
    node_id: req.params.node_id,
    import_type: req.params.type,
    task_id: taskId,
    state: "pending",
    result: null
  }

  tasks.push(workerData);

  var worker = new Worker("./figma-import-worker.js", {workerData: workerData});

  worker.postMessage(workerData);

  worker.once("message", function (result) {
    // res.send(result);
    // console.log("hello", result);

    var taskId = result.task_id;

    var task = tasks.filter(function(obj) {
      return obj.task_id == taskId;
    })[0];

    task.result = result.result;
    task.state = result.state;

  });

  worker.on("error", function (error) {
    res.send(error);
  });

  // worker.on("exit", function (exitCode) {
  //   console.log(`It exited with code ${exitCode}`);
  // })

  res.send(workerData);

});

app.get("/:task_id", async function (req, res) {

  var taskId = req.params.task_id;

  var task = tasks.filter(function(obj) {
    return obj.task_id == taskId;
  })[0];

  res.send(task);

});

var generateRandomNumber = function (len, charSet) {
  var charSet = charSet || "0123456789";
  var randomString = "";
  var i = 0;
  while (i < len) {
    randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
    i++;
  }
  return randomString;
};

app.listen(PORT, function () {
  console.log("Express is listening at port: " + PORT);
});
