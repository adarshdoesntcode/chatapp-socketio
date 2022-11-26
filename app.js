let APP_ID = "7a59762ae5964c7683164cf6ff1d8b55";
let token = null;
let uid = String(Math.floor(Math.random()*10000000));

let client;
let channel;

let localStream;
let remoteStream;

let peerConnection;

const servers = {
  iceServers : [
    {
      urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
    }
  ]
}

let init = async ()=>{
  client = await AgoraRTM.createInstance(APP_ID);

  await client.login({uid,token});
  channel = client.createChannel('main');
  await channel.join();

  channel.on('MemberJoined',handleUserJoined);
  client.on("MessageFromPeer",handleMessageFromPeer);

  localStream = await navigator.mediaDevices.getUserMedia({audio:false,video:true});
  document.getElementById("user-1").srcObject = localStream;

}
let handleMessageFromPeer = async(message, MemberID)=>{
  message = JSON.parse(message.text)
  
  if(message.type === "offer"){
    createAnswer(MemberID,message.offer);
  }
  if(message.type === "answer"){
    addAnswer(message.answer);
  }
  if(message.type === "candidate"){
    if(peerConnection){
      peerConnection.addIceCandidate(message.candidate);
    }
  }
}

let handleUserJoined = async (MemberID)=>{
  createOffer(MemberID);

}

let createPeerConnection = async(MemberID)=>{
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  if(!localStream){
    localStream = await navigator.mediaDevices.getUserMedia({audio:false,video:true});
    document.getElementById("user-1").srcObject = localStream;
  }

  localStream.getTracks().forEach((track)=>{
    peerConnection.addTrack(track,localStream);
  })

  peerConnection.ontrack = (event)=>{
    event.streams[0].getTracks().forEach((track)=>{
      remoteStream.addTrack(track)
    })
  }

  peerConnection.onicecandidate = async (event)=>{
    if(event.candidate){
      client.sendMessageToPeer({text:JSON.stringify({'type':'candidate','candidate':event.candidate})},MemberID)

    }
  }

}


let createOffer = async (MemberID)=>{
  await createPeerConnection(MemberID);

  let offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);

  client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberID)

}

let createAnswer = async(MemberID,offer)=>{
  await createPeerConnection(MemberID);

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();

  await peerConnection.setLocalDescription(answer)
  client.sendMessageToPeer({text:JSON.stringify({'type':'answer','answer':answer})},MemberID)

}

let addAnswer = async (answer)=>{
  if(!peerConnection.currentRemoteDescription){
    peerConnection.setRemoteDescription(answer)
  }
}

init();