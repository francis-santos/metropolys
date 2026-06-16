## ADDED Requirements

### Requirement: Trade Proposal System
The active player SHALL be allowed to compile and send trade proposals to any other active player, offering combinations of properties and/or cash in exchange for the opponent's properties.

#### Scenario: Send trade proposal
- **WHEN** Alice drafts a trade proposing to exchange "Avenida Paulista A" and 200 cash for Bob's property "Copacabana B", and clicks "Enviar Proposta"
- **THEN** the server SHALL insert the trade record, block Alice from making moves, and display the trade proposal modal on Bob's client

### Requirement: Trade Proposal Resolution
The target player SHALL be allowed to Accept or Decline trade proposals.

#### Scenario: Accept trade proposal
- **WHEN** Bob clicks "Aceitar" on Alice's trade proposal
- **THEN** the server SHALL transfer ownership of "Avenida Paulista A" to Bob, transfer ownership of "Copacabana B" to Alice, deduct 200 from Alice's balance, add 200 to Bob's balance, close the dialog overlays, and release Alice's action blocks
