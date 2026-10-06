# Update for Tanah — admin leads

**Draft for after launch. Production deployment has not been verified; view tracking requires the database migration.**

We made the inquiry list easier to work through:

- Use **Status**, **Viewed**, and **Notes** together. For example, choose **Contacted** and **Has notes** to find leads you've already worked on.
- Each lead row shows its status, note count, view history, received date, and latest activity.
- Choose **Sort by** to see newest or oldest inquiries, the soonest events, or the most recent activity.
- Open an inquiry and use **Status** at the top to mark it Contacted, Booked, Archived, or another stage. You can also correct a status or restore an archived inquiry here.
- Budget, guests, date, and venue are now easier to scan.
- Search includes private notes as well as names, contact details, and venues. **Clear filters** takes you back to the full list.
- **Studio activity** shows who opened the inquiry, changed its status, or added a note after tracking begins.

A few things to know:

- **Viewed** means someone in the studio opened it. The detail shows who last opened it. It's shared across our accounts.
- Old inquiries may say **Earlier history unknown**, because we weren't recording opens before this update. This doesn't mean nobody looked at them.
- After sending an email or making a call, set **Status → Contacted**. Opening Gmail alone doesn't mean the message was sent.
- If an open inquiry stops matching your filter after a change, its details stay open so you can finish working on it.

Messaging and follow-up reminders are planned separately.

Preview screenshots are saved locally for the handoff and are not included in the source commit.



October 1 follow-up: the detail panel now stays visible while browsing the desktop list, opening an inquiry starts its content at the top, and the mobile panel supports Tab, Shift+Tab, and Escape without moving focus behind it.

## October 5 preview — Your own unread inbox

- Four overview cards show Total inquiries, your Unread count, Contacted, and Booked. Click a card to filter the list.
- An unread inquiry has a dot and bold name. Opening it marks it read for you immediately.
- TJ opening an inquiry leaves it unread for Tanah. Both can still see who has opened it.
- Use “Mark unread for me” to put an inquiry back in your unread inbox.
- Opening an inquiry keeps its status unchanged. Update Contacted or Booked separately.
- Reviewed on localhost and approved for production release on October 6.
