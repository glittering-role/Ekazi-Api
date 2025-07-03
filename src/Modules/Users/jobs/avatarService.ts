import { createCanvas } from 'canvas';
import streamifier from 'streamifier';
import { v2 as cloudinary } from "cloudinary";

const generateAvatar = async (email: string): Promise<string> => {
    const initials = extractInitials(email);
    const size = 100;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Randomly choose between solid color or gradient
    if (Math.random() > 0.5) {
        // Solid background color
        const randomColor = getRandomSolidColor();
        ctx.fillStyle = randomColor;
    } else {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#FF5733'); // Red-Orange
        gradient.addColorStop(1, '#4CAF50'); // Green
        ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, size, size);

    // Render the initials
    ctx.fillStyle = '#ffffff'; // Text color
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
        const buffer = canvas.toBuffer();

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'avatars', resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result?.secure_url || '');
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

const extractInitials = (email: string): string => {
    const [localPart] = email.split('@'); // Get the part before '@'
    return (localPart[0] || '').toUpperCase() + (localPart[1] || '').toUpperCase();
};

// Function to generate a random solid color from a predefined palette
const getRandomSolidColor = (): string => {
    const colors = [
        '#CDB07E', // Gold
        '#FF5733', // Red-Orange
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#FFEB3B', // Yellow
        '#FF9800', // Orange
        '#009688', // Teal
        '#3F51B5', // Indigo
        '#795548'  // Brown
    ];

    // Pick a random color from the array
    return colors[Math.floor(Math.random() * colors.length)];
};

export default generateAvatar;
