import express from 'express';
import { createLink, getLinks, deleteLink } from '../controllers/linkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/').post(createLink).get(getLinks);
router.route('/:linkId').delete(deleteLink);

export default router;
