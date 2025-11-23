import jwt from "jsonwebtoken";
import { query } from "../database/db-postgres.js";

async function adminMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized" });
    }
    
    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer') 
        ? authHeader.slice(7) 
        : authHeader;
    
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.id;
        
        // Check if user has admin role
        const result = await query("SELECT role FROM users WHERE id = $1", [decoded.id]);
        
        if (result.rows.length === 0) {
            return res.status(401).send({ message: "User not found" });
        }
        
        if (result.rows[0].role !== 'admin') {
            return res.status(403).send({ message: "Forbidden: Admin access required" });
        }
        
        next();
    } catch (err) {
        return res.status(401).send({ message: "Invalid token" });
    }
}

export default adminMiddleware;

