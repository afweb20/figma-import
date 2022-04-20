const PERSONAL_ACCESS_TOKEN = "367581-50354355-43eb-4834-a520-da304dbe7ae3";
const PROJECT_ID = "vfcLzhPe3Aowdak3AZPXK8";
const NODE_ID = "636:3";
const PORT = 8000;

var express = require("express");
var app = express();
var router = express.Router();
var axios = require("axios");

app.get("/", function (req, res) {
  axios({
    method: "get",
    url: "https://api.figma.com/v1/files/" + PROJECT_ID + "/nodes?ids=" + NODE_ID,
    headers: { "X-Figma-Token": PERSONAL_ACCESS_TOKEN },
  }).then(function (response) {
    console.log("@@@@@@@@@@@@@@@@@@@@");
    console.log(response.data);
    res.send(response.data);
    // console.log(response.status);
    // console.log(response.statusText);
    // console.log(response.headers);
    // console.log(response.config);
  });
});

app.listen(PORT, function () {
  console.log("Express is listening at port: " + PORT);
});
