import { updateSingleUser } from "../db/db.js";
import USER from "../Models/UserSchema.js";
import jwt from 'jsonwebtoken';
import { encryptPassword } from "../services/common_utils.js";
import PROJECT from "../Models/ProjectSchema.js";


// -------------------ADMIN ADD USER---------------------------------------

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existingUser = await USER.find({ email: email });
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await encryptPassword(password);

    const newUser = new USER({
      name,
      email,
      password: hashedPassword,
      role: role || 'governance',
    });
    await newUser.save();

    return res.status(201).json({ message: 'User added successfully', data: newUser });

  } catch (error) {
    console.error('Error in addUser:', error);
    res.status(500).json({ message: 'Internal server error' });

  }
}

// -------------------ADMIN GET ALL USERS---------------------------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await USER.find();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    const userData = users.filter(user => user.role !== 'admin').map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    }));
    if (userData.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    return res.status(200).json({ message: 'Users retrieved successfully', data: userData });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
// -------------------ADMIN DELETE USER---------------------------------------
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await USER.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully', data: user });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
// -------------------ADMIN UPDATE USER---------------------------------------
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'user id  and rolerequired' });
    }
    const updateduser = await updateSingleUser(USER, { _id: userId }, { role });

    if (!updateduser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully', data: updateduser });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// -------------------ADMIN GET USER BY ID---------------------------------------
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await USER.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User retrieved successfully', data: user });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// -------------------- ACTIVATE/DEACTIVE USER------------------------------------------------

export const updateUserStatus = async (req, res) => {
  try {
    const { userId, action } = req.params;

    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "activate" or "deactivate".' });
    }

    const user = await USER.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const shouldBeActive = action === 'activate';

    if (user.is_active === shouldBeActive) {
      return res.status(400).json({ message: `User is already ${shouldBeActive ? 'active' : 'deactivated'}` });
    }

    user.is_active = shouldBeActive;
    await user.save();

    return res.status(200).json({
      message: `User ${shouldBeActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// -----------------------CREATE PROJECT----------------------------------------------------

export const addProject = async (req, res) => {
  try {
    const { name, description, location, assigned_to } = req.body
    if (!name || !description || !location || !assigned_to) {
      return res.status(400).json({ message: 'all field required' })
    }
    const existingProject = await PROJECT.findOne({ name: name, assigned_to: assigned_to })
    if (existingProject ) {
      return res.status(400).json({ message: 'Project with this name already assigned to this manager' })
    }

    const newProject = new PROJECT({
      name,
      description,
      location,
      assigned_to
    });

    await newProject.save()
 return res.status(200).json({data:newProject,message:'Successfully add project'})
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Server error while adding project' });

  }
}

// --------------------GET ALL PROJECT------------------------------------
export const getAllProjects = async (req, res) => {
  try {
    const fetchedProjects = await PROJECT.find({})
    return res.status(200).json({ data: fetchedProjects, message: 'Projects fetche successfully' })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
// ------------------GET PARTICULAR MANAGER  PROJECTS----------------------------
export const getManagerProjects = async (req, res) => {
  try {
    const {managerId}=req.params
    const fetchedProjects = await PROJECT.findOne({assigned_to:managerId})
    return res.status(200).json({ data: fetchedProjects, message: 'Projects fetched successfully' })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
// -------------------GET SINGLE PROJECT----------------------------------------------
export const getSingleProject=async(req,res)=>{
  try {
    const {projectId}=req.params
    const existingProject=await PROJECT.findOne({_id:projectId})
    if(!existingProject){
      return res.status(200).json({message:'Project not found '})
    }

    return res.status(200).json({message:'Project fetched',data:existingProject})
  } catch (error) {
    console.log(error)
  }
}
