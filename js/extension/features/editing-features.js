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

    function createCloneTrackAction() {
      let newActionAnchor = document.createElement("a");
      newActionAnchor.onclick = cloneTrack;
      // TODO: Localize to the user's language, rl.language();
      newActionAnchor.innerText = "Clone Track";

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
        // populateNewTrackCredits(sourceTrackElement, destinationTrackElement),
        populateNewTrackDuration(sourceTrackElement, destinationTrackElement),
      ]);
    }

    async function populateNewTrackPosition(sourceTrackElement, destinationTrackElement) {
      let sourceTrackPositionElement = sourceTrackElement.querySelector(`.${discogsTrackPositionClass} input`);
      let destinationTrackPositionElement = destinationTrackElement.querySelector(`.${discogsTrackPositionClass} input`);

      setValue(sourceTrackPositionElement, destinationTrackPositionElement);
    }

    async function populateNewTrackArtists(sourceTrackElement, destinationTrackElement) {
      let sourceArtists = getSourceArtists(sourceTrackElement);
      
      if (sourceArtists.length === 0) {
        return;
      }
    }

    function getSourceArtists(sourceTrackElement) {
      let sourceTrackArtistsBaseElement = sourceTrackElement.querySelector(`.${discogsTrackArtistsClass}`);

      let artistsListItems = sourceTrackArtistsBaseElement.querySelectorAll(".editable_list .editable_items_list li");

      if (artistsListItems.length === 0) {
        return [];
      }

      let isCurrentlyEditing = isTrackMetadataBeingEdited(sourceTrackArtistsBaseElement);
      let forcedEditing = false;

      if (!isCurrentlyEditing) {
        startEditingArtist(sourceTrackArtistsBaseElement)
        forcedEditing = true;
      }

      let artists = [];
      let hasJoins = artistsListItems.length > 1;

      for (let i = 0; i < artistsListItems.length; i++) {
        const artistListItem = artistsListItems[i];
        let name = artistListItem.querySelector("fieldset > .lookup-field > input").value;

        let join = undefined;
        let avn = undefined;

        let inputs = artistListItem.querySelectorAll("fieldset > input");

        let avnInput = undefined;
        let joinInput = undefined;

        if (inputs.length !== 0) {
          if (hasJoins && i !== (artistsListItems.length - 1)) {
            if (inputs.length === 2) {
              avnInput = inputs[0];
              joinInput = inputs[1]
            } else {
              joinInput = inputs[0];
            }
          } else {
            // does not have joins or is the last artist in the list
            // may have an AVN
            avnInput = inputs[0];
          }
        }

        avn = avnInput ? avnInput.value : undefined;
        join = joinInput ? joinInput.value : undefined;

        artists.push(new Artist(name, avn, join));
      }
      
      if (forcedEditing) {
        stopEditingArtist(sourceTrackArtistsBaseElement);
      }

      return artists;
    }

    function startEditingArtist(trackBaseElement) {
      let editableActionButtons = trackBaseElement.querySelectorAll(discogsEditOrSaveArtistsButtonSelector);

      if (editableActionButtons.length !== 2) {
        // Add and Edit buttons
        console.error("Edit button not found");
        return;
      }

      let editButton = editableActionButtons[1];

      editButton.click();
    }

    function stopEditingArtist(trackBaseElement) {
      let editableActionButtons = trackBaseElement.querySelectorAll(discogsEditOrSaveArtistsButtonSelector);

      if (editableActionButtons.length !== 2) {
        // Add and Save buttons
        console.error("Save button not found");
        return;
      }

      let saveButton = editableActionButtons[1];

      saveButton.click();
    }

    function Artist(name, avn, join) {
      this.name = name;
      this.avn = avn;
      this.join = join;
    }

    function isTrackMetadataBeingEdited(trackAncestor) {
      let fieldsets = trackAncestor.querySelectorAll("fieldset");
      return fieldsets.length !== 0;
    }

    async function populateNewTrackTitle(sourceTrackElement, destinationTrackElement) {
      let sourceTrackTitleElement = sourceTrackElement.querySelector(`.${discogsTrackTitleClass} input`);
      let destinationTrackTitleElement = destinationTrackElement.querySelector(`.${discogsTrackTitleClass} input`);

      setValue(sourceTrackTitleElement, destinationTrackTitleElement);
    }

    async function populateNewTrackDuration(sourceTrackElement, destinationTrackElement) {
      let sourceTrackDurationElement = sourceTrackElement.querySelector(`.${discogsTrackDurationClass} input`);
      let destinationTrackDurationElement = destinationTrackElement.querySelector(`.${discogsTrackDurationClass} input`);

      setValue(sourceTrackDurationElement, destinationTrackDurationElement);
    }

    function setValue(sourceElement, destinationElement) {
      destinationElement.setAttribute("value", sourceElement.value);
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
