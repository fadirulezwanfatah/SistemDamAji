# Test Plan: Swiss System Implementation

## Test Cases

### 1. Basic Swiss System Setup
- [ ] Create new tournament
- [ ] Select Swiss format
- [ ] Add even number of players (6 players)
- [ ] Verify no BYE matches generated
- [ ] Check leaderboard sorting

### 2. Odd Number Players Validation
- [ ] Try to start Swiss with odd number of players
- [ ] Verify error message appears
- [ ] Add one more player to make it even
- [ ] Verify tournament can start

### 3. Match Generation
- [ ] Generate Round 1 - verify all players paired
- [ ] Complete some matches with wins/draws
- [ ] Generate Round 2 - verify pairing logic
- [ ] Check no repeat opponents

### 4. Points System
- [ ] Win = 1 point
- [ ] Draw = 0.5 points each
- [ ] Loss = 0 points
- [ ] Verify leaderboard updates correctly

### 5. Leaderboard Sorting
- [ ] Sort by points (descending)
- [ ] Then by wins (descending)  
- [ ] Then by losses (ascending)
- [ ] Test in both admin and public views

### 6. Tournament Completion
- [ ] Complete all rounds (log2(players) rounds)
- [ ] Verify tournament finishes automatically
- [ ] Check final rankings

## Test Data
Players to add:
1. Ahmad bin Ali - Kelab A
2. Siti Fatimah - Kelab B  
3. Raj Kumar - Kelab C
4. Lim Wei Ming - Kelab D
5. Nurul Aina - Kelab E
6. David Wong - Kelab F

Expected rounds for 6 players: ceil(log2(6)) = 3 rounds
