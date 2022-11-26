const socket = io();

document.getElementById('chat-box').addEventListener('submit',(e)=>{
  e.preventDefault();
  let message = document.getElementById('message').value;
  document.getElementById('chat-box').reset(); 
  socket.emit('sendMessage',message);
  
})

document.querySelector('#send-location').addEventListener('click',()=>{
  if(!navigator.geolocation){
    alert("Your browser does not support geolocation");
  }

  navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation',{lat: position.coords.latitude, long: position.coords.longitude});
  })
})

socket.on('renderMessage',(message)=>{
  console.log(message);
})

