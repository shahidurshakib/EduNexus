
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const researchController = require('../controllers/researchController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { optionalAuth } = require('../middleware/optionalAuth');

const uploadResearchPdf = require('../middleware/uploadResearchPdf');
const uploadProposal = require('../middleware/uploadProposal');

function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  next();
}

// ----------------------------------------------------------------------------
// Research listing and details
// ----------------------------------------------------------------------------

router.get('/', researchController.listResearch);

router.get('/patents', researchController.listPatents);

// Optional authentication allows public access to unlocked documents
// while enabling collaborator access to locked documents.
router.get(
  '/documents/:docId/download',
  optionalAuth,
  researchController.downloadResearchDocument
);

router.get(
  '/:id',
  optionalAuth,
  researchController.getResearch
);

// ----------------------------------------------------------------------------
// Research creation
// ----------------------------------------------------------------------------

router.post(
  '/',
  protect,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),
  ],
  validate,
  researchController.createResearch
);

// ----------------------------------------------------------------------------
// Research management
// ----------------------------------------------------------------------------

router.put(
  '/:id',
  protect,
  researchController.updateResearch
);

router.delete(
  '/:id',
  protect,
  researchController.deleteResearch
);

// Upload research PDF
router.patch(
  '/:id/pdf',
  protect,
  uploadResearchPdf.single('pdf'),
  researchController.uploadPdf
);

// ----------------------------------------------------------------------------
// Research mentors and documents
// ----------------------------------------------------------------------------

// Attach a mentor to a research project
router.post(
  '/:id/mentors',
  protect,
  researchController.addResearchMentor
);

// Upload a draft proposal or full paper
router.post(
  '/:id/documents',
  protect,
  uploadProposal.single('proposal'),
  researchController.uploadResearchDocument
);

// ----------------------------------------------------------------------------
// Patent management
// ----------------------------------------------------------------------------

router.post(
  '/patents',
  protect,
  researchController.createPatent
);

router.put(
  '/patents/:id',
  protect,
  authorize('platform_founder', 'admin'),
  researchController.updatePatent
);

router.delete(
  '/patents/:id',
  protect,
  authorize('platform_founder', 'admin'),
  researchController.deletePatent
);

module.exports = router;
