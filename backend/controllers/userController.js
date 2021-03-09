import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'

// Auth user & get token
// Route POST /api/users/login
// Access Public
const authUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if(user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password!')
    }
})

// Sign up new user
// Route POST /api/users
// Access Public
const signUpUser = asyncHandler(async(req, res) => {
    const { name, email, password } = req.body

    const userExist = await User.findOne({ email })

    if(userExist) {
        res.status(400)
        throw new Error('User already exists!')
    }
    const user = await User.create({ name, email, password })

    if(user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data!')
    }
})

// Get user profile
// Route GET /api/users/profile
// Access Private
const getUserProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id)
    if(user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        })
    } else {
        res.status(401)
        throw new Error('User not found!')
    }
}) 

// Update user profile
// Route PUT /api/users/profile
// Access Private
const updateUserProfile = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id)
    if(user) {
        user.name = req.body.name || user.name
        user.email = req.body.email ?? user.email
        if(req.body.password) {
            user.password = req.body.password
        }
        const updatedUser = await user.save()
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id)
        })
    } else {
        res.status(404)
        throw new Error('User not found!')
    }
}) 

// Get all users
// Route GET /api/users
// Access Private/Admin
const getUsers = asyncHandler(async(req, res) => {
    const users = await User.find({})
    res.json(users)
})

// Delete user
// Route DELETE /api/users/:id
// Access Private/Admin
const deleteUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id)
    if(user) {
        await user.remove()
        res.json({ message: 'User removed!' })
    } else {
        res.status(404)
        throw new Error('User not found!')
    }
})

// Get user By Id
// Route GET /api/users/:id
// Access Private/Admin
const getUserById = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if(user) {
        res.json(user)
    } else {
        res.status(404)
        throw new Error('User not found!')
    }
})

// Update user
// Route PUT /api/users/:id
// Access Private/Admi
const updateUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id)
    if(user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.isAdmin = req.body.isAdmin === undefined ? user.isAdmin : req.body.isAdmin
        const updatedUser = await user.save()
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin
        })
    } else {
        res.status(404)
        throw new Error('User not found!')
    }
}) 


export { authUser, signUpUser, getUserProfile, updateUserProfile, getUsers, deleteUser, getUserById, updateUser }