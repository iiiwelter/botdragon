const { Command } = require('discord.js-commando');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bey',
      aliases: ['end'],
      group: 'music',
      memberName: 'bey',
      guildOnly: true,
      description: 'Bey Bey'
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('ادخل الروم وحاول مره ثانية');

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply('لا يوجد اغنية تشتغل الان !');
    }
    if (!message.guild.musicData.queue)
      return message.say('ما فيه اغنية تشتغل الحين');
    message.guild.musicData.songDispatcher.end();
    message.guild.musicData.queue.length = 0;
    return;
  }
};
