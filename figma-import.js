const PERSONAL_ACCESS_TOKEN = "367581-50354355-43eb-4834-a520-da304dbe7ae3";
const PORT = 8000;

// http://localhost:8000/vfcLzhPe3Aowdak3AZPXK8/636:3/2 - зеленый фон с лого фо ру
// http://localhost:8000/dms5Vr9yGfK445F3mncTz9/1%3A2/2 - webmoney video landing
// http://localhost:8000/vfcLzhPe3Aowdak3AZPXK8/757%3A26/2 - webmoney files landing

var express = require("express");
var app = express();
var router = express.Router();
var axios = require("axios");
const { json } = require("express");
var parentX = null;
var parentY = null;
var fs = require('fs');


app.get("/:project_id/:node_id/:view", function (req, res) {

  var projectId = req.params.project_id;
  var nodeId = req.params.node_id;

  // res.sendFile('views/index.html', {root: __dirname })

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

    fs.readFile('views/index.html', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      // Только для отображения на этапе разработки, потом нужно убрать 
      if (req.params.view == 0) {
        content = response.data.nodes[req.params.node_id].document;
      } else if (req.params.view == 1) {
        // content = html;
      } else if (req.params.view == 2) {
        content = htmlBlock; // визуально html
      }

      data = data.replace(/\<\/body>/g, content + '</body>');
      // console.log(data);
      res.send(data);

    });

    
  });



});


