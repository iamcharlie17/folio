import express from 'express';
import { getTags, createTag, getTagItems, deleteTag } from '../controllers/tagController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getTags).post(createTag);
router.route('/:tagId/items').get(getTagItems);
router.route('/:tagId').delete(deleteTag);

export default router;
