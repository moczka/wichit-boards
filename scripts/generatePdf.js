const {exec} = require('child_process');
const fs = require('fs');

const INPUT = `${__dirname}/../pdf`;
const OUTPUT = `${__dirname}/../pdf/bundled`;
const PAGE = {
  PART_1: {width: 3300, height: 5100},
  PART_2: {width: 3300, height: 2635}
};

fs.readdir(INPUT, (err, files) => {
  const exportsMap = {};
   const {convertableFiles, missingPairFiles} = verifyFiles(files);
   // Convert files that have matching pairs.
   convertableFiles.forEach((image) => {
      createImage(image).then(createdImage => {
        // Keep track of the converted images
        exportsMap[createdImage] = true;
        const {background, overlay} = getImageParts(createdImage);
        // Only overlay images when both background and overlay have been converetd. 
        if (exportsMap[background] && exportsMap[overlay]) {
          overlayImages(background, overlay).then(convertToPdf);
        }
      });
   });
   if (missingPairFiles.length) {
    console.log("Some files have missing matching pairs. Take a look at: ", missingPairFiles.join("\n "));
   } else {
     console.log("All files are in place, converting...");
   }
});

/*
  Verifies the formatting of files and separates the files into arrays of matching or missing pairs.
*/
function verifyFiles(files) {
  const filesMap = {};
  const knownPages = {};
  // Only want files that match the formatting and are unique.
  const validFiles = files.filter((file) => {
    if (satisfyFormat(file) && !filesMap[file]) {
      const pageNumber = file.match(/page\d+/)[0];
      knownPages[pageNumber] = !knownPages[pageNumber] ? true : false;
      return true;
    }
    return false;
  });
  const returnValue = {
    convertableFiles: [],
    missingPairFiles: []
  };
  // Only want the files for pages with matching pairs.
  return validFiles.reduce((acc, file) => {
    const matchingFilename = getNameOfMatchingFile(file);
    const fileHasMatch = validFiles.some((possibleMatch) => possibleMatch === matchingFilename);
    // Place file in array of matching pairs or array of missing pairs.
    if (fileHasMatch) {
      acc.convertableFiles.push(file);
    } else {
      acc.missingPairFiles.push(file);
    }
    return acc;
  }, returnValue);
}

// PDF files need to satisfy this filenaming format to be convertable.
function satisfyFormat(file) {
  return /^page\d+-part[1-2]+.pdf$/.test(file);
}

// Draws the name of the matching file given the passed filename.
function getNameOfMatchingFile(file) {
  return file.includes('part1') ? file.replace('part1', 'part2') : file.replace('part2', 'part1');
}

function convertToPdf(image) {
  return (new Promise((res, rej) => {
    const command = `convert ${OUTPUT}/${image}.png ${OUTPUT}/${image}.pdf`;
    exec(command, (err) => {
      if (!err) {
        res(image);
        deleteFile(`${OUTPUT}/${image}.png`).then(resp => {
          console.log(`Stitched images for ${image} were deleted.`);
        })
      } else {
        rej(image);
      }
    }); 
  }));
}

// Will merge all the page pdfs into one.
function mergePdfs(pdfFiles) {
  return (new Promise((res, rej) => {
    const command = `convert -density 300 ${pdfFiles.join( )} ${OUTPUT}/output.pdf`;
    exec(command, (err) => {
      if (!err) {
        res();
      } else {
        rej();
      }
    });
  }));
}

function deleteFile(path) {
  return (new Promise((res, rej) => {
    const command = `rm ${path}`;
    exec(command, (err) => {
      if (!err) {
        res(`Removed file ${path}`);
      } else {
        rej(`Failed to remove file ${path}`);
      }
    });
  }));
}

// Returns the filename of the background and overlay images.
function getImageParts(createdImage) {

    let background = '';
    let overlay = '';

    if (createdImage.includes('part1')) {
      background = createdImage;
      overlay = getNameOfMatchingFile(createdImage);
    } else {
      background = getNameOfMatchingFile(createdImage);
      overlay = createdImage;
    }

    return {background, overlay};
}

function overlayImages(background, overlay) {
  return (new Promise((res, rej) => {
    
    const mergedImage = {geometry: `${PAGE.PART_1.width}x${(PAGE.PART_1.height + PAGE.PART_2.height)}`,
                         filename: background.match(/page\d+/g)[0]
                        };
    const command = `convert -size ${mergedImage.geometry} xc:black ${OUTPUT}/${background}.png -geometry +0+0 -composite ${OUTPUT}/${overlay}.png -geometry +0+${PAGE.PART_1.height} -composite ${OUTPUT}/${mergedImage.filename}.png`;
       
    exec(command, (err) => {
      if (!err) {
        res(mergedImage.filename);
        Promise.all([deleteFile(`${OUTPUT}/${background}.png`), deleteFile(`${OUTPUT}/${overlay}.png`)]).then(resp => {
          console.log(`Deleting image parts for ${mergedImage.filename}.`);
        });
      } else {
        rej(mergedImage.filename);
      }
    });
  }));
}

function createImage(path) {
  return (new Promise((res, rej) => {
    const fileFormat = path.match(/\w+$/g)[0];
    const fileName = path.match(/(\w+-\w+)/g)[0];
    const dimensions = fileName.includes('part2') ? `${PAGE.PART_2.width}x${PAGE.PART_2.height}` : `${PAGE.PART_1.width}x${PAGE.PART_1.height}`;
    const command = `convert -density 300 ${INPUT}/${path} ${OUTPUT}/${fileName}.png`;
    exec(command, (err) => {
      if (!err) {
        res(fileName);
      } else {
        rej(fileName);
      }
    });
  }));
}

