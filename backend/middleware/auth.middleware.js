import jwt from "jsonwebtoken"
import User from "../models/user.model.js";

const protect = (req, res, next) => {
    // Access token must come via Authorization header only.
    // The 'jwt' cookie holds the REFRESH token — never use it here.
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret_1234567890", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        }
        req.userId = decoded.userId;
        req.user = { _id: decoded.userId, id: decoded.userId };
        next();
    });
};

const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId || req.user?._id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { protect, adminOnly };
export default protect;