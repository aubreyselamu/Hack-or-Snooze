"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  //if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);
  
  return $(`
    <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showStar ? getStarHTML(story, currentUser) : ""}
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
    `);
}



/** Make delete button HTML for story */
function getDeleteBtnHTML () {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

/** Make favorite/not-favorite star for story */
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}



//** Handle submitting new story form */
async function submitNewStory (evt) {
  console.debug("submitNewStory")
  evt.preventDefault();

  //get the values for each input
  const author = $("#story-author").val()
  const title = $("#story-title").val()
  const url = $("#story-url").val();
  const username = currentUser.username; //in the user.js file. We set a currentUser to be a global variable to hold the User instance of the currently logged in user
  const storyData = {title, url, author, username}

  
  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story)
  $("#all-stories-list").prepend($story)

  //hide the form and reset it
  $("#submit-form").slideUp("slow");
  $("#submit-form").trigger("reset")
}

$("#submit-form").on("submit", submitNewStory);



/******************************************************************************
 * Functionality for list of user's own stories
 */

function putUserStoriesOnPage (){
  console.debug("putUserStoriesonPage");

  $("#my-stories").empty();

  if(currentUser.ownStories.length === 0){
    $("#my-stories").append("<h5>No stories added by the user yet!</h5>")
  } else {
    //loop through all of users stories and generate HTML markup for them
    for(let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story, true);
      $("#my-stories").append(story)
    }
  }
  $("#my-stories").show()
}





/******************************************************************************
 * Functionality for favorites list and starr/un-starr a story
 */
/** Put favorites list on page. */

function putFavoritesListOnPage (){
  console.debug("putFavoritesListOnPage")

  $favoritedStories.empty();

  if(currentUser.favorites.length === 0){
    $favoritedStories.append("<h5>No favorites added!</h5>")
  } else {
    for(let favorite of currentUser.favorites){
      let $favorite = generateStoryMarkup(favorite)
      $favoritedStories.append($favorite)
    }
  }
  $favoritedStories.show()
}


/** Handle favorite/un-favorite a story */

async function toggleFavorites(evt){
  console.debug("toggleFavorites")
  
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id")
  const story = storyList.stories.find(s => s.storyId === storyId)

  if($tgt.hasClass("fas")){
    await currentUser.removeFavorite(story)
    $tgt.closest("i").toggleClass("fas far")
  } else {
    await currentUser.addFavorite(story)
    $tgt.closest("i").toggleClass("fas far")
  }
}

$(".stories-list").on("click",".star", toggleFavorites)

