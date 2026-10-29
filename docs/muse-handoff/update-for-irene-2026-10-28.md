# Portal update for Irene and Muse: October 28, 2026

This answers the 8 items from Irene's portal re-check, says what we did today, and lists what's still open. Details are in `notes.md` (first entry in the Log).

## Answers to the 8 items

**1. Wave: connected, with one open question.**
The portal now has a read-only link to Wave. It can't create, change or send anything there. Today we created the Wave developer app ("LVD Client Portal"), added its settings to the website, and connected it. The first import brought in **5 invoices** (#1, #4, #5, #7, #8) from the Wave business **"Planning & Coordination LVD"**, and the amounts match Wave.
**Open question:** Irene's examples **#528, #491 and #514 aren't in that business**, which only goes up to #8. Her main invoices seem to be in a different Wave business, probably under a different Wave login. **Which business and login hold them?** Once we know, it's a reconnect on our side.

**2 + 3. Couple money page: done.**
The couple's "Invoices" tab is now **Budget & payments**. It shows, in order:
- One **40/30/30 payment schedule** covering everything they owe LVD (planning and design added together), with what's paid and due for each payment. Outside vendors aren't included.
- Their **budget by category**: planned and paid.
- Their **Wave invoices**.

**4. Approval name: done.**
To approve a moodboard, the person types their full name, like signing. It's pre-filled with the partner name the studio entered, never the login handle. The approval stamp shows that typed name.

**5. Design + Florals budget category: done and live.**

**6. Activity log: built, not live yet.**
The page is built but hasn't been released, so it won't show on the site yet.

**7. Roles: draft waiting on Irene.**
The draft table is in `portal-roles-draft-2026-10-28.md`. It has three questions for her:
1. Should Family see the budget? (Some parents are paying.)
2. Should Guest exist at all, or is it really for the wedding party?
3. Should Family be able to tick off checklist items?

**Until she approves, Family and Guest logins can see every page, including the money page.**

**8. Guest default: done.**
A new guest's RSVP now starts blank ("Not chosen") instead of "Invited."

## What we did today

- Fixed items 2, 3, 4 and 8, and released them along with Design + Florals.
- Drafted the roles table (item 7).
- Set up and connected Wave (item 1). It took four fixes along the way:
  1. Wave always adds a read-only "basic" permission, which the portal had refused.
  2. The portal expected the business name "Lady Victoria Designs LLC"; the real Wave business is "Planning & Coordination LVD".
  3. The database had the same old-name rule, so it refused to save the connection.
  4. Wave writes amounts with commas ("1,272.00"), which the portal couldn't read.
- Added error logging to the Wave connection, so a future failure shows the exact reason.
- All automated tests pass.

## Still to do

**Needs Irene:**
- Tell us which Wave business and login hold her main invoices (#528 and up).
- Answer the three roles questions so we can build roles. Until then, Family and Guest can see money.

**Needs us:**
- Connect the right Wave business once we know it, then check it against her examples: #528, partially paid/overdue #491, overdue #514, Lola's separate events, and Ritwik's separate tracks.
- Match each imported invoice to its couple, track (Planning or Design & Floral) and signing date. Nothing is matched yet, so couples don't see any Wave numbers so far.
- Release the activity log (item 6).
- Click through the signed-in couple pages as a real couple would. We haven't yet, because we don't have a test couple login. A test couple account would let us catch problems before Irene does.
- Supabase backups: the database is still on the Free plan, which has no restorable backups. Upgrading to Pro ($25/month) is still recommended before real couples go in.
