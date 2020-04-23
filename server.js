/**
 * Created by serkankocaman on 24.06.2017.
 */
const twit = require('node-twitter-api');
const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
const express = require('express');
const CryptoJS = require('crypto-js');
const url = require('url');
const vision = require('@google-cloud/vision')();
const async = require('async');
const timeout = require('connect-timeout');
const path = require('path');
const phantom = require('phantom');
const qs = require('querystring');
const app = express();
const arr = [];
let p;
let session_secret = '';
let session_key = '';

class periscope {
    constructor() {
        let self = this;
        self.login = false;
        self.liste = [];
        self.durum = 0;
        self.twitterConsumerKey = 'XXXXXXX';
        self.twitterConsumerSecret = 'XXXXXXXXXX';
        self.index = arr.push(self);
        self.t = new twit({
            consumerKey: self.twitterConsumerKey,
            consumerSecret: self.twitterConsumerSecret,
            callback: 'twittersdk://openperiscope/index.html?id=' + self.index
        });
    }

    verify() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.t.verifyCredentials(self.twitterOAccessToken, self.twitterOAccessSecret, {}, function(error, data, response) {
                resolve();
            });
         });
    }

    getAccessToken() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.t.getAccessToken(self.twitterOAuthToken, self.twitterRequestSecret, self.twitterOAuthVerifier, function (err, accessToken, accessSecret) {
                if (err) {
                    reject(err);
                } else {
                    self.twitterOAccessToken = accessToken;
                    self.twitterOAccessSecret = accessSecret;
                    resolve();
                }
            });
        });
    }

    twitterrequest() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.t.getRequestToken(function(error, requestToken, requestTokenSecret, results){
                if (error) {
                    console.log("Error getting OAuth request token.");
                    console.log(error);
                    reject();
                } else {
                    self.twitterRequestToken = requestToken;
                    self.twitterRequestSecret = requestTokenSecret;
                    resolve();
                }
            });
        });
    }

    periscopelogin() {
        let self = this;
        return new Promise((resolve, reject) => {
            if (self.login) {
                resolve();
            } else {
                let giden = {
                    'session_secret': self.twitterOAccessSecret,
                    'user_id': 'XXXXXX',
                    'phone_number': '',
                    'bundle_id': 'com.bountylabs.periscope',
                    'session_key': self.twitterOAccessToken,
                    'user_name': 'XXXXXX',
                    'vendor_id': 'XXXXXXXXXXXXX'
                };
                let options = {
                    host: 'api.periscope.tv',
                    path: '/api/v2/loginTwitter',
                    headers: {
                        'Content-Length': Buffer.byteLength(JSON.stringify(giden)),
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept-Language': 'en-GB;q=1, en;q=0.9, fr;q=0.8, de;q',
                        'Connection': 'keep-alive',
                        'User-Agent': 'Periscope/3313 (iPhone; iOS 7.1.1; Scale/2.00)'
                    },
                    method: 'POST'
                };
                let req = http.request(options, (res) => {
                    let chunk = '';
                    res.on('data', (data) => {
                        chunk += data;
                    });
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            self.login = true;
                            self.periscopeLogin = JSON.parse(chunk);
                            resolve();
                        } else reject();
                    });
                });
                req.write(JSON.stringify(giden));
                req.end();
            }
        });
    }

    rankedBroadcastFeed() {
        let self = this;
        return new Promise((resolve, reject) => {
            let giden = {
                cookie: self.periscopeLogin.cookie,
                languages: ['en', 'ru', 'tr']
            };
            let options = {
                host: 'api.periscope.tv',
                path: '/api/v2/rankedBroadcastFeed',
                headers: {
                    'Content-Length': Buffer.byteLength(JSON.stringify(giden)),
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept-Language': 'en-GB;q=1, en;q=0.9, fr;q=0.8, de;q',
                    'Connection': 'keep-alive',
                    'User-Agent': 'Periscope/3313 (iPhone; iOS 7.1.1; Scale/2.00)'
                },
                method: 'POST'
            };
            let req = http.request(options, (res) => {
                let chunk = '';
                res.on('data', (data) => {
                    chunk += data;
                });
                res.on('end', () => {
                    resolve(JSON.parse(chunk));
                });
            });
            req.write(JSON.stringify(giden));
            req.end();
        });
    }

    getBroadcastShareUrl(id) {
        let self = this;
        return new Promise((resolve, reject) => {
            let giden = {
                cookie: self.periscopeLogin.cookie,
                broadcast_id: id
            };
            let options = {
                host: 'api.periscope.tv',
                path: '/api/v2/getBroadcastShareURL',
                headers: {
                    'Content-Length': Buffer.byteLength(JSON.stringify(giden)),
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept-Language': 'en-GB;q=1, en;q=0.9, fr;q=0.8, de;q',
                    'Connection': 'keep-alive',
                    'User-Agent': 'Periscope/3313 (iPhone; iOS 7.1.1; Scale/2.00)'
                },
                method: 'POST'
            };
            let req = http.request(options, (res) => {
                let chunk = '';
                res.on('data', (data) => {
                    chunk += data;
                });
                res.on('end', () => {
                    resolve(JSON.parse(chunk));
                });
            });
            req.write(JSON.stringify(giden));
            req.end();
        });
    }

    accessChannel(id) {
        let self = this;
        return new Promise((resolve, reject) => {
            let giden = {
                cookie: self.periscopeLogin.cookie,
                broadcast_id: id
            };
            let options = {
                host: 'api.periscope.tv',
                path: '/api/v2/accessChannel',
                headers: {
                    'Content-Length': Buffer.byteLength(JSON.stringify(giden)),
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept-Language': 'en-GB;q=1, en;q=0.9, fr;q=0.8, de;q',
                    'Connection': 'keep-alive',
                    'User-Agent': 'Periscope/3313 (iPhone; iOS 7.1.1; Scale/2.00)'
                },
                method: 'POST'
            };
            let req = http.request(options, (res) => {
                let chunk = '';
                res.on('data', (data) => {
                    chunk += data;
                });
                res.on('end', () => {
                    resolve(JSON.parse(chunk));
                });
            });
            req.write(JSON.stringify(giden));
            req.end();
        });
    }

    arastir(degerler) {
        let self = this;
        let yedek = [];
        let sayi = 1;
        return new Promise((resolve, reject) => {
            async.eachSeries(degerler, (itm, bitti) => {
                let img = itm.image_url;
                console.log(sayi + ' değerlendiriliyor...');
                vision.detectLabels(img, {verbose: false}, function(err, detection, apiResponse) {
                     yedek.push({
                         detection: detection,
                         itm: itm
                     });
                     sayi++;
                     /*
                     if (sayi > 10) {
                         self.liste = yedek;
                         resolve();
                     } else */
                     bitti();
                });
            }, () => {
                self.liste = yedek;
                resolve();
            });
        });
    }

    sayfaAc() {
       let self = this;
       let js = 'function() { '+
             '   document.getElementById(\'username_or_email\').value = \'xxxxxx\';' +
             '   document.getElementById(\'password\').value = \'xxxxxxxx\';' +
             '   var form = document.getElementById(\'oauth_form\'); ' +
             '   form.submit(); ' +
             '   return true; ' +
            ' }';
        let _ph, _page;
        let outObj;
        let basladi = false;
        phantom.create()
            .then(ph => {
                console.log('Phantom instance oluşturuldu.');
                _ph = ph;
                outObj = _ph.createOutObject();
                outObj.urls = '';
                return _ph.createPage();
            })
            .then(page => {
                console.log('Sayfa oluşturuldu.');
                _page = page;
                _page.property('onResourceRequested', function(requestData, networkRequest, out) {
                    out.urls = requestData.url;
                }, outObj);
                _page.on('onLoadFinished', function() {
                    outObj.property('urls').then(function(urls){
                        if (urls.indexOf('twittersdk') > -1 && basladi === false) {
                            basladi = true;
                            _page.close();
                            let u = url.parse(urls);
                            let params = qs.parse(u.search);
                            self.twitterOAuthToken = params.oauth_token;
                            self.twitterOAuthVerifier = params.oauth_verifier;
                            p.getAccessToken()
                                .then(() => {
                                    p.periscopelogin()
                                        .then(() => {
                                            console.log('Periscope login işlemi bitti.');
                                            kontrol();
                                            _ph.exit();
                                        });
                                });
                        }
                    });
                    console.log('Sayfa yüklendi...');
                });
                return _page.open('https://api.twitter.com/oauth/authenticate?oauth_token=' + p.twitterRequestToken);
            })
            .then(status => {
                console.log('Sayfa açıldı:' + status);
                    _page.evaluateJavaScript(js)
                        .then(html => {
                            console.log('Javascript çalıştırıldı; HTML;');
                        });
            })
            .catch(err => console.log(err));
    }

}

