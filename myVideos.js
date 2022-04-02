let numPreloadingManualItems = 8;

function loadMyVideoList(){
    playerList.push(new PlayerModule(counterVideos, "assets/00.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/01.mp4", "assets/mainSound.mp3"));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/02.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/03.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/04.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/05.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/06.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/07.mp4", ""));counterVideos++;
}