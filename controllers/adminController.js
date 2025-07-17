import { updateSingleUser } from "../db/db.js";
import USER from "../Models/UserSchema.js";
import jwt from 'jsonwebtoken';
import { encryptPassword } from "../services/common_utils.js";
import PROJECT from "../Models/ProjectSchema.js";
import CsvData from '../Models/CsvDataSchema.js';



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
      .populate({
        path: 'assigned_to',
        select: 'name avatar',
        model: 'user', 
      });

    return res.status(200).json({ data: fetchedProjects, message: 'Projects fetched successfully' });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

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
    const existingProject=await PROJECT.find({_id:projectId}).populate({
        path: 'assigned_to',
        select: 'name avatar',
        model: 'user', 
      });
     
    if(!existingProject){
      return res.status(200).json({message:'Project not found '})
    }

    return res.status(200).json({message:'Project fetched',data:existingProject})
  } catch (error) {
    console.log(error)
    return  res.status(500).json({message:'Internal Sever Error'})
  }
}
// ------------------Manager create project permission Setting----------------------------------------------------


export const allowManagerToAddProject = async (req, res) => {
  try {
    const { createProject } = req.body;

    const isAllowed = createProject === true || createProject === 'true';

    const result = await USER.updateMany(
      { role: 'project-manager' },
      { $set: { is_allowed_create_project: isAllowed } }
    );

    res.status(200).json({
      message: `Project creation permission updated for project managers.`,
      modifiedCount: result.modifiedCount,
      is_allowed_create_project: isAllowed
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error while updating permissions.' });
  }
};

// --------------------GET PROJECT BY ID-----------------------
export const getManagerProjectById = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { csvType } = req.query;
    // const { _id } = req.user;

    const filter = {
      project_id,
      // uploadedBy: _id,
    };

    if (csvType) {
      filter.csvType = csvType;
    }
    const ProjectDetails = await PROJECT.findOne({ _id: project_id });
    console.log("Project Details:", ProjectDetails);
    const csvData = await CsvData.find(filter)
      .populate('csvFile', 'name file')
      .populate('project_id', 'name')
      .sort({ uploadedAt: -1 });

    let mainPhases = [];
    let sunburstData = [];
    let healthData = [];

    if (csvData && csvData.length > 0) {
      if (!csvType || csvType === "schedule") {
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

      if (!csvType || csvType === "finance") {
        const hierarchy = {};

        csvData.forEach(doc => {
          if (Array.isArray(doc.data)) {
            doc.data.forEach(row => {
              const ledger = row["General Ledger Name"];
              const centre = row["Cost Centre Name"];
              const vendor = row["Name"];
              const value = parseFloat(row["Total Net Value"]);

              if (!ledger || !centre || !vendor || isNaN(value)) return;

              hierarchy[ledger] ??= {};
              hierarchy[ledger][centre] ??= {};
              hierarchy[ledger][centre][vendor] =
                (hierarchy[ledger][centre][vendor] || 0) + value;
            });
          }
        });

        const buildSunburst = (node) =>
          Object.entries(node).map(([k, v]) =>
            typeof v === "object"
              ? { name: k, children: buildSunburst(v) }
              : { name: k, value: v }
          );

        sunburstData = buildSunburst(hierarchy);
      }
     if (!csvType || csvType === "risk-indicatore") {
  healthData = csvData
    .filter(doc => doc.csvType === "risk-indicatore")
    .flatMap(doc => 
      (doc.data || [])
        .filter(row => 
          row["Safety Health"] !== undefined || 
          row["Quality Health"] !== undefined ||
          row["Scope Health"] !== undefined ||
          row["Time Health"] !== undefined ||
          row["Cost Health"] !== undefined
        )
        .map(row => ({
          safetyHealth: row["Safety Health"],
          safetyComments: row["Safety Comments"],
          qualityHealth: row["Quality Health"],
          qualityComments: row["Quality Comments"],
          scopeHealth: row["Scope Health"],
          scopeComments: row["Scope Comments"],
          timeHealth: row["Time Health"],
          timeComments: row["Time Comments"],
          costHealth: row["Cost Health"],
          costComments: row["Cost Comments"]
        }))
    );
}
    }

    res.status(200).json({
      success: true,
      projectDetails: ProjectDetails,
      data: csvData,
      mainPhases,
      sunburstData,
      healthData
    });

  } catch (error) {
    console.error("Get CSV Data Error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
