const db = require("../database/index");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
JWT_SECRET = 'ascefbth,plnihcdxuwy';

const validatePassword = (password) => {
    const errors = [];
    const passwordChecking = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (password.length < 8) {
        errors.push('Password should be 8 characters or more.');
    }
    if (!passwordChecking.test(password)) {
        errors.push('Password must have uppercase, lowercase, and a symbol.');
    }
    return {
        isValid: errors.length === 0,
        errors: errors,
    };
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const signup = async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            birthMonth,
            birthDay,
            birthYear
        } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).send('Missing required fields');
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'Password is too weak',
                errors: passwordValidation.errors
            });
        }

        const existingUser = await db.user.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const monthName = monthNames[parseInt(birthMonth) - 1] || null;

        const userData = {
            email,
            firstName,
            lastName,
            password: hashedPassword,
            month: monthName,  
            day: birthDay || null,
            year: birthYear || null,
            type: 'user', 
        };

        const user = await db.user.create(userData);

        return res.status(201).json(user);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(err => err.message),
            });
        }
        console.error(error);
        res.status(500).send('Server error');
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        const user = await db.user.findOne({ where: { email } });//this is to find the user in the database with the email address the user used to login 

        if (!user) {//if the email address is not in our database, an error message will be shown indicaing that we do not have this user
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);//this to compare if the given password is the same as the hashed one in our database

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });//if the password is not the same, it displays an error 
        }

        const fullName = `${user.firstName} ${user.lastName}`;

        const token = jwt.sign(//json web token to give a token to the user once they are logged in 
            { id: user.id, name: fullName, email: user.email , avatar: user.avatar},//the token will include these
            JWT_SECRET,
            { expiresIn: '5h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: fullName,
                email: user.email,
                type: user.type,
                avatar: user.avatar 

            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

const updateAvatar = async (req, res) => {
    try {
        const { userId, avatar } = req.body;
        const user = await db.user.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.update({ avatar });
        res.status(200).json({
            message: 'Avatar updated successfully',
            avatar: avatar
        })
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Error updating avatar' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await db.user.findAll(); 
        return res.status(200).json(users); 
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send('Server error');
    }
};
const getuserbyid = async (req, res) => {
    try {
        const { id } = req.params; 
        const user = await db.user.findByPk(id); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); 
        }

        return res.status(200).json(user); 
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send('Server error'); 
    }
};
const deleteuserbyid = async (req, res) => {
    try {
        const { id } = req.params; 
        const user = await db.user.findByPk(id); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); 
        }

        await user.destroy(); 
        return res.status(200).json({ message: 'User deleted successfully' }); 
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send('Server error'); 
    }
};
const updateName = async (req, res) => {
    try {
        const { userId, firstName, lastName } = req.body;
        await db.user.update(
            { firstName, lastName },
            { where: { id: userId } }
        );
        res.status(200).json({
            message: 'Name updated successfully',
            name: `${firstName} ${lastName}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating name' });
    }
};

module.exports = { signup, login, updateAvatar, getAllUsers ,getuserbyid, deleteuserbyid , updateName};
