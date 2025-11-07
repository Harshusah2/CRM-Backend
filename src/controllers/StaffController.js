import User from '../models/User.js';

// Get all staffs (with role-based filtering)
export const getStaffs = async (req, res) => {
  try {
    let query = { role: 'staff' }; // Base query to get users with client role
    
    // If user is staff, they can only see their own profile
    if (req.user.role === 'staff') {
      query._id = req.user._id;
    }

    const staff = await User.find(query)
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: staff.length,
      data: staff
    });
  } catch (error) {
    console.error('Get staffs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching staffs'
    });
  }
};


// Admin create client
export const adminCreateStaff = async (req, res) => {
    try {
        // console.log('Request body received:', req.body); // Debug log

        // Check if body exists
        if (!req.body) {
            return res.status(400).json({
                status: 'error',
                message: 'Request body is missing'
            });
        }

        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, email and password are required',
                received: { name, email, hasPassword: !!password }
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'staff'
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            status: 'success',
            data: userResponse
        });
    } catch (error) {
        console.error('Admin create staff error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating staff',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteStaff = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only admin can delete staffs'
      });
    }

    const { id } = req.params;

    // Check if client exists
    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({
        status: 'error',
        message: 'Staff not found'
      });
    }

    // Ensure we're only deleting clients
    if (staff.role !== 'staff') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only delete users with staff role'
      });
    }

    // Delete the client
    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting staff'
    });
  }
};