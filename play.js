const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'p',
      aliases: ['play-song', 'add', 'p'],
      memberName: 'p',
      group: 'music',
      description: 'شغل اي اغنية من اليوتيوب',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'query',
          prompt: 'ايش تبغى تسمع اغنية؟',
          type: 'string',
          validate: function(query) {
            return query.length > 0 && query.length < 200;
          }
        }
      ]
    });
  }

  async run(message, { query }) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.say('ادخل الروم وحاول من جديد.');

    if (message.guild.triviaData.isTriviaRunning == true) {
      return message.say('Please try after the trivia has ended');
    }

    if (
      // if the user entered a youtube playlist url
      query.match(
        /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
      )
    ) {
      const playlist = await youtube.getPlaylist(query).catch(function() {
        return message.say('البلاي ليست برايفت او محذوف !');
      });
      // add 10 as an argument in getVideos() if you choose to limit the queue
      const videosObj = await playlist.getVideos().catch(function() {
        return message.say(
          'جت مشكله وانا احاول اخذ الاغنية '
        );
      });
      for (let i = 0; i < videosObj.length; i++) {
        if (videosObj[i].raw.status.privacyStatus == 'private') {
          continue;
        } else {
          try {
            const video = await videosObj[i].fetch();
            // this can be uncommented if you choose to limit the queue
            // if (message.guild.musicData.queue.length < 10) {
            //
            message.guild.musicData.queue.push(
              PlayCommand.constructSongObj(video, voiceChannel)
            );
            // } else {
            //   return message.say(
            //     `I can't play the full playlist because there will be more than 10 songs in queue`
            //   );
            // }
          } catch (err) {
            console.error(err);
          }
        }
      }
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message);
      } else if (message.guild.musicData.isPlaying == true) {
        return message.say(
          `Playlist - :musical_note:  ${playlist.title} :musical_note: الاغنية انضافت في قائمة الانتظار .`
        );
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      query = query
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      const id = query[2].split(/[^0-9a-z_\-]/i)[0];
      const video = await youtube.getVideoByID(id).catch(function() {
        return message.say(
          'حصلت مشكله في الاغنية !'
        );
      });
      // // can be uncommented if you don't want the bot to play live streams
      // if (video.raw.snippet.liveBroadcastContent === 'live') {
      //   return message.say("I don't support live streams!");
      // }
      // // can be uncommented if you don't want the bot to play videos longer than 1 hour
      // if (video.duration.hours !== 0) {
      //   return message.say('I cannot play videos longer than 1 hour');
      // }
      // // can be uncommented if you want to limit the queue
      // if (message.guild.musicData.queue.length > 10) {
      //   return message.say(
      //     'There are too many songs in the queue already, skip or wait a bit'
      //   );
      // }
      message.guild.musicData.queue.push(
        PlayCommand.constructSongObj(video, voiceChannel)
      );
      if (
        message.guild.musicData.isPlaying == false ||
        typeof message.guild.musicData.isPlaying == 'undefined'
      ) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message);
      } else if (message.guild.musicData.isPlaying == true) {
        return message.say(`${video.title} انضافت في قائمة الانتظار`);
      }
    }

    // if user provided a song/video name
    const videos = await youtube.searchVideos(query, 5).catch(function() {
      return message.say(
        'حصلت مشكله في البحث عن اغنيتك :('
      );
    });
    if (videos.length < 5) {
      return message.say(
        `حصلت مشكله في البحث اللي تبيه , حاول من جديد`
      );
    }
    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(`${i + 1}: ${videos[i].title}`);
    }
    vidNameArr.push('exit');
    const embed = new MessageEmbed()
      .setColor('#e9f931')
      .setTitle('اختر اغنية من 1-5')
      .addField('الاغنية 1', vidNameArr[0])
      .addField('الاغنية 2', vidNameArr[1])
      .addField('الاغنية 3', vidNameArr[2])
      .addField('الاغنية 4', vidNameArr[3])
      .addField('الاغنية 5', vidNameArr[4])
      .addField('Exit', 'exit');
    var songEmbed = await message.channel.send({ embed });
    message.channel
      .awaitMessages(
        function(msg) {
          return (msg.content > 0 && msg.content < 6) || msg.content === 'exit';
        },
        {
          max: 1,
          time: 60000,
          errors: ['time']
        }
      )
      .then(function(response) {
        const videoIndex = parseInt(response.first().content);
        if (response.first().content === 'exit') return songEmbed.delete();
        youtube
          .getVideoByID(videos[videoIndex - 1].id)
          .then(function(video) {
            // // can be uncommented if you don't want the bot to play live streams
            // if (video.raw.snippet.liveBroadcastContent === 'live') {
            //   songEmbed.delete();
            //   return message.say("I don't support live streams!");
            // }

            // // can be uncommented if you don't want the bot to play videos longer than 1 hour
            // if (video.duration.hours !== 0) {
            //   songEmbed.delete();
            //   return message.say('I cannot play videos longer than 1 hour');
            // }

            // // can be uncommented if you don't want to limit the queue
            // if (message.guild.musicData.queue.length > 10) {
            //   songEmbed.delete();
            //   return message.say(
            //     'There are too many songs in the queue already, skip or wait a bit'
            //   );
            // }
            message.guild.musicData.queue.push(
              PlayCommand.constructSongObj(video, voiceChannel)
            );
            if (message.guild.musicData.isPlaying == false) {
              message.guild.musicData.isPlaying = true;
              if (songEmbed) {
                songEmbed.delete();
              }
              PlayCommand.playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
              if (songEmbed) {
                songEmbed.delete();
              }
              return message.say(`${video.title} انضافت في قائمة الانتظار`);
            }
          })
          .catch(function() {
            if (songEmbed) {
              songEmbed.delete();
            }
            return message.say(
              'An error has occured when trying to get the video ID from youtube'
            );
          });
      })
      .catch(function() {
        if (songEmbed) {
          songEmbed.delete();
        }
        return message.say(
          'حاول مره ثانيه , اختر من 1-5'
        );
      });
  }
  static playSong(queue, message) {
    const classThis = this; // use classThis instead of 'this' because of lexical scope below
    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              quality: 'highestaudio',
              highWaterMark: 1024 * 1024 * 10
            })
          )
          .on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            dispatcher.setVolume(message.guild.musicData.volume);
            const videoEmbed = new MessageEmbed()
              .setThumbnail(queue[0].thumbnail)
              .setColor('#e9f931')
              .addField('الان تشتغل:', queue[0].title)
              .addField('Duration:', queue[0].duration);
            if (queue[1]) videoEmbed.addField('الاغنية الثانية:', queue[1].title);
            message.say(videoEmbed);
            message.guild.musicData.nowPlaying = queue[0];
            return queue.shift();
          })
          .on('finish', function() {
            if (queue.length >= 1) {
              return classThis.playSong(queue, message);
            } else {
              message.guild.musicData.isPlaying = false;
              message.guild.musicData.nowPlaying = null;
              message.guild.musicData.songDispatcher = null;
              if (message.guild.me.voice.channel) {
                return message.guild.me.voice.channel.leave();
              }
            }
          })
          .on('error', function(e) {
            message.say('error');
            console.error(e);
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.isPlaying = false;
            message.guild.musicData.nowPlaying = null;
            message.guild.musicData.songDispatcher = null;
            return message.guild.me.voice.channel.leave();
          });
      })
      .catch(function(e) {
        console.error(e);
        return message.guild.me.voice.channel.leave();
      });
  }
  static constructSongObj(video, voiceChannel) {
    let duration = this.formatDuration(video.duration);
    if (duration == '00:00') duration = 'Live Stream';
    return {
      url: `https://www.youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnails.high.url,
      voiceChannel
    };
  }
  // prettier-ignore
  static formatDuration(durationObj) {
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
      durationObj.minutes ? durationObj.minutes : '00'
    }:${
      (durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
    return duration;
  }
};
