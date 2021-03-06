/**
 * Created by sonste on 27.02.2016.
 */

var srtPlayer = srtPlayer || {};

srtPlayer.FindVideoService = srtPlayer.FindVideoService || (() => {
        "use strict";

        var META_CHANNEL = messageBus.channel(srtPlayer.ServiceDescriptor.CHANNEL.META);
        var BACKEND_SERVICE_CHANNEL = messageBus.channel(srtPlayer.ServiceDescriptor.CHANNEL.BACKEND_SERVICE);

        var CONTENT_SERVICE_CHANNEL = messageBus.channel(srtPlayer.ServiceDescriptor.CHANNEL.CONTENT_SERVICE);
        var SERVICE_CONST = srtPlayer.ServiceDescriptor.CONTENT_SERVICE.FIND_VIDEO;
        var console = srtPlayer.LogService.getLoggerFor(SERVICE_CONST.NAME);


        var video;

        META_CHANNEL.subscribe({
            topic: 'user.standby',
            callback: (isStandby)=> {
                if (isStandby) {
                    CONTENT_SERVICE_CHANNEL.publish({
                        topic: srtPlayer.ServiceDescriptor.CONTENT_SERVICE.FIND_VIDEO.PUB.RELEASE,
                        data: {}
                    });
                    video = null;
                    return;
                }
                if (video) {
                    return;
                }




                if (document.querySelector('video')) {
                    video = document.querySelector('video');
                    CONTENT_SERVICE_CHANNEL.publish({
                        topic: SERVICE_CONST.PUB.FOUND,
                        data: video
                    });
                    return;
                }

                console.log("no video found, register observer");
                var findVideoCandidate = ()=> {
                    if (!document.querySelector('video')) {
                        return;
                    }
                    video = document.querySelector('video');
                    console.log('observer found video');
                    CONTENT_SERVICE_CHANNEL.publish({
                        topic: SERVICE_CONST.PUB.FOUND,
                        data: video
                    });
                    observer.disconnect();
                };
                var observer = new MutationObserver(findVideoCandidate);
                observer.observe( document.querySelector('body'), {childList: true, subtree: true});

            }
        });

        BACKEND_SERVICE_CHANNEL.publish({
            topic: srtPlayer.ServiceDescriptor.BACKEND_SERVICE.META.SUB.PUBLISH,
            data: 'user.standby'
        });

    })();