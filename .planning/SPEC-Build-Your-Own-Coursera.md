===== PAGE 1 =====
FREE GUIDE
Build Your OwnCoursera
Coursera charges forty thousand dollars for an online degree. This is the
seven-step build that turns everything you already save — YouTube videos,
articles, links you text yourself — into your own study guides, briefing docs
and quizzes, sorted by subject, generated overnight while you sleep.
You save a link
→
It lands in one table
→
An agent reads it
→
Course material
appears
→
You get told
HOW TO USE THIS GUIDE
Work top to bottom. Setup is the next four pages — you make one table, connect one agent and open four ways to save things. Then steps 1 to 7 each
give you one prompt. Copy it, paste it into your agent, watch it build the skill, move on. Nothing here needs code. Where a tool has real alternatives you get
the full menu with real prices, and you pick on budget — every single function in this build has a free option.
TIME
About 90 minutes to set up, once.
COST
Runs on free tiers end to end, except the agent.
SKILL
Copy and paste. No code, no terminal beyond
three commands.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 2 =====
Setup 1. Make the one table everything lands inThis is the only thing in the build you make by hand. Everything else fills it in for you.
PICK WHERE YOUR LIBRARY LIVES
All six take a plain web request, so any of your inboxes can write to them, and all six let an AI agent read and write rows. Baserow is the pick if you want the
longest free runway with zero setup friction.
BaserowFREE TO 3,000 ROWS
Native MCP built in. Token from the UI. 23 months at 30 saves a week.
AirtableFREE 1,000 ROWS
One-click connector in Claude. Free plan also caps you at 1,000 API calls a
month.
SupabaseFREE 500 MB
Real Postgres, so full transcripts fit. Free projects pause after a week idle.
NotionFREE, UNLIMITED
Official MCP. Text fields cap at 2,000 characters, so transcripts go in the page
body.
NeonFREE 0.5 GB, NO CARD
Serverless Postgres. No text limits. Weakest click-to-build story.
NocoDBFREE 1,000 ROWS
OAuth connector for Claude. 1,000 API calls a month runs out fast.
CREATE A TABLE CALLED LIBRARY WITH THESE 12 FIELDS
url URL the link you saved
source Single select youtube / browser / telegram / sms
title Text filled in by step 3
author Text channel name or byline
transcript Long text the full text, filled in by step 3
topic Text the subject, filled in by step 4
status Single select new / fetched / sorted / done / failed
notebook_id Text filled in by step 5
added Date when you saved it
built Date when the material was made
note Long text anything you typed when you saved it
error Long text why something failed, written by the agent
YOUR TRACKER
That table is your library — think of it as a mini-CRM for everything you are learning. You never type in it. Your agent adds every row and updates every
field itself. Open it in Baserow any time to see what is queued, what is done, and what broke.
The status ladder, in order:new → fetched → sorted → done. A row starts at new the moment you save something. Step 3 reads it and sets 
fetched. Step 4 files it under a subject and sets sorted. Step 5 builds the material and sets done. Anything that breaks goes to failed with the reason
in the error field, so it never silently blocks the queue.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 3 =====
Setup 2. Pick your agent, then connect three thingsYour agent needs four things for this build: reusable named skills, a daily schedule, custom connectors, and the ability to run a command on
your own computer.
PICK YOUR AGENT
Run this from a desktop app, not a browser tab. Step 5 uses a command line tool that needs your own machine, so a cloud-only agent cannot finish the loop.
Claude Cowork$17/MO ANNUAL, $20 MONTHLY
Named skills, /schedule, custom connectors. Not on the free plan.
ChatGPT WorkFREE ON DESKTOP, $20/MO PLUS
Only one with a browser built in. Custom MCP needs Plus and Developer Mode.
Perplexity
Computer$20/MO PRO
Cloud browser that genuinely runs while you sleep. Custom MCP unconfirmed.
n8nFREE SELF-HOSTED, FROM EUR20/MO
Best scheduler here. No skills and no browser, so it is a partial fit.
Gumloop$37/MO, NO FREE PLAN
Plain-English triggers, no cron syntax. 14-day trial, card required.
ObsidianFREE
Not an agent. Listed because its MCP makes a fine destination if you skip step 5.
THE FREE PLAN WILL NOT CARRY THIS BUILD
Claude allows one custom connector on the free plan and this build needs three. Cowork and scheduled tasks are paid-only. Budget $17 a month billed
annually, or $20 monthly. Every other tool in this guide has a real free tier.
CONNECT THESE THREE, THEN YOU ARE DONE WITH SETUP 2
Your library table
In Baserow click your workspace name → My Settings → MCP Server → Create Endpoint. Copy the URL it gives you and add it as a custom connector.
YouTube transcripts
Add https://youtube-transcript.ai/mcp as a custom connector. No key, no signup, no account. It exposes one tool called get_youtube_transcript.
Web page reader
Add https://mcp.firecrawl.dev/v2/mcp as a custom connector. Works with no API key at all — you get scrape, search and parse on a shared limit.
WHERE TO PASTE A CONNECTOR URL, BY AGENT
Claude (Cowork or Desktop)Customize → Connectors → Add custom connector → paste the URL → Add
Claude Code claude mcp add --transport http <name> <url>
ChatGPT Work Settings → Security and login → Developer mode, then Plugins → + → paste the URL. Web only, Plus and
above.
Codex codex mcp add <name> --url <url>
Build Your Own Coursera  ·  angussewell.com
===== PAGE 4 =====
Setup 3. Open your four ways to save thingsOne table, four doors into it. Do the playlist and Telegram now; the browser and phone doors are optional and can wait.
Door 1. Your Learn playlist
1. On any video, Save → New playlist → call it Learn.
2. Open the playlist, set visibility to Unlisted.
3. In the playlist, set the ordering to Date added (newest).
4. Copy the playlist ID out of the address bar — it is the part after list= and starts with PL.
BOTH OF THOSE SETTINGS ARE LOAD-BEARING
A Private playlist is invisible to every free method there is — you would need a full OAuth app to read it. Unlisted is not searchable, not on your channel
and not in anyone's feed; it just means a link works. And the feed only ever returns the first 15 slots, so if you leave the default ordering your newest saves
fall off the end and the whole thing quietly stops working after two weeks.
Door 2. A Telegram bot, so you can save from your phone
1. In Telegram, message @BotFather and send /newbot. Give it a name, then a username. It hands you a token that looks like 110201543:AAHdqTcvCH1vG...
2. Send your new bot any message, so a conversation exists.
3. Open https://api.telegram.org/bot<YOUR-TOKEN>/getUpdates in a browser and copy the "chat":{"id": ... } number. That is your chat ID.
4. Keep both. Steps 2 and 6 need them.
That token is a password. Anyone holding it controls your bot. Keep the skills that contain it private, and if it leaks, send /token to BotFather to get a new one.
DOOR 3. SAVE ANY PAGE FROM YOUR BROWSER (OPTIONAL)
Install one extension, point it at a webhook, then right-click any page to file it. All six are free on the Chrome Web Store.
Send To WebHookFREE, 655 USERS, 4.6 STARS
Open source. You write the JSON body, so you control exactly what gets sent.
ZapierFREE 100 TASKS/MO
No JSON to write at all. Webhook actions need the $19.99/mo Professional plan.
ApifyFREE
URL Webhook Clipper: 158 users, 5 stars. Adds notes and file attachments to the
save.
n8nFREE, 816 USERS, 5 STARS
Webhook to n8n. Pulls extra text off the page with a CSS selector.
FirecrawlFREE, 9 USERS
Web Clipper Webhook. The only one that grabs a YouTube transcript itself.
Val TownFREE, 60 USERS
Webhook Trigger. Most recently updated. Groups and drag-and-drop ordering.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 5 =====
Setup 3, continued. The receiver, and a real phone numberThe browser extension and a text message cannot write to your table on their own. They need one small free relay in between.
WHY A RELAY, AND WHY YOU CANNOT SKIP IT
Your table needs an authorisation header to accept a new row, and Chrome extensions strip that header out of the request before it is sent. So the
extension posts to a webhook URL instead, and the relay writes the row. It is one free scenario, built by dragging two boxes together, and it takes about
ten minutes. Telegram does not need this — your agent reads that inbox directly in step 2.
PICK YOUR RELAY
In Make: new scenario, Webhooks > Custom webhook, copy the URL it gives you, then add Baserow > Create a Row after it and map the fields. Paste that
webhook URL into your browser extension.
Make.comFREE 1,000 CREDITS/MO
Has a Baserow Create a Row module. 2 scenarios on free. Idle webhooks cost
nothing.
ActivepiecesFREE, PLUS $16/MO YEARLY
Open source, and its built-in Tables mean one vendor instead of two.
ZapierFREE 100 TASKS/MO
Easiest to learn. Webhooks are locked behind Professional at $19.99/mo.
SupabaseFREE 500K INVOCATIONS
Database and receiver in one product. Free projects pause after a week idle.
Cloudflare WorkersFREE 100K REQUESTS/DAY
Cheapest at any scale. 10ms CPU limit and you write real JavaScript.
Val TownFREE 100K RUNS/DAY
Write a handler in a browser tab. Free tier forces your code to be public.
DOOR 4. A REAL PHONE NUMBER YOU CAN TEXT (OPTIONAL)
Point the number's inbound webhook at the same relay. Telegram already does this job for free, so treat this as a want, not a need.
TelegramFREE, FOREVER
No number to rent, no verification, no card. Working in about five minutes.
WhatsApp Cloud
APIFREE INBOUND
Meta business verification first. Expect a few days, and 250 contacts until
approved.
Bird$0.11/MO + $0.0073 PER TEXT
Cheapest number rental found. US still needs 10DLC carrier registration.
Telnyx$1.10/MO + $0.004 PER TEXT
Cheapest per message. 10DLC brand $4.50, and $15 per campaign review.
Twilio$1.15/MO + $0.0083 PER TEXT
Best documented. Twilio's own banner says 10DLC review takes 10 to 15 days.
VonageEUR0.90/MO + EUR0.0057
Billed in euros. UK numbers need no registration and work the same day.
READ THIS BEFORE YOU RENT A US NUMBER
Texting an app in the US now needs carrier registration (10DLC) before your number can send anything back. Twilio's own documentation says the review
takes 10 to 15 days, and the toll-free shortcut closed in February 2026. UK numbers need no registration and work the same day. If you just want to text
yourself links today, use Telegram and move on.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 6 =====
Now the build. Seven prompts, one at a time.Each one makes a separate named skill. Separate is deliberate: they schedule, break and get replaced on their own, so one bad step can never
take the rest down with it.
1 Watch the
playlist
This is the video-to-table half of the loop. It reads your Learn playlist and files anything new.
Paste it into your agent as a new chat.
Create a new skill called learning-capture.
What it does: it checks my YouTube Learn playlist and adds any video I have
saved but not processed yet as a new row in my library table.
How it works:
1. Fetch this URL, using the playlist ID I copied in Setup 3:
   https://www.youtube.com/feeds/videos.xml?playlist_id=PASTE_MY_PLAYLIST_ID
   It returns up to 15 entries as XML.
