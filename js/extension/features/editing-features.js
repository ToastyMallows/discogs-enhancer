rl.ready(() => {
  if (rl.pageIsNot("edit")) return;

  window.addEventListener("DOMContentLoaded", () => {

    const newActionClass = "de-editing-features-new-track-action";
    const discogsTrackActionMenuSelector = ".subform_track_actions ul.action_menu";
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
      let sourceTrackArtistsBaseElement = sourceTrackElement.querySelector(`.${discogsTrackArtistsClass}`);
      let isCurrentlyEditing = isTrackMetadataBeingEdited(sourceTrackArtistsBaseElement);

      // alert("Source artist editing: " + isCurrentlyEditing);
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
