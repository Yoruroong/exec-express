var express = require('express')
var app = express()
var config = require('./config')
const DiscordOauth2 = require("discord-oauth2")
var session = require('express-session');
const child = require("child_process")
var Base64 = {
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode : function (input) {
      var output = ""
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4
      var i = 0

      input = Base64._utf8_encode(input)

      while (i < input.length) {

          chr1 = input.charCodeAt(i++)
          chr2 = input.charCodeAt(i++)
          chr3 = input.charCodeAt(i++)

          enc1 = chr1 >> 2
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
          enc4 = chr3 & 63

          if (isNaN(chr2)) {
              enc3 = enc4 = 64
          } else if (isNaN(chr3)) {
              enc4 = 64
          }

          output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4)

      }

      return output
  },
  _utf8_encode : function (string) {
      string = string.replace(/\r\n/g,"\n")
      var utftext = ""

      for (var n = 0; n < string.length; n++) {

          var c = string.charCodeAt(n)

          if (c < 128) {
              utftext += String.fromCharCode(c)
          }
          else if((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192)
              utftext += String.fromCharCode((c & 63) | 128)
          }
          else {
              utftext += String.fromCharCode((c >> 12) | 224)
              utftext += String.fromCharCode(((c >> 6) & 63) | 128)
              utftext += String.fromCharCode((c & 63) | 128)
          }
      }
      return utftext
  }
}

/*app.all('*', (req, res, next) => 
{ 
  let protocol = req.headers['x-forwarded-proto'] || req.protocol; 
  if (protocol == 'https') 
  { 
    next()
  } else {
    let from = `${protocol}://${req.hostname}${req.url}`;
    let to = `https://'${req.hostname}${req.url}`
    // log and redirect 
    console.log(`[${req.method}]: ${from} -> ${to}`)
    res.redirect(to); 
  } 
})*/

app.use(session({
  secret: 'parkbot',
  resave: false,
  saveUninitialized: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.set('views', __dirname + '/views')

app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res){
  if(req.query.code){
    const oauth = new DiscordOauth2({
      clientSecret: config.clientSecret,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      credentials: Base64.encode(`${config.clientId}:${config.clientSecret}`)
    })
    oauth.tokenRequest({
      code: req.query.code,
      scope: "identify email",
      grantType: "authorization_code",
    }).then(asdf=>{
      oauth.getUser(asdf.access_token).then(userdata =>{
        console.log(userdata)
        if(userdata.email == "tuntun4132@naver.com" || userdata.email == "kkomanse1004@gmail.com"){
            req.session.logined = true
            req.session.user_id = req.body.id
            res.send('<script>location.href="/manager"</script>')
            console.log(req.session.logined)
        } else {
          res.send("X")
        }
      })
    })
  } else{
    res.send(`<script>location.href="https://discord.com/oauth2/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=identify%20email"</script>`)
  }
})

app.get('/:id', function (req, res){
  if(req.session.logined==true){
    if(req.query.command){
      try{
        const htmlfilecode = `<!DOCTYPE HTML><html><head><title>Manager</title><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" /><link rel="stylesheet" href="/assets/css/main.css" /><noscript><link rel="stylesheet" href="/assets/css/noscript.css" /></noscript></head><body class="is-preload"><div id="wrapper"><header id="header"><div class="logo"><span class="icon fa-gem"></span></div><div class="content"><div class="inner"><h1>Manager</h1><p>${child.execSync(req.query.command)}</p></div><nav><ul><li><a href="?command=pm2 restart parkbot">parkbot</a></li><li><a href="?command=pm2 restart manager">Manager</a></li></ul></nav></header><div id="main"><article id="intro"><h2 class="major">Intro</h2><span class="image main"><img src="/images/pic01.jpg" alt="" /></span><p></p></article></div><footer id="footer"></footer></div><div id="bg"></div><script src="/assets/js/jquery.min.js"></script><script src="/assets/js/browser.min.js"></script><script src="/assets/js/breakpoints.min.js"></script><script src="/assets/js/util.js"></script><script src="/assets/js/main.js"></script></body></html>`
        res.send(htmlfilecode)
      } catch(e) {
        res.send(`<h2>${e}</h2><br /><a href="/manager">BACK</a>`)
      }
    }
    const exec1 = child.execSync("pm2 ls")
    const execResult = String(exec1).split("\\").join("")
    const htmlfilecode = `<!DOCTYPE HTML><html><head><title>Manager</title><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" /><link rel="stylesheet" href="/assets/css/main.css" /><noscript><link rel="stylesheet" href="/assets/css/noscript.css" /></noscript></head><body class="is-preload"><div id="wrapper"><header id="header"><div class="logo"><span class="icon fa-gem"></span></div><div class="content"><div class="inner"><h1>Manager</h1><p>${execResult}</p></div><nav><ul><li><a href="?command=pm2 restart parkbot">parkbot</a></li><li><a href="?command=pm2 restart manager">Manager</a></li></ul></nav></header><div id="main"><article id="intro"><h2 class="major">Intro</h2><span class="image main"><img src="/images/pic01.jpg" alt="" /></span><p></p></article></div><footer id="footer"></footer></div><div id="bg"></div><script src="/assets/js/jquery.min.js"></script><script src="/assets/js/browser.min.js"></script><script src="/assets/js/breakpoints.min.js"></script><script src="/assets/js/util.js"></script><script src="/assets/js/main.js"></script></body></html>`
    res.send(htmlfilecode)
  } else{
    res.send(`<script>location.href="/"</script>`)
  }
})

app.get('/logout', function (req, res){
  req.session.logined = false
  res.send("success")
})

app.use(function(req, res, next) {
  res.status(404).send("404")
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log(ip)
})

app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send("500")
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log(ip)
})

app.listen(3000, '0.0.0.0', function () {
  console.log("You can test here: " + `https://discord.com/oauth2/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=identify%20email`)
})