2. For each <entry>, read <yt:videoId> and the <entry>'s own <title>. Ignore the
   <title> at the top of the feed, that one is the playlist name, not a video.
3. Read every row already in my library table and build a list of the video IDs
   in them. To get an ID from a stored URL, take the v= value, or the last path
   segment for a youtu.be or /shorts/ link, and drop everything after a & or ?.
4. For any video ID not already in that list, add one row:
      url    = https://www.youtube.com/watch?v=THE_VIDEO_ID   (nothing after it)
      source = youtube
      title  = the entry's title, with any &amp; style codes turned back into
               real characters
      status = new
      added  = today's date in YYYY-MM-DD, in my local timezone
   Leave every other field empty.
5. Match on the video ID only. Never match on the published date, because the
   feed's date is when the video went up, not when I saved it.
6. Tell me how many rows you added and their titles. If all 15 entries were
   already in the table, say so, and warn me that I may have saved more than 15
   things since the last run and some could have been missed.
If the feed returns an error or no entries, wait 10 seconds, try once more, then
stop and tell me. Do not add anything on a failed fetch.
Careful: Fifteen is the hard ceiling on what the playlist feed shows at once. If you save more than 15 things in a day, run this twice.
You will know it worked when the skill exists, and running it once adds a row to your library table for every video already in the playlist, each with status 
new.
2 Pick up what you texted
yourself
Door two into the same table. Your agent reads the bot's inbox itself, so you need no relay for this one.
Paste it into your agent as a new chat.
Create a new skill called learning-inbox.
What it does: it picks up links I have sent to my Telegram bot and adds them to
my library table, so I can save things from my phone.
How it works:
1. Read the file learning-offset.txt next to this skill. If it does not exist,
   treat the stored value as 0.
