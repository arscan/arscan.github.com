---
layout: post
title: Birthday Web Apps
---
This month I've had some fun making little web applications to celebrate the birthdays of friends and family. I think I'm going to make a habit of doing this -- I'm always looking for an excuse to play around with jQuery, and people seem to get a kick out of them. Click on the images to check them out.

###Lisa's Quest
As kids, my sister and I spent countless hours playing [kings quest](http://en.wikipedia.org/wiki/King's_Quest).  I thought it would be fun to recreate the first scene from KQI to send [a unique birthday message](/lisasquest/).
[![Lisa's Quest](/blog/images/birthday_lisa_small.png "Lisa's Quest") ](/lisasquest/ "Lisa's Quest")

All graphics were grabbed from the game manually, and the everything is rendered as DOM ndoes.  [Sprites](/lisasquest/prince_final.png) were used for the parts that are animated.

###Like a Day for Simmy
I've got a friend that is notorious for "liking" just about everything that people post on facebook.  So to repay her generosity, I made a page that gives her a [thumbs up for every day that she's been alive](/likeaday/).

[![Like A Day](/blog/images/birthday_simmy_small.png "A like a day!") ](/likeaday/ "Like A Day")

If you hover over any given "like" icon, it will show what day it represents.  Likes that fell on her birthdays are highlighted in red.  This turned out to be a pretty cool visualization of how many days any given 20-something year old has been alive (there really are LOTS of days).  

In retrospect, I should have rendered the little hands in a canves element instead of appending nodes to the DOM.  That way this page wouldn't eat up nearly as much memory.

###iBradley.com Post-it-notified

In an act of general silliness at my last job, some coworkers completely covered our marketing director's office in post it notes when he was away on a business trip.  On his birthday, I decided to recreate that event on a [copy of his personal website](/ibradley.com/).     


[![Bradley Notes](/blog/images/birthday_bradley_small.png "Bradley Post-its") ](/ibradley.com/ "iBradley.com post-its")

His website seemed particlarly well suited for this kind of vandalism.

