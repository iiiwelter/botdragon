const { Command } = require('discord.js-commando');

module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 're',
      aliases: ['resume-song', 'continue'],
      memberName: 're',
      group: 'music',
      description: 'Resume the current paused song',
      guildOnly: true
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('ادخل الروم وحاول مره ثانيه !');

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher === null
    ) {
      return message.reply('مافيه اغينة تشتغل الحين !');
    }

    message.say('الاغنية اشتغلت :play_pause:');

    message.guild.musicData.songDispatcher.resume();
  }
};
