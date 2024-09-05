const cloudinary = require('cloudinary').v2;


exports.uploadToCloudinary = async (image, folderName) => {
    const uploadedResponse = await cloudinary.uploader.upload(image, {
        folder: folderName
    });

    return uploadedResponse.secure_url;
}

exports.destroyFromCloudinary = async (imageUrl, folderName) => {
    //extract public_id from secure_url (that is stored in our MongoDb actually) so it could be used for src value in the front end
    //concatenate with folder name
    const public_id = `${folderName}/${imageUrl.split('/').pop().split('.')[0]}`;

    await cloudinary.uploader.destroy(public_id);
}