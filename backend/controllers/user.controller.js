import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// user register function
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

        const duplicate = await User.findOne({ email });
        if (duplicate) return res.status(409).json({ message: 'user already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });

        return res.status(201).json({
            message: 'user created successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'user creation failed',
            error: error.message
        });
    }
}

// user login function
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const foundUser = await User.findOne({ email });
        if (!foundUser) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        // Create the Tokens
        const accessToken = jwt.sign(
            { "userId": foundUser._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { "userId": foundUser._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' } //7 days
        );

        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Send access token in JSON response
        return res.status(200).json({
            message: 'user logged in successfully',
            accessToken,
            user: {
                _id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: 'user login failed',
            error: error.message
        })
    }
}

// refereshToken function
export const refreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken });

    if (!foundUser) return res.status(403).json({ message: 'Forbidden' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || foundUser._id.toString() !== decoded.userId) return res.status(403).json({ message: 'Forbidden' });

        const newAccessToken = jwt.sign(
            { "userId": foundUser._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        res.json({ accessToken: newAccessToken });
    });
};

// user logout function
export const logout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204);

        const refreshToken = cookies.jwt;
        const foundUser = await User.findOne({ refreshToken });

        if (foundUser) {
            foundUser.refreshToken = '';
            await foundUser.save();
        }
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
        }
        );
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({
            message: 'user logout failed',
            error: error.message
        })
    }
}

// getUserProfile 
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -refreshToken');
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({
            message: "user data fetch",
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: 'user profile fetch failed',
            error: error.message
        })
    }
}

// updateUserProfile
export const updateUserProfile = async (req, res) => {
    try {
        const { name, email, password, gender } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (email && email !== user.email) {
            const emailTaken = await User.findOne({ email });
            if (emailTaken) return res.status(409).json({ message: 'Email already in use' });
            user.email = email;
        }

        if (name) user.name = name.trim();
        user.password = await bcrypt.hash(password, 10);
        user.gender = gender;
        const updatedUser = await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                gender: updatedUser.gender
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Profile update failed',
            error: error.message
        });
    }
}

// add address function
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;
        if (isDefault) user.address.forEach((a) => { a.isDefault = false; });

        user.address.push({
            name, street, city, state, zipCode, country, phone,
            isDefault: isDefault,
        });
        await user.save();
        return res.status(201).json(user.address);
    } catch (error) {
        return res.status(500).json({
            message: 'address add failed',
            error: error.message
        })
    }
};

// update address function
export const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const address = user.address.id(req.params.addressId);
        if (!address) return res.status(404).json({ message: 'Address not found' });

        const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;
        if (isDefault) {
            user.address.forEach((a) => {
                if (a._id.toString() !== req.params.addressId) a.isDefault = false;
            });
        }

        if (name != null) address.name = name;
        if (street != null) address.street = street;
        if (city != null) address.city = city;
        if (state != null) address.state = state;
        if (zipCode != null) address.zipCode = zipCode;
        if (country != null) address.country = country;
        if (phone != null) address.phone = phone;
        if (isDefault != null) address.isDefault = isDefault;

        await user.save();
        return res.json(user.address);
    } catch (error) {
        return res.status(500).json({
            message: 'address update failed',
            error: error.message
        })
    }
};

// delete address function
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const address = user.address.id(req.params.addressId);
        if (!address) return res.status(404).json({ message: 'Address not found' });

        const wasDefault = address.isDefault;
        user.address.pull(req.params.addressId);
        if (wasDefault && user.address.length > 0) user.address[0].isDefault = true;

        await user.save();
        return res.json(user.address);
    } catch (error) {
        return res.status(500).json({
            message: 'address delete failed',
            error: error.message
        })
    }
};

// get wishlist function (unfinished) 
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist', populate: { path: 'category', select: 'name slug' },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user.wishlist);
    } catch (error) {
        return res.status(500).json({
            message: 'wishlist fetch failed',
            error: error.message
        })
    }
};

//toggle wishlist product
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const [user, product] = await Promise.all([
            User.findById(req.user._id),
            Product.findById(productId),
        ]);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const index = user.wishlist.indexOf(productId);
        const isAdded = index === -1;
        if (isAdded) {
            user.wishlist.push(productId);
        } else {
            user.wishlist.splice(index, 1);
        }

        await user.save();
        return res.json({ message: isAdded ? 'Added to wishlist' : 'Removed from wishlist', wishlist: user.wishlist, isAdded });
    } catch (error) {
        return res.status(500).json({
            message: 'wishlist toggle failed',
            error: error.message
        })
    }
};

// get reciently viewed products
export const getRecentlyViewed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('recentlyViewed');
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user.recentlyViewed);
    } catch (error) {
        return res.status(500).json({
            message: 'recently viewed fetch failed',
            error: error.message
        })
    }
};

// add reciently viewed products
export const addRecentlyViewed = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.recentlyViewed = user.recentlyViewed.filter((id) => id.toString() !== productId);
        user.recentlyViewed.unshift(productId);
        if (user.recentlyViewed.length > 8) user.recentlyViewed.pop();

        await user.save();
        return res.json(user.recentlyViewed);
    } catch (error) {
        return res.status(500).json({
            message: 'recently viewed add failed',
            error: error.message
        })
    }
};
