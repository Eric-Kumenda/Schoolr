exports.submitJoinRequest = async (req, res) => {
	const { schoolId, role, proofUrl } = req.body;
	const userId = req.user.id;

	try {
		await db.collection("joinRequests").add({
			userId,
			schoolId,
			role,
			proofUrl: proofUrl || null,
			status: "pending",
			createdAt: new Date(),
		});

		res.status(201).json({ message: "Join request submitted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getPendingJoinRequests = async (req, res) => {
	const { schoolId } = req.user; // Assuming logged-in admin

	try {
		const snapshot = await db
			.collection("joinRequests")
			.where("schoolId", "==", schoolId)
			.where("status", "==", "pending")
			.get();

		const requests = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		res.json(requests);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.approveJoinRequest = async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
  
    try {
      const requestDoc = await db.collection('joinRequests').doc(requestId).get();
      if (!requestDoc.exists) return res.status(404).json({ error: 'Request not found' });
  
      const { userId, schoolId, role } = requestDoc.data();
  
      if (action === 'approve') {
        await db.collection('users').doc(userId).update({
          schoolId,
          role,
          isVerified: true,
        });
      }
  
      // Update the request status
      await db.collection('joinRequests').doc(requestId).update({
        status: action,
      });
  
      res.json({ message: `Request ${action}d successfully` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  