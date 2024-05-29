"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
exports.Cloudinary = {
    provide: 'Cloudinary',
    useFactory: () => {
        return cloudinary_1.v2.config({
            cloud_name: process.env.CLD_CLOUD_NAME,
            api_key: process.env.CLD_API_KEY,
            api_secret: process.env.CLD_API_SECRET,
        });
    },
};
//# sourceMappingURL=cloudinary.js.map