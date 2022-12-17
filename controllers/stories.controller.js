const Stories = require("../models/stories");
const check = require('joi');
const fs = require('fs');
const driveAuth = require("../config/driveAuth");
require("dotenv").config();

const getAllFile = async (req, res) => {
    try {
        const q = `'${process.env.FOLDER_ID}' in parents`;
        const response = await driveAuth.files.list({
            q: q, // comment this if you want all possible files
            fields: "files(id, name)",
        });
        res.send(response.data);
        // console.log(response.data.files[0].id);

    } catch (err) {
        res.send(err);
    }
};

const deleteFile = async (req, res) => {
    const fileId = req.body.fileId; // the file to delete
    const response = await driveAuth.files.delete({
        fileId: fileId,
        parentId: `${process.env.FOLDER_ID}`,
    });
    res.send(fileId + " has been deleted!");
};

const updateFile = async (req, res) => {
    try {
        const filePath = req.file; // the file to replace with
        const fileId = req.body.fileId; // the file to be replaced
        await fs.promises.rename(
            filePath.destination + "/" + filePath.filename,
            filePath.destination + "/" + filePath.originalname
        );
        const media = {
            mimeType: filePath.mimeType,
            body: fs.createReadStream(filePath.destination + "/" + filePath.originalname), // the filePath sent through multer will be uploaded to Drive
        };

        const response = await driveAuth.files.update({
            resource: { name: filePath.originalname },
            addParents: `${process.env.FOLDER_ID}`,
            fileId: fileId,
            media: media,
            fields: "id",
        });

        res.send(resource + " updated!");
    } catch (err) {
        res.send(err);
    }
};

