
// import USER from "../Models/UserSchema.js";
// import CsvFile from "../Models/CsvSchema.js"

// import fs from 'fs';
// import path from 'path';
// // import CsvFile from "../Models/CsvSchema.js";


// // -------------------------------------UPLOAD CSV------------------------------------


// export const uploadProjectCSV = async (req, res) => {
//     try {
//         const { csvType, name } = req.body;
        
//         const { _id } = req.user;

//         if (!req.file) {
//             return res.status(400).json({ success: false, msg: "No file uploaded" });
//         }

//        const normalizedName = (name || req.file.originalname)?.trim().toLowerCase();
       
//        const existingCSV = await CsvFile.findOne({
//             name: normalizedName,
//             uploadedBy: _id,
//         });
        
//         if (existingCSV) {
//             return res.status(400).json({ success: false, message: 'CSV with this name already exists for this user' });
//         }

//         const CSVFile = await CsvFile.create({
//             name: normalizedName,
//             file: `/uploads/csvs/${req.file.filename}`,
//             csvType,
//             uploadedBy: _id,
//         });

//         res.status(200).json({
//             success: true,
//             message: "CSV uploaded successfully",
//             CSVFile,
//         });

//     } catch (error) {
//         console.error("Upload CSV Error:", error);
//         res.status(500).json({ success: false, msg: "Server error" });
//     }
// };


// // ---------------------------------GET CSV--------------------------------------------------

// export const getUploadedCSVs = async (req, res) => {
//     try {
//         const { _id } = req.user;
//         const { csvType } = req.query; 

//         const filter = { uploadedBy: _id };

//         if (csvType) {
//             filter.csvType = csvType;
//         }

//         const csvFiles = await CsvFile.find(filter).sort({ uploadedAt: -1 });

//         res.status(200).json({
//             success: true,
//             total: csvFiles.length,
//             data: csvFiles,
//         });
//     } catch (error) {
//         console.error("Error fetching CSVs:", error);
//         res.status(500).json({
//             success: false,
//             msg: "Internal Server Error",
//         });
//     }
// };


// // -------------------------------DELETE CSV----------------------------------------------------



// export const deleteCSV = async (req, res) => {
//     try {
//         const { csvId } = req.params;
//         const { _id } = req.user;

        
//         const existingCsv = await CsvFile.findOne({ _id: csvId, uploadedBy: _id });

//         if (!existingCsv) {
//             return res.status(404).json({ success: false, message: 'No CSV found for this user' });
//         }

        
//         const filePath = path.join(process.cwd(), existingCsv.file); 

        
//         fs.unlink(filePath, async (err) => {
//             if (err && err.code !== 'ENOENT') {
        
//                 console.error('Error deleting file from disk:', err);
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Failed to delete file from disk',
//                 });
//             }

            
//             await CsvFile.deleteOne({ _id: csvId });

//             return res.status(200).json({
//                 success: true,
//                 message: 'CSV file and record deleted successfully',
//             });
//         });

//     } catch (error) {
//         console.error('Error deleting CSV:', error);
//         res.status(500).json({
//             success: false,
//             msg: "Server error while deleting CSV",
//         });
//     }
// };
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';


import CsvData from '../Models/CsvDataSchema.js';  
import CsvFile from '../Models/CsvSchema.js';      
import PROJECT from '../Models/ProjectSchema.js';