2. Fetch https://api.telegram.org/bot<MY-TOKEN>/getUpdates?offset=<STORED+1>
   using the bot token from Setup 3. This returns up to 100 updates and
   permanently confirms everything below that offset, so nothing repeats.
3. For each message whose chat id matches my chat ID from Setup 3, find every
   http or https link in the message text and in its link entities.
4. Before adding anything, read the urls already in my library table. Skip any
   link that is already there. Compare after stripping utm_ parameters, any ?si=
   value, and any trailing slash.
5. Add one row per new link:
      url    = the link, cleaned as above
      source = telegram
      status = new
      added  = today's date in YYYY-MM-DD
      note   = whatever else I typed in that message, minus the link
6. Only after every row is written, save the highest update_id you saw into
   learning-offset.txt. If a write fails, do not save the offset.
7. Ignore messages with no link in them. Tell me how many links you picked up
   and how many you skipped as duplicates.
Telegram throws these away after 24 hours, so this needs to run at least daily.
You will know it worked when you send your bot a link, run the skill, and that link shows up as a new row with source telegram.Build Your Own Coursera  ·  angussewell.com
===== PAGE 7 =====
Reading what you saved
3 Get the actual
text
Nothing downstream can work from a URL alone. This step turns every saved link into words on the page.
Paste it into your agent as a new chat.
Create a new skill called learning-fetch.
What it does: it reads everything I have saved but not yet read, and stores the
full text, so the rest of the pipeline has something to work from.
How it works:
1. Get rows in my library table where status = new, oldest added first. Take at
   most 15 per run. If there are more, do 15 and tell me how many are left.
