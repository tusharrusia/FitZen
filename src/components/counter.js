import React from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { useRef, useEffect } from "react";
import angleBetweenThreePoints from "./angle";
import { Button } from "@material-ui/core";
import bicepcurls from "../assets/images/bicepcurls.png";
import crunches from "../assets/images/crunches.png";
import pushups from "../assets/images/pushup.png";
import squats from "../assets/images/squats.png";
import { Link } from "react-router-dom";

const styles = {
  webcam: {
    position: "absolute",
    marginRight: "auto",
    marginLeft: "auto",
    left: 0,
    right: 800,
    top: 200,
    textAlign: "center",
    zIndex: 9,
    width: 860,
    height: 645,
  },
  countBox: {
    position: "absolute",
    marginRight: "auto",
    marginLeft: "auto",
    left: 1100,
    right: 0,
    top: 600,
    width: 400,
    height: 100,
  },
  selectBox: {
    position: "absolute",
    marginRight: "auto",
    marginLeft: "auto",
    left: 900,
    right: 0,
    top: 200,
    textAlign: "center",
    width: 400,
    color: "#b3a69f",
    background: "#1f2838",
  },
  back: {
    position: "fixed",
    bottom: 0,
    right: 0
  },
};

const exrInfo = {
  bicepCurls: {
    index: [12, 14, 16],
    ul: 160,
    ll: 50,
  },
  squats: {
    index: [24, 26, 28],
    ul: 170,
    ll: 50,
  },
  pushups: {
    index: [12, 14, 16],
    ul: 160,
    ll: 80,
  },
  crunches: {
    index: [12, 24, 26],
    ul: 130,
    ll: 50,
  },
};

let count = 0;
let dir = 0;
let angle = 0;
function Counter(props) {
 

  let imgSource;
  if (props.exercise === "bicepCurls") {
    imgSource = bicepcurls;
  } else if (props.exercise === "squats") {
    imgSource = squats;
  } else if (props.exercise === "pushups") {
    imgSource = pushups;
  } else if (props.exercise === "crunches") {
    imgSource = crunches;
  }

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  let camera = null;
  const countTextbox = useRef(null);

  function onResult(results) {
    if (results.poseLandmarks) {
      const position = results.poseLandmarks;

      // set height and width of canvas
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      //ratios between 0-1, covert them to pixel positions
      const upadatedPos = [];
      const indexArray = exrInfo[props.exercise].index;

      for (let i = 0; i < 3; i += 1) {
        upadatedPos.push({
          x: position[indexArray[i]].x * width,
          y: position[indexArray[i]].y * height,
        });
      }
      
      angle = Math.round(angleBetweenThreePoints(upadatedPos));
      

      
      //0 is down, 1 is up
      if (angle > exrInfo[props.exercise].ul) {
        
        if (dir === 0) {
          
          console.log(count, " ", dir, " decrement ", angle);
          dir = 1;
        }
      }
      if (angle < exrInfo[props.exercise].ll) {
        if (dir === 1) {
          count = count + 1;
          var message = new SpeechSynthesisUtterance();
          message.text = count;
          window.speechSynthesis.speak(message);
          console.log(count, " ", dir, " increment ", angle);
          dir = 0;
        }
      }

      
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.save();

      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      

      for (let i = 0; i < 2; i++) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(upadatedPos[i].x, upadatedPos[i].y);
        canvasCtx.lineTo(upadatedPos[i + 1].x, upadatedPos[i + 1].y);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "white";
        canvasCtx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        canvasCtx.beginPath();
        canvasCtx.arc(upadatedPos[i].x, upadatedPos[i].y, 10, 0, Math.PI * 2);
        canvasCtx.fillStyle = "#AAFF00";
        canvasCtx.fill();
      }
      canvasCtx.font = "40px aerial";
      canvasCtx.fillText(angle, upadatedPos[1].x + 10, upadatedPos[1].y + 40);
      canvasCtx.restore();
    }
  }

  useEffect(() => {
    console.log("rendered");
    count = 0;
    dir = 0;

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1624666670/${file}`;
      },
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResult);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if(countTextbox.current) countTextbox.current.value = count;

          if(webcamRef.current) await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  });
 
  function resetCount() {
    console.log("clicked");
    count = 0;
    dir = 0;
  }

  return (
    <div>
      <div style={styles.selectBox}>
      {(() => {
        if (props.exercise === "bicepCurls") {
          return (
            <h1>Bicep Curls</h1>
          )
        } else if (props.exercise === "squats") {
          return (
            <h1>Squats</h1>
          )
        } else if (props.exercise === "pushups") {
          return (
            <h1>Pushups</h1>
          )
        } else {
          return (
            <h1>Crunches</h1>
          )
        }
      })()}

      {/* Different img properties for large width images */}
      {(() => {
        if (props.exercise === "pushups" || props.exercise === "crunches") {
          return (
            <img src={imgSource} width="450" style={{ marginTop:100}} alternate="bicepimage"></img>
          )
        } else {
          return (
            <img src={imgSource} width="200" alternate="bicepimage"></img>
          )
        }
      })()}
     
        <br></br>
        <div style={{ top: 50 }}>
          <h1>Count</h1>
          <input
            variant="filled"
            ref={countTextbox}
            value={count}
            textAlign="center"
            style={{ height: 50, fontSize: 40, width: 80 }}
          />
          <br></br>
          <br></br>
          <Button
            style={{ backgroundColor:'#b3a69f',fontWeight:'bold', top: 15 }}
            size="large"
            variant="contained"
            color="Yellow"
            onClick={resetCount}
          >
            Reset Counter
          </Button>
        </div>
      </div>
      <Webcam ref={webcamRef} style={styles.webcam} />
      <canvas ref={canvasRef} style={styles.webcam} />
      <div style={styles.back}>
        <Link to="/counter">
          <Button size="large" variant="contained"  style={{backgroundColor:'#b3a69f',fontWeight:'bold'}}>
            Back
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Counter;
