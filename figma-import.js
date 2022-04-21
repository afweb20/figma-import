const PERSONAL_ACCESS_TOKEN = "367581-50354355-43eb-4834-a520-da304dbe7ae3";
const PORT = 8000;


// 1 --- http://localhost:8000/vfcLzhPe3Aowdak3AZPXK8/636:3

var express = require("express");
var app = express();
var router = express.Router();
var axios = require("axios");

app.get("/:project_id/:node_id", function (req, res) {

  axios({
    method: "get",
    url: "https://api.figma.com/v1/files/" + req.params.project_id + "/nodes?ids=" + req.params.node_id,
    headers: { "X-Figma-Token": PERSONAL_ACCESS_TOKEN },
  }).then(function (response) {

    console.log("@@@@@@@@@@@@@@@@@@@@");
    console.log(response.data);

    var sitecontent = [];

    if (response.data) {
      if (response.data.nodes) {
        if (response.data.nodes[req.params.node_id]) {
          if (response.data.nodes[req.params.node_id].document) {

            console.log(response.data.nodes[req.params.node_id].document);
      
            sitecontent = generateSitecontent(response.data.nodes[req.params.node_id].document);

          }
        }
      }
    }

    var html = "<div>";
    html += "</div>";
    html += "<div> " + JSON.stringify(sitecontent) + "</div>";

    // res.send(response.data.nodes[req.params.node_id].document);
    // res.send(html);


    var htmlBlock = "<div style='display: flex;align-items: center;justify-content: center;'><div style='position: relative'>" + renderHtml(sitecontent) + "</div></div>";
    res.send(htmlBlock);
    
  });

});


var generateElementid = function(len, charSet) {

  var i, randomPoz, randomString;
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  randomString = '';
  i = 0;
  while (i < len) {
    randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
    i++;
  }
  randomString = "el" + randomString;
  return randomString.toLocaleLowerCase();

}


var generateSitecontent = function (object) {

  var sitecontent = {};
  var keys = Object.keys(object);
  var elementid = generateElementid(32);
  sitecontent[elementid] = {};

  for (var i = 0; i < keys.length; i++) {

    var key = keys[i];

    // type - String
    // The type of the node, refer to table below for details.
    if (key == "type") {
      
      if (object[key] == "FRAME") {

        sitecontent[elementid]["classes"] = "fgm-node-type-frame";
        sitecontent[elementid]["style"] = {};

        console.log("Efewgewgewgwg", elementid)

      } else {

        alert("Ошибка! Родительский элемент не является фреймом!");
        return false;

      }

    }

      
    // absoluteBoundingBox - Object
    // Bounding box of the node in absolute space coordinates
    if (key == "absoluteBoundingBox") {

      if (object[key]["width"]) {

        sitecontent[elementid]["style"]["width"] = object[key]["width"].toString() + "px";

      }

      if (object[key]["height"]) {

        sitecontent[elementid]["style"]["height"] = object[key]["height"].toString() + "px";

      }

    }
    

    // fills - Array of objects
    // An array of fill paints applied to the node
    if (key == "fills") {

      if (object[key].length == 1) {

        if (object[key][0]["color"]) {

          var r = 0;
          var g = 0;
          var b = 0;
          var a = 0;
          
          if (object[key][0]["color"]["r"]) {

            r = object[key][0]["color"]["r"] * 255;

          }

          if (object[key][0]["color"]["g"]) {

            g = object[key][0]["color"]["g"] * 255;

          }

          if (object[key][0]["color"]["b"]) {

            b = object[key][0]["color"]["b"] * 255;

          }

          if (object[key][0]["color"]["a"]) {

            a = object[key][0]["color"]["a"];

          }

          sitecontent[elementid]["style"]["background-color"] = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";

        }

      }

    }

  }

  return sitecontent;

}

function renderHtml (sitecontent) {

  var keys = Object.keys(sitecontent);

  for (var i = 0; i < keys.length; i++) {

    var key = keys[i];
    var styleString = "";
    var styleKeys = Object.keys(sitecontent[key]["style"]);

    for (var sk = 0; sk < styleKeys.length; sk++) {

      styleString += styleKeys[sk] + ":" + sitecontent[key]["style"][styleKeys[sk]] + ";"

    }

    var html = "<div elementid='" + key + "' style='" + styleString + "'> test </div>";
    // sitecontent[key]

  }

  return html;
}

app.listen(PORT, function () {
  console.log("Express is listening at port: " + PORT);
});