var renderHtml = function (object, project_id, node_id, closest_parent_x, closest_parent_y) {

  var closestParentX = closest_parent_x;
  var closestParentY = closest_parent_y;
  var type = object.type.toLowerCase(); //type есть  всегда

  if (type == "vector=") {
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

  if (type == "text=") {
    // тут всё от vector
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

    // + дополнительно 
    console.log("hello object.characters", object.characters);
    console.log("hello object.characterStyleOverrides", object.characterStyleOverrides);
    console.log("hello object.styleOverrideTable", object.styleOverrideTable);
    console.log("hello object.lineTypes", object.lineTypes);
    console.log("hello object.lineIndentations", object.lineIndentations);


    console.log("~~~~~~~~~");
  }

  if (type == "ellipse=") {
    // тут всё от vector
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

    // + дополнительно 
    console.log("hello object.arcData", object.arcData);

    console.log("~~~~~~~~~");
  }

  if (type == "rectangle=") {
    // тут всё от vector
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

    // + дополнительно 
    console.log("hello object.cornerRadius", object.cornerRadius);
    console.log("hello object.rectangleCornerRadii", object.rectangleCornerRadii);

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

    // console.log("NO child");

    if (type == "text") {

      if (object.characters) {

        var string = object.characters;
        var array_of_arrs = [];
        var prev = null;

        if (object.characterStyleOverrides) {
          if (object.characterStyleOverrides.length > 0) {

            for (var i = 0; i < object.characterStyleOverrides.length; i++) {

              if (!prev) {

                var arr = [];
                arr.push(object.characterStyleOverrides[i]);
                array_of_arrs.push(arr);

              } else {

                if ( prev != object.characterStyleOverrides[i] ) {

                  var arr = [];
                  arr.push(object.characterStyleOverrides[i]);
                  array_of_arrs.push(arr);

                } else {

                  arr.push(object.characterStyleOverrides[i]);

                }

              }

              prev = object.characterStyleOverrides[i];

            }

          }
        }

        // console.log("@@@@@@ array_of_arrs ", array_of_arrs, string);

        if (array_of_arrs.length > 0) {

          var prevIndex = 0;
          for (var i = 0; i < array_of_arrs.length; i++) {

            var ar = array_of_arrs[i];
            var key = ar[0];
            var lastIndex = ar.length + prevIndex;
            var text = string.substring(prevIndex, lastIndex);
            var match = /\r|\n/.exec(text);
            var attributes = setTextAttributes(object, key);

            if (match) {

              text = text.replace(/(?:\r\n|\r|\n)/g, '');

              var htmStr = "<div " + attributes + ">";
              htmStr += escapeHtml(text);
              htmStr += "</div>";

            } else {

              var htmStr = "<span " + attributes + ">";
              htmStr += escapeHtml(text);
              htmStr += "</span>";

            }

            // console.log("@@@@@", prevIndex, ar.length, string, htmStr);

            prevIndex = ar.length;
            
            html += htmStr;

          }

        } else {

          var text = string;
          var match = /\r|\n/.exec(text);
          var attributes = setTextAttributes(object, key);

          if (match) {

            text = text.replace(/(?:\r\n|\r|\n)/g, '');

            var htmStr = "<div " + attributes + ">";
            htmStr += escapeHtml(text);
            htmStr += "</div>";

          } else {

            var htmStr = "<span " + attributes + ">";
            htmStr += escapeHtml(text);
            htmStr += "</span>";

          }
          
          html += htmStr;

        }

      }

    }

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

  var elem = {};
  var type = object.type.toLowerCase(); // type - присутствует всегда

  elem["style"] = {};
  elem["class"] = "b-" + type;

  // добавляем position 
  if (object.id) {

    elem["node-id"] = object.id;
    elem["elementid"] = "el" + project_id.toLowerCase() + object.id.replace(":", "x");

    if (object.id == node_id) {
      elem["style"]["position"] = "relative"; //самый первый родитель, то есть - главный frame 
      elem["style"]["overflow"] = "hidden";  //элементы могут выходить за пределы frame, поэтому overflow: hidden нужен
    } else {
      elem["style"]["position"] = "absolute";
    }
    
  }

  // добавляем фон
  if (type != "text") {

    var fills = object.fills;

    if (fills) {
      if (fills.length > 0) {

        for (var i=0; i < fills.length; i++) {

          var fill = fills[i];
          var fillType = fill.type;

          if (fillType == "SOLID") {

            if (fill.color) {

              elem["style"]["background-color"] = generateRgbaString(fill.color);

            }

          }

          if (fillType == "GRADIENT_LINEAR") {

            console.log("hello GRADIENT_LINEAR", fill.gradientHandlePositions);
            console.log("hello GRADIENT_LINEAR2", fill.gradientStops);

            if (fill.gradientStops) {

              var x1 = fill.gradientHandlePositions[0]["x"];
              var y1 = fill.gradientHandlePositions[0]["y"];

              var x2 = fill.gradientHandlePositions[1]["x"];
              var y2 = fill.gradientHandlePositions[1]["y"];

              var deltaX = x2 - x1;
              var deltaY = y2 - y1;
              var rad = Math.atan2(deltaY, deltaX); // In radians

              var deg = rad * (180 / Math.PI)
              

              var gradient = "linear-gradient(";
              gradient += deg + "deg, ";

              for (var i=0; i < fill.gradientStops.length; i++) {

                gradient += generateRgbaString(fill.gradientStops[i].color);

                if (i != fill.gradientStops.length - 1) {
                  gradient += ", ";
                }

              }

              gradient += ")";

              elem["style"]["background-image"] = gradient;

            }

            // elem["style"]["background-image"] = "linear-gradient()";

            // {
            //   blendMode: 'NORMAL',
            //   type: 'GRADIENT_LINEAR',
            //   gradientHandlePositions: [ [Object], [Object], [Object] ],
            //   gradientStops: [ [Object], [Object] ]
            // }
          
          }


        }
        
      }

    }

  }

  // размеры и позиционирование элемента (left && top)
  if (object.absoluteBoundingBox) {
    
    if (object.id == node_id) {

      parentX = object.absoluteBoundingBox.x;
      parentY = object.absoluteBoundingBox.y;

    } else {

      // высчитывать позицию, если родитель не x=0 & y=0, т е если iframe смещен

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

  // для текста 
  if (type == "text") {

  }

  // для эллипса 
  if (type == "ellipse") {
    elem["style"]["border-radius"] = "100%";
  }

  // для прямоугольника 
  if (type == "rectangle") {
    if (object.cornerRadius) {
      elem["style"]["border-radius"] = object.cornerRadius + "px";
    }
    if (object.rectangleCornerRadii) {
      elem["style"]["border-top-left-radius"] = object.rectangleCornerRadii[0] + "px";
      elem["style"]["border-top-right-radius"] = object.rectangleCornerRadii[1] + "px";
      elem["style"]["border-bottom-right-radius"] = object.rectangleCornerRadii[2] + "px";
      elem["style"]["border-bottom-left-radius"] = object.rectangleCornerRadii[3] + "px";
    }
  }

  return generateStyleAttribute(elem);

}

var setTextAttributes = function(object, key) {

  var availableStyles = ["font-family", "font-weight", "font-size", "letter-spacing", "line-height-px"];
  var elem = {};
  elem["style"] = {};

  if (object.style) {

    styles(object.style);

  }

  // console.log("helllo key", object.styleOverrideTable[key]);

  if (key) {

    if (object.styleOverrideTable) {

      if (object.styleOverrideTable[key]) {

        styles(object.styleOverrideTable[key]);

      }

    }

  }

  function styles (styles) {

    var keys = Object.keys(styles);

    for (var i = 0; i < keys.length; i++) {

      var k = keys[i];
      var kebabKey = toKebabCase(k);

      if (availableStyles.indexOf(kebabKey) > -1) {

        if (kebabKey == "line-height-px") {

          kebabKey = "line-height";

        }

        if (kebabKey == "line-height" || kebabKey == "font-size" || kebabKey == "letter-spacing") {

          elem["style"][kebabKey] = styles[k] + "px";

        } else if (kebabKey == "font-family") {

          elem["style"][kebabKey] = "\"" + styles[k] + "\", sans-serif";

        } else {

          elem["style"][kebabKey] = styles[k];

        }

      }

      if (k == "fills") {

        if (styles[k].length == 1) {

          var color = styles[k][0];

          if (color.type.toLowerCase() == "solid") {

            elem["style"]["color"] = generateRgbaString(color.color);

          }


        }

      }

    }

  }

  return generateStyleAttribute(elem);

};

var generateStyleAttribute = function (elem) {

  var attributes = "";

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

        return (object.absoluteBoundingBox.x - closestParentX).toFixed(0) + "px";

      } else {

        return (object.absoluteBoundingBox.x - parentX).toFixed(0) + "px";

      }

    } else {

      return "0px";

    }

  }

}

var getElementTopPosition = function (object, parentY, closestParentY) {

  if (parentY != null){

    if (object.absoluteBoundingBox.y != closestParentY) {

      // если позиция iframe по y < 0
      if ( parentY < 0 ) {

        var top = object.absoluteBoundingBox.y + Math.abs(parentY);

        if (closestParentY != null) {

          var topClosestParent = closestParentY + Math.abs(parentY);

          return (top - topClosestParent) + "px";

        } else {

          return top + "px";

        }

      } else {
        // если позиция iframe по y > 0

        var top = object.absoluteBoundingBox.y - Math.abs(parentY);

        if (closestParentY != null) {

          var topClosestParent = closestParentY - Math.abs(parentY);

          return (top - topClosestParent) + "px";

        } else {

          return top + "px";

        }

      }

    } else {

      return "0px";

    }

  }

}

var toKebabCase = function (s) {

  return s.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "-" + y.toLowerCase()}).replace(/^-/, "");

}

var escapeHtml = function (unsafe) {
  return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.listen(PORT, function () {
  console.log("Express is listening at port: " + PORT);
});
