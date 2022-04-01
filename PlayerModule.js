class PlayerModule {
  //-----------------------------------------
  constructor(_id, _pathVideo, _pathMainAudio) {
    this.idVideo = _id;
    this.newSpeed = 1; //default speed
    this.speed = this.newSpeed;
    this.volumeVideo = 0;
    this.volumeAudioVideo = 0;
    this.volumeAudioExtraSound = 0;
    this.isPause = false;
    this.isStop = true;

    //From Slider values
    //Hack
    this.lerpSound = 0.05;
    this.lerpSpeed = 0.05;
    //this.timeFadeIn = sliderSecondsFadeIn.value();//5;
    //this.timeFadeOut = sliderSecondsFadeOut.value();//7;

    //Sound
    this.bExtraSound =false;
    this.volumeAudio = 0;

    this.movFwd = createVideo([_pathVideo], (vidLoad) => {
      preloadingItems++;
      this.movFwd.volume(this.volumeVideo);
      this.movFwd.noLoop();
      console.log("Video at " + this.idVideo + " loaded!");
    });
    this.movFwd.hide();

    if(_pathMainAudio!=""){
        this.mainSound = createAudio([_pathMainAudio], (audioLoad) => {
          preloadingItems++;
          //this.mainSound.autoplay(true);
          this.mainSound.volume(this.volumeAudioExtraSound);
          if(bDebugMode)console.log("Audio at " + this.idVideo + " loaded!");
        });
        this.bExtraSound = true;
    //this.mainSound.hide();
    }

  }

  startOrStop(_actualIdPlaying) {
    if (_actualIdPlaying == this.idVideo){
      this.start();
      if(bDebugMode)console.log("Lets Play "+actualVideo);
    }else{
      this.stop();
      if(_actualIdPlaying == 0  && this.idVideo == 1){
        if(this.bExtraSound)this.mainSound.stop();
        if(bDebugMode)console.log("stop Main Audio! at " + this.idVideo);
      }
    }
  }

  start() {

    if(this.idVideo == 0){
        this.movFwd.loop(); 
    }
    else{
      this.movFwd.play();
      if(this.bExtraSound)this.mainSound.play();
    }

    if(bDebugMode)console.log("start!" + this.idVideo);
    this.isStop = false;

  }

  stop(){
    this.movFwd.stop();
    if(bDebugMode)console.log("stop!" + this.idVideo);
    this.isStop = true;
  }

  ending(){ // TODO is this used?
    setZeroVolumeVideo();
  }

  drawFadeIn(){
    push();
    strokeWeight(16);
    noFill();
    
    stroke(0, 255, 0, 50);
    rect(0,0, width, height);
    pop();
  }

  drawFadeOut(_alpha){
    push();
    strokeWeight(16);
    noFill();
    
    stroke(255, 0, 0, _alpha);
    rect(0,0, width, height);
    pop();
  }

  updateSpeedFwd(){
    //SPEED
    let minSpeed = 0.1;
    let marginMinSpeed = 0.1;
    if(bArduMode)this.newSpeed = map(mySpeedArduino, 0, sliderMaxSpeedArduino.value(), minSpeed, sliderVelVideo.value());
    else this.newSpeed = map(mySpeedArduino, 0, width, minSpeed, sliderVelVideo.value()); //5 SPEED MANUAL ADDDED x5
    this.speed = lerp(this.speed, this.newSpeed, this.lerpSpeed);

    if (this.speed < minSpeed+marginMinSpeed) {
      this.speed = minSpeed;
      this.movFwd.pause();
      this.isPause = true;
    } else {
      if(this.isPause){
        this.movFwd.play();//prevent to ask many times aysncrouns call when ready will play
        this.isPause = false;
      }

      this.movFwd.speed(this.speed);
    }
  }

  //-----------------------------------------
  update() { 
    // here fade between actual video and the next one at the end 
    // here face in at start video linear with lerp

    //Play Payse and apply Speed videos

    //update PCT
    if(this.movFwd.duration != 0){
      this.pctVideo = this.movFwd.time() / this.movFwd.duration();
    }

    if(!this.isStop){
      this.updateSpeedFwd();
    }


  }

  setMaxVolumeVideo(){
    this.volumeVideo = lerp(this.volumeVideo, sliderMaxVolVideo.value(), this.lerpSound);//not enough time to go until 0.7/sliderMaxVolVideo.value() but is good enough way
    this.movFwd.volume(this.volumeVideo);
  }

  setMinVolumeVideo(){
    this.volumeVideo = lerp(this.volumeVideo, 0, this.lerpSound); // interpolate to 0
    this.movFwd.volume(this.volumeVideo);
  }

  setZeroVolumeVideo(){
    this.volumeVideo = lerp(this.volumeVideo, 0, this.lerpSound); // interpolate to 0
    this.movFwd.volume(this.volumeVideo);
  }

  setMinVolumeMainAudio(){ //Hack to get allways access to this video.. this only works if we play just one video at time, not amny... Then remove from here and set out this class.
      if(playerList.length >2){
        if(playerList[1].bExtraSound){
          playerList[1].volumeAudioExtraSound = lerp(playerList[1].volumeAudioExtraSound, 0.1, this.lerpSound); // interpolate to 0
          playerList[1].mainSound.volume(playerList[1].volumeAudioExtraSound);
        }       
      }
  }

  setMaxVolumeMainAudio(){ //Hack to get allways access to this video.. this only works if we play just one video at time, not amny... Then remove from here and set out this class.
      if(playerList.length >2){
        if(playerList[1].bExtraSound){
          playerList[1].volumeAudioExtraSound = lerp(playerList[1].volumeAudioExtraSound, sliderMaxVolMainAudio.value(), this.lerpSound); // interpolate to 0
          playerList[1].mainSound.volume(playerList[1].volumeAudioExtraSound);
        }       
      }
  }

  unPlayVolumeMainAudio(){ //Hack to get allways access to this video.. this only works if we play just one video at time, not amny... Then remove from here and set out this class.
      if(playerList.length >2){
        if(playerList[1].bExtraSound){
          playerList[1].volumeAudioExtraSound = lerp(playerList[1].volumeAudioExtraSound, 0, this.lerpSound); // interpolate to 0
          playerList[1].mainSound.volume(playerList[1].volumeAudioExtraSound);
        }       
      }
  }


  //-----------------------------------------
  display() {
    
    /////////////////////////////
    //CHECK IF SKIP INTRO IFNOT PLAY X1 in LOOP
    if(bNewArduinoInteraction && this.idVideo == 0){
      setNextVideo();
      if(bDebugMode)console.log("*********SKIP INTRO********")
    }else if(!bNewArduinoInteraction && this.idVideo == 0){
      this.speed = 1; //Fixed speed for intro Video
    }
    
    /////////////////////////////
    // FADE OUT // Calculate and draw
    let auxTimeLeft = this.movFwd.duration() - this.movFwd.time();
    let auxFadeOutLeft = map(auxTimeLeft, sliderSecondsFadeOut.value(), 0, 1, 0, true); //TESTING MARGINS

    if(auxTimeLeft < sliderSecondsFadeOut.value()){
      
      if(actualVideo == playerList.length-1){//HAck fade out last one
        this.setZeroVolumeVideo();//TODO may be we are doing this double?
        this.unPlayVolumeMainAudio();
        if(bDebugMode)console.log("last vídeo Fade OFF audios");
      }else { // normal fadeout
        this.setZeroVolumeVideo();
        if(bDebugMode)console.log("Fade OFF audio video");
      }
      //FADE OUT Here with TINT?
      this.drawFadeOut(auxFadeOutLeft);//First Debug with rect red
  
      //End FADE out... NEXT?
      if(auxTimeLeft <= 0.1 && actualVideo == this.idVideo){ // General comparison 
        if(this.idVideo!=0)setNextVideo();// Hacking
      }        
      
    }

    /////////////////////////////
    //FADE IN // Calc and draw 
    let auxTimeStart = this.movFwd.time();
    let auxFadeInStart = map(auxTimeStart, sliderSecondsFadeIn.value(), 0, 0, 1, true);//TESTING MARGINS

    if (this.movFwd.time() < sliderSecondsFadeIn.value()) {
      this.setMinVolumeVideo();
      
      this.setMaxVolumeMainAudio();

      this.drawFadeIn();//First Debug with rect red
    }

    /////////////////////////////
    //Draw main MEDIA Element
    let numArray = [auxFadeOutLeft, auxFadeInStart, 5, 4, 8, 9];//TESTING FADEIN
    let finalAlpha = min(numArray);
    //tint(255, 100); // animation violation , very slow
    drawingContext.globalAlpha = auxFadeOutLeft; // alternative
    image(this.movFwd, 0, 0);
    drawingContext.globalAlpha = 1;//restore


    //////////////////////////////
    //Calc and update Volume if Speed is Slower or Higher.
    if(this.speed < 0.9 || this.speed > 1.4){
      this.setMaxVolumeVideo();
      this.setMinVolumeMainAudio();
    }else {
      this.setMinVolumeVideo();
      this.setMaxVolumeMainAudio();
    }


    /////////////////////////////
    //DEBUG MODE
    if(bDebugMode){
      let auxSizeText = 50;
      let auxPosX = 0.5;
      fill(255);
      textSize(auxSizeText);
      textAlign(RIGHT);

      text("Time since Start......" + ellapsedTimePlaying, width * auxPosX, height * 0.5+ auxSizeText*-5);
      text("Action........." + bNewArduinoInteraction, width * auxPosX, height * 0.5+ auxSizeText*-4);
      text("Time no interaction....." + timeWithoutInteraction, width * auxPosX, height * 0.5+ auxSizeText*-3);

      text("Id Video.........." + this.idVideo, width * auxPosX, height * 0.5+ auxSizeText*-1);
      text("Speed Video....." + nfc(this.speed, 2), width * auxPosX, height * 0.5+ auxSizeText*0);
      text("Vol Video......" + nfc(this.volumeVideo, 2), width * auxPosX, height * 0.5+ auxSizeText*1);
      text("Pause Video....." + this.isPause, width * auxPosX, height * 0.5+ auxSizeText*2);

      //Hack to mantain video with sound active
      if(playerList.length >2){
        if(playerList[1].bExtraSound){
          text("Vol MainAudio..." + nfc(playerList[1].volumeAudioExtraSound, 2), width * auxPosX, height * 0.5+ auxSizeText*4);
        }        
      }

      textSize(auxSizeText*0.5);
      text("Press 'd' to quit this view", width * auxPosX, height * 0.5+ auxSizeText*6);
      text("Press ESC for exit"         , width * auxPosX, height * 0.5+ auxSizeText*7);
      text("Press 'r' for restart"         , width * auxPosX, height * 0.5+ auxSizeText*8);

      fill(200);
      stroke(0)
      strokeWeight(1)
      rect(0,0, width*this.pctVideo, 10);
    }else{
      /////////////////////////////
      //REGULAR MODE INFO
      let sizeTextInfo = 20;
      textSize(sizeTextInfo);
      textAlign(LEFT);
      text("x" + nfc(this.speed, 2), width * 0.1, height * 0.1);
      text(distanceRunned+" meters", width * 0.1, height * 0.1+sizeTextInfo*1);


      let auxSec=floor(this.movFwd.duration());
      let auxhours   = Math.floor(auxSec / 3600); // get hours
      let auxMinutes = Math.floor((auxSec - (auxhours * 3600)) / 60); // get minutes
      let auxSeconds = auxSec - (auxhours * 3600) - (auxMinutes * 60); //  get seconds
      //text(auxSec+" seconds", width * 0.1, height * 0.1+sizeTextInfo*2);
      text(auxMinutes+"'"+auxSeconds+'"', width * 0.1, height * 0.1+sizeTextInfo*2);
      
    }
  }

}