2. If a row's url field has words around the link, pull out the first http link
   and use that. Write the cleaned link back to the url field.
3. For each row:
   - youtube.com or youtu.be link: use my connected transcript tool.
   - anything else: use my connected web-reading tool to get the page as text.
4. On success write back:
      title      = the real title of the video or article
      author     = the channel name or the byline, or leave empty if there
                   isn't one. Do not guess.
      transcript = the full text you got back
      status     = fetched
5. If the text comes back under 500 characters, treat it as a failure, not a
   success. A short result is almost always an error page or a paywall, not the
   content. Same for any timeout or error. In that case write:
      status = failed
      error  = one line saying what went wrong
   and leave note alone, that field holds my own words.
6. Never write status = fetched with an empty transcript.
7. Tell me which rows worked, which failed and why, and how many are left.
You will know it worked when rows move from new to fetched and the transcript field is full of real text. Anything that broke sits at failed with a reason,
not stuck in the queue.
IF YOU WANT TO SWAP THE READING TOOLS
Step 3 says "my connected transcript tool" and "my connected web-reading tool" on purpose, so you can change either one without touching the prompt.
youtube-transcript.aiFREE, NO KEY, NO SIGNUP
YouTube only. One tool: get_youtube_transcript. No SLA, so keep a backup.
FirecrawlFREE 1,000 PAGES/MO
Web pages only. Keyless MCP works with no account. Handles PDFs and JS
pages.
Exa$10 FREE CREDITS MONTHLY
Does both. $1 per 1,000 pages. YouTube transcripts work but are undocumented.
SupadataFREE 100/MO, $5/MO BASIC
Does both, plus playlist listing. One key covers the whole build.
Jina ReaderFREE, NO KEY, 20/MIN
Web pages only. Paste r.jina.ai/ in front of any URL. Slowest of the six.
Apify$5 FREE USAGE/MO
Does both. Transcripts from $0.011 per 1,000. Heaviest setup of the six.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 8 =====
Sorting it into subjectsThis is the step that turns a pile of links into a curriculum. It is also the one worth checking by hand for the first week.
4 Group the similar things
together
Everything on one subject gets the same label, so step 5 can put it all in one place.
Paste it into your agent as a new chat.
Create a new skill called learning-sort.
What it does: it decides which subject each thing belongs to, so related
material ends up in the same place.
How it works:
1. Get rows in my library table where status = fetched, oldest first, at most 25
   per run.
2. Read the topic field across the whole table and build the list of subjects
   already in use. Ignore blank ones.
3. For each row, read the title and the first 2,000 words of the transcript.
   - If it fits a subject already on the list, use that name spelled exactly as
     it already appears, same capitals, same singular or plural.
   - Only invent a new subject if none of them fit. New names are one or two
     plain words in Title Case, letters and spaces only, under 30 characters.
     For example: AI Agents, Sales, Distribution, Finance.
   - After you invent one, add it to your working list straight away, so the
     rest of this run reuses it instead of inventing a near-copy.
   - Before inventing, check it is not the same as an existing subject with
     different capitals, an s on the end, or an abbreviation.
