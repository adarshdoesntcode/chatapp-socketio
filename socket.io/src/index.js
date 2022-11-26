const path = require('path');
const http = require('http');

const express = require ('express');
const hbs = require ('hbs');
const socketio = require('socket.io');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname,"../public");
const viewsDirectoryPath = path.join(__dirname,"../templates/views");
const partialsDirectoryPath = path.join(__dirname,"../templates/partials");


app.set('view engine','hbs');
app.set('views',viewsDirectoryPath);

app.use(express.static(publicDirectoryPath));
hbs.registerPartials(partialsDirectoryPath);

app.get('/',(req,res)=>{
  res.render('index');
})


io.on('connection',(socket)=>{

  socket.emit('renderMessage',"Welcome!")
  socket.broadcast.emit('renderMessage','A new user has joinded');

  socket.on('sendMessage',(message)=>{
    io.emit('renderMessage',message);
  })

  socket.on('sendLocation',({lat,long})=>{
    io.emit('renderMessage',`https://google.com/maps?q=${lat},${long}`)
  })

  socket.on('disconnect',()=>{
    io.emit('renderMessage','A user left!!')
  })
})



server.listen(port,()=>{
  console.log('server started at port ', port);
})