//read data
const read = async (req, res) => {
    Stories.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
};
//create data
const create = async (req, res) => {
    validations
    const Schema = check.object({
        title: check.string().required(),
        name: check.string().required(),
        caption: check.string().required(),
        category_id: check.string().required(),
        cover_url: check.string().required(),
        creator_id: check.string().required(),
        desciption: check.string().required(),
        province_target: check.string().required(),
        city_taget: check.string().required(),
        rejected_message: check.string().required(),
        reviewer_id: check.string().required(),
        status: check.string().required(),
        is_commercial: check.string().required(),
        likes: check.string().required(),
        linked_property_id: check.string().required(),
        total_clicks: check.string().required(),
        total_views: check.string().required()
    }).required();
    const { error } = Schema.validate(req.body)
    if (error) {
        return res.send(error.message);
    }
    const filePath = req.file;
    // console.log(filePath);
    try {
        // res.send(req.file.originalname + " uploaded!");
        Stories.findOne({ title: req.body.title }, //find data where title
            async function (err, stories) {
                if (err) {
                    res.status(500).send(err.message);
                } if (stories) {
                    res.status(500).send(req.body.title + " was already added!");
                } else {

                    await fs.promises.rename(
                        filePath.destination + "/" + filePath.filename,
                        filePath.destination + "/" + filePath.originalname
                    )
                    const metaData = {
                        name: filePath.originalname.substring(
                            0,
                            filePath.originalname.lastIndexOf(".")
                        ),
                        parents: [process.env.FOLDER_ID] // the ID of the folder you get is used here
                    };

                    const media = {
                        mimeType: filePath.mimeType,
                        body: fs.createReadStream(filePath.destination + "/" + filePath.originalname) // the filePath sent through multer will be uploaded to Drive
                    };

                    const response = await driveAuth.files.create({//create image in the drive
                        resource: metaData,
                        media: media,
                        fields: "id",
                    });

                    const fileId = response.data.id; // the file to delete
                    const getUrl = await driveAuth.permissions.create({
                        fileId: fileId,
                        // parentId: `${process.env.FOLDER_ID}`,
                        requestBody: {
                            role: 'reader',
                            type: 'anyone'
                        }
                    });
                    const getResult = await driveAuth.files.get({
                        fileId: fileId,
                        fields: 'webViewLink'
                    });

                    let bool = JSON.parse(req.body.is_commercial);
                    const create = new Stories({
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        thumbnail_name: metaData.name,
                        thumbnail_url: getResult.data.webViewLink,
                        category_id: req.body.category_id,
                        cover_url: req.body.cover_url,
                        creator_id: req.body.creator_id,
                        description: req.body.description,
                        province_target: req.body.province_target,
                        city_taget: req.body.city_taget,
                        rejected_message: req.body.rejected_message,
                        reviewer_id: req.body.reviewer_id,
                        status: req.body.status,
                        is_commercial: bool,
                        likes: req.body.likes,
                        linked_property_id: req.body.linked_property_id,
                        total_clicks: req.body.total_clicks,
                        total_views: req.body.total_views
                    });

                    create.save(function (err, result) {//save data to database
                        if (err) {
                            res.status(500).send(err.message);
                            return;
                        } else {
                            res.status(500).send('Stories data created! ' + result);
                        }
                    })
                }
            }
        )
    } catch (error) {
        console.log(error);
        res.send(error);
    }
};
//update data
const updating = async (req, res) => {
    // const Schema = check.object().keys({
    //     title: check.string().required().min(1)
    // }).required();
    // const { error } = Schema.validate(req.body)
    // if (error) {
    //     return res.send(err.message);
    // }
    Stories.findOne({ _id: req.params.id })
        .then(async data => {
            //update media func
            //pasring an id from thumbnail file in Drive
            const thumbnail = data;
            const filePath = req.file; // the file to replace with

            const idPick = thumbnail.thumbnail_url.replace('https://drive.google.com/file/d/', '');
            const idPick2 = idPick.replace('/view?usp=drivesdk', '');

            const fileId = idPick2; // the id file to be replaced
            await fs.promises.rename(
                filePath.destination + "/" + filePath.filename,
                filePath.destination + "/" + filePath.originalname
            );
            const media = {
                mimeType: filePath.mimeType,
                body: fs.createReadStream(filePath.destination + "/" + filePath.originalname), // the filePath sent through multer will be uploaded to Drive
            };
            //update
            const response = await driveAuth.files.update({
                resource: { name: filePath.originalname },
                addParents: `${process.env.FOLDER_ID}`,
                fileId: fileId,
                media: media,
                fields: "id",
            });

            //get link of media
            const getResult = await driveAuth.files.get({
                fileId: fileId,
                fields: 'webViewLink'
            });

            //update data
            const result = await Stories.updateOne({
                title: req.body.title,
                name: req.body.name,
                caption: req.body.caption,
                thumbnail_name: response.data.name,
                thumbnail_url: getResult.data.webViewLink,
                category_id: req.body.category_id,
                cover_url: req.body.cover_url,
                creator_id: req.body.creator_id,
                description: req.body.description,
                province_target: req.body.province_target,
                city_taget: req.body.city_taget,
                rejected_message: req.body.rejected_message,
                reviewer_id: req.body.reviewer_id,
                status: req.body.status,
                is_commercial: req.body.is_commercial,
                likes: req.body.likes,
                linked_property_id: req.body.linked_property_id,
                total_clicks: req.body.total_clicks,
                total_views: req.body.total_views
            })
            if (result) {
                res.send('Updated successfully!')
            }
        },
            () => {
                res.status(201).json({
                    message: 'Thing updated successfully!'
                });
            }
        )
        .catch(err => {
            res.status(500).send(err.message);
        });
};

//deleting data
const deleting = async (req, res) => {
    // const Schema = check.object().keys({
    //     title: check.string().required()
    // });
    // const { error } = Schema.validate(req.body)
    // if (error) {
    //     return res.send(error.message);
    // }
    const id = req.params.id;
    const findDat = await Stories.findOne({ _id: id });
    // const thumbnail = findDat;
    console.log(findDat)

    Stories.deleteOne({ _id: id })
        .then(async data => {

            // const idPick = thumbnail.thumbnail_url.replace('https://drive.google.com/file/d/', '');
            // const idPick2 = idPick.replace('/view?usp=drivesdk', '');
            // const fileId = idPick2; // the id file to be delete

            // const response = driveAuth.files.delete({
            //     fileId: fileId,
            //     parentId: `${process.env.FOLDER_ID}`,
            // });

            // res.send(response + " has been deleted!");
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
};

module.exports = {
    getAllFile,
    deleteFile,
    updateFile,
    read,
    create,
    updating,
    deleting
}