const express = require('express');
const complaintController = require('../controllers/complaintController');
const llmModeration = require('../middlewares/llmModeration');

const router = express.Router();

router.post('/submit', llmModeration.moderateComplaint, complaintController.submitComplaint);
router.get('/admin/complaints', complaintController.getQuarantinedComplaints);
router.get('/admin/complaints/:id', complaintController.getComplaintById);
router.patch('/admin/complaints/:id/status', complaintController.updateComplaintStatus);
router.post('/admin/complaints/:id/notes', complaintController.addAdminNote);
router.delete('/admin/complaints/:id', complaintController.deleteComplaint);

module.exports = router;
