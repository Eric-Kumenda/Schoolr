const jwt = require('jsonwebtoken'); // For verifying JWTs
const supabase = require('../supabaseClient');

const requireAuth = async (req, res, next) => {
    // 1. Check for the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer TOKEN"

    // If no token is provided, send a 401 Unauthorized response
    if (!token) {
        return res.status(401).json({ msg: 'No authentication token provided. Access denied.' });
    }

    try {
        // 2. Verify the JWT token
        // Use your JWT_SECRET from your environment variables
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // The decoded token should contain the user's Supabase ID
        // (Assuming you're putting `id` and `_id` into the JWT during login/registration)
        const supabaseUserId = decodedToken.id; // Supabase user ID

        // 3. Fetch user details from your database (Supabase 'users' table)
        // This step is crucial to get the user's current role and schoolId
        // and to ensure the user still exists and is active.
        const { data: user, error } = await supabase
            .from('users') // Your Supabase table where user roles and schoolId are stored
            .select('id, role, schoolId') // Select necessary fields
            .eq('id', supabaseUserId)
            .single(); // Expecting one user

        if (error || !user) {
            console.error("User lookup error from Supabase:", error);
            return res.status(403).json({ msg: 'Authentication failed. User not found or inactive.' });
        }

        // 4. Attach user information to the request object
        // This makes user data available to subsequent middleware and route handlers.
        req.user = {
            id: user.id, // Supabase user ID
            role: user.role,
            schoolId: user.schoolId, // Mongoose ObjectId of the school
        };

        // 5. Proceed to the next middleware or route handler
        next();

    } catch (err) {
        // Handle various JWT verification errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Authentication token expired. Please log in again.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid authentication token. Access denied.' });
        }
        console.error('Error in requireAuth middleware:', err);
        return res.status(500).json({ msg: 'Server authentication error.' });
    }
};

module.exports = requireAuth;