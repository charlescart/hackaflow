const path = require('path');
const fs = require('fs');
const uuidV1 = require('uuid/v1');
const StandarException = require("../exceptions/standard.exception");
const EXTENSION = require("../constant/constant").EXTENSION;

const uploadService = {
  createFolder: async (dir) => {
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
      return true;
    }else {
      return true;
    }
  },
  deleteFolder: async (folder) => {

  },
  deleteFile: async (file) => {

  },
  saveFile: async (req, res, next, folder) => {
    try {
      // obtener nombre del archivo
      var file = req.files.image;
      var cutName = file.name.split('.');
      var extFile = cutName[cutName.length - 1];

      if (EXTENSION.indexOf(extFile) < 0) {
        throw new StandarException(404, 'Las extensiones validas son ' + EXTENSION.join(', '));
      } else {
        var id = req.params.id;
        // nombre de archivo personalizado
        var avatarName = `${id}-${new Date().getMilliseconds()}-${uuidV1()}.${extFile}`;

        // mover el archivo del temporal a un path
        let create = await uploadService.createFolder(path.join(__dirname, `../uploads/${folder}/${id}`));
        if(create) {
          var pathFileSave = path.join(__dirname, `../uploads/${folder}/${id}/${avatarName}`);

          file.mv(pathFileSave, (err) => {
            if (err) {
              throw new StandarException(500, "Internal server error");
            }
          });

          return avatarName;
        }else {
          throw new StandarException(500, "Internal server error");
        }
      }
    } catch (error) {
      next(error);
    }
  },
  getFile: (route) => {

  },
  getAllFiles: (route) => {
    
  },
}

module.exports = uploadService;