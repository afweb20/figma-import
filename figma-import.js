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
    console.log("hello", result);
  });

  worker.on("error", function (error) {
    res.send(error);
  });

  // worker.on("exit", function (exitCode) {
  //   console.log(`It exited with code ${exitCode}`);
  // })

  res.send(workerData);

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
