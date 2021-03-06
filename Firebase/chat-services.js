var app = require('express')
var http = require('http').Server(app)
var io = require('socket.io')(http)
var admin = require('firebase-admin')
var FCM = require('fcm-push')
var firebase_functions = require('firebase-functions')

let SEND_CHAT_MESSAGE_EVENT = 'SEND_CHAT_MESSAGE_EVENT'
let FIREBASE_CHATS_TABLE = 'Chats'
let FIREBASE_NEW_CHATS_TABLE = 'NewMessageIds'
let FIREBASE_USERS_TABLE = 'Users'

var serverKey = 'AAAAsaS7MwQ:APA91bHtqDmOBfWmk9vk_6EzTEccqkz7Jn4Q6TiIw6XZjIL7wM5aVs3W6qBW2a0M0_W5V84rUep49j96BYsEOo9Z6re5DbJEiqls1uNZeco9-iuRn5ryF-Za_D4kULtGFaA4Nrpu3GAU'
var fcm = new FCM(serverKey)
var db = admin.database()
var usersRef = db.ref(FIREBASE_USERS_TABLE)
var chatsRef = db.ref(FIREBASE_CHATS_TABLE)

var chatServicesRequests = (io) => {
  io.on('connection', (socket) => {
    notifyNewMessage(socket, io)
  })
}

function notifyNewMessage (socket, io) {
  socket.on(SEND_CHAT_MESSAGE_EVENT, (data) => {
    var userChatRef = chatsRef.child(data.chattrBoxId).child(data.chatId)
    userChatRef.set({
      chatId: data.chatId,
      message: data.chatBody,
      sender_username: data.sender_username,
      receiver_username: data.receiver_username,
      time: data.time
    })
      .then(() => {
        var tokenRef = usersRef.child(data.receiver_username).child('InstanceId')
        tokenRef.once('value', (snapshot) => {
          var message = {
            to: snapshot.val(),
            data: {
              title: 'Chattr',
              body: `New message from `,
              sender: data.sender_username,
              receiver: data.receiver_username,
              message: data.chatBody,
              chatId: data.chatId,
              chattrBoxId: data.chattrBoxId,
              time: data.time,
              timeStamp: data.timeStamp
            }
          }
          fcm.send(message)
            .then((response) => {
            })
            .catch((err) => {
              console.log(err)
            })
        })
          .catch((err) => {
            console.log(err)
          })
      })
  })
}

module.exports = {
  chatServicesRequests
}
