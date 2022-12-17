const mongoose = require("mongoose");
const Stories = mongoose.model(
    "Stories",
    new mongoose.Schema({
        title: String,
        name: String,
        caption: String,
        thumbnail_name: String,
        thumbnail_url: String,
        category_id: String,
        cover_url: String,
        creator_id: String,
        desciption: String,
        province_target: String,
        city_taget: String,
        rejected_message: String,
        reviewer_id: String,
        status: {
            type: String,
            enum: ['active', 'passive']
        },
        is_commercial: Boolean,
        likes: String,
        linked_property_id: String,
        total_clicks: String,
        total_views: String
    }, {
        collection: 'Stories',
        versionKey: false
    })
);
module.exports = Stories;
