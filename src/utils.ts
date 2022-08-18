import fs from "node:fs";
import path from "node:path";

export const getFolderPath = (folderName: string) => {
    return path.join(__dirname, folderName);
};

export const getFilesFromFolder = (folderPath: string) => {
    return fs.readdirSync(folderPath).filter((file: string) => file.endsWith(".ts"));
};

export const getDefaultObject = (folderPath: string, file: string) => {
    const filePath = path.join(folderPath, file);
    
    return require(filePath).default;
};
