const WebRcon = require('webrconjs') 
const Discord = require('discord.js')
const bot = new Discord.Client()
const config = require('config.json')('./config.json')

// Login to discord 
bot.on('ready', () => {
	console.log('Logged in as', bot.user.tag)
})

// Create a new client:
let rcon = new WebRcon(config.IP, config.Port)
 
// Handle events:
rcon.on('connect', function() {
    console.log('CONNECTED')
    
// Run a command once connected:
function getData() {
    rcon.run ('serverinfo', 0);
}
getData();
// Rerun command over set interval 
setInterval(getData, Math.max(5, config.SetInterval || 5) * 1000);

});
rcon.on('message', function(msg) {
    // Parse Messages
    const data = JSON.parse(msg.message)  
    // Set Discord status (No idea why it returns undefined sometimes simple fix added to prevent it.)
    if (data.Players === undefined){
        return;
    } else if (data.Queued > 0){
        bot.user.setActivity(`(${data.Players}/${data.MaxPlayers} (${data.Queued}) Queued!)`);
        console.log(`(${data.Players}/${data.MaxPlayers} (${data.Queued}) Queued!)`);
    } else if (data.Joining === 0){
        bot.user.setActivity(`(${data.Players}/${data.MaxPlayers} Online!)`);
        console.log(`(${data.Players}/${data.MaxPlayers} Online!)`);
    } else {
        bot.user.setActivity(`(${data.Players}/${data.MaxPlayers} (${data.Joining}) Joining!)`);
        console.log(`(${data.Players}/${data.MaxPlayers} (${data.Joining}) Joining!)`);
    }
})

rcon.on('disconnect', function() {
    console.log('DISCONNECTED')
})

// Connect by providing the server's rcon.password:
rcon.connect(config.RconPassword)
// Login to discord bot
bot.login(config.DiscordToken)
