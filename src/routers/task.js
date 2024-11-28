const express = require('express');
const Task = require('../models/task')
const auth = require('../middlewares/auth')
const router = new express.Router();


router.post('/tasks',auth, async (req, res)=>{
    // const task1 = new Task(req.body);
    const task1 = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task1.save()
        res.status(201).send(task1);
    }catch(e){
        return res.status(401).send(e);
    }
    
});


// patch is used to update the info
router.patch('/tasks/:id',auth,async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((update )=> allowedUpdates.includes(update))

    if (!isValid){
        return res.status(400).send("Field not present")
    }
    try{
        // const task = await Task.findOneAndUpdate({_id:req.params.id, owner:req.user._id}, req.body, {new:true});
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
        updates.forEach((update) => task[update] = req.body[update]);
        task.save();
        if(!task) 
            return res.status(401).send("Not a valid task");

        res.send(task);

    }catch(err){
        res.status(404).send(err.message);
    }
})

router.get('/tasks',auth,async (req, res)=>{

    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    try{
    // const task = await Task.find({owner:req.user._id})    // this is also the way to fetch the user task
    await req.user.populate({
        path:'tasks',
        match:match,
        options:{
            limit:parseInt(req.query.limit),
            skip :parseInt(req.query.skip)
        }
    })
    // res.send(task);
    res.send(req.user.tasks);
    }catch(e){
        res.status(401).send(e.message);
    }
});

router.get('/tasks/:id',auth, async (req, res)=>{
    try{
        const _id = req.params.id;
        const task = await Task.findOne({_id:_id, owner: req.user._id});
        if(!task) return res.status(404).send("Task not found");

        res.send(task)
    }catch(e){
        return res.status(401).send(e.message);
    }
})

router.delete('/tasks/:id',auth ,async(req, res) => {
    try{
        const id = req.params.id;
        const task =  Task.findOneAndDelete({_id:id, owner:req.user._id})
        if(!task){
            return res.status(404).send();
        } 
        res.send(task);
    }catch(e){
        res.status(500).send(e.message);
    }
})


module.exports = router;
