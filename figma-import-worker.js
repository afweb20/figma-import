const FORUHOST = "http://localhost:3000";
const FORUTOKEN = "UI3sVyzKtTvq1CCgu0j2cASQbQvJpDUqZW8goTJse6iG";
const FORUFONTSKEY = "4uy343y4378478nrejjkvne9803u234u3htjh54bk21209klsdfn48390hfn8**(*(fenjkqlkvbwlhbwhvbw9040943jflk12nlk21gb";

const { parentPort, workerData } = require("worker_threads");
var axios = require("axios");
var parentX = null;
var parentY = null;
var images = null;
var himalaya = require("himalaya");
var loadedFonts = [];
var fs = require("fs");
var request = require('request');

parentPort.on("message", function (data) {

  getFigmaContent();

});

var getFigmaContent = async function () {

  sendStatus(5);

  // получение картинок
  var responseimg = await axios({
    method: "get",
    url: "https://api.figma.com/v1/files/" + workerData.project_id + "/images",
    headers: { "Authorization": "Bearer " + workerData.figma_token },
  });

  if (responseimg) {
    if (responseimg.data) {
      if (responseimg.data.meta) {
        if (responseimg.data.meta.images) {
          images = responseimg.data.meta.images;
        }
      }
    }
  }

  sendStatus(35);  

  // получение всех элементов
  var response = await axios({
    method: "get",
    url: "https://api.figma.com/v1/files/" + workerData.project_id + "/nodes?ids=" + workerData.node_id,
    headers: { "Authorization": "Bearer " + workerData.figma_token },
  });


  sendStatus(50);

  var mainObject = response.data.nodes[workerData.node_id].document;

  var mainObjectString = JSON.stringify(mainObject);
  var regex = /"id":"(.+?)"/g;
  var mainObjectArray = mainObjectString.match(regex);

  var counter = {};
  counter.index = 0;
  counter.times = 20;
  counter.partnumber = 1;
  counter.part = Math.ceil(mainObjectArray.length / counter.times);
  counter.status = 50;

  var data = {};
  var elementObject = await generateElementObject(counter, mainObject, workerData.project_id, workerData.node_id, null, null, null, null, workerData.figma_token);

  sendStatus(95);

  data.sitecontent = await getSitecontent(elementObject, mainObject, workerData.project_id, workerData.node_id, null, null, null, workerData.figma_token);
  data.html = await getHtml(elementObject, mainObject, workerData.project_id, workerData.node_id, null, null, null, workerData.figma_token);
  data.fonts = loadedFonts;

  var htmlHimalaya = await getHtmlHimalaya(elementObject, mainObject, workerData.project_id, workerData.node_id, null, null, null, workerData.figma_token);
  data.himalaya = himalaya.parse(htmlHimalaya);

  setPageFonts(data.fonts);
  createBlock(data);

}


var generateElementObject = async function (counter, object, project_id, node_id, closest_parent_x, closest_parent_y, elementid, parent, figma_token) {

  if (counter.index > (counter.part * counter.partnumber)) {

    counter.status = counter.status + 2;
    sendStatus(counter.status);
    counter.partnumber++;

  }

  var type = object.type; //type есть  всегда
  var elementObject = {};

  var visible = true;

  if (object.hasOwnProperty("visible")) {

    visible = object.visible;

  }

  if (!visible) {

    return false;

  }

  if (!elementid) {
    elementid = "el" + project_id.toLowerCase() + object.id.replace(":", "x");
  }

  elementObject[elementid] = {};
  elementObject[elementid]["tag"] = "div";
  elementObject[elementid]["nodeid"] = object.id;
  elementObject[elementid]["figma-element"] = type.toLowerCase();
  elementObject[elementid]["style"] = await createSitecontentStyles(object, project_id, node_id, closest_parent_x, closest_parent_y, parent, figma_token, elementObject, elementid);

  if (object["children"]) {

    if (object["children"].length > 0) {

      if (object.absoluteBoundingBox) {

        if (object.absoluteBoundingBox.x) {
          closest_parent_x = object.absoluteBoundingBox.x;
        }

        if (object.absoluteBoundingBox.y) {
          closest_parent_y = object.absoluteBoundingBox.y;
        }

      }

      elementObject[elementid]["children"] = [];

      parent = elementObject[elementid];

      for (var i = 0; i < object["children"].length; i++) {

        var child = await generateElementObject(counter, object["children"][i], project_id, node_id, closest_parent_x, closest_parent_y, null, parent, figma_token);

        elementObject[elementid]["children"].push(child);

      }

    }

  } else {

    if (type == "TEXT") {

      if (object.characters) {

        elementObject[elementid] = addTextPropertiesToObject(object, elementObject, elementid);

      }

    }

  }

  counter.index++;

  return elementObject;

}


