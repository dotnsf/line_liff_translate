//. app.js

var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cfenv = require( 'cfenv' ),
    app = express();
var ltv3 = require( 'watson-developer-cloud/language-translator/v3' );

var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();


app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.use( bodyParser.urlencoded( { extended: true }) );  //. body-parser deprecated undefined extended
app.use( bodyParser.json() );

var lt = null;
if( settings.lt_apikey ){
  var url = ( settings.lt_url ? settings.lt_url : 'https://gateway.watsonplatform.net/language-translator/api/' );
  lt = new ltv3({
    iam_apikey: settings.lt_apikey,
    version: '2018-05-01',
    url: url
  });
}

app.get( '/languages', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  lt.listIdentifiableLanguages( {}, function( err, languages ){
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: err } ) );
      res.end();
    }else{
      if( languages && languages.languages ){
        //. languages.languages = [ { "language: "af", "name": "Afrikaaans" }, { .... } ]
        res.write( JSON.stringify( { status: true, languages: languages.languages } ) );
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
          if( translations && translations.translations ){
            res.write( JSON.stringify( { status: true, translations: translations.translations } ) );
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
          if( translations1 && translations1.translations && translations1.translations.length > 0 ){
            var data2 = { text: translations1.translations[0].translation, source: 'en', target: target };
            lt.translate( data2, function( err, translations2 ){
              if( err ){
                res.status( 400 );
                res.write( JSON.stringify( { status: false, error: err } ) );
                res.end();
              }else{
                if( translations2 && translations2.translations ){
                  res.write( JSON.stringify( { status: true, translations: translations2.translations } ) );
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


app.listen( appEnv.port );
console.log( "server stating on " + appEnv.port + " ..." );