4. If a row's transcript is empty or too thin to judge, set its topic to
   Unsorted rather than guessing.
5. Write the topic back and set status = sorted.
6. Show me every row you sorted with the subject you gave it, and list any new
   subjects you created so I can rename them now rather than later.
Careful: Read the new subjects it proposes for the first few runs and rename them yourself if they drift. Subject names become your notebook names in step 5,
and renaming later is a chore.
You will know it worked when every fetched row has a subject on it, the list of subjects is short and sensible, and nothing has landed in two near-
identical buckets like AI Agent and AI Agents.
Setup 4. Install the bridge to Gemini Notebook
Google does not publish a consumer API for Gemini Notebook, so this open-source tool drives it for you. Open Terminal on Mac or PowerShell on Windows
and run these three, once:
pip install "notebooklm-py[browser]>=0.8.0"
notebooklm login
notebooklm auth check --test --json
The middle one opens a browser and asks you to sign in to Google. Version 0.8.0 or later is not optional — earlier ones cannot sign in since Google moved the app in
July 2026.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 9 =====
Making the course material
5 Build the study guide, briefing and
quiz
The payoff. Every subject becomes a notebook, every notebook gets material built from the sources under it.
Paste it into your agent, on your own computer.
Create a new skill called learning-build.
What it does: it turns everything I saved into real course material, filed under
the right subject.
It runs on my own computer using the notebooklm-py command line tool I set up in
Setup 4. Before you do anything else, run notebooklm --help and notebooklm
auth check --test --json . If either fails, stop and tell me. Do not invent
commands.
How it works:
1. Get rows in my library table where status = sorted and topic is not empty.
   At most 20 per run. Group them by topic.
2. Run notebooklm list --json to get my existing notebooks and their ids.
3. For each topic:
   - If a notebook already has exactly that name, keep its id.
   - If not, run  notebooklm create "THE TOPIC"  and keep the new id.
   - For each row in that topic, run:
        notebooklm source add "THE ROW URL" -n THE_NOTEBOOK_ID
   - Then, once, for that notebook:
        notebooklm generate report --format study-guide  -n THE_NOTEBOOK_ID
        notebooklm generate report --format briefing-doc -n THE_NOTEBOOK_ID
        notebooklm generate quiz -n THE_NOTEBOOK_ID
4. For each row that made it all the way through, write back:
      notebook_id = the notebook's id
      built       = today's date in YYYY-MM-DD
      status      = done
5. If adding a source or generating fails, leave that row at sorted, put the
   error in the error field, and carry on with the other topics. Never mark a
   row done unless all three pieces of material actually generated.
6. Never add the same url to the same notebook twice. Check the notebook's
   existing sources first.
7. Tell me which notebooks you created, which you added to, and what you built.
Careful: This step runs on your own machine, and it has to be awake for the daily run. It also drives Gemini Notebook through an unofficial tool, because Google
publishes no consumer API. If Google changes something and it breaks, steps 1 to 4 keep working and you add sources by hand until it is patched.
You will know it worked when you open Gemini Notebook and see one notebook per subject, each with your saved videos as sources and a study guide,
briefing doc and quiz waiting inside.
WHERE ELSE YOUR MATERIAL COULD GO
Gemini NotebookFREE: 100 NOTEBOOKS
Study guides, briefings, quizzes, audio. AI Pro $19.99/mo lifts every limit.
AnkiFREE, FOREVER
Flashcards. A 42-tool MCP writes cards straight into your deck. Must run locally.
Readwise$9.99/MO ANNUAL
Official remote MCP, zero install. Captures and resurfaces, but generates nothing.
ObsidianFREE, SYNC $4/MO ANNUAL
MCP ships inside the Local REST API plugin. Your notes stay on your machine.
MochiFREE, PRO $5/MO
Markdown flashcards over a plain REST API. No MCP, so the agent posts directly.
ElevenLabsFREE 10,000 CREDITS
Official MCP. Reads your material back as audio. You supply the script.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 10 =====
Closing the loop
6 Get told what
landed
Without this you have to remember to go and look, which means in a month you will not.
Paste it into your agent as a new chat.
Create a new skill called learning-digest.
What it does: it messages me what got built, grouped by subject.
How it works:
1. Get rows in my library table where built = today's date. Group them by topic.
2. Write a plain text message. For each subject: the subject name on its own
   line, then one line per item, each as  Title - link  where the link is
   https://notebook.google.com/notebook/ plus that row's notebook_id.
