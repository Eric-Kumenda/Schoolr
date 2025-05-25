const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient'); // Adjust the path to your Supabase client

const requireAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'No token provided' }); // Unauthorized
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user existence and role in the database
        const { data: user, error } = await supabase
            .from('users')
            .select('role, schoolId, id')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return res.status(403).json({ msg: 'Invalid token or user not found' }); // Forbidden
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin role required' }); // Forbidden
        }

        // Attach user information to the request object for further use
        req.user = {
            id: user.id,
            role: user.role,
            schoolId: user.schoolId,
        };

        next(); // Proceed to the next middleware or route handler

    } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).json({ msg: 'Invalid token' }); // Forbidden
    }
};

module.exports = requireAdmin;