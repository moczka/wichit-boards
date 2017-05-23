
const gm = require('gm').subClass({imageMagick: true});
const exec = require('child_process').exec;
const fs = require('fs');

/*
  NOTE: Density can change, but this will cause the layout dimensions to change as well.
*/

var density = 300;
var dir = '';
const DIR = {
  PDF_DIR: "pdfs/",
  PNG_DIR: "pngs/"
};

var numItems = 7;
var partProto = {
  getGeometry: function(){
    return this.width+"x"+this.height;
  }
};

const constructor = {
  container : Object.assign(Object.create(partProto), {
      width: 3300,
      height: 7425
  }),
  part1: Object.assign(Object.create(partProto), {
      width: 3300,
      height: 5100
  }),
  part2: Object.assign(Object.create(partProto), {
      width: 3300,
      height: 2325
  })
};


init();

function init(){
  
  const directoryRead = (new Promise((res, rej) => {

    fs.readdir("scripts/", (err, files) => {

      if(err !== null){

        rej({message: "Error reading directory: ", error: err});

      }else{

        files = files.filter( file => !(file[0] === "." || file === "generateBoards.js") ).map( file => __dirname+"/"+file);
        res(files);

      }

  });

})).then((files) => {

    const convertPromises = files.map((filePath, index) => {

        const outputPath = filePath.replace(/.pdf/, ".png");
        const partName = filePath.slice(-9, -4); 

        return convertTo({path: filePath, ops: {density: 300}}, {path: outputPath, ops: {extent: constructor[partName].getGeometry()}});

    });

    return Promise.all(convertPromises);

}).then((convertedFiles) => {

    const mergePromises = [];

        convertedFiles.forEach((convertedFile) => {

          if(!(/part1/.test(convertedFile))) return;

          const part1Path = convertedFile;
          const part2Path = convertedFile.replace("part1", "part2");
          const finalImage =  __dirname+"/"+convertedFile.slice(-15, -10) + ".png";

          var containerInfo = {path: part1Path, ops: {extent: constructor["container"].getGeometry()}};
          var childInfo = {path: part2Path};
          var outputInfo = {path: finalImage, ops: {geometry: ("+0+"+constructor["part1"].height), composite: ""}};

          const mergePromise = mergeImages(containerInfo, childInfo, outputInfo).then(() =>{

              removeFile(containerInfo.path, childInfo.path);
            
          });

        mergePromises.push(mergePromise);
    
    });

    return Promise.all(mergePromises);

}).then(() => {

   console.log("Done merging all images!");

}).catch((failure) => {

    console.log(failure.message, failure.error);

});

}

function mergeImages(container, child, output){

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

      exec(command, function(err, stdout, stderr){

        if(err !== null){

          console.log('failed! ', err)
          rej("Convertion failed!");

        }else{

          console.log('Conversion succeeded.');
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
          console.log("There was an error removing file ", err);
          return false;
        }else{
          return true;
        }
      });
  }

}