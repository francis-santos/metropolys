## ADDED Requirements

### Requirement: Screen Navigation and Routing
The application SHALL support seamless transition between three primary screens: Home Screen, Settings Screen, and Match Screen.

#### Scenario: Navigate to Settings from Home
- **WHEN** the user clicks the "Settings" button on the Home screen
- **THEN** the application SHALL transition to and render the Settings screen

#### Scenario: Return to Home from Settings
- **WHEN** the user clicks the "Back" or "Save" button on the Settings screen
- **THEN** the application SHALL transition back to the Home screen

### Requirement: Local Player Setup Form
The Home screen SHALL include a form to configure a hotseat match, supporting between 2 and 4 players with custom names and color selections.

#### Scenario: Configure and initialize hotseat match
- **WHEN** the user enters 3 players' names, selects colors, and clicks "Start Match"
- **THEN** the application SHALL transition to the Match screen and initialize the game state with these 3 players

### Requirement: Match Layout Structure
The Match screen SHALL display a main dashboard containing a Phaser game canvas, a sidebar with player status cards (current money, owned properties, active turn), and game controls (roll dice, end turn).

#### Scenario: View current player information in Match screen
- **WHEN** the Match screen is active
- **THEN** the sidebar SHALL highlight the active player's status card, indicating their turn, color, and current balance
