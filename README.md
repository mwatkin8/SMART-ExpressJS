# SMART-ExpressJS
Boilerplate code which can be modified to create an ExpressJS SMART on FHIR app.

Adapted from this [tutorial](https://github.com/cerner/cds-services-tutorial/wiki) by Cerner.<br>
Architecture uses [Express](https://expressjs.com/).<br>
Templating done via [EJS](https://ejs.co/).<br>
Front-end display uses Bootstrap's [Dashboard](https://getbootstrap.com/docs/4.0/examples/) example (v4.0).

## 1. Install Docker
This example uses Docker, the links below can help you get Docker installed.
* Mac users: https://www.docker.com/products/docker-desktop
    * Follow installer
* Windows users: https://github.com/docker/toolbox/releases
    * Download latest .exe file
    * Follow installer

## 2. Create a SMART on FHIR sandbox
This app was developed using an [HSPC Logica Sandbox](https://sandbox.logicahealth.org/) as the launch environment.<br>
Create an account and then create a new sandbox making sure that you use FHIR version R4, allow an open FHIR endpoint, and import sample patients, practitioners, and applications.

![newsandbox](readme_imgs/newsandbox.png)

### Register this app with your sandbox

Select the "Apps" option on the sidebar and press the button to add an app.

![apps](readme_imgs/apps.png)

Select the option to "Manually" create the app

![manually](readme_imgs/manually.png)

On the details page, give the app a name and ensure that the "Public Client" option is selected. Enter the following parameters as shown below:

App Launch URI: <code>http://localhost:8080/smart-launch</code><br>
App Redirect URI: <code>http://localhost:8080/</code><br>
Scopes: <code>launch patient/\*.\*</code>

<u><b>IMPORTANT</b></u> - if you are a Windows user and installed Docker Toolbox, your app won't be deployed on localhost but on a default IP address. The standard IP used by Docker Toolbox is <code>192.168.99.100</code> but yours could be different. Check the top of the terminal window (by the whale) for your Docker machine IP. Use the same URIs as above but replace "localhost" with your IP.

![params](readme_imgs/params.png)

After saving, you will be given a client ID.

![clientid](readme_imgs/clientid.png)

Copy this ID and open the file <i>index.js</i>.

At the top of this file you will see: <br><code>let client = "REPLACE-WITH-CLIENT-ID-FROM-SANDBOX"</code><br>
Paste the ID there so that it looks something like this (but with your ID):<br>
<code>let client = "420c747a-e456-4487-808e-5de56c1be831"</code><br> Save the file

## 3. Start the app server
Open the terminal app (Mac) or the Docker terminal (Windows), go to the home directory of this project.

Launch the server with the command <code>docker-compose -p <i>projectName</i> up --build &</code>

* View server output: <code>docker logs <i>projectName</i>\_app_1</code>
* Stop server: <code>docker stop <i>projectName</i>\_app_1</code>
* Start server again: <code>docker start <i>projectName</i>\_app_1</code>
* To wipe a previous build if you want to start over:
    * <code>docker stop <i>projectName</i>\_app_1</code>
    * <code>docker rm <i>projectName</i>\_app_1</code>
    * <code>docker rmi <i>projectName</i>\_app</code>
    * <code>docker volume prune</code>


## 4. Perform a SMART launch
From the sandbox, launch your app and select a patient. The type of SMART launch we defined when registering our app depends on a patient (learn more about scopes [here](http://www.hl7.org/fhir/smart-app-launch/scopes-and-launch-context/index.html)). You'll see that the app redirects to the HSPC authorization server where you are prompted to authorize the app. Once authorized, you are taken to the app where this example demonstrates how to use the auth token to query the Patient resource and how to parse out the patient name, gender, and age.

![dashboard](readme_imgs/dashboard.png)
