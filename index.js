const WebRcon = require('webrconjs') 
const Discord = require('discord.js')
const bot = new Discord.Client({autoReconnect:true});
const config = require('config.json')('./config.json')
let connect = null;

// Login to discord 
bot.on('ready', () => {
	console.log('Logged in as', bot.user.tag)
}) 
//Catch discord disconnects
bot.on('disconnected', () => {
    console.log('Discord bot Error / Got disconnected (Trying to reconnect)')
});

// Create a new client:
let rcon = new WebRcon(config.IP, config.Port)
 
// Handle events:
let refreshing = false
rcon.on('connect', function() {
    try {
    connect = true 
    console.log('CONNECTED')
    bot.user.setActivity('Server Connecting...');
    } catch {
    }
    if (connect === true) {
        function getData() {
            try {
            rcon.run ('serverinfo', 0);
            } catch {
            }
        }
        getData();
        try {
        // Rerun command over set interval 
        setInterval(getData, Math.max(5, config.SetInterval || 5) * 1000);
        } catch {
        }
    }
});

rcon.on('message', function(msg) {
    // Parse Messages
    const data = JSON.parse(msg.message)  
    // Set Discord status (No idea why it returns undefined sometimes simple fix added to prevent it.)
    if (data.Players === undefined){
        return;
    } else if (data.Queued > 0){
        setMessage(`(${data.Players}/${data.MaxPlayers} (${data.Queued}) Queued!)`);
        waitForMessage = true
    } else if (data.Joining === 0){
        setMessage(`(${data.Players}/${data.MaxPlayers} Online!)`);
        waitForMessage = true
    } else {
        setMessage(`(${data.Players}/${data.MaxPlayers} (${data.Joining}) Joining!)`);
        waitForMessage = true
    }
})
//Spam prevention to discord api (If message is the same it will not paste over and over!)
let waitingForMessage = false
let lastMessage = ''
let mewMessage = ''
function setMessage(newMessage) {
    if (waitingForMessage === true || newMessage === lastMessage) {
        return
    } else {
        bot.user.setActivity(newMessage);
        console.log(newMessage);
        lastMessage = newMessage
    }
}

rcon.on('disconnect', function() {
    connect = false;
    bot.user.setActivity('Server Offline...');
    console.log("Server Offline");
// Reconnect if server goes offline 
    if (connect === false){
        try {
        console.log("TRYING TO RECONNECT");
        setInterval(reconnect, Math.max(5, 5 || 5) * 1000);
        } catch {
        }
    }
})

// Connect / Reconnect function
function reconnect() {
    try {
        rcon.connect(config.RconPassword)
    } catch {
    }
}

//First connection 
reconnect()
// Login to discord bot
bot.login(config.DiscordToken)
