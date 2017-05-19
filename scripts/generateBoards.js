
var gm = require('gm').subClass({imageMagick: true});
var exec = require('child_process').exec;

/*
  NOTE: Density can change, but this will cause the layout dimensions to change as well.
*/

var density = 300;
var dir = '';
var numItems = 7;
var partProto = {
  getGeometry: function(){
    return this.width+"x"+this.height;
  }
};
var container = Object.assign(Object.create(partProto), {
  width: 3300,
  height: 7425
});
var part1 = Object.assign(Object.create(partProto), {
  width: container.width,
  height: 5100
});
var part2 = Object.assign(Object.create(partProto), {
  width: container.width,
  height: 2325
});

init();

/*
var container = {path: 'page1-part1.png', ops: {extent: container.getGeometry()}};
var child = {path: 'page1-part2.png'};
var outputImage = {path: 'page1.png', ops: {geometry: ("+0+"+part1.height), composite: ""}};

mergeImages(container, child, outputImage).then(() =>{ console.log("DONE") });
*/


function init(){



  // create images
  for(var j=1; j<=numItems; j++){

    (function(i){

      var convertPromises = [];

      var sourcePart1 = dir+'page'+i+'-'+'part1.pdf';
      var sourcePart2 = dir+'page'+i+'-'+'part2.pdf';
      var boardImage = dir+'board'+i+".png";

      var outputPart1 = dir+sourcePart1.replace("pdf", "png");
      var outputPart2 = dir+sourcePart2.replace("pdf", "png");

      convertPromises.push(convertTo({path: sourcePart1, ops: {density: 300}}, {path: outputPart1, ops: {extent: part1.getGeometry()}}));
      convertPromises.push(convertTo({path: sourcePart2, ops: {density: 300}}, {path: outputPart2, ops: {extent: part2.getGeometry()}}));

      var mergePromise = Promise.all(convertPromises).then(function(values){

        console.log('Merger is running!!');
        console.log('values provided by promises: ', values);



        var containerInfo = {path: outputPart1, ops: {extent: container.getGeometry()}};
        var childInfo = {path: outputPart2};
        var outputInfo = {path: boardImage, ops: {geometry: ("+0+"+part1.height), composite: ""}};

        mergeImages(containerInfo, childInfo, outputInfo).then(() =>{

          removeFile(containerInfo.path, childInfo.path);
          console.log("DONE merging images.") });



      });



    })(j);

  }

}

function mergeImages(container, child, output){

  console.log('merge images being called! ');

  return convertTo(container, child, output);

}

function convertTo(source, output){

    var files = [].slice.call(arguments, 0);
    var command = "convert";

    if(files.length < 2) throw (new Error("Not enough files"));

    for(var i=0; i<files.length; i++){

      var currentFile = files[i];

      if(!currentFile.path) throw (new Error("No path provided"));

      var currentOptions = Object.keys(currentFile.ops || []).reduce((option, flag) =>{

        return (option + " -"+ flag + " " + currentFile.ops[flag] + " ");

      }, " ");

      currentOptions += currentFile.path;
      command += currentOptions;

    }

    var convertPromise = new Promise(function(res, rej){

      console.log(command);

      exec(command, function(err, stdout, stderr){

        if(err != null){

          console.log('failed! ', err)
          rej("Convertion failed!");

        }else{

          console.log('it succeeeded');
          res(output.path);

        }

      });

    });

    return convertPromise;

}

function removeFile(){

  var args = [].slice.call(arguments, 0);
  var filePath = '';

  for(var i=0; i<args.length; i++){

      filePath = args[i];

      exec('rm '+filePath, function(err, stdout, stderr){
        if(err != null){
          console.log("There was an error removing file "+ err);
          return false;
        }else{
          return true;
        }
      });
  }

}

/*
'convert -extent 792x1782 page1-part1.png page1-part2.png -geometry +0+1224 -composite total.png'

 convert -density 300 page1-part2.pdf -extract 3300x2324 page1-part2.png

convert -extent 3300x7424 page1-part1.png page1-part2.png -geometry +0+1224 -composite total.png
*/