var getHtml = async function (elementObject, object, project_id, node_id, closest_parent_x, closest_parent_y, elementid, figma_token) {

  var keys = Object.keys(elementObject);

  if (keys.length > 0) {

    for (var i = 0; i < keys.length; i++) {

      var k = keys[i];

      var html = generateHtmlElement(k, elementObject[k]);

    }

  }

  function generateHtmlElement(elementid, element) {

    var tag = element["tag"];

    var htmElement = "<" + tag;
    htmElement += " class=\"" + element["classes"] + "\"";
    htmElement += " elementid=\"" + elementid + "\"";

    if (element["nodeid"]) {

      htmElement += " node-id=\"" + element["nodeid"] + "\""; // исключить в будущем

    }

    var styleKeys = Object.keys(element["style"]);

    if (styleKeys.length > 0) {

      htmElement += " style=\"";

      for (var i = 0; i < styleKeys.length; i++) {

        var k = styleKeys[i];

        htmElement += k + ": " + element["style"][k] + "; ";

      }

      htmElement += "\"";

    }

    htmElement += ">";

    if (element.children) {

      for (var p = 0; p < element.children.length; p++) {

        var child = element.children[p];

        var childKeys = Object.keys(child);

        if (childKeys.length > 0) {

          for (var m = 0; m < childKeys.length; m++) {

            var key = childKeys[m];

            htmElement += generateHtmlElement(key, child[key]);

          }

        }


      }

    }

    if (element["text"]) {

      htmElement += element["text"];

    }

    htmElement += "</" + tag + ">";

    return htmElement

  }

  return html;

}


var getHtmlHimalaya = async function (elementObject, object, project_id, node_id, closest_parent_x, closest_parent_y, elementid, figma_token) {

  var keys = Object.keys(elementObject);

  if (keys.length > 0) {

    for (var i = 0; i < keys.length; i++) {

      var k = keys[i];

      var html = generateHtmlElement(k, elementObject[k]);

    }

  }

  function generateHtmlElement(elementid, element) {

    var tag = element["tag"];

    var htmElement = "<" + tag;
    htmElement += " elementid=\"" + elementid + "\"";
    htmElement += " figma-element=\"" + element["figma-element"] + "\"";
    htmElement += " ngClass=\"sitecontent." + elementid + ".classes\"";
    htmElement += " ngStyle=\"sitecontent." + elementid + ".style\"";

    if (element["text"]) {

      htmElement += " ngModel=\"sitecontent." + elementid + ".text\"";
      htmElement += " uiTinymce=\"tinymceOptions\"";

    }

    if (tag == "img") {

      htmElement += " ngSrc=\"{{sitecontent." + elementid + ".src}}\"";
      htmElement += "/>";

    } else {

      htmElement += ">";

    }


    if (element.children) {

      for (var p = 0; p < element.children.length; p++) {

        var child = element.children[p];

        var childKeys = Object.keys(child);

        if (childKeys.length > 0) {

          for (var m = 0; m < childKeys.length; m++) {

            var key = childKeys[m];

            htmElement += generateHtmlElement(key, child[key]);

          }

        }


      }

    }

    if (tag != "img") {
      htmElement += "</" + tag + ">";
    }

    return htmElement

  }

  return html;

}


