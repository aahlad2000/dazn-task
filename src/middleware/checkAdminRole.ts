import { Request, Response, NextFunction } from "express";
import { ROLE, ADMIN } from "../constants/constants";

//To check the role, which is passed from headers.
export const checkAdminRole = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userRole = req.headers[ROLE];

  if (userRole !== ADMIN) {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  next();
};
