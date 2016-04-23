var srtPlayer = srtPlayer || {};
if (typeof exports !== 'undefined') {
    exports.srtPlayer = srtPlayer;
    var messageBus = null;
    srtPlayer.ServiceDescriptor = require('./../../ServiceDescriptor.js').srtPlayer.ServiceDescriptor;
}

srtPlayer.MovieService = srtPlayer.MovieService || (($, messageBusLocal = messageBus)=> {

        var SERVICE_CHANNEL = messageBusLocal.channel(srtPlayer.ServiceDescriptor.CHANNEL.BACKEND_SERVICE);
        var SERVICE_CONST = srtPlayer.ServiceDescriptor.BACKEND_SERVICE.MOVIE;
        var console2 = srtPlayer.LogService.getLoggerFor(SERVICE_CONST.NAME);


        SERVICE_CHANNEL.subscribe({
            topic: SERVICE_CONST.SUB.SEARCH,
            callback: loadData
        });

        function loadData(query) {

            $.ajax({
                url: 'http://www.imdb.com/xml/find',
                type: 'GET',
                data: {
                    json: "1",
                    nr: "1",
                    tt: "on",
                    q: decodeURIComponent(query)
                },
                dataType: "json",
                success: function (response) {
                    if (Object.keys(response).length === 0) {
                        return;
                    }
                    createOmdbInformationFrom(createImbdInformationFrom(response));
                },
                error: function (e) {
                    console2.error("imdb error");
                    console2.error(e);
                }
            });
        }

        function createImbdInformationFrom(imdbResponse) {
            return Object.keys(imdbResponse).map((k)=>imdbResponse[k]).reduce((p, c)=> {
                p.push(...c);
                return p;
            }, []);
        }

        function createOmdbInformationFrom(imdbResult) {

            var maxRequestedImdb = 10;
            var imdbResultPartial = imdbResult.slice(0, imdbResult.length > maxRequestedImdb ? maxRequestedImdb : imdbResult.length);

            Promise.all(imdbResultPartial.map((rawImdb)=>
                new Promise(resolve=>
                    $.ajax({
                        url: 'http://www.omdbapi.com/',
                        type: 'GET',
                        data: {
                            i: rawImdb.id
                        },
                        dataType: "json",
                        success: function (data) {
                            if (data.Poster == 'N/A') {
                                data.Poster = '../icons/posterError.png';
                            }
                            data.valueField = JSON.stringify(data);
                            resolve(data);
                        },
                        error: function (e) {
                            console2.error("omdb error");
                            console2.error(e);
                            resolve({});
                        }
                    })
                )
            )).then((values) => SERVICE_CHANNEL.publish({
                    topic: SERVICE_CONST.PUB.SEARCH_RESULT,
                    data: values
                })
            );
        }
    });

//instant service does not correct initialize messageBus (in testfiles)
if (typeof exports === 'undefined' && typeof srtPlayer.MovieService === 'function') {
    srtPlayer.MovieService = srtPlayer.MovieService($);
}