var getSitecontent = async function (elementObject, object, project_id, node_id, closest_parent_x, closest_parent_y, elementid, figma_token) {

  var sitecontent = {};

  var keys = Object.keys(elementObject);

  if (keys.length > 0) {

    for (var i = 0; i < keys.length; i++) {

      var k = keys[i];

      sitecontent[k] = generateSitecontent(elementObject[k]);

    }

  }

  function generateSitecontent(element) {

    var content = {};

    if ("classes" in element) {
      content["classes"] = element["classes"];
    }

    if ("style" in element) {
      content["style"] = element["style"];
    }

    if ("text" in element) {
      content["text"] = element["text"];
    }

    if ("src" in element) {
      content["src"] = element["src"];
    }

    if (element.children) {

      for (var p = 0; p < element.children.length; p++) {

        var child = element.children[p];

        var childKeys = Object.keys(child);

        if (childKeys.length > 0) {

          for (var m = 0; m < childKeys.length; m++) {

            var key = childKeys[m];

            sitecontent[key] = generateSitecontent(child[key]);

          }

        }

      }

    }

    return content;

  }

  return sitecontent;

}


var getUpload = function(file) {

  return new Promise(function (resolve, reject) {
    var req = request.post('http://localhost:3000/api/v1/figmaimports/createupload', function (err, res, body) {
      if (err) throw new Error(err);
      if (res && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      };
    });
    var form = req.form();
    form.append("website_id", workerData.website_id);
    form.append('image', file);
  });

}


var generateImageFromElement = async function (figma_token, project_id, object_id) {

  var image = null;

  var responseVectorImage = await axios({
    method: "get",
    url: "https://api.figma.com/v1/images/" + project_id + "?ids=" + object_id,
    headers: { "Authorization": "Bearer " + figma_token },
  })

  if (responseVectorImage) {

    if (responseVectorImage.data) {

      if (responseVectorImage.data.images) {

        if (responseVectorImage.data.images[object_id]) {

          var imageUrl = responseVectorImage.data.images[object_id];
          var imagePath = "./figma-image-" + generateRandomNumber(5) + ".png";
          var writeStream = request(imageUrl).pipe(fs.createWriteStream(imagePath));

          await new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
              resolve();  
            }).on('error', err => {
              reject(err);
            });
          });
        
          var readStream = fs.createReadStream(imagePath);
          var upload = await getUpload(readStream);
          var json = JSON.parse(upload);
          image = json.image_url;

          try {
            fs.unlinkSync(imagePath)
          } catch(err) {
            console.error(err)
          }

        }

      }

    }

  } 

  return image;

}


