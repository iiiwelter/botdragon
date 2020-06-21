const { Command } = require('discord.js-commando');

module.exports = class RemoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      memberName: 'remove',
      group: 'music',
      description: 'حذف اغنية من قائمة الانتظار',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          prompt: 'كم رقم الاغنية اللي تبي تحذفها من قائمة الانتظار؟',
          type: 'integer'
        }
      ]
    });
  }
  run(message, { songNumber }) {
    if (songNumber < 1 && songNumber >= message.guild.musicData.queue.length) {
      return message.reply('اختر رقم زين');
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('ادخل روم وحاول مره ثانيه !');

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply('ما فيه اغنية تشتغل الحين !');
    }

    message.guild.musicData.queue.splice(songNumber - 1, 1);
    return message.say(`تم حذف ${songNumber} من ثائمة الانتظار`);
  }
};
