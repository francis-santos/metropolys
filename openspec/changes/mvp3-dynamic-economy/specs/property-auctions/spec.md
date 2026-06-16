## ADDED Requirements

### Requirement: Auction Session Initialization
When a player lands on an unowned property slot and declines to purchase it (or cannot afford it), the server SHALL put the property up for auction, initializing a bidding lobby with a 30-second countdown.

#### Scenario: Start property auction
- **WHEN** active player Alice declines to buy "Savassi A", having a list cost of 300
- **THEN** the server SHALL start an auction session with starting bid 150 (50% of cost), broadcast the auction phase to all players in the room, and open the bidding dialog overlay on all clients

### Requirement: Bid Processing and Time Extension
Any active non-bankrupt player in the room SHALL be permitted to submit a higher bid. If a bid is submitted in the final 10 seconds, the timer SHALL extend to prevent sniper bids.

#### Scenario: Submit higher bid during auction
- **WHEN** Bob submits a bid of 200, when current highest bid is 150
- **THEN** the server SHALL register Bob as the current winner and update the highest bid to 200 on all clients

#### Scenario: Auto-extend timer on late bids
- **WHEN** Carlos bids 220 when the remaining countdown is 4 seconds
- **THEN** the server SHALL update the bid to 220 and reset the countdown timer back to 10 seconds
