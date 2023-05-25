import { Router } from 'express';
import { signup } from './signup.js';

export const routes = Router();

routes.use(signup);