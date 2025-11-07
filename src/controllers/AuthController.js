import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const signup = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Restrict signup to only clients and staff
        if (role && role !== 'client' && role !== 'staff') {
            return res.status(400).json({
                status: 'error',
                message: 'Only clients and staff can sign up'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'client'
        });


        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Remove password from response
        user.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            user
        });
        
    } catch (error) {
        console.error('Signup error:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error creating user',
            error: error.message
        });
        
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // console.log('Signin attempt:', { email });

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Find user with email
        // console.log('Attempting to find user with email:', email);
        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Compare password
        const ok = await bcrypt.compare(password, user.password);
        console.log('Password valid:', ok ? 'Yes' : 'No');

        if (!ok) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // If we get here, credentials are valid
        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-fallback-secret',
            { expiresIn: '24h' }
        );

        // Remove sensitive data
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            status: 'success',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add a me controller that returns req.user
const me = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ status: 'error', message: 'Not authenticated' })
    user.password = undefined
    res.json(user)
}

export { signup, signin, me };



const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const adminPlain = process.env.ADMIN_PASSWORD || "admin123";

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      // Do NOT pre-hash here — let the model pre('save') hash it
      const admin = new User({
        name: "Admin",
        email: adminEmail,
        password: adminPlain,
        role: "admin",
      });
      await admin.save();
      console.log("Default admin created:", adminEmail);
      console.log("Default admin password (local only):", adminPlain);
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};

// Call this function when the server starts
export {createDefaultAdmin};


const getDashboardStats = async (req, res) => {
  try {
    const total_clients = await User.countDocuments({ role: 'client' });
    const total_staff = await User.countDocuments({ role: 'staff' });
    // const total_admins = await User.countDocuments({ role: 'admin' });

    return res.json({
      total_clients,
      total_staff,
    //   total_admins
    });
  } catch (err) {
    console.error('getDashboardStats error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export {getDashboardStats};