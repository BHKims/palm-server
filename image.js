const mongoose = require('mongoose')

const imageSchema = mongoose.Schema({
    name: String,
    img: {data: Buffer, contentType: String}
});

//imageSchema.index({email:1, name:1});

imageSchema.statics.addImage = function(
    name,
    img
) {
    return new Promise((resolve, reject) => {
        var newImage = new this();
        newImage.name = name;
        newImage.img = img; 
        newImage.save((err, res) => {
            if(err){
                console.log(err);
                reject(err);}
            //console.log('[addImage] result: ', res);
            resolve(res);
        })
    })
}

module.exports = mongoose.model('Image', imageSchema);