const express = require('express');
require('./db/mongoose');
const app = express()
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const User = require('./models/users');
const Task = require('./models/task');

// app.use(async (req, res, next) => {
//     res.status(503).send(`cannot reach ${req.path} Website Under Maintanence`)
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log("Server is up on port: "+port);
    console.log(`Click: http://127.0.0.1:${port}`);
})





// const jwt = require('jsonwebtoken')
// const fun = async ()=>{
//     const data = jwt.sign({data: 'Deepanshu'}, 'secret', { expiresIn: '5 seconds' });
//     console.log(data)
//     const v = jwt.verify(data,'secret')
//     console.log(v)
// }

// fun();


// const fun = async()=>{
// // const task1 = await Task.findById('66f7f518a79510782fff9638')
// // await task1.populate('owner') 
// // console.log(task1.owner)

// const user = await User.findById('66f7f4d5a79510782fff962d')
// await user.populate('tasks')
// console.log(user.tasks)
// }
// fun()