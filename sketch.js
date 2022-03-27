/**
 * Se hace camino al andar
 *
 * by Carles Gutiérrez Vallès
 * a creative art installation for Santiago Morilla "Se hace camino al andar"
 *
 */

//loading options
let angle = 0;
let deltaAngle = 0.1;//Desktop And // '0.2' for mobile?
let bLoading = true;
let preloadingItems = 0;

//Vars
let actualVideo = 0;
let counterVideos = 0;

let mySpeedArduino, last_mySpeedArduino;
let bNewArduinoInteraction = false;

let bDebugMode = true;
let bArduMode = false;
let bSlidersActive = false;
let bMouseButtonPressed = false;

//Meters
let distanceRunned = 0;
let distanceStartRunned = 0;
//Timers
let bLestRestartVideos = false;
let lastTimeInteraction;
let timeStartInteraction;
let timeWithoutInteraction;

let ellapsedTimePlaying 
//ArrayList<MovieModule> playerList = new ArrayList<MovieModule>();
let playerList = []; //arreglo de objetos Jitter

//UI Sliders + Button Start
let sliderMaxSpeedArduino;
let sliderVelVideo;
let sliderMaxVolVideo;
let sliderMaxVolMainAudio;
let sliderSecondsFadeIn;
let sliderSecondsFadeOut;
let sliderTimeWithoutInteraction;

let buttonStartW = 220;
let buttonStartH = 70;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //TODO LOAD JSON with slider values and add to setupSliders(_myLoadedJson)...
  setupSliders();
  switchDebugModeUI(bDebugMode);

  background(0);

  if(false){
    setupUI_StartButton();
  }else{
    playerList.push(new PlayerModule(counterVideos, "assets/00.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/01.mp4", "assets/mainSound.mp3"));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/02.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/03.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/04.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/05.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/06.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/07.mp4", ""));counterVideos++;
  }


  //default values
  mySpeedArduino = mouseX;//not necessary if Button Start click... 
  last_mySpeedArduino = mySpeedArduino;
  timeStartInteraction = int(millis()/1000);
  lastTimeInteraction = timeStartInteraction;
  timeWithoutInteraction = 0;

  //Ardu
  setupArdu();
}
  
//------------------------------------------------
//Read mySpeedArduino HERE and update timers
function updateArduinoData(){

  //Speed
  last_mySpeedArduino = mySpeedArduino;
  if(bArduMode)  mySpeedArduino = speedArdu; //HERE arduino VAL
  else  mySpeedArduino = mouseX; // if not lets play with mouseX
  
  //ArduinoInteraction
  if(last_mySpeedArduino != mySpeedArduino){
    bNewArduinoInteraction = true;
    lastTimeInteraction = int(millis()/1000);
  }
  else bNewArduinoInteraction = false;

  //update Timers
  timeWithoutInteraction  = int(millis()/1000) - lastTimeInteraction;
  if(timeWithoutInteraction > sliderTimeWithoutInteraction.value() && actualVideo != 0) {
    bLestRestartVideos = true;
  }else bLestRestartVideos = false;


  ellapsedTimePlaying = int(millis()/1000) - timeStartInteraction;

  //meters
  distanceRunned = distArdu - distanceStartRunned;

}

function drawPreloadingAnimation(){
    push();
      translate(width/2, height/2);
      rotate(angle);
      noStroke();
      fill(0,255,255);
      ellipse(100,0, 20, 20);
      angle += deltaAngle;
    pop();
}

function checkPreloading(){
  let numPreloadingManualItems = 9;

  if(preloadingItems == numPreloadingManualItems){//manual count..
    //Finish Loading
    bLoading = false;
    if(bDebugMode)console.log("bLoading DONE -> preloadingItems was = "+ preloadingItems);

    //!!!!!START!!!!!
    if(playerList.length>0)playerList[0].start();//Let's play just first VIDEO

  }else {
    //if(bDebugMode)console.log("waiting ["+numPreloadingManualItems+"] preloadingItems -> "+ preloadingItems);
  }
}

