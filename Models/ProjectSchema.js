import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  company_name:{ type: String, required: true },
  logo: { type: String, default: null},
  assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  is_active: { type: Boolean, default: true },
  },
{
  timestamps: true 
});

const PROJECT = model('project', projectSchema);

export default PROJECT;
