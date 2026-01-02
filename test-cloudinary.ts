
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testConnection() {
    console.log('Testing Cloudinary connection...');
    try {
        const result = await cloudinary.api.ping();
        console.log('Success:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

testConnection();
