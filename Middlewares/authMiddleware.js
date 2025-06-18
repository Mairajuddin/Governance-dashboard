import USER from "../Models/UserSchema.js";
import { verifyJWTToken } from "../services/common_utils.js";

export const protectRoute = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] 
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized - No Token Provided" });
      }

      const decoded = verifyJWTToken(token);
console.log(decoded)
      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized - Invalid Token" });
      }

      const user = await USER.findById(decoded._id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden - Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.log("Error in protectRoute middleware:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
