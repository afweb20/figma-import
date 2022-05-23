const PERSONAL_ACCESS_TOKEN = "367581-50354355-43eb-4834-a520-da304dbe7ae3";
const PORT = 8000;


// 1 --- http://localhost:8000/vfcLzhPe3Aowdak3AZPXK8/636:3/2
// 2 --- http://localhost:8000/P9rADa5f4Rve6NoTjPUG5B/183%3A3/2
// 3 --- http://localhost:8000/dms5Vr9yGfK445F3mncTz9/1%3A2/2


var express = require("express");
var app = express();
var router = express.Router();
var axios = require("axios");
var parentX = null;
var parentY = null;

app.get("/:project_id/:node_id/:view", function (req, res) {

  var projectId = req.params.project_id;
  var nodeId = req.params.node_id;

  axios({
    method: "get",
    url: "https://api.figma.com/v1/files/" + projectId + "/nodes?ids=" + nodeId,
    headers: { "X-Figma-Token": PERSONAL_ACCESS_TOKEN },
  }).then(function (response) {

    // console.log("@@@@@@@@@@@@@@@@@@@@");
    // console.log(response.data);

    // var sitecontent = [];
    // var elementid = generateElementid(32);


    // if (response.data) {
    //   if (response.data.nodes) {
    //     if (response.data.nodes[nodeId]) {
    //       if (response.data.nodes[nodeId].document) {

    //         console.log(response.data.nodes[nodeId].document);

    //         sitecontent = generateSitecontent(response.data.nodes[nodeId].document, nodeId, elementid);

    //       }
    //     }
    //   }
    // }

    // var html = "<div>";
    // html += "</div>";
    // html += "<div> " + JSON.stringify(sitecontent) + "</div>";


    var htmlBlock = renderHtml(response.data.nodes[nodeId].document, projectId, nodeId, null, null);


    // Только для отображения на этапе разработки, потом нужно убрать 
    if (req.params.view == 0) {
      res.send(response.data.nodes[req.params.node_id].document);
    } else if (req.params.view == 1) {
      // res.send(html);
    } else if (req.params.view == 2) {
      res.send(htmlBlock);
    }

    
  });

});


var renderHtml = function (object, project_id, node_id, closest_parent_x, closest_parent_y) {

  var closestParentX = closest_parent_x;
  var closestParentY = closest_parent_y;

  if (object.type.toLowerCase() == "vector222") {
    console.log("hello obj", object.id, object.name, object.visible, object.type, object.pluginData, object.sharedPluginData);
    console.log("hello object.locked", object.locked);
    console.log("hello object.exportSettings", object.exportSettings);
    console.log("hello object.blendMode", object.blendMode);
    console.log("hello object.preserveRatio", object.preserveRatio);
    console.log("hello object.layoutAlign", object.layoutAlign);
    console.log("hello object.layoutGrow", object.layoutGrow);
    console.log("hello object.constraints", object.constraints);
    console.log("hello object.transitionNodeID", object.transitionNodeID);
    console.log("hello object.transitionDuration", object.transitionDuration);
    console.log("hello object.transitionEasing", object.transitionEasing);
    console.log("hello object.opacity", object.opacity);
    console.log("hello object.absoluteBoundingBox", object.absoluteBoundingBox);
    console.log("hello object.effects", object.effects);
    console.log("hello object.size", object.size);
    console.log("hello object.relativeTransform", object.relativeTransform);
    console.log("hello object.isMask", object.isMask);
    console.log("hello object.fills", object.fills);
    console.log("hello object.fillGeometry", object.fillGeometry);
    console.log("hello object.strokes", object.strokes);
    console.log("hello object.strokeWeight", object.strokeWeight);
    console.log("hello object.strokeCap", object.strokeCap);
    console.log("hello object.strokeJoin", object.strokeJoin);
    console.log("hello object.strokeDashes", object.strokeDashes);
    console.log("hello object.strokeMiterAngle", object.strokeMiterAngle);
    console.log("hello object.strokeGeometry", object.strokeGeometry);
    console.log("hello object.strokeAlign", object.strokeAlign);
    console.log("hello object.styles", object.styles);
    console.log("~~~~~~~~~");
  }

  var attributes = setHtmlAttributes(object, project_id, node_id, closestParentX, closestParentY);
  var html = "<div " + attributes + ">";

  if (object["children"]) {

    if (object["children"].length > 0) {

      if (object.absoluteBoundingBox) {
        if (object.absoluteBoundingBox.x) {
          closestParentX = object.absoluteBoundingBox.x;
        }
      }

      if (object.absoluteBoundingBox) {
        if (object.absoluteBoundingBox.y) {
          closestParentY = object.absoluteBoundingBox.y;
        }
      }

      for (var i = 0; i < object["children"].length; i++) {

        html += renderHtml(object["children"][i], project_id, node_id, closestParentX, closestParentY);

      }

    }

  } else {

    console.log("NO child");

  }

  html += "</div>";

  return html;

}


