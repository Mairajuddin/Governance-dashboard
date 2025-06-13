
import mongoose from 'mongoose';
import { createSuperAdmin } from '../services/common_utils.js';


export const connectDB = () => {
    const connectionURL = 'mongodb://127.0.0.1:27017/gareth-project';

    mongoose.connect(connectionURL)
        .then(() => console.log('Connected!'));

    mongoose.connection
         .on('open', async () => {
            console.log('DB connection SUCCESSFUL');
            try {
                await createSuperAdmin(); 
                console.log('SuperAdmin created (if not already present)');
            } catch (err) {
                console.error('Error creating SuperAdmin:', err);
            }
        })
        .on('close', () => {
            console.log('DB connection CLOSED');
        })
        .on('error', (error) => {
            console.log('ERROR IN CONNECTING DB:\n' + error)
        });
};

export const registerSingle = async (model, data) => {
    return await model.create(data);
};

export const readSingleUser = async (model, data) => {
    return await model.findOne(data);
};

export const updateSingleUser = async (model, filter, data) => {
    return await model.updateOne(filter, data);
};

export const deleteSingleUser = async (model, data) => {
    return await model.deleteOne(data);
};
