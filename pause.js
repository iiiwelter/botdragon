const { Command } = require('discord.js-commando');

module.exports = class PauseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pa',
      aliases: ['pause-song', 'hold', 'stop'],
      memberName: 'pa',
      group: 'music',
      description: 'توقف مؤقت',
      guildOnly: true
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('ادخل الروم وحاول من جديد ');

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.say('ما فيه اغنية تشتغل الحين!');
    }

    message.say('الاغنية توقفت مؤقتا :pause_button:');

    message.guild.musicData.songDispatcher.pause();
  }
};