var createSitecontentStyles = async function (object, project_id, node_id, closest_parent_x, closest_parent_y, parent, figma_token, elementObject, elementid) {

  var type = object.type;
  var style = {};
  style["box-sizing"] = "border-box";

  var needImageCreation = false;

  if (type == "VECTOR" || type == "REGULAR_POLYGON") {

    needImageCreation = true;

  }

  // добавляем position 
  if (object.id == node_id) {
    style["position"] = "relative"; //самый первый родитель, то есть - главный frame 
    style["overflow"] = "hidden";  //элементы могут выходить за пределы frame, поэтому overflow: hidden нужен
    style["margin"] = "0 auto";
  } else {
    style["position"] = "absolute";
  }

  // размеры и позиционирование элемента (left && top)
  if (object.absoluteBoundingBox) {

    if (object.id == node_id) {

      parentX = object.absoluteBoundingBox.x;
      parentY = object.absoluteBoundingBox.y;

    } else {

      // высчитывать позицию, если родитель не x=0 & y=0, т е если iframe смещен

      style["left"] = getElementLeftPosition(object, parentX, closest_parent_x);
      style["top"] = getElementTopPosition(object, parentY, closest_parent_y);

    }

    if (object.absoluteBoundingBox.width) {
      style["width"] = object.absoluteBoundingBox.width.toFixed(0) + "px";
    }

    if (object.absoluteBoundingBox.height) {
      style["height"] = object.absoluteBoundingBox.height.toFixed(0) + "px";
    }

  }


  // добавляем фон (у vector & plygon добавляется фоновое изображение, фоновый цвет не нужен)
  if (type != "TEXT" && type != "VECTOR" && type != "REGULAR_POLYGON") {

    var fills = object.fills;

    if (fills) {
      if (fills.length > 0) {

        for (var i = 0; i < fills.length; i++) {

          var fill = fills[i];
          var fillType = fill.type;

          // если не добавлен backgroundColor
          if (!object.backgroundColor) {

            if (fillType == "SOLID") {

              if (fill.color) {

                var visibleFill = true;

                if (fill.hasOwnProperty("visible")) {

                  visibleFill = fill.visible;

                }

                if (visibleFill) {

                  style["background-color"] = generateRgbaString(fill.color);

                }

              }

            }

          }

          if (fillType == "IMAGE") {

            if (fill.imageRef) {

              if (images) {

                if (images[fill.imageRef]) {

                  style["background-image"] = "url(" + images[fill.imageRef] + ")";
                  
                  var cls = elementObject[elementid]["classes"];
                  elementObject[elementid]["classes"] = cls + " force-significate";

                  if (fill.scaleMode == "FILL") {
                    style["background-size"] = "cover";
                    style["background-position"] = "center center";
                  }

                }

                if (fill.imageTransform) {
                  style["background-size"] = "cover";
                }

              }
            }


          }

          if (fillType == "GRADIENT_LINEAR" || fillType == "GRADIENT_RADIAL") {

            needImageCreation = true;

          }

          // добавляем прозрачность, если задана прозрачность фона
          if (fill.opacity) {

            style["opacity"] = fill.opacity.toFixed(2);

          }

        }

      }

    }

  }


  // формируем картинку для векторных элементов
  if (needImageCreation) {

    // для вектора формируем картинку, иначе никак 
    // генерация картинки из элемента
    var image = await generateImageFromElement(figma_token, project_id, object.id);

    elementObject[elementid]["tag"] = "img"
    elementObject[elementid]["src"] = image;

    var cls = elementObject[elementid]["classes"];
    elementObject[elementid]["classes"] = cls + " force-significate";

  }

  // добавляем фон
  if (object.backgroundColor) {

    style["background-color"] = generateRgbaString(object.backgroundColor);

  }

  // добавляем эффекты (тени и тд)
  if (object.effects) {

    for (var i = 0; i < object.effects.length; i++) {

      var effect = object.effects[i];

      if (effect.type == "DROP_SHADOW") {

        if (effect.visible) {

          style["box-shadow"] = effect.offset.x + " " + effect.offset.y + " " + effect.radius + "px " + generateRgbaString(effect.color);;

        }

      }

    }

  }

  // для текста 
  if (type == "TEXT") {

  }

  // для эллипса 
  if (type == "ELLIPSE") {

    style["border-radius"] = "100%";

  }

  // для прямоугольника 
  if (type == "RECTANGLE" || type == "FRAME") {

    if (object.cornerRadius) {
      style["border-radius"] = object.cornerRadius + "px";
    }

    if (object.rectangleCornerRadii) {
      style["border-top-left-radius"] = object.rectangleCornerRadii[0] + "px";
      style["border-top-right-radius"] = object.rectangleCornerRadii[1] + "px";
      style["border-bottom-right-radius"] = object.rectangleCornerRadii[2] + "px";
      style["border-bottom-left-radius"] = object.rectangleCornerRadii[3] + "px";
    }

  }

  if (type == "RECTANGLE" || type == "FRAME" || type == "ELLIPSE") {

    // добавляем бордер
    if (object.strokes) {

      if (object.strokes.length == 1) {

        var stroke = object.strokes[0];

        var visibleStroke = true;

        if (stroke.hasOwnProperty("visible")) {

          visibleStroke = stroke.visible;

        }

        if (visibleStroke) {

          if (stroke.type) {

            style["border-style"] = stroke.type.toLowerCase();

          }

          if (stroke.color) {

            style["border-color"] = generateRgbaString(stroke.color);

          }

          if (object.strokeWeight) {

            style["border-width"] = object.strokeWeight + "px";

          }

        }

      }

    }

  }

  // Если маска, то применить часть стилей к родителю
  if (object.isMask) {

    parent["style"]["overflow"] = "hidden";

    style["background-color"] = "transparent";

    if (style["border-radius"]) {
      parent["style"]["border-radius"] = style["border-radius"];
    }

    if (style["border-top-left-radius"]) {
      parent["style"]["border-top-left-radius"] = style["border-top-left-radius"];
    }

    if (style["border-top-right-radius"]) {
      parent["style"]["border-top-right-radius"] = style["border-top-right-radius"];
    }

    if (style["border-bottom-right-radius"]) {
      parent["style"]["border-bottom-right-radius"] = style["border-bottom-right-radius"];
    }

    if (style["border-bottom-left-radius"]) {
      parent["style"]["border-bottom-left-radius"] = style["border-bottom-left-radius"];
    }

  }

  return style;

}


