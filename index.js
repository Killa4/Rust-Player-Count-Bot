const WebRcon = require('webrconjs')
const Discord = require('discord.js')
const bot = new Discord.Client();
const config = require('./config.json')

config.Servers.forEach((server, index) => {
    server.name = `${server.IP}:${server.Port}/${index}`
    server.rcon = new WebRcon(server.IP, server.Port)
    server.connected = false;
    server.bot = new Discord.Client();
    server.bot.login(server.DiscordToken)

    let waitingForMessage = false
    let lastMessage = ''

    // Login to discord 
    server.bot.on('ready', () => {
        console.log('Logged in as', server.bot.user.tag)
        server.bot.user.setActivity('Server Connecting...');
        reconnect()
    })

    server.bot.on('error', error => {
	 console.error('The websocket connection encountered an error:', error);
    });

    process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
    });

    server.rcon.on('connect', function () {
        try {
            server.connected = true;
            console.log(server.name, 'CONNECTED');
            lastMessage = '';
            server.bot.user.setActivity('Server Connecting...');
        } catch {
        }
            function getData() {
                if (server.connected === true) {
                try {
                    server.rcon.run('serverinfo', 0);
                    setTimeout(getData, config.SetTimeout);
                } catch {
                }
            }
        }
        getData();
    });

    server.rcon.on('message', function (msg) {
        // Parse Messages
        const data = JSON.parse(msg.message)
        // Set Discord status (No idea why it returns undefined sometimes simple fix added to prevent it.)
        if (data.Players === undefined) {
            return;
        } else if (data.Queued > 0) {
            setMessage(`(${data.Players}/${data.MaxPlayers} (${data.Queued}) Queued!)`);
            waitingForMessage = true
        } else if (data.Joining === 0) {
            setMessage(`(${data.Players}/${data.MaxPlayers} Online!)`);
            waitingForMessage = true
        } else {
            setMessage(`(${data.Players}/${data.MaxPlayers} (${data.Joining}) Joining!)`);
            waitingForMessage = true
        }
    })
    //Spam prevention to discord api (If message is the same it will not paste over and over!)
    function setMessage(newMessage) {
        if (waitingForMessage === true && newMessage === lastMessage) {
			console.log('Discord Spam Prevention (Message is the same)');
        } else {
            server.bot.user.setActivity(newMessage);
            console.log(server.name, newMessage);
            lastMessage = newMessage
			waitingForMessage = false;
        }
    }
    // Disconnect function to know when the rcon gets disconnected / server restarts
    server.rcon.on('disconnect', function () {
        server.connected = false;
        server.bot.user.setActivity('Server Offline...');
        console.log(server.name, "Server Offline");
        // Reconnect if server goes offline 
        if (server.connected === false) {
            try {
                console.log(server.name, "TRYING TO RECONNECT");
                setTimeout(reconnect, config.SetTimeout);
            } catch {
            }
        }
    })

    // Connect / Reconnect function
    function reconnect() {
        try {
            server.rcon.connect(server.RconPassword)
        } catch {
        }
    }
});
