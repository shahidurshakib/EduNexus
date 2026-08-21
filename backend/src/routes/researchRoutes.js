const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const researchController = require('../controllers/researchController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const uploadResearchPdf = require('../middleware/uploadResearchPdf');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

router.get('/', researchController.listResearch);
router.get('/patents', researchController.listPatents);
router.get('/:id', researchController.getResearch);

router.post(
  '/',
  protect,
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  researchController.createResearch
);

router.put('/:id', protect, researchController.updateResearch);
router.delete('/:id', protect, researchController.deleteResearch);
router.patch('/:id/pdf', protect, uploadResearchPdf.single('pdf'), researchController.uploadPdf);

router.post('/patents', protect, researchController.createPatent);
router.put('/patents/:id', protect, authorize('platform_founder', 'admin'), researchController.updatePatent);
router.delete('/patents/:id', protect, authorize('platform_founder', 'admin'), researchController.deletePatent);

module.exports = router;
