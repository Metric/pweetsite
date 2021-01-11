Pweet Site / UI
=====================
This is the basic Pweet Site / UI code. Looking for feedback on what others would like to see as part of it. 

It is not finished yet.

Browser Requirements
=======================
* Must be ES6 compatible with async capabilities.
* Require Worker API (If hosted on a real server URL)
* Requires Window.crypto 

Basically, most modern browsers e.g. Chrome, Firefox, Safari, Edge, Opera, iOS Safari, and most default Android Browsers on Android 6+.

It will no longer use a worker if index.html is loaded from file://

Changes to Make it Work with Private Pweeter Nodes
==========================================
You will need to go into pweeter.js and in the initNodes() method, assign an array to this.nodes with your node urls. Otherwise, it will try and pull from the peers.json list on the Pweeter repo from github.

Looking for the Pweet Blockchain Node?
==============================
Go here: https://github.com/Metric/pweet

Looking for the Readapt Library?
=================================
Go here: https://github.com/Metric/readapt

Looking for the latest version of Cuckoo-Cycle 32bit JS Library?
======================================
Go here: https://github.com/Metric/cuckoo-cycle