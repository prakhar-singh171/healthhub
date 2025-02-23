import express from 'express'

import { addDoctor } from '../controllers/doctorController.js'
import upload from '../middlewares/multer.js'

const adminRouter = express.Router();

adminRouter.post('/add-doctors',upload.single('image'),addDoctor)

export default adminRouter;