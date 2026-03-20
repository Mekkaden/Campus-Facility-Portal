const complaintModel = require('../models/Complaint');

function submitComplaint(req, res) {
    const email = req.body.email;
    const category = req.body.category;
    const title = req.body.title;
    const description = req.body.description;
    const moderationResult = req.moderationResult;

    if (!email || !category || !title || !description) {
        return res.status(400).json({ error: 'Missing required fields for secure submission.' });
    }

    try {
        const studentHash = complaintModel.generateStudentHash(email);

        const newComplaint = new complaintModel.Complaint({
            studentHash: studentHash,
            category: category,
            title: title,
            description: description,
            status: 'pending_manual_review',
            trustScore: moderationResult.trustScore,
            moderationFlags: moderationResult.flags,
            statusHistory: [{
                status: 'pending_manual_review',
                note: 'Initial submission — awaiting review.'
            }]
        });

        newComplaint.save()
            .then(function(saved) {
                return res.status(201).json({
                    success: true,
                    message: 'Payload secured and quarantined successfully.',
                    complaintId: saved._id
                });
            })
            .catch(function(saveError) {
                console.error('Database Save Error:', saveError);
                return res.status(500).json({ error: 'Failed to write to secure database.' });
            });

    } catch (error) {
        console.error('Submission Processing Error:', error);
        return res.status(500).json({ error: 'Internal server error during payload decryption.' });
    }
}

function getQuarantinedComplaints(req, res) {
    complaintModel.Complaint.find()
        .sort({ createdAt: -1 })
        .then(function(complaints) {
            return res.status(200).json(complaints);
        })
        .catch(function(error) {
            console.error('Fetch Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve analytics data.' });
        });
}

function getComplaintById(req, res) {
    const complaintId = req.params.id;

    complaintModel.Complaint.findById(complaintId)
        .then(function(complaint) {
            if (!complaint) {
                return res.status(404).json({ error: 'Complaint not found.' });
            }
            return res.status(200).json(complaint);
        })
        .catch(function(error) {
            console.error('Fetch by ID Error:', error);
            return res.status(500).json({ error: 'Failed to retrieve complaint.' });
        });
}

function updateComplaintStatus(req, res) {
    const complaintId = req.params.id;
    const newStatus = req.body.status;
    const note = req.body.note || '';

    const validStatuses = ['approved', 'rejected', 'pending_manual_review'];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ error: 'Invalid status value.' });
    }

    const historyEntry = {
        status: newStatus,
        changedAt: new Date(),
        note: note
    };

    complaintModel.Complaint.findByIdAndUpdate(
        complaintId,
        {
            status: newStatus,
            $push: { statusHistory: historyEntry }
        },
        { new: true }
    )
        .then(function(updated) {
            if (!updated) {
                return res.status(404).json({ error: 'Complaint not found.' });
            }
            return res.status(200).json({ success: true, complaint: updated });
        })
        .catch(function(error) {
            console.error('Status Update Error:', error);
            return res.status(500).json({ error: 'Failed to update complaint status.' });
        });
}

function addAdminNote(req, res) {
    const complaintId = req.params.id;
    const text = req.body.text;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Note text is required.' });
    }

    const noteEntry = {
        text: text.trim(),
        createdAt: new Date()
    };

    complaintModel.Complaint.findByIdAndUpdate(
        complaintId,
        { $push: { adminNotes: noteEntry } },
        { new: true }
    )
        .then(function(updated) {
            if (!updated) {
                return res.status(404).json({ error: 'Complaint not found.' });
            }
            return res.status(200).json({ success: true, complaint: updated });
        })
        .catch(function(error) {
            console.error('Add Note Error:', error);
            return res.status(500).json({ error: 'Failed to add note.' });
        });
}

function deleteComplaint(req, res) {
    const complaintId = req.params.id;

    complaintModel.Complaint.findByIdAndDelete(complaintId)
        .then(function(deleted) {
            if (!deleted) {
                return res.status(404).json({ error: 'Complaint not found.' });
            }
            return res.status(200).json({ success: true, message: 'Complaint deleted.' });
        })
        .catch(function(error) {
            console.error('Delete Error:', error);
            return res.status(500).json({ error: 'Failed to delete complaint.' });
        });
}

module.exports = {
    submitComplaint: submitComplaint,
    getQuarantinedComplaints: getQuarantinedComplaints,
    getComplaintById: getComplaintById,
    updateComplaintStatus: updateComplaintStatus,
    addAdminNote: addAdminNote,
    deleteComplaint: deleteComplaint
};
