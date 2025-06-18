
import USER from "../Models/UserSchema.js";
import CsvFile from "../Models/CsvSchema.js"

import fs from 'fs';
import path from 'path';
// import CsvFile from "../Models/CsvSchema.js";


// -------------------------------------UPLOAD CSV------------------------------------


export const uploadProjectCSV = async (req, res) => {
    try {
        const { csvType, name } = req.body;
        const { _id } = req.user;

        if (!req.file) {
            return res.status(400).json({ success: false, msg: "No file uploaded" });
        }

       const normalizedName = (name || req.file.originalname)?.trim().toLowerCase();
       
       const existingCSV = await CsvFile.findOne({
            name: normalizedName,
            uploadedBy: _id,
        });
        
        if (existingCSV) {
            return res.status(400).json({ success: false, message: 'CSV with this name already exists for this user' });
        }

        const CSVFile = await CsvFile.create({
            name: normalizedName,
            file: `/uploads/csvs/${req.file.filename}`,
            csvType,
            uploadedBy: _id,
        });

        res.status(200).json({
            success: true,
            message: "CSV uploaded successfully",
            CSVFile,
        });

    } catch (error) {
        console.error("Upload CSV Error:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};


// ---------------------------------GET CSV--------------------------------------------------

export const getUploadedCSVs = async (req, res) => {
    try {
        const { _id } = req.user;
        const { csvType } = req.query; 

        const filter = { uploadedBy: _id };

        if (csvType) {
            filter.csvType = csvType;
        }

        const csvFiles = await CsvFile.find(filter).sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            total: csvFiles.length,
            data: csvFiles,
        });
    } catch (error) {
        console.error("Error fetching CSVs:", error);
        res.status(500).json({
            success: false,
            msg: "Internal Server Error",
        });
    }
};


// -------------------------------DELETE CSV----------------------------------------------------



export const deleteCSV = async (req, res) => {
    try {
        const { csvId } = req.params;
        const { _id } = req.user;

        
        const existingCsv = await CsvFile.findOne({ _id: csvId, uploadedBy: _id });

        if (!existingCsv) {
            return res.status(404).json({ success: false, message: 'No CSV found for this user' });
        }

        
        const filePath = path.join(process.cwd(), existingCsv.file); 

        
        fs.unlink(filePath, async (err) => {
            if (err && err.code !== 'ENOENT') {
        
                console.error('Error deleting file from disk:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete file from disk',
                });
            }

            
            await CsvFile.deleteOne({ _id: csvId });

            return res.status(200).json({
                success: true,
                message: 'CSV file and record deleted successfully',
            });
        });

    } catch (error) {
        console.error('Error deleting CSV:', error);
        res.status(500).json({
            success: false,
            msg: "Server error while deleting CSV",
        });
    }
};