3. Count rows where status = failed. If that count is above zero, add a final
   line: "N items failed, check the error column."
4. If the message would go over 3,500 characters, split it and send in parts.
5. Send it by POSTing to
     https://api.telegram.org/bot<MY-TOKEN>/sendMessage
   with a JSON body containing chat_id set to my chat ID from Setup 3 and text
   set to the message. Do not set a parse mode, so titles with brackets and
   underscores in them cannot break the send.
6. If nothing was built today and nothing failed, send nothing.
7. If Telegram returns an error, tell me in the chat rather than failing quietly.
You will know it worked when you get a Telegram message listing what was built, grouped by subject, with a working link to each notebook.
WHERE THE DIGEST COULD GO INSTEAD
Any of these works. Telegram is the default only because you already made the bot in Setup 3.
TelegramFREE
Same bot you already made. One POST, no new account.
ntfy.shFREE, NO SIGNUP AT ALL
curl a topic name. Anyone who guesses the topic can read it.
Pushover$4.99 ONE-TIME
Real native push, 10,000 messages a month. No subscription.
DiscordFREE
Server Settings, Integrations, Create Webhook. Paste JSON at it.
SlackFREE PLAN WORKS
Official Slack connector in Claude. Free plan hides messages after 90 days.
ResendFREE 3,000 EMAILS/MO
If you want it in your inbox. Official Claude connector. 100/day cap.
7 Set it
running
Six skills, one schedule, in order. This is the line between a demo you built once and a system that runs without you.
Paste it into your agent as a new chat.
Set up a daily schedule that runs these six skills once a day at 6am my time,
one after another, in exactly this order, each finishing before the next starts:
   1. learning-capture
   2. learning-inbox
   3. learning-fetch
   4. learning-sort
   5. learning-build
   6. learning-digest
Before you save the schedule, run all six once now, in that order, and show me
what each one did, so I can see the whole thing work end to end before it starts
running on its own.
You will know it worked when you wake up the next morning to a Telegram message you did not ask for, about videos you saved yesterday and forgot
about.
Build Your Own Coursera  ·  angussewell.com
===== PAGE 11 =====
Everything you just equippedEvery function in this build has five alternatives priced inside the guide. Swap any of them without touching the rest.
YOUR LOADOUT 11 tools  ·  10 of them free
Your toolkit for this buildEverything you equip in this guide, in one place. The agent is the only thing you have to pay for — every other function here has a real free tier.
No affiliate links, no discount codes, nothing sponsored: these are just what the build uses.
1 Claude CoworkAI AGENT
Runs every skill and holds the daily schedule. $17/mo billed annually, $20 monthly. Not on the free plan.
FROM $17
2 BaserowYOUR LIBRARY
The one table everything lands in. Free to 3,000 rows, native MCP server built into the product.
FREE
3 YouTubeCAPTURE SURFACE
Your Learn playlist is inbox number one. Free. Must be Unlisted, sorted by date added.
FREE
4 TelegramINBOX AND DIGEST
Bot you make in BotFather. Free, no verification. Takes links in and sends your digest back.
FREE
5 Send To WebHookBROWSER SAVE
Send To WebHook, free on the Chrome Web Store. Right-click any page to file it.
FREE
6 Make.comWEBHOOK RECEIVER
Catches the browser and SMS saves and writes the row. Free, 1,000 credits a month.
FREE
7 youtube-transcript.aiTRANSCRIPTS
Free MCP, no key and no signup. One tool: get_youtube_transcript.
FREE
8 FirecrawlPAGE READER
Reads saved articles. Free for 1,000 pages a month, and the MCP works with no account.
FREE
9 Gemini NotebookCOURSE MATERIAL
Formerly NotebookLM. Builds the study guide, briefing doc and quiz. Free tier is generous.
FREE
10 notebooklm-pyTHE BRIDGE
Open-source command line tool that drives Gemini Notebook. Free. Needs version 0.8.0 or later.
FREE
11 ExaBACKUP READER
Second source for transcripts and pages when the free ones fall over. $10 free credits monthly.
FREE
MORE WHERE THIS CAME FROM
I build one of these every week and give it away.
Teardowns, working prompts and the whole stack behind each one — free, no course, no upsell. Grab the rest at
angussewell.com
Build Your Own Coursera  ·  angussewell.com