/*
function Api(method, params, callback, callback_fail) {
    if (!params)
        params = {};
    var req = GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://api.periscope.tv/api/v2/' + method,
        headers: {
            'User-Agent': 'Periscope/2699 (iPhone; iOS 8.1.2; Scale/2.00)'
        },
        data: JSON.stringify(params),
        onload: function (r) {
            var response;
            if (r.status === 200) {
                try {
                    response = JSON.parse(r.responseText);
                } catch (e) {
                    console.warn('JSON parse error:', e);
                }
                if (!!response && callback)
                    callback(response);
            } else if (r.status == 406) {
                alert(JSON.parse(r.responseText).errors[0].error);
            } else {
                response = 'API error: ' + r.status + ' ' + r.responseText;
                if (callback_fail && Object.prototype.toString.call(callback_fail) === '[object Function]')
                    callback_fail(response);
            }
            console.log('Method:', method, 'params:', params, 'response:', response);
        }
    });
}
*/

app.get('/redirect', (req, res) => {
    /* OAuthTwitter('access_token', function (oauth) {
        console.log(oauth);
        session_key = oauth.oauth_token;
        session_secret = oauth.oauth_token_secret;
        Api('loginTwitter', {
            "session_key": session_key,
            "session_secret": session_secret
        }, function (response) {
            console.log(response);
        });
    }, {oauth_token: req.query.oauth_token, oauth_verifier: req.query.oauth_verifier}); */

    let p = arr[req.query.id - 1];
    p.twitterOAuthToken = req.query.oauth_token;
    p.twitterOAuthVerifier = req.query.oauth_verifier;
    p.getAccessToken()
        .then(() => {
            p.periscopelogin()
                .then(() => {
                    console.log('Periscope login işlemi bitti.');
                    res.sendFile(path.join(__dirname + '/arama.html'));
                    /*
                    p.rankedBroadcastFeed()
                        .then(sonuc => {
                            console.log(sonuc.length + ' sonuç değerlendiriliyor...');
                            p.arastir(sonuc)
                                .then(h => {
                                    console.log('Değerlendirme tamamlandı.');
                                    res.header("Content-Type",'text/html');
                                    res.send(h);
                                });
                        });
                        */
                });
        })
        .catch((err) => {
            res.send('Hata oluştu');
        });
});