export const uploadProjectCSV = async (req, res) => {
    try {
        const { csvType, name, project_id } = req.body;
        
        const { _id } = req.user;

        if (!req.file) {
            return res.status(400).json({ success: false, msg: "No file uploaded" });
        }

        if (!project_id) {
            return res.status(400).json({ success: false, msg: "Project ID is required" });
        }

        const normalizedName = (name || req.file.originalname)?.trim().toLowerCase();
       
        const existingCSV = await CsvFile.findOne({
            name: normalizedName,
            uploadedBy: _id,
        });
        
        if (existingCSV) {
            return res.status(400).json({ success: false, message: 'CSV with this name already exists for this user' });
        }

        // Create CSV file record
        const CSVFile = await CsvFile.create({
            name: normalizedName,
            file: `/uploads/csvs/${req.file.filename}`,
            csvType,
            uploadedBy: _id,
            project_id, // Add project reference
        });

        // Parse CSV file
        const filePath = path.join('uploads', 'csvs', req.file.filename);
        const parsedData = [];
        let headers = [];

        // Read and parse CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('headers', (headerList) => {
                    headers = headerList;
                })
                .on('data', (row) => {
                    parsedData.push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Save parsed data to database - Use CsvData model, not CsvDataSchema
        const csvData = await CsvData.create({
            csvFile: CSVFile._id,
            project_id,
            csvType,
            uploadedBy: _id,
            data: parsedData,
            headers,
            rowCount: parsedData.length,
        });

        res.status(200).json({
            success: true,
            message: "CSV uploaded and parsed successfully",
            CSVFile,
            csvData: {
                id: csvData._id,
                rowCount: csvData.rowCount,
                headers: csvData.headers,
            },
        });

    } catch (error) {
        console.error("Upload CSV Error:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// Get CSV data by project ID
export const getProjectCSVData = async (req, res) => {
    try {
        const { project_id } = req.params;
        const { csvType } = req.query;
        const { _id } = req.user;

        const filter = {
            project_id,
            uploadedBy: _id,
        };

        if (csvType) {
            filter.csvType = csvType;
        }

        const csvData = await CsvData.find(filter)
            .populate('csvFile', 'name file')
            .populate('project_id', 'name')
            .sort({ uploadedAt: -1 });


          let mainPhases = [];
        
        if (csvData && csvData.length > 0) {
            // Assuming CSV data is stored in each document's 'data' field
            csvData.forEach(document => {
                if (document.data && Array.isArray(document.data)) {
                    const phases = document.data.filter(item => 
                        item["Project Stage"] && 
                        item["Task"] === item["Project Stage"]
                    );
                    mainPhases = [...mainPhases, ...phases];
                }
            });
        }


        res.status(200).json({
            success: true,
            data: csvData,
            mainPhases
        });

    } catch (error) {
        console.error("Get CSV Data Error:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// Get specific CSV data by ID
export const getCSVDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;

        const csvData = await CsvData.findOne({
            _id: id,
            uploadedBy: _id,
        })
        .populate('csvFile', 'name file')
        .populate('project_id', 'name');

        if (!csvData) {
            return res.status(404).json({ success: false, msg: "CSV data not found" });
        }

        res.status(200).json({
            success: true,
            data: csvData,
        });

    } catch (error) {
        console.error("Get CSV Data By ID Error:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// Convert JSON back to CSV format for download
export const downloadCSVData = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;

        const csvData = await CsvData.findOne({
            _id: id,
            uploadedBy: _id,
        }).populate('csvFile', 'name');

        if (!csvData) {
            return res.status(404).json({ success: false, msg: "CSV data not found" });
        }

        // Convert JSON back to CSV
        const headers = csvData.headers;
        const rows = csvData.data;

        let csvContent = headers.join(',') + '\n';
        
        rows.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes in values
                return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            });
            csvContent += values.join(',') + '\n';
        });

        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${csvData.csvFile.name}.csv"`,
        });

        res.send(csvContent);

    } catch (error) {
        console.error("Download CSV Error:", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// -------------DELETE PROJECT----------------------------------------------    
export const deleteProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { _id } = req.user;

    if (!project_id) {
      return res.status(400).json({ success: false, msg: "Project ID is required" });
    }

    // Find all CSVFile documents related to this project
    const csvFiles = await CsvFile.find({ project_id, uploadedBy: _id });

    // Delete CSV file from filesystem and database
    for (const csvFile of csvFiles) {
      const filePath = path.join('uploads', 'csvs', path.basename(csvFile.file));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // remove physical file
      }
      await CsvData.deleteMany({ csvFile: csvFile._id }); // remove parsed data
      await csvFile.deleteOne(); // remove csv file doc
    }

    // Delete the project itself
    // const projectDeleted = await PROJECT.findOneAndDelete({ _id: project_id, createdBy: _id });
    // if (!projectDeleted) {
    //   return res.status(404).json({ success: false, msg: "Project not found or not authorized" });
    // }

    res.status(200).json({ success: true, msg: "Project and associated CSVs deleted successfully" });

  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
