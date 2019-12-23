var express = require("express");
var app = express.Router();

let {PythonShell} = require('python-shell');
var fs = require('fs');
const path = require('path');

var multer = require('multer');
const storage = multer.memoryStorage();
var upload = multer({storage: storage});

app.post('/', upload.single('fileObject'), (req,res) => {
    console.log('files: ', req.file.buffer);
    console.log('name: ', req.file.originalname);

    const imageFile = req.file.buffer;
    const fileName = req.file.originalname;

    var saveDir = path.join(__dirname, '../images', fileName);
    console.log('[saveDir] ', saveDir);
    fs.writeFile(saveDir, imageFile, (err) => {
        if(err) {
            //console.log(err);
            throw err;
        }

        var pyDir = path.join(__dirname, '../solution.py');

        let options = {
            mode: 'text',
            pythonOptions: ['-u'],
            args: [saveDir]
        };

        console.log('[CheckPoint]');
        PythonShell.run(pyDir, options, function(err) {
            if(err) throw err;
        
            console.log('finished');

            var sendDir = path.join(__dirname, '../images/result.png');
            fs.readFile(sendDir, (err, data) => {
                if(err) {
                    res.json({result: false, err:'readFile_Failed'});
                }

                let base64Image = new Buffer(data, 'binary').toString('base64');
                base64Image='data:image/png;base64,'+base64Image;
                res.json({
                    result: true, 
                    image: base64Image
                });
            })
            
        })
        
    })
})

module.exports = app;