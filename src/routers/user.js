const express = require('express');
const User = require('../models/users')
// const Tasks = require('../models/task')
const auth = require('../middlewares/auth');
const multer = require('multer')

const router = new express.Router();

router.post('/users',async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        if(user){
            const token = await user.generateAuthToken(); 
            res.status(201).send({user,token});
        }
    }catch(e){
        res.status(401).send(e.message);
    }
});



router.patch('/users/me/',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','age', 'password']
    const isValidUpdate = updates.every((up) => allowedUpdates.includes(up))

    if(!isValidUpdate)
        return res.status(401).send("Trying to update an invalid filed!");
    try{
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});
        // const user = await User.findById(req.user._id);
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

        // if(!user)   //  user just logged in and that is authenticated so no need to check if user is avaiable or not
        //     return res.status(401).send(`User Not Fount with ID: ${req.user.id}`)

        res.send(req.user);
    } catch (error) {
        return res.status(401).send(error)
    }
})

router.get('/users/me',auth,async (req,res)=>{
    // try{
    //     const user = await User.find({})
    //     res.send(user);
    // }catch(error) {
    //     res.status(401).send(error);
    // }
    res.send(req.user)
});

const upload = multer({dest:"media/"})
router.post('/users/me/avatar', upload.single('avatar') ,async (req, res)=>{
    res.send()
})

// router.get('/users/:id',async (req,res)=>{
//     try{
//         const _id = req.params.id;
//         const user = await User.find({_id});
//         if(!user){
//             return res.status(404).send(`User with this ID(${_id}) not found!!`);
//         }
//         res.send(user);
//     }catch(e){
//         res.status(500).send(e);
//     }
// })

router.delete('/users/me/',auth, async(req, res) => {
    try{
        const _id = req.user.id;
        await Tasks.deleteMany({owner: req.user._id})   // It is one way to delete all the tasks when user profile is deleted another way is by using middlewares like .pre
        await User.deleteOne({_id: _id})
        // We cannot use middleware to delete all tasks as remove function is not working and throwing ans error.
        // await req.user.remove()    // giving errror req.user.remove() is not a fun
        res.send(`user deleted successfully`)
    }catch(err) {
        res.status(500).send(err.message)
    }
})




router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.password, req.body.email);
        const token = await user.generateAuthToken()
        res.send({user,token});
    } catch(e){
        res.status(400).send(e.message);
    }
})

router.post('/users/logout', auth, async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save();
        res.send("Logout Successfully");

    } catch (e) {
        res.status(500).send(e.message);
    }
})

router.post('/users/logoutAll',auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save();
        res.send("Logout Successfully from all devices");

    } catch (e) {
        res.status(500).send(e.message);
    }
})

router.post('/users/noOfActiveDevices',auth, async (req, res) => {
    try{
        var count = 0;
        req.user.tokens = req.user.tokens.filter((token) => {
            // if(token.token)
                count = count + 1;
        })
        res.send(`You are currently logged in ${count} Devices`);

    } catch (e) {
        res.status(500).send(e.message);
    }
})


module.exports = router