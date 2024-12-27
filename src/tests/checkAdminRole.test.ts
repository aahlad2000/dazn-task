import { ADMIN } from "../constants/constants";
import { checkAdminRole } from "../middleware/checkAdminRole";
import { Request, Response, NextFunction } from "express";

describe("checkAdminRole Middleware", () => {
    const mockRequest = (role: string): Partial<Request> => ({
        headers: { role },
      });

  const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  it("should allow admin role", () => {
    const req = mockRequest(ADMIN);
    const res = mockResponse();
    checkAdminRole(req as Request, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("should block non-admin role", () => {
    const req = mockRequest("user");
    const res = mockResponse();
    checkAdminRole(req as Request, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied. Admins only." });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
