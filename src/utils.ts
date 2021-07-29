const path = require('path');
const fs = require('fs');

function emptyDirectory (target: string) {
  for (const p of fs.readdirSync(target)) {
    rm(path.join(target, p));
  }
  fs.rmdirSync(target);
}

function rm (target: string) {
  if (fs.statSync(target).isDirectory()) {
    emptyDirectory(target);
  } else {
    fs.unlinkSync(target);
  }
}

export {
  emptyDirectory,
  rm
};
