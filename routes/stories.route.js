const multer = require('multer');
const controller = require('../controllers/stories.controller');
const upload = multer({ dest: "./uploads" });

module.exports = function (app) {

    // app.post('/upload', upload.single("file"), controller.postFile);
    app.put("/update", upload.single("file"), controller.updateFile);
    app.delete("/delete", controller.deleteFile);
    app.get("/get-all", controller.getAllFile);
    // app.get("/public", controller.publicFile);

    app.get('/stories', controller.read);
    app.post('/stories/create', upload.single("file"), controller.create);
    app.put('/stories/update/:id', upload.single("file"), controller.updating);
    app.delete('/stories/delete/:id', controller.deleting);
}