"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants/constants");
const checkAdminRole_1 = require("../middleware/checkAdminRole");
describe("checkAdminRole Middleware", () => {
    const mockRequest = (role) => ({
        headers: { role },
    });
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const mockNext = jest.fn();
    it("should allow admin role", () => {
        const req = mockRequest(constants_1.ADMIN);
        const res = mockResponse();
        (0, checkAdminRole_1.checkAdminRole)(req, res, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });
    it("should block non-admin role", () => {
        const req = mockRequest("user");
        const res = mockResponse();
        (0, checkAdminRole_1.checkAdminRole)(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Access denied. Admins only." });
        expect(mockNext).not.toHaveBeenCalled();
    });
});
