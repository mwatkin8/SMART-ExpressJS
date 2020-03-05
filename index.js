let express = require('express');
let path = require('path');
let fetch = require('node-fetch')
let app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//Allow access to front-end static files
app.use(express.static(path.join(__dirname, '/public/')));

//-------SMART launch params---------
let client = "PUT-CLIENT-ID-HERE"; //Given by sandbox when registering
let server,launch,redirect,authUri,tokenUri;

app.get('/smart-launch', async (request, response) => {
    //URL for the secure data endpoint
    server = request.query.iss;
    //Launch context parameter
    launch = request.query.launch;
    //Permission to launch and read/write all resources for the launch patient
    let scope = ["patient/*.*","launch"].join(" ");
    //Random session key
    let state = Math.round(Math.random()*100000000).toString();
    //Set redirect to the app landing page - CHANGE TO DYNAMICALLY DETECT PROTOCOL IF NOT USING LOCALHOST
    redirect = 'http://' + request.headers.host + '/'
    // Get the conformance statement and extract URL for auth server and token
    let req = await fetch(server + "/metadata");
    let r = await req.json();
    let smartExtension = r.rest[0].security.extension.filter(function (e) {
        return (e.url === "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris");
    });
    smartExtension[0].extension.forEach(function(arg, index, array){
        if (arg.url === "authorize") {
            authUri = arg.valueUri;
        } else if (arg.url === "token") {
            tokenUri = arg.valueUri;
        }
    });
    //Redirect to the authorization server and request launch
    response.redirect( authUri + "?" +
        "response_type=code&" +
        "client_id=" + encodeURIComponent(client) + "&" +
        "scope=" + encodeURIComponent(scope) + "&" +
        "redirect_uri=" + encodeURIComponent(redirect) + "&" +
        "aud=" + encodeURIComponent(server) + "&" +
        "launch=" + launch + "&" +
        "state=" + state )
});

let token,patient;
app.get('/', async (request, response) => {
    //Fetch the patient access token
    let code = request.query.code;
    let r = await fetch(tokenUri, {
        method:'POST',
        body: 'grant_type=authorization_code&client_id=' + client + '&redirect_uri=' + redirect + '&code=' + code,
        headers: {
		    'Content-Type': 'application/x-www-form-urlencoded'
	    }
    });
    let res = await r.json();
    token = res.access_token;
    patient = res.patient;
    let dem = await demographics()
    response.render('index',{name:dem[0],gender:dem[1],age:dem[2],test_var:'this is a test'});
});

async function getResource(url){
    let response = await fetch(url, {
        method: 'get',
        headers: {'Authorization': 'Bearer ' + token}
    });
    return await response.json();
}

async function demographics(){
    let url = server + '/Patient?_id=' + patient;
    let bundle = await getResource(url);
    let p = bundle.entry[0].resource;
    let name = p.name[0].given[0] + ' ' + p.name[0].family + ' ';
    let today = new Date();
    let age = today.getFullYear() - parseInt(p.birthDate.split('-')[0]);
    let gender = p.gender
    return [name,gender,age];
}

// Here is where we define the port for the localhost server to setup
app.listen(8080);
