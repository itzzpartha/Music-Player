let currentSong = new Audio();
let links;
let currentFolder;
let temp_volume;

const minToSec = (time) => {
  let min = Math.floor(time / 60);
  let sec = Math.floor(time % 60);
  min = min < 10 ? "0" + min.toString() : min.toString();
  sec = sec < 10 ? "0" + sec.toString() : sec.toString();
  final =
    (isNaN(min) ? "00" : min).toString() +
    ":" +
    (isNaN(sec) ? "00" : sec).toString();
  return final;
};

async function getSongs(folder) {
  currentFolder = folder;
  highlightCard();  
  let data = await fetch(`/${folder}/`);
  let response = await data.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let items = div.getElementsByTagName("a");
  let songLinks = [];
  let songNames = [];
  for (let index = 0; index < items.length; index++) {
    if (items[index].href.endsWith(".mp3")) {
      songLinks.push(items[index].href);
      songNames.push(items[index].title);
    }
  }

  links = {
    songLinks: songLinks,
    songNames: songNames,
  };

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const name of links.songNames) {
    console.log(name)
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        <div class="cardLeft">
          <img class="invert" src="icons/music.svg" alt="music">
          <div class="songInfo">
            <div class="highlight">
            ${name.split("-")[0]}
            </div>
            <div class="highlight">
            ${name.split("-")[1].split(".mp3")[0]}
            </div>
            <div class="songLinks" style="display:none">
            ${links.songLinks[links.songNames.indexOf(name)]}
            </div>
          </div>
        </div>
        <div class="cardRight">
          <span>Play</span>
          <img class="invert" src="icons/play.svg" alt="">
        </div>
      </li>`;
  }

  highlight();

  // Attaching The Event Listener To Each Song When A Folder Is Loaded
  // This Way, Every Time A New Playlist Is Called, Events Are Attached To Them Right Away
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (event) => {
      let link = e.querySelector(".songInfo :nth-child(3)").innerHTML;
      let name =
        e.querySelector(".songInfo :nth-child(1)").innerText +
        " - " +
        e.querySelector(".songInfo :nth-child(2)").innerText;
      console.log(name);
      playMusic(link, name);
    });
  });

  //Resetting Song Player Info And Position
  if (currentSong.paused){
    document.querySelector(".circle").style.left = 0;
  }
}

const displayAlbums = async() =>{
  let data = await fetch(`/songs/`);
  response = await data.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.querySelectorAll("li a");
  // let anchors = div.querySelectorAll("td a");
  let cardData = document.querySelector(".cardContainer");
  cardData.innerHTML = "";
  for (let i = 0; i< anchors.length; i++) {
    if (anchors[i].href.includes("/songs/") && !anchors[i].href.includes(".htaccess")){
          let folder_name = anchors[i].href.split("/").slice(-1)[0]
          // let folder_name = anchors[i].href.split("/").slice(-2)[0]
          let json_data = await fetch(`/songs/${folder_name}/info.json`);
          let json_info = await json_data.json();
          cardData.innerHTML = cardData.innerHTML + 
          `<div class="card" data-folder="${folder_name}">
          <div class="play">
            <img src="icons/play_button.svg" alt="play_button" />
          </div>
          <img src="songs/${folder_name}/thumbnail.jpg" alt="1" />
          <p style="font-weight: bold; overflow:hidden; font-size: 20px">${json_info.title}</p>
          <p style="font-weight: bold; overflow:hidden; font-size: 12px; color: rgb(131, 131, 131);">${json_info.description}</p>
        </div>`
        }
      }

  //Load Playlist When Card Is Clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (card_div) => {
      await getSongs(`songs/${card_div.currentTarget.dataset.folder}`);
    });
  });
}

function playMusic(trackLink, trackName, pause = false) {
  currentSong.src = trackLink;
  if (!pause) {
    currentSong.play();
    play.src = "icons/pause.svg";
    highlight();
  }
  document.querySelector(".trackName").innerHTML = trackName;
  document.querySelector(".trackTime").innerHTML = "00:00 / 00:00";
}

//Highlighting Songs Function
const highlight = ()=>{
  //Adding Highlighting Class To Song When It Is Playing
  Array.from(document.querySelectorAll(".songList ul li")).forEach((e)=>{
    let song_link = (e.querySelector(".songLinks").innerHTML).trim();
    if (song_link == currentSong.src){
      e.classList.add("highlightSong")
    }
    else{
      e.classList.remove("highlightSong")
    }
  })
}

const highlightCard = ()=>{
  Array.from(document.querySelectorAll(".card")).forEach(e=>{
    if(e.dataset.folder == currentFolder.replace("songs/","")){
      e.classList.add("highlightCard");
    }
    else{
      e.classList.remove("highlightCard");
    }
  })
}

// MAIN FUNCTION

async function main() {
  // await getSongs("songs/Soothing");
  await displayAlbums();
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = `<div style="font-size:15px; display:flex; gap:20px; align-items:center; margin:auto;">
  Click On Any Album
  <img class="invert" style="height:45px;" src="icons/right.svg" alt="music"></div>`;

  // Attaching Event Listeners To Play & Pause Button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "icons/pause.svg";
    } else {
      currentSong.pause();
      play.src = "icons/play.svg";
    }
  });

  // Attaching Event Listener For Updating Song Time
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".trackTime").innerHTML = `${minToSec(
      currentSong.currentTime
    )} / ${minToSec(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    if (currentSong.paused) {
      play.src = "icons/play.svg";
    }
  });

  // Seekbar Event
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let seekbarWidth = e.target.getBoundingClientRect().width;
    let currentX = e.offsetX;
    document.querySelector(".circle").style.left =
      (currentX / seekbarWidth) * 100 + "%";
    currentSong.currentTime = (currentX / seekbarWidth) * currentSong.duration;
  });

  //Hambgurger Event
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  //Hamburger Close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-200%";
  });

  //Event Listener for Prev & Next
  previous.addEventListener("click", () => {
    let index = links.songLinks.indexOf(currentSong.src);
    if (index > 0) {
      playMusic(
        links.songLinks[index - 1],
        links.songNames[index - 1].split(".mp3")[0]
      );
    }
  });

  next.addEventListener("click", () => {
    let index = links.songLinks.indexOf(currentSong.src);
    if (index < links.songLinks.length - 1) {
      playMusic(
        links.songLinks[index + 1],
        links.songNames[index + 1].split(".mp3")[0]
      );
    }
  });

  //Add Event To Volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      let new_volume = e.target.value
      if(new_volume > 66){
        document.querySelector(".volume img").src = "icons/volume.svg"
      }
      else if(new_volume > 33){
        document.querySelector(".volume img").src = "icons/volume_2.svg"
      }
      else if(new_volume > 0){
        document.querySelector(".volume img").src = "icons/volume_1.svg"
      }
      else{
        document.querySelector(".volume img").src = "icons/volume_0.svg"
      }
      currentSong.volume = new_volume / 100;
    });

  //Auto Play Next Song
  currentSong.addEventListener("ended", () => {
    let index = links.songLinks.indexOf(currentSong.src);
    if (index < links.songLinks.length - 1) {
      playMusic(
        links.songLinks[index + 1],
        links.songNames[index + 1].split(".mp3")[0]
      );
    }
  });

  //Adding event listener to volume speaker button
  //The volume button click event automatically calls the inpur range chaneg event using dispatchEvent(event)
  document.querySelector(".volume img").addEventListener("click", e=>{
      let range_val = document.querySelector(".range").getElementsByTagName("input")[0];
      if(range_val.value == 0){
        let event = new Event('change');
        range_val.value = temp_volume;
        document.querySelector(".range").getElementsByTagName("input")[0].dispatchEvent(event);
      }
      else{
        let event = new Event('change');
        temp_volume = range_val.value;
        range_val.value = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].dispatchEvent(event);
      }
    })

  //Adding event listener directly to play song from card
  Array.from(document.getElementsByClassName("card")).forEach(async(e) => {
    e.querySelector(".play img").addEventListener("click",async()=>{
      await getSongs(`songs/${e.dataset.folder}`);
      playMusic(links.songLinks[0], links.songNames[0].split(".mp3")[0]);
    })
  });
}

main();
