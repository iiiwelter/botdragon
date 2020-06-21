const { Command } = require('discord.js-commando');

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 's',
      aliases: ['skip-song', 'advance-song', 's'],
      memberName: 's',
      group: 'music',
      description: 'تخطي الاغنية',
      guildOnly: true
    });
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('ادخل الروم وحاول مره ثانية');

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply('ما فيه اغنية تشتغل الحين !');
    } else if (message.guild.triviaData.isTriviaRunning) {
      return message.reply(`You can't skip a trivia! Use end-trivia`);
    }
    message.guild.musicData.songDispatcher.end();
  }
};
