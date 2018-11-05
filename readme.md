Pweet Site / UI
=====================
This is the basic Pweet Site / UI code. Looking for feedback on what others would like to see as part of it. 

It is not finished yet, as the initial sign in / registration, still needs some graphics etc. As that is pretty blank still.

Browser Requirements
=======================
* Must be ES6 compatible with async capabilities.
* Web workers are required
* Requires Window.crypto 

Basically, most modern browsers e.g. Chrome, Firefox, Safari, Edge, Opera, iOS Safari, and most default Android Browsers on Android 6+.

Changes to Make it Work with a Real Server
==========================================
You will need to go into pweeter.js and change any of the Request.get / Request.post to the specified Pweet Node URL. Right now they are set to http://127.0.0.1:8000/ in order to work on localhost in chrome / firefox.

Looking for the Pweet Blockchain Node?
==============================
Go here: https://github.com/Metric/pweet

Looking for the Readapt Library?
=================================
Go here: https://github.com/Metric/readapt

Looking for the latest version of Cuckoo-Cycle 32bit JS Library?
======================================
Go here: https://github.com/Metric/cuckoo-cycle