// src/types/express.d.ts (or any appropriate path in your project)

declare global {
    namespace Express {
        interface Request {
            user?: User;
            files?: Express.Multer.File[];
        }
    }
}