function draw() {
  background(0);
  fill(255);

  if(bLoading){
    drawPreloadingAnimation();
    checkPreloading(); 
  }
  else{

    updateArduinoData();
    if(bLestRestartVideos){
      restartVideos();
      bLestRestartVideos = false;
    }

    //------------------------------------------------
    //DRAW ACTUAL VIDEOS
    for (let i = 0; i < playerList.length; i++) {
      if (actualVideo == playerList[i].idVideo) {
        playerList[i].update();
        playerList[i].display();
      }
      else{
        //TODO when it's not the main video. 
        //playerList[i].decreaseVolumeVideo(); //TODO is this necessary? try remove it here
      }
    }


    //UI
    if(bDebugMode)drawSlidersValues();

    //Ardu
    if(bArduMode && bDebugMode)drawArdu();
  }

}

//---------------------------------
function restartVideos(){
  actualVideo = 0;
  timeStartInteraction = int(millis()/1000);
  lestPlayOrStop();
  distanceStartRunned = distArdu;
}

function lestPlayOrStop(){
  //HACKy
  //TODO Better try to stop just the one that has to be stop and then control fadeinout?git 
  for (let i = 0; i < playerList.length; i++) {
    playerList[i].startOrStop(actualVideo);
  }
}

//----------------------------------
function setNextVideo(){

  actualVideo++;
  if(actualVideo>playerList.length-1){
    actualVideo = 0;
  } 

  lestPlayOrStop();
}

function mousePressed(){
  if(!bLoading){
    if(mouseButton === LEFT) {
      if(bDebugMode && !bSlidersActive)setNextVideo();
    }
  }
 
}


function keyPressed(){
  if(keyCode == ESCAPE){
    console.log("EXIT!");
    remove();
  }

  if(!bLoading){
    if(key == "D" || key == "d"){
      bDebugMode = !bDebugMode;
      switchDebugModeUI(bDebugMode);
      console.log("bDebugMode = "+bDebugMode)
    }

    if(key == "r" || key == "R"){
      restartVideos();
    }
  }
}

//////////////////////////////////////////////////////////////
//UI

function setupSliders(){

  let sizeSlider = 200;
  let initX = 100;
  let initY = 30;
  let deltaY = 30;
  let countSliders = 1;

  let default_lerpSound = 0.005;
  let default_auxlerpSpeed = 0.05;


  let default_SpeedCintaCorrer = 1;// ADAPT HERE IF NEW HARDWARE ( Cinta de correr ) IS USED
  let default_VelVideo = 6;
  let default_MaxVolVideo = 0.7;
  let default_auxtimeFadeIn = 5;
  let default_auxtimeFadeOut = 7;
  let default_timeWithoutInteraction = 10;

  
  sliderMaxSpeedArduino = createSlider(1, 5, default_SpeedCintaCorrer);
  sliderMaxSpeedArduino.position(initX, initY+deltaY*countSliders);countSliders++;
  sliderMaxSpeedArduino.style('width', sizeSlider+'px');


  sliderVelVideo = createSlider(1, 10, default_VelVideo);
  sliderVelVideo.position(initX, initY+deltaY*countSliders);countSliders++;
  sliderVelVideo.style('width', sizeSlider+'px');
  //sliderVelVideo.hide();

  sliderMaxVolVideo = createSlider(0, 1, default_MaxVolVideo, 0.1);
  sliderMaxVolVideo.position(initX, initY+deltaY*countSliders);countSliders++;
  sliderMaxVolVideo.style('width', sizeSlider+'px');

  sliderMaxVolMainAudio = createSlider(0, 1, default_MaxVolVideo, 0.1);
  sliderMaxVolMainAudio.position(initX, initY+deltaY*countSliders);countSliders++;
  sliderMaxVolMainAudio.style('width', sizeSlider+'px');

  sliderSecondsFadeIn = createSlider(0, 10, default_auxtimeFadeIn);
  sliderSecondsFadeIn.position(initX, initY+deltaY*countSliders);countSliders++;
  sliderSecondsFadeIn.style('width', sizeSlider+'px');

  sliderSecondsFadeOut = createSlider(0, 10, default_auxtimeFadeOut);
  sliderSecondsFadeOut.position(initX, initY+deltaY*countSliders);countSliders++;
  sliderSecondsFadeOut.style('width', sizeSlider+'px');

  sliderTimeWithoutInteraction = createSlider(5, 120, default_timeWithoutInteraction);//10 by default
  sliderTimeWithoutInteraction.position(initX, initY+deltaY*countSliders);countSliders++;
  sliderTimeWithoutInteraction.style('width', sizeSlider+'px');
  
}

