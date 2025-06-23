import mongoose from "mongoose";

const CsvDataSchema = new mongoose.Schema({
  csvFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CsvFile',
    required: true,
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  csvType: {
    type: String,
    enum: ['finance', 'schedule', 'risk-indicatore'],
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // This will store the parsed CSV data as JSON
    required: true,
  },
  headers: [{
    type: String
  }],
  rowCount: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CsvData", CsvDataSchema);