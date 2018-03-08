const {exec} = require('child_process');
const fs = require('fs');

const INPUT = `${__dirname}/../pdf`;
const OUTPUT = `${__dirname}/../pdf/bundled`;
const PAGE = {
  PART_1: {width: 2550, height: 4200},
  PART_2: {width: 2550, height: 1540}
};

fs.readdir(INPUT, (err, files) => {
  const exportsMap = {};
   const images = files.filter(file => {
    if (/page\d+-part[1-2].pdf/.test(file)) {
      return true;
    } else if (file.includes('pdf')) {
      console.log(`Check ${file} it doesn't follow the page#-part# format!`);
      return false;
    }
    return false;
   })
   console.log("Convertion has started...");
   images.forEach((image) => {
    if (image.includes('pdf')) {
      createImage(image).then(createdImage => {
        exportsMap[createdImage] = true;

        const {background, overlay} = getImageParts(createdImage);
        if (exportsMap[background] && exportsMap[overlay]) {
          overlayImages(background, overlay).then(convertToPdf);
        }
      });
    }
   });
});

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

function getImageParts(createdImage) {
    const background = createdImage.includes('part1') ? createdImage : createdImage.replace('part2', 'part1');
    const overlay = background.replace('part1', 'part2');
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

