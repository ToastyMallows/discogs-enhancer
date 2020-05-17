rl.ready(() => {
  if (rl.pageIsNot("edit")) return;

  window.addEventListener("DOMContentLoaded", () => {

    const newActionClass = "de-clone-track-action";
    const discogsTrackActionMenuSelector = ".subform_track_actions ul.action_menu";
    const discogsEditOrSaveArtistsButtonSelector = ".editable_list .editable_artist_list_actions button";
    const discogsLoadingClass = "loading-placeholder";
    const discogsSubformTrackActionClass = "subform_track_action";
    const discogsSubformTracklistClass = "subform_tracklist";
    const discogsEditableListClass = "editable_list";
    const discogsEditableItemsListClass = "editable_items_list";
    const discogsLookupFieldClass = "lookup-field";
    const discogsRemoveButtonSelector = ".editable_actions button.editable_input_remove";
    const discogsEditableListItemSelector = `.${discogsEditableListClass} .${discogsEditableItemsListClass} li`;
    const discogsTrackTitleClass = "subform_track_title";
    const discogsTrackPositionClass = "subform_track_pos";
    const discogsTrackDurationClass = "subform_track_duration";
    const discogsTrackArtistsClass = "subform_track_artists";
    let lastTrackCount = 0;
    let firstLoad = true;
    let allTrackActionMenus = [];

    // ========================================================
    // Track Copying Functions
    // ========================================================

    /**
     * Asynchronously copies all track information from source to destination.
     * 
     * @method populateNewTrack
     * @param {HTMLElement} sourceTrackElement 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    function populateNewTrack(sourceTrackElement, destinationTrackElement) {
      Promise.allSettled([
        populateNewTrackPosition(sourceTrackElement, destinationTrackElement),
        populateNewTrackArtists(sourceTrackElement, destinationTrackElement),
        populateNewTrackTitle(sourceTrackElement, destinationTrackElement),
        populateNewTrackCredits(sourceTrackElement, destinationTrackElement),
        populateNewTrackDuration(sourceTrackElement, destinationTrackElement),
      ]);
    }

    /**
     * Copies track credits from source to destination.
     * 
     * @method populateNewTrackCredits
     * @param {HTMLElement} sourceTrackElement 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    async function populateNewTrackCredits(sourceTrackElement, destinationTrackElement) {
      let sourceCredits = getSourceCredits(sourceTrackElement);

      if (sourceCredits.length === 0) {
        return;
      }

      populateDestinationCredits(sourceCredits, destinationTrackElement);
    }

    /**
     * Copies track position from source to destination.
     * 
     * @method populateNewTrackPosition
     * @param {HTMLElement} sourceTrackElement 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    async function populateNewTrackPosition(sourceTrackElement, destinationTrackElement) {
      const sourceTrackPositionElement = sourceTrackElement.querySelector(`.${discogsTrackPositionClass} input`);
      const destinationTrackPositionElement = destinationTrackElement.querySelector(`.${discogsTrackPositionClass} input`);

      setValue(sourceTrackPositionElement.value, destinationTrackPositionElement);
    }

    /**
     * Copies track artists from source to destination.
     * 
     * @method populateNewTrackArtists
     * @param {HTMLElement} sourceTrackElement 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    async function populateNewTrackArtists(sourceTrackElement, destinationTrackElement) {
      let sourceArtists = getSourceArtists(sourceTrackElement);
      
      if (sourceArtists.length === 0) {
        return;
      }

      populateDestinationArtists(sourceArtists, destinationTrackElement);
    }

    /**
     * Copies track title from source to destination.
     * 
     * @method populateNewTrackTitle
     * @param {HTMLElement} sourceTrackElement 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    async function populateNewTrackTitle(sourceTrackElement, destinationTrackElement) {
      let sourceTrackTitleElement = sourceTrackElement.querySelector(`.${discogsTrackTitleClass} input`);
      let destinationTrackTitleElement = destinationTrackElement.querySelector(`.${discogsTrackTitleClass} input`);

      setValue(sourceTrackTitleElement.value, destinationTrackTitleElement);
    }

    /**
     * Copies track duration from source to destination.
     * 
     * @method populateNewTrackDuration
     * @param {HTMLElement} sourceTrackElement 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    async function populateNewTrackDuration(sourceTrackElement, destinationTrackElement) {
      let sourceTrackDurationElement = sourceTrackElement.querySelector(`.${discogsTrackDurationClass} input`);
      let destinationTrackDurationElement = destinationTrackElement.querySelector(`.${discogsTrackDurationClass} input`);

      setValue(sourceTrackDurationElement.value, destinationTrackDurationElement);
    }

    // ========================================================
    // Credit Population Methods
    // ========================================================

    /**
     * Gets all of the Credits on the source track.
     * 
     * @method getSourceCredits
     * @param {HTMLElement} sourceTrackElement 
     * @returns {Array<Credit>}
     */
    function getSourceCredits(sourceTrackElement) {
      const sourceTrackCreditsBaseElement = sourceTrackElement.querySelector(`.${discogsTrackTitleClass} > .${discogsEditableListClass}`);
      const creditsListItems = sourceTrackCreditsBaseElement.querySelectorAll(discogsEditableListItemSelector);

      if (creditsListItems.length === 0) {
        return [];
      }

      let forcedEditing = false;

      if (!isTrackMetadataBeingEdited(sourceTrackCreditsBaseElement)) {
        startEditing(sourceTrackCreditsBaseElement);
        forcedEditing = true;
      }

      const credits = [];
      
      for (let i = 0; i < creditsListItems.length; i++) {
        const creditListItem = creditsListItems[i];
        const rolesButton = creditListItem.querySelector(".lookup-copy-button");
        clickReactButton(rolesButton);

        const inputs = creditListItem.querySelectorAll("input");

        const roles = inputs[0].value;
        const name = inputs[1].value;
        let anv = undefined;

        if (inputs.length === 3) {
          // there's an ANV
          anv = inputs[2].value;
        }

        credits.push(new Credit(roles, name, anv))
      }

      if (forcedEditing) {
        stopEditing(sourceTrackCreditsBaseElement);
      }

      return credits;
    }

    /**
     * Sets all of the Credit data on the destination track.
     * 
     * @method populateDestinationCredits
     * @param {Array<Credit>} sourceCredits 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    function populateDestinationCredits(sourceCredits, destinationTrackElement) {
      const destinationTrackCreditsBaseElement = destinationTrackElement.querySelector(`.${discogsTrackTitleClass} > .${discogsEditableListClass}`);
      const addButton = destinationTrackCreditsBaseElement.querySelector(discogsEditOrSaveArtistsButtonSelector);

      startEditing(destinationTrackCreditsBaseElement);

      for (let i = 0; i < sourceCredits.length; i++) {
        // Add one more credit than we need.
        // If we don't, sometimes the last credit shows up empty.
        // I think this is because of the lookup search box that pops up.
        addButton.click();
      }

      const creditsListItems = destinationTrackCreditsBaseElement.querySelectorAll(`.${discogsEditableItemsListClass} > li`);

      for (let i = 0; i < sourceCredits.length; i++) {
        const credit = sourceCredits[i];
        const creditListItem = creditsListItems[i];

        const rolesButton = creditListItem.querySelector(".lookup-copy-button");
        clickReactButton(rolesButton);

        if (credit.anv) {
          creditListItem.querySelector("fieldset > button").click();
        }

        const inputs = creditListItem.querySelectorAll("input");

        setValue(credit.roles, inputs[0]);
        setValue(credit.name, inputs[1]);

        if (credit.anv) {
          setValue(credit.anv, inputs[2]);
        }
      }

      // Remove the last (empty) credit we added earlier.
      creditsListItems[creditsListItems.length - 1].querySelector(discogsRemoveButtonSelector).click();

      stopEditing(destinationTrackCreditsBaseElement);
    }

    // ========================================================
    // Artist Population Methods
    // ========================================================

    /**
     * Gets all of the Artists on the source track.
     * 
     * @method getSourceArtists
     * @param {HTMLElement} sourceTrackElement 
     * @returns {Array<Artist>}
     */
    function getSourceArtists(sourceTrackElement) {
      const sourceTrackArtistsBaseElement = sourceTrackElement.querySelector(`.${discogsTrackArtistsClass}`);
      const artistsListItems = sourceTrackArtistsBaseElement.querySelectorAll(discogsEditableListItemSelector);

      if (artistsListItems.length === 0) {
        return [];
      }

      let forcedEditing = false;

      if (!isTrackMetadataBeingEdited(sourceTrackArtistsBaseElement)) {
        startEditing(sourceTrackArtistsBaseElement)
        forcedEditing = true;
      }

      let artists = [];
      let hasJoins = artistsListItems.length > 1;

      for (let i = 0; i < artistsListItems.length; i++) {
        const artistListItem = artistsListItems[i];
        let name = artistListItem.querySelector(`fieldset > .${discogsLookupFieldClass} > input`).value;

        let join = undefined;
        let anv = undefined;

        const inputs = artistListItem.querySelectorAll("fieldset > input");

        let anvInput = undefined;
        let joinInput = undefined;

        if (inputs.length !== 0) {
          if (hasJoins && i !== (artistsListItems.length - 1)) {
            if (inputs.length === 2) {
              anvInput = inputs[0];
              joinInput = inputs[1]
            } else {
              joinInput = inputs[0];
            }
          } else {
            // does not have joins or is the last artist in the list
            // may have an ANV
            anvInput = inputs[0];
          }
        }

        anv = anvInput ? anvInput.value : undefined;
        join = joinInput ? joinInput.value : undefined;

        artists.push(new Artist(name, anv, join));
      }
      
      if (forcedEditing) {
        stopEditing(sourceTrackArtistsBaseElement);
      }

      return artists;
    }

    /**
     * Sets all of the Artists data on the destination track.
     * 
     * @method populateDestinationArtists
     * @param {Array<Artist>} artists 
     * @param {HTMLElement} destinationTrackElement 
     * @returns {undefined}
     */
    function populateDestinationArtists(artists, destinationTrackElement) {
      const destinationTrackArtistsBaseElement = destinationTrackElement.querySelector(`.${discogsTrackArtistsClass}`);
      const addButton = destinationTrackArtistsBaseElement.querySelector(discogsEditOrSaveArtistsButtonSelector);

      startEditing(destinationTrackArtistsBaseElement);

      for (let i = 0; i < artists.length; i++) {
        // Add one more artist than we need.
        // If we don't, sometimes the last artist shows up empty.
        // I think this is because of the lookup search box that pops up.
        addButton.click();
      }

      const artistsListItems = destinationTrackArtistsBaseElement.querySelectorAll(discogsEditableListItemSelector);

      for (let i = 0; i < artists.length; i++) {
        const artist = artists[i];
        const artistListItem = artistsListItems[i];

        const nameInput = artistListItem.querySelector(`fieldset > .${discogsLookupFieldClass} > input`);
        setValue(artist.name, nameInput);

        if (artist.anv) {
          artistListItem.querySelector("fieldset > button").click();
        }

        const inputs = artistListItem.querySelectorAll("fieldset > input");

        if (artist.anv && artist.join) {
          setValue(artist.anv, inputs[0]);
          setValue(artist.join, inputs[1]);
        } else if (artist.anv) {
          setValue(artist.anv, inputs[0]);
        } else if (artist.join) {
          setValue(artist.join, inputs[0]);
        }
      }

      // Remove the last (empty) artist we added earlier.
      artistsListItems[artistsListItems.length - 1].querySelector(discogsRemoveButtonSelector).click();

      stopEditing(destinationTrackArtistsBaseElement);
    }

    // ========================================================
    // Helper Methods
    // ========================================================

    /**
     * Gets the localized value for the new "Clone Track" action.
     * 
     * @method getCloneTrackButtonText
     * @returns {String}
     */
    function getCloneTrackButtonText() {
      const language = rl.language();
      switch (language) {
        // German
        case 'de':
          return "Titel Klonen";
        // Italian
        case 'it':
          return "Traccia Clone";
        // Korean
        case 'ko':
          return "클론 트랙";
        // Spanish
        case 'es':
          return "Pista De Clonación";
        // French
        case 'fr':
          return "Cloner La Piste";
        // Portuguese
        case 'pt':
          return "Clonar Faixa";
        // Japanese
        case 'ja':
          return "重複したトラック";
        // Russian
        case 'ru':
          return "Клон трек";
        // English
        default:
          return "Clone Track";
      }
    }

    /**
     * Creates the "Clone Track" option on the Track actions dropdown.
     * 
     * @method createCloneTrackAction
     * @returns {undefined}
     */
    function createCloneTrackAction() {
      let newActionAnchor = document.createElement("a");
      newActionAnchor.onclick = cloneTrack;
      newActionAnchor.innerText = getCloneTrackButtonText();

      let newActionListItem = document.createElement("li");

      newActionListItem.classList.add(discogsSubformTrackActionClass);
      newActionListItem.classList.add(newActionClass);

      newActionListItem.appendChild(newActionAnchor);

      return newActionListItem;
    }

    /**
     * Dynamically clicks the "Insert Track" action on the target track.
     * Listens to the DOM for changes and finds the destination track, then
     * kicks off a function to copy over all information to the new track.
     * 
     * @method cloneTrack
     * @returns {undefined}
     */
    function cloneTrack() {
      let trackTable = document.querySelector(`table.${discogsSubformTracklistClass}`);
      let insertedTracks = [];
      let trackTableObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            insertedTracks.push(mutation.addedNodes[i]);
          }
        });

        let newTrackElement = insertedTracks[0];
        let trackToClone = newTrackElement.nextSibling;

        trackTableObserver.disconnect();
  
        populateNewTrack(trackToClone, newTrackElement);
      });
      
      trackTableObserver.observe(trackTable, {
        childList: true,
        subtree: true
      });
      
      let insertTrackActionElement = this.parentElement.parentElement.querySelectorAll("li a")[1];

      insertTrackActionElement.click();
    }

    /**
     * Clicks the Add or Edit button on a track subform to start editing it.
     * 
     * @method startEditing
     * @param {HTMLElement} baseElement
     * @returns {undefined}
     */
    function startEditing(baseElement) {
      let editableActionButtons = baseElement.querySelectorAll(discogsEditOrSaveArtistsButtonSelector);

      const editOrAddButton = editableActionButtons.length === 1 ? editableActionButtons[0] : editableActionButtons[1];

      editOrAddButton.click();
    }

    /**
     * Clicks the Save button on a track subform to stop editing it.
     * 
     * @method stopEditing
     * @param {HTMLElement} baseElement
     * @returns {undefined}
     */
    function stopEditing(baseElement) {
      let editableActionButtons = baseElement.querySelectorAll(discogsEditOrSaveArtistsButtonSelector);

      if (editableActionButtons.length !== 2) {
        // Add and Save buttons
        console.error("Save button not found");
        return;
      }

      let saveButton = editableActionButtons[1];

      saveButton.click();
    }
    
    /**
     * Detects of the given HTMLElement has a fieldset Element
     * as a descendent, which means that it is actively being edited.
     * 
     * @method isTrackMetadataBeingEdited
     * @param {HTMLElement} trackAncestor
     * @returns {Boolean}
     */
    function isTrackMetadataBeingEdited(trackAncestor) {
      let fieldsets = trackAncestor.querySelectorAll("fieldset");
      return fieldsets.length !== 0;
    }

    /**
     * Sets a value on an input element and then raises React events
     * on that element so that React picks up the changes.
     * 
     * @method setValue
     * @param {String} value 
     * @param {HTMLInputElement} destinationElement 
     * @returns {undefined}
     */
    function setValue(value, destinationElement) {
      destinationElement.setAttribute("value", value);
      destinationElement.dispatchEvent(new Event("input", { bubbles: true }));
      destinationElement.dispatchEvent(new Event("change", { bubbles: true }));
      destinationElement.dispatchEvent(new Event("blur", { bubbles: true }));
    }

    /**
     * Clicks a button that is controlled by React by raising multiple MouseEvents.
     * 
     * @method clickReactButton
     * @param {HTMLButtonElement} buttonToClick
     * @returns {undefined}
     */
    function clickReactButton(buttonToClick) {
      buttonToClick.dispatchEvent(new Event("mousedown", { bubbles: true }));
      buttonToClick.dispatchEvent(new Event("click", { bubbles: true }));
      buttonToClick.dispatchEvent(new Event("mouseup", { bubbles: true }));
    }

    // ========================================================
    // Helper Model Classes
    // ========================================================

    function Artist(name, anv, join) {
      this.name = name;
      this.anv = anv;
      this.join = join;
    }

    function Credit(roles, name, anv) {
      this.roles = roles;
      this.name = name;
      this.anv = anv;
    }

    // ========================================================
    // Editing page React load completed detection
    // ========================================================

    /**
     * Detects when the Edit page is done loading and kicks off
     * the dynamic loading.
     */
    let loadingInterval = setInterval(() => {
      let loadingElement = document.querySelector(`.${discogsLoadingClass}`);

      if (!loadingElement) {
        clearInterval(loadingInterval);
        startTrackListener();
      }
    }, 100);

    /**
     * Kicks off a timeout function that detects when new tracks
     * get added by the user. When a new track is added, the "Clone Tracks"
     * feature is reloaded to incorporate the new track.
     * 
     * @method startTrackListener
     * @returns {undefined}
     */
    function startTrackListener() {
      function trackListener() {
        allTrackActionMenus = document.querySelectorAll(discogsTrackActionMenuSelector);

        if (allTrackActionMenus.length !== lastTrackCount) {
          loadFeature();
        }
  
        lastTrackCount = allTrackActionMenus.length;
        setTimeout(trackListener, 1000);
      }

      trackListener();
    }

    /**
     * (Re)Populates all tracks with the "Clone Track" action.
     * 
     * @method loadFeature
     * @returns {undefined} 
     */
    function loadFeature() {
      if (!firstLoad) {
        let existingActions = document.getElementsByClassName(newActionClass);
        Array.from(existingActions).forEach((action) => {
          action.remove();
        });
      }
      
      if (allTrackActionMenus.length === 0) return;
      
      allTrackActionMenus.forEach(actionMenu => {
        actionMenu.appendChild(createCloneTrackAction());
      });

      if (firstLoad) {
        firstLoad = false;
      }
    }
  });
});
