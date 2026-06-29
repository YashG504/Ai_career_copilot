import { Request, Response, NextFunction } from 'express';

export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Not authorized as an admin' });
  }
};
