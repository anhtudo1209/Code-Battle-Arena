import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized" });
    }
    
    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { 
        if (err) {
            return res.status(401).send({ message: "Invalid token" });
        }
        req.userId = decoded.id;
        next();
    })
}
export default authMiddleware;