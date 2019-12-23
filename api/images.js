var express = require("express");
var app = express.Router();
var Image = require('../image');

let {PythonShell} = require('python-shell');
var fs = require('fs');
const path = require('path');
const gm = require('gm');

var multer = require('multer');
const storage = multer.memoryStorage();
var upload = multer({storage: storage});

app.post('/save', upload.single('fileObject'), (req,res) => {
    //console.log('files: ', req.file.buffer);
    console.log('===> POST /api/images/save');
    console.log('name: ', req.file.originalname);

    const imageFile = req.file.buffer;
    const fileName = req.file.originalname;

    let img = {data: imageFile, contentType: 'image/png'};

    let base64Image = new Buffer(imageFile, 'binary').toString('base64');
    base64Image='data:image/png;base64,'+base64Image;

    Image.find({name: fileName}, (err, image) => {
        console.log('[length]: ', image.length);
        if(image.length > 0) {
            res.json({result: false, err: 'image_same_name_exists'});
        }
        else {
            Image.addImage(fileName, img).then(data => {
                res.json({result: true, data: data});
            })
            .catch(err => {
                res.json({result: false, err: err});
            })
        }
    })
});

app.post('/process', (req, res) => {
    console.log('===> POST /api/images/process');
    const fileName = req.body.fileName;

    Image.findOne({name: fileName}, (err, image) => {
        console.log('[process] image: ', image);

        const imgBuffer = image.img.data;
        var saveDir = path.join(__dirname, '../images/process.png');
        console.log('[saveDir] ', saveDir);

        fs.writeFile(saveDir, imgBuffer, (err) => {
            if(err) {
                //console.log(err);
                throw err;
            }
            console.log('[Please Check Image Direction!]');
            // gm(saveDir)
            // .size((err, size) => {
            //     if(err) throw err;
            //     console.log('width: ', size.width, ' height: ', size.height);
            // })

            var pyDir = path.join(__dirname, '../solution.py');

            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: [saveDir]
            };

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

        });

    })
})

module.exports = app;