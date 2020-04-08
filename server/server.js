const express = require('express');
const connectDB =require('./config/db')
const path =require('path');

const app = express();

//connnect to DB
connectDB();

//Init middleware for parsing 
app.use(express.json({ extended: false}));



//Define routesrs
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

//Serve static  assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('ui/build'));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'ui', 'build', 'index.html'));
    });
  }

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Listening on Port ${PORT}`)
})

