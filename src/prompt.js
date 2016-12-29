var prompt = require('prompt');
 var colors = require("colors/safe");
 var fs = require('fs');
  //
  // Setting these properties customizes the prompt.
  //
  prompt.message = '';
  //prompt.delimiter = colors.green(":");

  var props = {
    properties: {
      name: {
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'Name must be only letters, spaces, or dashes',
        required: true
      },
      parts: {
        default: 3
      },
      sections: {
        default: 3
      }
    }
  };

  function buildSections(length) {
    var sections = {properties:{}};

    for (var i = 0; i < length;i++) {

      sections.properties['section' + (i+1)] = {
        properties: {
          beats: {
            default: 48
          }
        }
      };

    }

    return sections;
   
  }

  //
  // Start the prompt
  //
  prompt.start();

  var output = {};

  //
  // Get two properties from the user: username and email
  //
  prompt.get(props, function (err, result) {
    //
    // Log the results.
    //
  //  console.log('Command-line input received:');
  //  console.log('  username: ' + result.username);
  //  console.log('  email: ' + result.email);
  //  return result;
    Object.assign(output,result);

    prompt.get(buildSections(result.sections),function(err,result) {

      Object.assign(output,result);
      //console.log(JSON.stringify(output));
     // process.send(output);
      fs.writeFile('./tmp/config.js', JSON.stringify(output));
    });

   // process.stdout.write(JSON.stringify(result));

  });