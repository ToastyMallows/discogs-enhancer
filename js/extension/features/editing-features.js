rl.ready(() => {
  if (rl.pageIsNot("edit")) return;

  window.addEventListener("DOMContentLoaded", () => {

    const newActionClass = "de-editing-features-new-track-action";
    const discogsTrackActionMenuSelector = ".subform_track_actions ul.action_menu";
    //const discogsAddTracksSelector = "table.subform_tracklist tfoot tr td button";
    const discogsLoadingClass = "loading-placeholder";
    const discogsSubformTrackActionClass = "subform_track_action";
    const discogsSubformTracklistClass = "subform_tracklist";
    const discogsTrackTitleClass = "subform_track_title";
    //let addTracksButton;
    let lastTrackCount = 0;
    let firstLoad = true;
    let allTrackActionMenus = [];

    function loadFeature() {

      // if (firstLoad) {
      //   // find the 'Add Tracks' button
      //   addTracksButton = document.querySelector(discogsAddTracksSelector);
      //   if (!addTracksButton) return;
      // }

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
        alert("finishedFirstLoad");
        firstLoad = false;
      }
    }

    function createCloneTrackAction() {
      let newActionAnchor = document.createElement("a");
      newActionAnchor.onclick = cloneTrack;
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

      let insertTrackActionElement = findInsertTrackActionElement(this.parentElement);

      insertTrackActionElement.click();
    }

    function populateNewTrack(sourceTrackElement, destinationTrackElement) {
      // populateNewTrackPosition(sourceTrackElement, destinationTrackElement);
      // populateNewTrackArtists(sourceTrackElement, destinationTrackElement);
      populateNewTrackTitle(sourceTrackElement, destinationTrackElement);
      // populateNewTrackCredits(sourceTrackElement, destinationTrackElement);
      // populateNewTrackDuration(sourceTrackElement, destinationTrackElement);
    }

    function populateNewTrackTitle(sourceTrackElement, destinationTrackElement) {
      let sourceTrackTitleElement = sourceTrackElement.querySelector(`.${discogsTrackTitleClass} input`);
      let destinationTrackTitleElement = destinationTrackElement.querySelector(`.${discogsTrackTitleClass} input`);

      destinationTrackTitleElement.setAttribute("value", sourceTrackTitleElement.value);
      destinationTrackTitleElement.dispatchEvent(new Event("input", { bubbles: true }));
      destinationTrackTitleElement.dispatchEvent(new Event("change", { bubbles: true }));
      destinationTrackTitleElement.dispatchEvent(new Event("blur", { bubbles: true }));
    }

    function findInsertTrackActionElement(newActionListItem) {
      let insertTrackAction;

      newActionListItem.parentElement.querySelectorAll("li a").forEach((action) => {
        if (action.innerText === "Insert Track") {
          insertTrackAction = action;
        }
      });

      return insertTrackAction;
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
