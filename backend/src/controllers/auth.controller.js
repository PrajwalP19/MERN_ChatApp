import { generateToken } from '../lib/utils.js'
import { User } from '../models/user.model.js'
import bcrypt from "bcrypt"
import cloudinary from '../lib/cloudinary.js'


export const signup = async (req, res) => {
    const {fullName, email, password} = req.body

   try {
      if ((!fullName || !email || !password)) {
         return res.status(400).json({message: "All fields are required!!"})
      }

      if (!password || password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long!!" });
        }

    const user = await User.findOne({email})

    if (user) return res.status(400).json({message: "Email already exist!!"})

    const salt = await bcrypt.genSalt(10)
    
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
        fullName,
        email,
        password: hashedPassword
    })

    if (newUser) {
        //generate new JWT token here
        generateToken(newUser._id, res)
        await newUser.save()

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic
        })
    } else {
        return res.status(400).json({message: "Invalid user data!!"})
    }

   } catch (error) {
     console.log("Error in signup controller!!", error)
     res.status(500).json({message: "Internal Server Error!!"})
   }
}

export const login = async (req, res) => {
    const { email, password } = req.body
   try {
    const user = await User.findOne({email})

    if (!user) {
        return res.status(400).json({message: "Invalid Credentials!!"})
    }

    const isPassCorrect = await bcrypt.compare(password, user.password)

    if (!isPassCorrect) {
        return res.status(400).json({message: "Invalid Credentials!!"})
    }

    generateToken(user._id, res)

    res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic
    })
   } catch (error) {
     console.log("Error in signup controller!!", error)
     res.status(500).json({message: "Internal Server Error!!"})
   }
}

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged Out Successfully!!" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

export const updateProfile = async(req, res) => {
    try {
        const { profilePic } = req.body
        const userID = req.user._id

        if (!profilePic) {
            return res.status(400).json({message: "Profile pic is required!!"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userID, {profilePic: uploadResponse.secure_url}, {new: true})
        
        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error in updating profile", error.message);
        res.status(500).json({ message: "Internal Server Error!!" });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message: "Internal Server Error!!"})
    }
} 

