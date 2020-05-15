rl.ready(() => {
  if (rl.pageIsNot("edit")) return;

  window.addEventListener("DOMContentLoaded", () => {

    const newActionClass = "de-editing-features-new-track-action";
    const discogsTrackActionMenuSelector = ".subform_track_actions ul.action_menu";
    const discogsEditOrSaveArtistsButtonSelector = ".editable_list .editable_artist_list_actions button";
    const discogsLoadingClass = "loading-placeholder";
    const discogsSubformTrackActionClass = "subform_track_action";
    const discogsSubformTracklistClass = "subform_tracklist";
    const discogsTrackTitleClass = "subform_track_title";
    const discogsTrackPositionClass = "subform_track_pos";
    const discogsTrackDurationClass = "subform_track_duration";
    const discogsTrackArtistsClass = "subform_track_artists";
    let lastTrackCount = 0;
    let firstLoad = true;
    let allTrackActionMenus = [];

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

    function populateNewTrack(sourceTrackElement, destinationTrackElement) {

      Promise.allSettled([
        populateNewTrackPosition(sourceTrackElement, destinationTrackElement),
        populateNewTrackArtists(sourceTrackElement, destinationTrackElement),
        populateNewTrackTitle(sourceTrackElement, destinationTrackElement),
        populateNewTrackCredits(sourceTrackElement, destinationTrackElement),
        populateNewTrackDuration(sourceTrackElement, destinationTrackElement),
      ]);
    }

    async function populateNewTrackCredits(sourceTrackElement, destinationTrackElement) {
      let sourceCredits = getSourceCredits(sourceTrackElement);

      if (sourceCredits.length === 0) {
        return;
      }

      populateDestinationCredits(sourceCredits, destinationTrackElement);
    }

    function populateDestinationCredits(sourceCredits, destinationTrackElement) {
      
    }

    function getSourceCredits(sourceTrackElement) {
      const sourceTrackCreditsBaseElement = sourceTrackElement.querySelector(`.${discogsTrackTitleClass} > .editable_list`);
      const creditsListItems = sourceTrackCreditsBaseElement.querySelectorAll(".editable_items_list > li");

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
        rolesButton.dispatchEvent(new Event("mousedown", { bubbles: true }));
        rolesButton.dispatchEvent(new Event("click", { bubbles: true }));
        rolesButton.dispatchEvent(new Event("mouseup", { bubbles: true }));

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

    async function populateNewTrackPosition(sourceTrackElement, destinationTrackElement) {
      const sourceTrackPositionElement = sourceTrackElement.querySelector(`.${discogsTrackPositionClass} input`);
      const destinationTrackPositionElement = destinationTrackElement.querySelector(`.${discogsTrackPositionClass} input`);

      setValue(sourceTrackPositionElement.value, destinationTrackPositionElement);
    }

    async function populateNewTrackArtists(sourceTrackElement, destinationTrackElement) {
      let sourceArtists = getSourceArtists(sourceTrackElement);
      
      if (sourceArtists.length === 0) {
        return;
      }

      populateDestinationArtists(sourceArtists, destinationTrackElement);
    }

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

      const artistsListItems = destinationTrackArtistsBaseElement.querySelectorAll(".editable_list .editable_items_list li");

      for (let i = 0; i < artists.length; i++) {
        const artist = artists[i];
        const artistListItem = artistsListItems[i];

        const nameInput = artistListItem.querySelector("fieldset > .lookup-field > input");
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
      artistsListItems[artistsListItems.length - 1].querySelector(".editable_actions button.editable_input_remove").click();

      stopEditing(destinationTrackArtistsBaseElement);
    }

    function getSourceArtists(sourceTrackElement) {
      const sourceTrackArtistsBaseElement = sourceTrackElement.querySelector(`.${discogsTrackArtistsClass}`);
      const artistsListItems = sourceTrackArtistsBaseElement.querySelectorAll(".editable_list .editable_items_list li");

      if (artistsListItems.length === 0) {
        return [];
      }

      let forcedEditing = false;

      if (!isTrackMetadataBeingEdited(sourceTrackArtistsBaseElement)) {
        startEditingArtist(sourceTrackArtistsBaseElement)
        forcedEditing = true;
      }

      let artists = [];
      let hasJoins = artistsListItems.length > 1;

      for (let i = 0; i < artistsListItems.length; i++) {
        const artistListItem = artistsListItems[i];
        let name = artistListItem.querySelector("fieldset > .lookup-field > input").value;

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
        stopEditingArtist(sourceTrackArtistsBaseElement);
      }

      return artists;
    }

    function startEditing(baseElement) {
      let editableActionButtons = baseElement.querySelectorAll(discogsEditOrSaveArtistsButtonSelector);

      const editOrAddButton = editableActionButtons.length === 1 ? editableActionButtons[0] : editableActionButtons[1];

      editOrAddButton.click();
    }

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

    function isTrackMetadataBeingEdited(trackAncestor) {
      let fieldsets = trackAncestor.querySelectorAll("fieldset");
      return fieldsets.length !== 0;
    }

    async function populateNewTrackTitle(sourceTrackElement, destinationTrackElement) {
      let sourceTrackTitleElement = sourceTrackElement.querySelector(`.${discogsTrackTitleClass} input`);
      let destinationTrackTitleElement = destinationTrackElement.querySelector(`.${discogsTrackTitleClass} input`);

      setValue(sourceTrackTitleElement.value, destinationTrackTitleElement);
    }

    async function populateNewTrackDuration(sourceTrackElement, destinationTrackElement) {
      let sourceTrackDurationElement = sourceTrackElement.querySelector(`.${discogsTrackDurationClass} input`);
      let destinationTrackDurationElement = destinationTrackElement.querySelector(`.${discogsTrackDurationClass} input`);

      setValue(sourceTrackDurationElement.value, destinationTrackDurationElement);
    }

    function setValue(value, destinationElement) {
      destinationElement.setAttribute("value", value);
      destinationElement.dispatchEvent(new Event("input", { bubbles: true }));
      destinationElement.dispatchEvent(new Event("change", { bubbles: true }));
      destinationElement.dispatchEvent(new Event("blur", { bubbles: true }));
    }

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

    let loadingInterval = setInterval(() => {
      let loadingElement = document.querySelector(`.${discogsLoadingClass}`);

      if (!loadingElement) {
        clearInterval(loadingInterval);
        startTrackListener();
      }
    }, 100);
  });
});