app.get('/', function(req, res) {
    res.sendfile('./arama.html');
});

app.get('/ara', function(req, res) {
    let aranacak = req.query.aranacak;
    aranacak = aranacak.split(',');
    let donus = [];
    async.eachSeries(p.liste, (itm, bitti) => {
       async.eachSeries(aranacak, (itm2, bitti2) => {
           if (itm.detection !== undefined) {
               if (itm.detection.indexOf(itm2) > -1) {
                   p.accessChannel(itm.itm.id)
                       .then(res => {
                           donus.push({
                               d: itm.detection,
                               i: itm.itm.image_url_small,
                               u: res.hls_url
                           });
                           bitti();
                       })
                       .catch(err => {
                           console.log('getBroadcastShareURL:' + err.message);
                           bitti();
                       });
               } else bitti2();
           } else bitti2();
       }, () => {
           bitti();
       });
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(donus));
    });
});

app.use(timeout(120000));
app.use(haltOnTimedout);

function haltOnTimedout (req, res, next) {
    if (!req.timedout) next()
}

p = new periscope();
p.twitterrequest()
    .then(() => {
        console.log('Sayfa açılıyor...');
        p.sayfaAc();
    });

function kontrol() {
    if (p.durum === 0) {
        p.durum = 1;
        p.rankedBroadcastFeed()
            .then(sonuc => {
                console.log(sonuc.length + ' sonuç değerlendiriliyor...');
                p.arastir(sonuc)
                    .then(h => {
                        p.durum = 0;
                        console.log('Değerlendirme tamamlandı.');
                    });
            });
    }
}

setInterval(() => {
    kontrol();
}, 300000);

const server = app.listen(80, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(`Example app listening at http://${host}:${port}`);
});