var generateElementid = function (len, charSet) {

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

var setHtmlAttributes = function (object, project_id, node_id, closestParentX, closestParentY) {

  var attributes = "";
  var elem = {};

  elem["style"] = {};
  if (object.type) {
    elem["class"] = "b-" + object.type.toLowerCase();
  }
  if (object.id) {

    elem["node-id"] = object.id;
    elem["elementid"] = "el" + project_id.toLowerCase() + object.id.replace(":", "x");

    if (object.id == node_id) {
      elem["style"]["position"] = "relative";    
    } else {
      elem["style"]["position"] = "absolute";
    }
    
  }
  if (object.fills) {
    if (object.fills.length > 0) {
      if (object.fills[0]) {
        if (object.fills[0]["color"]) {
          elem["style"]["background-color"] = generateRgbaString(object.fills[0]["color"]);
        }
      }
    }
  }
  if (object.absoluteBoundingBox) {
    
    if (object.id == node_id) {

      parentX = object.absoluteBoundingBox.x;
      parentY = object.absoluteBoundingBox.y;

      // console.log("parentX", parentX);
      // console.log("closestParentX", closestParentX);
      // console.log("parentY", parentY);
      // console.log("closestParentY", closestParentY);

    } else {

      elem["style"]["left"] = getElementLeftPosition(object, parentX, closestParentX);
      elem["style"]["top"] = getElementTopPosition(object, parentY, closestParentY);

    }

    if (object.absoluteBoundingBox.width) {
      elem["style"]["width"] = object.absoluteBoundingBox.width.toString() + "px";
    }

    if (object.absoluteBoundingBox.height) {
      elem["style"]["height"] = object.absoluteBoundingBox.height.toString() + "px";
    }

  }

  var keys = Object.keys(elem);

  for (var i = 0; i < keys.length; i++) {

    var key = keys[i];

    if (key == "style") {

      var styleKeys = Object.keys(elem[key]);

      if (styleKeys.length > 0) {

        attributes += " style='";

        for (var s = 0; s < styleKeys.length; s++) {

          var k = styleKeys[s];

          attributes += k + ": " + elem[key][k] + "; ";

        }

        attributes += "'";
        
      }
      
    } else {

      attributes += " " + key + "='" + elem[key] + "'";

    }

  }
  
  return attributes;

}

var generateSitecontent = function (object, node_id, elementid) {

  var sitecontent = {};
  var keys = Object.keys(object);
  var isParentIframe = false;
  sitecontent[elementid] = {};

  if (node_id) {
    if (object.id) {
      if (object.id == node_id) {
        isParentIframe = true;
      }
    }
  }

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

          sitecontent[elementid]["style"]["background-color"] = generateRgbaString(object[key][0]["color"]);

        }

      }

    }

  }

  return sitecontent;

}

var generateRgbaString = function (color_object) {

  var r = 0;
  var g = 0;
  var b = 0;
  var a = 0;

  if (color_object["r"]) {

    r = color_object["r"] * 255;

  }

  if (color_object["g"]) {

    g = color_object["g"] * 255;

  }

  if (color_object["b"]) {

    b = color_object["b"] * 255;

  }

  if (color_object["a"]) {

    a = color_object["a"];

  }

  return "rgba(" + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0) + ", " + a + ")";

}

var getElementLeftPosition = function (object, parentX, closestParentX) {

  if (parentX != null){

    if (object.absoluteBoundingBox.x != closestParentX) {

      if (closestParentX != null) {

        return (object.absoluteBoundingBox.x - closestParentX) + "px";

      } else {

        return (object.absoluteBoundingBox.x - parentX) + "px";

      }

    } else {

      return "0px";

    }

  }

}

var getElementTopPosition = function (object, parentY, closestParentY) {

  if (parentX != null){

    if (object.absoluteBoundingBox.y != closestParentY) {

      var top1 = Math.abs(object.absoluteBoundingBox.y);

      if (closestParentY != null) {

        var top2 = Math.abs(closestParentY);

      } else {

        var top2 = Math.abs(parentY);

      }

      return (top2 - top1) + "px";

    } else {

      return "0px";

    }

  }

}

app.listen(PORT, function () {
  console.log("Express is listening at port: " + PORT);
});
