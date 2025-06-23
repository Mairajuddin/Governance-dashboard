// import mongoose from "mongoose";

// const CsvSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   file: {
//     type: String,
//     required: true,
//   },
//   csvType: {
//     type: String,
//     enum: ['finance', 'schedule','risk-indicatore'],
//     required: true,
//   },
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user',
//     required: true,
//   },
//    project_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'project',
//     required: true,
//   },
//   uploadedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export default mongoose.model("CsvFile", CsvSchema);
import mongoose from "mongoose";

const CsvSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  csvType: {
    type: String,
    enum: ['finance', 'schedule','risk-indicatore'],
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CsvFile", CsvSchema);