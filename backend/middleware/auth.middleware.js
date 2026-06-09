import jwt from "jsonwebtoken"

const protect = (req, res, next) => {
    // Access token must come via Authorization header only.
    // The 'jwt' cookie holds the REFRESH token — never use it here.
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

export default protect