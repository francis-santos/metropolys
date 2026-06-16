## 1. City Packs Registry and Configuration Files

- [ ] 1.1 Create directory `apps/web/src/game/citypacks` and write JSON configurations for "São Paulo" and "London"
- [ ] 1.2 Implement `src/game/citypacks/index.js` to register and export available city packs
- [ ] 1.3 Create City Loader service to validate loaded properties lists and prevent canvas configuration crashes

## 2. Lobby selection UI (CitySelectionScreen)

- [ ] 2.1 Implement `CitySelectionScreen.vue` displaying custom detail cards for each city pack and a "Random" picker button
- [ ] 2.2 Refactor the conditional routing manager in `App.vue` to insert the City Selection view between Home and Match screens
- [ ] 2.3 Connect the chosen city metadata to `gameStore.js` before launching the match state initialization

## 3. Dynamic Store and Engine Refactoring

- [ ] 3.1 Refactor `gameStore.js` to load slot configs, starting capital, and event decks dynamically based on the active room's city code
- [ ] 3.2 Update Phaser `boardScene.js` to dynamically read slot layouts, names, and color tags from the loaded store config
- [ ] 3.3 Set up a dynamic visual styling injector in Phaser to color board elements (e.g. connections, skyline glowing window colors) based on selected city's theme settings

## 4. Backend Room validation Updates

- [ ] 4.1 Update NestJS server controllers and Supabase DB room tables to store and check the `cityCode` field during lobby creation
- [ ] 4.2 Adjust server-side match launch endpoints to populate the property database tables with slot definitions from the selected city pack

## 5. Verification and Verification Tests

- [ ] 5.1 Verify that choosing "São Paulo" loads SP neighborhoods, green UI accents, and custom events
- [ ] 5.2 Verify that choosing "London" loads London neighborhoods, red/blue UI accents, and custom events