var generateTextStyles = function (style, object, key) {

  // var availableStyles = ["font-family", "font-weight", "font-size", "letter-spacing", "line-height-px"];

  if (!style) {
    style = {};
  }

  // добавляем цвет тексту 
  if (object.fills) {

    if (object.fills.length == 1) {

      if (object.fills[0].type == "SOLID") {

        if (object.fills[0].color) {

          style["color"] = generateRgbaString(object.fills[0].color);

        }

      }

    }

  }

  if (object.style) {

    styles(object.style);

  }

  if (key) {

    if (object.styleOverrideTable) {

      if (object.styleOverrideTable[key]) {

        styles(object.styleOverrideTable[key]);

      }

    }

  }

  function styles(styles) {

    var keys = Object.keys(styles);

    for (var i = 0; i < keys.length; i++) {

      var k = keys[i];

      if (k == "fontFamily") {

        style["font-family"] = "\'" + styles[k] + "\'";

        // для разработки  (подгрузка шрифтов)
        var fontString = styles[k].replace(/\s/g, "+");
        if (loadedFonts.indexOf(fontString) == -1) {
          loadedFonts.push(fontString);
        }

      }

      if (k == "fontWeight") {

        style["font-weight"] = styles[k];

      }

      if (k == "letterSpacing") {

        style["letter-spacing"] = styles[k].toFixed(0) + "px";

      }

      if (k == "lineHeightPx") {

        style["line-height"] = styles[k].toFixed(0) + "px";

      }

      if (k == "textCase") {

        var textCase = styles.textCase;

        if (textCase == "UPPER") {

          style["text-transform"] = "uppercase";

        }

        if (textCase == "LOWER") {

          style["text-transform"] = "lowercase";

        }

        if (textCase == "TITLE") {

          style["text-transform"] = "capitalize";

        }

      }

      if (k == "textAlignHorizontal") {

        var textAlignHorizontal = styles.textAlignHorizontal;

        if (textAlignHorizontal == "LEFT") {

          style["text-align"] = "left";

        }

        if (textAlignHorizontal == "RIGHT") {

          style["text-align"] = "right";

        }

        if (textAlignHorizontal == "CENTER") {

          style["text-align"] = "center";

        }

        if (textAlignHorizontal == "JUSTIFIED") {

          style["text-align"] = "justify";

        }

      }

      if (k == "fontSize") {

        var fontSize = styles.fontSize;

        style["font-size"] = fontSize + "px";

      }

      function isOdd(num) { return num % 2; }

      if (k == "fills") {

        if (styles[k].length == 1) {

          var color = styles[k][0];

          if (color.type.toLowerCase() == "solid") {

            style["color"] = generateRgbaString(color.color);

          }


        }

      }

    }

  }

  return style;

};


