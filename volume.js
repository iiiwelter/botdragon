const { Command } = require('discord.js-commando');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'v',
      aliases: ['change-volume'],
      group: 'music',
      memberName: 'v',
      guildOnly: true,
      description: 'تعديل صوت البوت',
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'wantedVolume',
          prompt: 'كم تبي الصوت من 1-200 ؟',
          type: 'integer',
          validate: function(wantedVolume) {
            return wantedVolume >= 1 && wantedVolume <= 200;
          }
        }
      ]
    });
  }

  run(message, { wantedVolume }) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('ادخل الروم وحاول مره ثانيه !');

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply('ما فيه اغنية تشتغل الحين');
    }
    const volume = wantedVolume / 100;
    message.guild.musicData.volume = volume;
    message.guild.musicData.songDispatcher.setVolume(volume);
    message.say(`الصوت الان: ${wantedVolume}%`);
  }
};
