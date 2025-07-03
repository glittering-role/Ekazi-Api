import { createCanvas } from 'canvas';
import { v2 as cloudinary } from "cloudinary";

const generateCoverPhoto = async () => {
  const width = 1200;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Generate a random background color
  const backgroundColor = getRandomBackgroundColor();
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Add semi-transparent geometric shapes
  const numShapes = Math.floor(Math.random() * 11) + 10; // Random number between 10 and 20
  for (let i = 0; i < numShapes; i++) {
    const shapeColor = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.random() * 0.5 + 0.5})`;
    const shapeType = Math.floor(Math.random() * 3) + 1; // Randomly choose shape type: 1 = rectangle, 2 = ellipse, 3 = polygon

    switch (shapeType) {
    case 1: // Rectangle
      const rectWidth = Math.floor(Math.random() * 151) + 50;
      const rectHeight = Math.floor(Math.random() * 151) + 50;
      const x = Math.floor(Math.random() * (width - rectWidth));
      const y = Math.floor(Math.random() * (height - rectHeight));
      ctx.fillStyle = shapeColor;
      ctx.fillRect(x, y, rectWidth, rectHeight);
      break;
    case 2: // Ellipse (circle)
      const circleRadius = Math.floor(Math.random() * 101) + 50;
      const cx = Math.floor(Math.random() * (width - circleRadius * 2)) + circleRadius;
      const cy = Math.floor(Math.random() * (height - circleRadius * 2)) + circleRadius;
      ctx.fillStyle = shapeColor;
      ctx.beginPath();
      ctx.arc(cx, cy, circleRadius, 0, 2 * Math.PI);
      ctx.fill();
      break;
    case 3: // Polygon (triangle)
      const numPoints = 3; // triangles have 3 points
      const points = [];
      for (let j = 0; j < numPoints; j++) {
        points.push(Math.floor(Math.random() * width)); 
        points.push(Math.floor(Math.random() * height)); 
      }
      ctx.fillStyle = shapeColor;
      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      for (let k = 2; k < points.length; k += 2) {
        ctx.lineTo(points[k], points[k + 1]);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  // Upload the image to Cloudinary
  return new Promise((resolve, reject) => {
    canvas.toBuffer(async (err, buffer) => {
      if (err) return reject(err);

      try {
        const result = cloudinary.uploader.upload_stream(
            {folder: 'cover-photos', resource_type: 'image'},
            (error, result) => {
              if (error) return reject(error);
              resolve(result?.secure_url);
            }
        );
        result.end(buffer);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const getRandomBackgroundColor = () => {
  const colors = [
    '#FFC107', '#9C27B0', '#3F51B5', '#FF5722', '#4CAF50', '#009688', '#E91E63', '#607D8B',
    '#FFEB3B', '#00BCD4', '#795548', '#8BC34A', '#CDDC39', '#2196F3', '#FF9800', '#673AB7',
    '#F44336', '#03A9F4', '#9E9E9E', '#76FF03', '#FF5252', '#607D8B', '#FFCCBC'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default generateCoverPhoto;