var addTextPropertiesToObject = function (object, elementObject, elementid) {

  var string = object.characters;
  var arrayOfCharArrays = [];
  var prev = null;

  if (object.characterStyleOverrides) {
    if (object.characterStyleOverrides.length > 0) {

      for (var i = 0; i < object.characterStyleOverrides.length; i++) {

        if (prev == null) {

          var arr = [];
          arr.push(object.characterStyleOverrides[i]);
          arrayOfCharArrays.push(arr);

        } else {

          if (prev != object.characterStyleOverrides[i]) {

            var arr = [];
            arr.push(object.characterStyleOverrides[i]);
            arrayOfCharArrays.push(arr);

          } else {

            arr.push(object.characterStyleOverrides[i]);

          }

        }

        prev = object.characterStyleOverrides[i];

      }

    }
  }

  if (arrayOfCharArrays.length > 0) {

    elementObject[elementid]["children"] = [];

    var prevIndex = 0;

    for (var i = 0; i < arrayOfCharArrays.length; i++) {

      var index = i + 1;
      var childTextElementid = elementid + "text" + index;
      var child = {};
      child[childTextElementid] = {};
      child[childTextElementid]["figma-element"] = "text-string"; 
      child[childTextElementid]["classes"] = "force-significate"; 

      var ar = arrayOfCharArrays[i];
      var key = ar[0];
      child[childTextElementid]["style"] = generateTextStyles(null, object, key);

      var lastIndex = ar.length + prevIndex;
      var text = string.substring(prevIndex, lastIndex);
      var match = /\r|\n/.exec(text);

      if (match) {

        text = text.replace(/(?:\r\n|\r|\n)/g, ' ');
        child[childTextElementid]["tag"] = "div";

      } else {

        child[childTextElementid]["tag"] = "span";

      }

      child[childTextElementid]["text"] = escapeHtml(text);

      prevIndex += ar.length;

      elementObject[elementid]["children"].push(child);

    }

  } else {

    var text = string;
    var match = /\r|\n/.exec(text);
    var style = elementObject[elementid]["style"];

    elementObject[elementid]["style"] = generateTextStyles(style, object, key);

    if (match) {

      text = text.replace(/(?:\r\n|\r|\n)/g, ' ');

      elementObject[elementid]["tag"] = "div";

    } else {

      elementObject[elementid]["tag"] = "span";

    }

    elementObject[elementid]["text"] = escapeHtml(text);

  }

  return elementObject[elementid];

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

  if (parentX != null) {

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

  if (parentY != null) {

    if (object.absoluteBoundingBox.y != closestParentY) {

      // если позиция iframe по y < 0
      if (parentY < 0) {

        var top = object.absoluteBoundingBox.y + Math.abs(parentY);

        if (closestParentY != null) {

          var topClosestParent = closestParentY + Math.abs(parentY);

          return (top - topClosestParent).toFixed(0) + "px";

        } else {

          return top.toFixed(0) + "px";

        }

      } else {
        // если позиция iframe по y > 0

        var top = object.absoluteBoundingBox.y - Math.abs(parentY);

        if (closestParentY != null) {

          var topClosestParent = closestParentY - Math.abs(parentY);

          return (top - topClosestParent).toFixed(0) + "px";

        } else {

          return top.toFixed(0) + "px";

        }

      }

    } else {

      return "0px";

    }

  }

}


var sendStatus = async function (status) {

  var finished = false;

  if (status == 100) {
    finished = true;
  }

  try {

    const { data } = await axios({
      method: "put",
      url: FORUHOST + "/api/v1/figmaimports/updatejobstatus",
      headers: { "X-Access-Token": FORUTOKEN },
      data: {
        jobid: workerData.task_id,
        percent: status,
        finished: finished
      }
    });

    if (!workerData.website_id) {

      workerData.website_id = data.website_id;

    }


  } catch (err) {

      if (err.response.status === 404) {

        console.log('Resource could not be found!');

      } else {

        console.log(err.message);

      }
      
  }

}


var createBlock = async function (block) {

  sitecontentData = [];

  var keys = Object.keys(block.sitecontent);


  for (var index = 0; index < keys.length; index++) {

    var element = keys[index];
    var obj = {};
    obj[element] = block.sitecontent[element];
    
    sitecontentData.push(obj);
    
  }


  try {

    const { data } = await axios({
      method: "post",
      url: FORUHOST + "/private/createblock",
      data: {
        id: workerData.website_id,
        page_id: null, 
        block: {
          content: block.himalaya[0], 
          blocktype: "json", 
          position: 0, 
          sitecontent: sitecontentData
        }
      }
    });

    sendStatus(100);

  } catch (err) {

      if (err.response.status === 404) {

        console.log('Resource could not be found!');

      } else {

        console.log(err.message);

      }
      
  }

};


var setPageFonts = async function (fonts) {

  try { 

    const { data } = await axios({
      method: "post",
      url: FORUHOST + "/api/v1/servicemethods/setpagefonts",
      data: {
        siteid: workerData.website_id,
        fonts: fonts,
        key: FORUFONTSKEY
      }
    });

  } catch (err) {

    if (err.response.status === 404) {

      console.log('Resource could not be found!');

    } else {

      console.log(err.message);

    }
    
  }

}


var escapeHtml = function (unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


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