const PORT = 8000;

var express = require("express");
var app = express();
const { Worker } = require("worker_threads");

app.post("/:figma_token/:project_id/:node_id/:type", async function (req, res) {

  var workerData = {
    figma_token: req.params.figma_token,
    project_id: req.params.project_id,
    node_id: req.params.node_id,
    import_type: req.params.type,
  }

  var worker = new Worker("./figma-import-worker.js", {workerData: workerData});

  worker.once("message", function (result) {
    res.send(result);
  });

  worker.on("error", function (error) {
    res.send(error);
  });

  // worker.on("exit", function (exitCode) {
  //   console.log(`It exited with code ${exitCode}`);
  // })

});


app.listen(PORT, function () {
  console.log("Express is listening at port: " + PORT);
});
