"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminRole = void 0;
const constants_1 = require("../constants/constants");
//To check the role, which is passed from headers.
const checkAdminRole = (req, res, next) => {
    const userRole = req.headers[constants_1.ROLE];
    if (userRole !== constants_1.ADMIN) {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    next();
};
exports.checkAdminRole = checkAdminRole;
