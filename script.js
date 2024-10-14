console.log("Hello spotify server");

let currentSong = new Audio();
let songs;
let currFolder;

// function formatTime(seconds) {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;

//     const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
//     const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

//     formattedMinutes.setMilliseconds(0);
//     formattedSeconds.setMilliseconds(0);

//     return `${formattedMinutes}:${formattedSeconds}`;
// }

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds =
        remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);

        }
    }

    let songUL = document
        .querySelector(".songlist")
        .getElementsByTagName("ul")[0];

    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML =
            songUL.innerHTML +
            `<li>
        <img src="svg/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="svg/play-2.svg" alt="" class="invert">
            </div></li>`;
    }

    //attach an event listener to each song
    Array.from(
        document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/song/" + track)
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "svg/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track
        .replaceAll("%20", " ").replaceAll(".mp3", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function DisplayAlbums() {
    let a = await fetch(`/song/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;


    let anchors = div.getElementsByTagName("a");


    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);
    // let array = anchors;
    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.href.includes("/song/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0]
                //Get the metadata of the folder
            console.log(folder);
            let a = await fetch(`/song/${folder}/info.json`);
            let response = await a.json();

            cardcontainer.innerHTML =
                cardcontainer.innerHTML +
                `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#000000" fill="black">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img class="hsimg" src="/song/${folder}/hs.jpg" alt="" />
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`;
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async(item) => {

            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        });
    });
}

async function main() {
    //Get the list of all the songs
    songs = await getSongs("song/ncs");
    playMusic(songs[0], true);


    //Display all the albums on the page
    await DisplayAlbums();

    //Attack an event listener to play next and previous song
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svg/pause.svg";
        } else {
            currentSong.pause();
            play.src = "svg/play.svg";
        }
    });

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(
    currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 99.3 + "%";
    });

    //Add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        console.log(formatTime(percent));
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    //Add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        console.log("clicked");
        document.querySelector(".left").style.left = "-200%";
    });

    //Add an event listener for previous and next playback
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
            console.log("Playing previous song");
        }
        //  else {
        //          alert("No previous song")
        //      }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
            console.log("Playing Next song");
        }
    });

    function updatevolumeimg(volume) {
        if (volume == 0) {
            volumeimg.src = "svg/volume-mute.svg";
        } else if (volume <= 50 && volume > 0) {
            volumeimg.src = "svg/volumefull.svg";
        }
    }
    //Add an event listener for volume control
    document.querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
            let volume1 = parseInt(e.target.value) / 100;
            updatevolumeimg(volume1);
            console.log("Setting volume to ", e.target.value, " /100");
        });

    //Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volumefull.svg")) {
            e.target.src = e.target.src.replace("volumefull.svg", "volume-mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("volume-mute.svg", "volumefull.svg")
            currentSong.volume = .30;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;


        }
    })

    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
            console.log("Playing Next song");
        }
    })

    document.getElementById('alertButton').addEventListener('click', function() {
        alert('This Feature Will Be Updated Soon');
    });
    document.getElementById('alertButtonlogin').addEventListener('click', function() {
        alert('This Feature Will Be Updated Soon');
    });


    document.querySelector(".buttons").addEventListener("ciick", () => {
            alert("This Feature Will Be Updated Soon")
            console.log("click button is working ")
        })
        // document.querySelector(".loginbtn").addEventListener("ciick", () => {
        //     alert("This Feature Will Be Updated Soon")
        // })



}

main();