function isTouchSliders(){ //TODO NOT USED
  let auxPressedSlider = false;

  auxPressedSlider = (sliderVelVideo._pixelsState.mouseIsPressed)// || //TODO THIS DO NOT WORK, same as mouseclick
   /*sliderMaxVolVideo._pixelsState.mouseIsPressed ||
   sliderMaxVolMainAudio._pixelsState.mouseIsPressed ||
   sliderSecondsFadeIn._pixelsState.mouseIsPressed ||
   sliderSecondsFadeOut._pixelsState.mouseIsPressed);*/

  console.log(auxPressedSlider);

  bSlidersActive = auxPressedSlider;
}

function drawSlidersValues(){

  let auxX = 0;

  push();
  fill(255)
  stroke(100)
  textAlign(LEFT, BASELINE);
  textSize(10);


  text("Max Speed ARDUINO "+sliderMaxSpeedArduino.value(), sliderMaxSpeedArduino.x - auxX, sliderMaxSpeedArduino.y);
  text("Max Speed VIDEO "+sliderVelVideo.value(), sliderVelVideo.x - auxX, sliderVelVideo.y);
  text("Max VolFWD VIDEO "+sliderMaxVolVideo.value(), sliderMaxVolVideo.x - auxX, sliderMaxVolVideo.y);
  text("Max VolMainAudio "+sliderMaxVolMainAudio.value(), sliderMaxVolMainAudio.x - auxX, sliderMaxVolMainAudio.y);
  text("Seconds FadeIN VIDEO "+sliderSecondsFadeIn.value(), sliderSecondsFadeIn.x - auxX, sliderSecondsFadeIn.y);
  text("Seconds FadeOUT VIDEO"+sliderSecondsFadeOut.value(), sliderSecondsFadeOut.x - auxX, sliderSecondsFadeOut.y);
  text("Seconds without Interaction "+sliderTimeWithoutInteraction.value(), sliderTimeWithoutInteraction.x - auxX, sliderTimeWithoutInteraction.y);
  

  pop();

  //isTouchSliders(); // TODO sliderVelVideo._pixelsState.mouseIsPressed NOT USEFULL is just isMousePRessed general

}

//BUTTON///////////////////////////////////////////////////

function switchDebugModeUI(_bdebug){
  if(_bdebug){
    sliderMaxSpeedArduino.show();
    sliderVelVideo.show();
    sliderMaxVolVideo.show();
    sliderMaxVolMainAudio.show();
    sliderSecondsFadeIn.show();
    sliderSecondsFadeOut.show();
    sliderTimeWithoutInteraction.show();
  } 
  else{
    sliderMaxSpeedArduino.hide();
    sliderVelVideo.hide();
    sliderMaxVolVideo.hide();
    sliderMaxVolMainAudio.hide();
    sliderSecondsFadeIn.hide();
    sliderSecondsFadeOut.hide();
    sliderTimeWithoutInteraction.hide();
  }
}

function setButtonStyle(_button){
    _button.style("font-family", "Helvetica");
    _button.style("font-size", 40+"px");
    _button.style("border-radius", "4em");
    _button.style("paddings", "1em 2em");

    _button.style("border", "2px solid #FFFFFF");
    _button.style("cursor", "pointer");
    _button.style("box-shadow", "0px 8px 15px rgba(0, 0, 0, 0.1)")
    _button.style('background-color', "rgba(0, 0, 0, 0)");
    _button.style('color', "white");
}

function setupUI_StartButton(){

  if (typeof buttonStart !== 'undefined') {
    buttonStart.show();
  } else {

    buttonStart = createButton("START");
    buttonStart.size(buttonStartW, buttonStartH);
    buttonStart.position(windowWidth * 0.5 - buttonStartW * 0.5, windowHeight * 0.5 - buttonStartH * 0.5);

    setButtonStyle(buttonStart);

  }

  buttonStart.mousePressed(() => {
    buttonStart.hide();
    
    console.log("LOAD AND START ALL");
    playerList.push(new PlayerModule(counterVideos, "assets/00.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/01.mp4", "assets/mainSound.mp3"));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/02.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/03.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/04.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/05.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/06.mp4", ""));counterVideos++;
    playerList.push(new PlayerModule(counterVideos, "assets/07.mp4", ""));counterVideos++;

  });
}