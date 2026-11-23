const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const researchController = require('../controllers/researchController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
<<<<<<< HEAD
const { optionalAuth } = require('../middleware/optionalAuth');
const uploadResearchPdf = require('../middleware/uploadResearchPdf');
const uploadProposal = require('../middleware/uploadProposal');
=======
const uploadResearchPdf = require('../middleware/uploadResearchPdf');
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

router.get('/', researchController.listResearch);
router.get('/patents', researchController.listPatents);
<<<<<<< HEAD
router.get('/documents/:docId/download', optionalAuth, researchController.downloadResearchDocument);
router.get('/:id', optionalAuth, researchController.getResearch);
=======
router.get('/:id', researchController.getResearch);
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092

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
<<<<<<< HEAD
router.post('/:id/mentors', protect, researchController.addResearchMentor);
router.post('/:id/documents', protect, uploadProposal.single('proposal'), researchController.uploadResearchDocument);
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092

router.post('/patents', protect, researchController.createPatent);
router.put('/patents/:id', protect, authorize('platform_founder', 'admin'), researchController.updatePatent);
router.delete('/patents/:id', protect, authorize('platform_founder', 'admin'), researchController.deletePatent);

module.exports = router;
