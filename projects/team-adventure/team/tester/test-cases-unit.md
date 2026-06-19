# Unit Test Cases — Virtual Office MVP

## Unit Test Cases

### TC-UNI-001: Player Entity Instantiation with Default Values
- **Objective:** Verify that a new Player instance is created with proper default values when optional parameters are omitted.
- **Inputs:** `id = 'socket_123'`, `name = ''`
- **Execution steps:**
  1. Instantiate `Player` object passing `id` and `name`.
  2. Verify player coordinates default to x=400, y=350.
  3. Verify status defaults to 'working'.
  4. Verify isMuted and isCamOff default to false.
- **Expected Outcome:** Player is created with fallback coords and statuses. Pass.

### TC-UNI-002: Player Position Update
- **Objective:** Verify player updates coordinates and facing directions.
- **Inputs:** `x = 550`, `y = 200`, `direction = 'up'`
- **Execution steps:**
  1. Instantiate player.
  2. Call `player.updatePosition(550, 200, 'up')`.
  3. Check player coordinates and direction.
- **Expected Outcome:** Coords update to 550, 200 and direction is 'up'. Pass.

### TC-UNI-003: Player Status Modification
- **Objective:** Verify player updates status.
- **Inputs:** `status = 'meeting'`
- **Execution steps:**
  1. Call `player.updateStatus('meeting')`.
  2. Verify player status matches.
- **Expected Outcome:** Player status changes to 'meeting'. Pass.

### TC-UNI-004: Player Media Control Toggle
- **Objective:** Verify microphone and camera toggling.
- **Inputs:** `isMuted = true`, `isCamOff = true`
- **Execution steps:**
  1. Call `player.updateMedia(true, true)`.
  2. Verify states are set to true.
- **Expected Outcome:** Player properties update to reflect muted microphone and disabled camera. Pass.
