const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const Tasks = require('../models/task')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous',
        trim: true
    },
    age: {
        type: Number,
        trim: true,
        validate(value) {
            if(value < 0)
                throw new Error('Age cannot be negative');
        }
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: true,
        validate(value) {
            if(!validator.isEmail(value))
                throw new Error('Invalid Email Address');
        }
    },
    password: {
        type:String,
        required: true,
        trim: true,
        // minlength:7,
        validate(value){
            if(value.length < 6)
                throw new Error('Password length should be greater or equal to 6');
            if(value.includes('password'))
                throw new Error(`Password must not contain the string "Password"`);
        }

    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    

},{
    timestamps: true
});

// virtual scheema are not the part of the database these are created only to set
// the relationship between the two models.

userSchema.virtual('tasks',{
    ref:'Task',       // 'Task' this name should match exported value from the other model 
    localField:'_id',
    foreignField:'owner'
})

//  it is the function to hide the sensitive information from display.
userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject();

    delete userObj.password
    delete userObj.tokens

    return userObj;
}



userSchema.methods.generateAuthToken = async function () {
    const  user = this
    const token = jwt.sign({_id: user._id.toString()}, "MySecret")
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
} 
// .statics is used to create the user defined functions which can be applied on the models
userSchema.statics.findByCredentials = async(password, email) => {
    const user = await User.findOne({email});
    if(!email){
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        throw new Error('unable to login')
    }
    return user;
}

// .pre is a type of middleware which will be executed just before some task like before save operation e.g., user.save()
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    next()
})

// userSchema.pre('remove', async function(next){
//     const user = this
//     await tasks.deleteMany({owner: user._id})
//     next()
// })


const User = mongoose.model('User', userSchema);

module.exports = User;