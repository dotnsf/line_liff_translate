//. app.js

var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    ejs = require( 'ejs' ),
    app = express();
//var ltv3 = require( 'watson-developer-cloud/language-translator/v3' );
var ltv3 = require( 'ibm-watson/language-translator/v3' );
var { IamAuthenticator } = require( 'ibm-watson/auth' );

var settings = require( './settings' );

app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.use( bodyParser.urlencoded( { extended: true }) );  //. body-parser deprecated undefined extended
app.use( bodyParser.json() );

app.set( 'views', __dirname + '/public' );
app.set( 'view engine', 'ejs' );

app.get( '/', function( req, res ){
  res.render( 'index', { liff_id: settings.liff_id } );
});

var lt = null;
if( settings.lt_apikey ){
  /*
  var url = ( settings.lt_url ? settings.lt_url : 'https://gateway.watsonplatform.net/language-translator/api/' );
  lt = new ltv3({
    iam_apikey: settings.lt_apikey,
    version: '2018-05-01',
    url: url
  });
  */
 lt = new ltv3({
   authenticator: new IamAuthenticator( { apikey: settings.lt_apikey } ),
    version: '2018-05-01'
 });
 lt.setServiceUrl( settings.lt_url );
}

app.get( '/languages', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  lt.listIdentifiableLanguages( {}, function( err, languages ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: err } ) );
      res.end();
    }else{
      if( languages && languages.result && languages.result.languages ){
        //. languages.result.languages = [ { "language: "af", "name": "Afrikaaans" }, { .... } ]
        res.write( JSON.stringify( { status: true, languages: languages.result.languages } ) );
        res.end();
      }else{
        res.write( JSON.stringify( { status: true, languages: [] } ) );
        res.end();
      }
    }
  });
});

app.post( '/identify', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var text = req.body.text;

  if( text ){
    lt.identify( { text: text }, function( err, languages ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, error: err } ) );
        res.end();
      }else{
        //. languages = [ { "language: "en", "confidence": 0.9962 }, { .... } ]
        res.write( JSON.stringify( { status: true, languages: languages } ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'parameter text not found.' } ) );
    res.end();
  }
});

app.post( '/translate', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var text = req.body.text;
  var source = req.body.source;
  var target = req.body.target;

  if( text ){
    if( source == 'en' || target == 'en' ){
      var data = { text: text, source: source, target: target };
      lt.translate( data, function( err, translations ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, error: err } ) );
          res.end();
        }else{
          if( translations && translations.result && translations.result.translations ){
            res.write( JSON.stringify( { status: true, translations: translations.result.translations } ) );
            res.end();
          }else{
            res.write( JSON.stringify( { status: true, translations: [] } ) );
            res.end();
          }
        }
      });
    }else{
      var data1 = { text: text, source: source, target: 'en' };
      lt.translate( data1, function( err, translations1 ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, error: err } ) );
          res.end();
        }else{
          if( translations1 && translations1.result && translations1.result.translations && translations1.result.translations.length > 0 ){
            var data2 = { text: translations1.result.translations[0].translation, source: 'en', target: target };
            lt.translate( data2, function( err, translations2 ){
              if( err ){
                res.status( 400 );
                res.write( JSON.stringify( { status: false, error: err } ) );
                res.end();
              }else{
                if( translations2 && translations2.result && translations2.result.translations ){
                  res.write( JSON.stringify( { status: true, translations: translations2.result.translations } ) );
                  res.end();
                }else{
                  res.write( JSON.stringify( { status: true, translations: [] } ) );
                  res.end();
                }
              }
            });
          }else{
            res.write( JSON.stringify( { status: true, translations: [] } ) );
            res.end();
          }
        }
      });
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'parameter text not found.' } ) );
    res.end();
  }
});


var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server stating on " + port + " ..." );
