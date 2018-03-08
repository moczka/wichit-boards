const {exec} = require('child_process');
const fs = require('fs');

fs.readdir(`${__dirname}/../public`, (err, items) => {
   items.forEach(console.log);
});

console.log(__filename, 'filename');
console.log(__dirname, 'dirname');