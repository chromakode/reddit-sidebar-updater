# spiffy sidebar updater

Hi, I'm a [Google Apps Script](http://www.google.com/script/start/) for
updating your subreddit's sidebar periodically. Currently, I only know how to
update a schedule from a Google Calendar, but you can teach me new tricks.


## details

Here's how it works:

The script signs into a configured mod account using OAuth2. It fetches a wiki
page in your subreddit called "sidebar_template". The configured Google
Calendar is then read: events between the start of today and a configurable
`DAY_RANGE` days ahead are added to a markdown table. If the sidebar grows past
reddit's limit, the script stops with however many lines will fit. Finally, the
wiki page "config/sidebar" (your subreddit sidebar) is updated by taking
"sidebar_template" and replacing the text `{{SCHEDULE}}` with the schedule
table.

To use it, you'll need:

 * a mod account with "wiki" permissions only
 * an OAuth2 app owned by your mod account
 * a wiki page called "sidebar_template" with your current sidebar (with
   `{{SCHEDULE}}` in place where you'd like it to be inserted)


## installation instructions

1. Create an [Apps Script](http://www.google.com/script/start/) with the
   contents of reddit-sidebar.gs.
2. Create a reddit account for the script and mod with with "wiki" permissions.
   Enter the username/password into your script.
3. Create an [OAuth2 app](https://ssl.reddit.com/prefs/apps/) for the script to
   authenticate with. Make sure to choose the "script" app type, which is
   necessary for the password OAuth2 flow this script uses. Enter the OAuth2
   app client id and client secret into the script.
4. Copy your existing sidebar into a wiki page called "sidebar_template",
   adding `{{SCHEDULE}}` where you wish for the schedule to be.

You can then give the script a test run by clicking "Run -> updateSchedule" in
the menu on Google Apps Script. Then check the sidebar edit history for your
subreddit (e.g. http://www.reddit.com/r/IAmA/wiki/revisions/config/sidebar) to
verify what the script changed.


## running periodically

Finally, if everything seems to be working properly, you can turn on periodic
runs. In the Google Apps Script page menu, click "Resources -> Current
project's triggers". Then choose to add a new trigger. You'll be presented with
a form that should default to hourly runs. I'd also recommend clicking the
"notifications" button and setting it up to email you immediately if the script
fails for some reason.


## tips

* Google Apps Script lets you configure the timezone the script treats dates
  with in File -> Project properties.

* If there's no change to the sidebar during a run, reddit won't add an entry
  to the wiki history.

* Google Apps Script has
  [quotas](https://developers.google.com/apps-script/guides/services/quotas)
  for various actions. Running the script hourly (or faster) should stay well
  clear of those limits, but please be conscientious of Google's and reddits
  servers and try to keep them in mind.
