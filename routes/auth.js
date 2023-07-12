const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')
require('dotenv').config()


const JWT_SECRET = process.env.JWT_SECRET_KEY

// ROUTE-1: Creating a User using POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', "Enter a valid name").isLength({min: 3}),
    body('email', "Enter a valid email").isEmail(),    
    body('password', "Enter a valid password").isLength({min: 5})
], async (req,res)=>{
  let success = false;
  // If errors then return bad request and send errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try{
      let user = await User.findOne({email: req.body.email});
      if(user){
        return res.status(400).json({success, error: "User with that email already exists."})
      }

      let salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(req.body.password, salt)

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })

      // res.send({user})

      const data = {
        user: {
          id: user.id
        }
      }

      const authtoken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({success,authtoken})

    }catch(err){
      // console.log(err)
      res.status(500).json({error: "Internal Error"})
    }

});

// ROUTE-2: Authenticating a User using POST "/api/auth/login". No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async(req,res)=>{
    let success = false;
    // If errors then return bad request and return the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success ,errors: errors.array() });
    }

    let {email, password} = req.body

    try {
      let user = await User.findOne({email});
      if(!user){
        return res.status(400).json({success,error: "Please try to login with correct credentials!!"});
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if(!passwordCompare){
        return res.status(400).json({success, error: "Please try to login with correct credentials!!"});
      }

      const data = {
        user: {
          id: user.id
        }
      }

      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true
      res.json({success, authtoken})

    } catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal Error"})
    }
})

// ROUTE-3: Getting loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser ,async(req,res)=>{
  try {
    let userId = req.user.id;
    let user = await User.findById(userId).select("-password");
    res.json(user)
  } catch (error) {
    console.log(error);
    res.status(400).json({error: "Internal Error!"});
  }
  
});

module.exports = router;