// spiffy sidebar updater
// https://github.com/chromakode/reddit-sidebar-updater
//
// Copyright (c) 2014 Max Goodman.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. The name of the author or contributors may not be used to endorse or
//    promote products derived from this software without specific prior
//    written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
// OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.

// your subreddit must have a wiki page titled "sidebar_template", which can be
// accessed by USERNAME (configured below). the template will be used as the
// base content for the sidebar, with {{SCHEDULE}} replaced with a tabular
// schedule from CALENDAR (configured below).

var CALENDAR = ''  // you must have subscribed to this calendar in Google Calendar
var SUBREDDIT = ''
var DAY_RANGE = 10  // how many days ahead to list events for
var SCHEDULE_TIME_ZONE = 'America/New_York'

var CLIENT_ID = ''  // your OAuth2 client ID
var CLIENT_SECRET = ''  // your OAuth2 client secret

// please create a user solely for this script and mod them with wiki permissions only.
var USERNAME = ''
var PASSWORD = ''

// the maximum sidebar length, set by reddit
var LENGTH_LIMIT = 5120

function updateSchedule() {
  // get an OAuth2 token
  var authData = UrlFetchApp.fetch('https://ssl.reddit.com/api/v1/access_token', {
    payload: {
      grant_type: 'password',
      scope: 'wikiread,wikiedit',
      username: USERNAME,
      password: PASSWORD
    },
    method: 'post',
    headers: {'Authorization': 'Basic ' + Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET)}
  })
  authData = JSON.parse(authData)
  var authToken = authData['access_token']

  // load the sidebar template from reddit's wiki
  var templateData = UrlFetchApp.fetch('https://oauth.reddit.com/r/' + SUBREDDIT + '/wiki/sidebar_template.json', {
    headers: {'Authorization': 'bearer ' + authToken}
  })
  templateData = JSON.parse(templateData)
  var template = templateData['data']['content_md']
  template = template
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')

  // read the calendar for events and build our schedule table
  var calendar = CalendarApp.getCalendarById(CALENDAR)
  var now = new Date()
  var dateStart = new Date(now)
  // look at events starting with the beginning of the current day
  dateStart.setHours(0, 0, 0, 0)
  var dateEnd = new Date(now.getTime() + (DAY_RANGE * 24 * 60 * 60 * 1000))
  var events = calendar.getEvents(dateStart, dateEnd)
  var sidebarTable = ''
  var sidebarLength = template.length - '{{SCHEDULE}}'.length
  for (var i = 0; i < events.length; i++) {
    var event = events[i]
    var eventDate = event.getStartTime()

    // these four fields form each table line
    var tableLine = [
      Utilities.formatDate(eventDate, SCHEDULE_TIME_ZONE, 'd MMM'),
      Utilities.formatDate(eventDate, SCHEDULE_TIME_ZONE, eventDate.getMinutes() != 0 ? 'h:mma' : 'ha').toLowerCase(),
      event.getTitle(),
      event.getDescription()
    ].join('|') + '\n'

    if (sidebarLength + tableLine.length > LENGTH_LIMIT) {
      break
    } else {
      sidebarTable += tableLine
      sidebarLength += tableLine.length
    }
  }

  // update the sidebar! :)
  var sidebar = template.replace('{{SCHEDULE}}', sidebarTable)
  UrlFetchApp.fetch('https://oauth.reddit.com/r/' + SUBREDDIT + '/api/wiki/edit', {
    payload: {
      content: sidebar,
      page: 'config/sidebar',
      reason: 'Automated Google Apps Script update @ ' + Utilities.formatDate(now, 'America/Los_Angeles', 'd MMM h:mma z')
    },
    method: 'post',
    headers: {'Authorization': 'bearer ' + authToken}
  })
}
