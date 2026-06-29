import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = (error as any).errors.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        res.status(400).json({ success: false, message: messages.join(', ') });
        return;
      }
      res.status(400).json({ success: false, message: 'Validation failed' });
    }
  };
};
