import React from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { useRef, useEffect } from "react";
import angleBetweenThreePoints from "./angle";
import yoga2 from "../assets/images/trikonasana.png";

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
  info: {
    position: "absolute",
    marginRight: "auto",
    marginLeft: "auto",
    left: 1050,
    right: 200,
    top: 300,
    color: "#b3a69f",
    background: "#1f2838",
    textAlign:"center"
  },
};

const Trikonasana = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let camera = null;

  var t = new Date().getTime();
  var max_time = props.Timer;
  var completed = 0;
  console.log(max_time);

  function onResult(results) {
    if (results.poseLandmarks) {
      const position = results.poseLandmarks;
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      // index 12,14,16 11,13,15, range 125,145
      const leftHand = [];
      const rightHand = [];
      for (let i = 11; i < 17; i++) {
        let obj = {};
        obj["x"] = position[i].x * width;
        obj["y"] = position[i].y * height;
        if (i % 2 === 0) {
          rightHand.push(obj);
        } else {
          leftHand.push(obj);
        }
      }

      // index 12,24,26, range 125,145
      const back = [];
      const indexBack = [12, 24, 26];
      for (let i = 0; i < 3; i++) {
        let obj = {};
        obj["x"] = position[indexBack[i]].x * width;
        obj["y"] = position[indexBack[i]].y * height;
        back.push(obj);
      }

      const angleBack = Math.round(angleBetweenThreePoints(back));
      const angleLeftHand = Math.round(angleBetweenThreePoints(leftHand));
      const angleRightHand = Math.round(angleBetweenThreePoints(rightHand));

      let inRangeBack;
      let inRangeLeftHand;
      let inRangeRightHand;
      if (angleBack >= 110 && angleBack <= 150) {
        inRangeBack = true;
      } else {
        inRangeBack = false;
      }
      if (angleLeftHand >= 165 && angleLeftHand <= 195) {
        inRangeLeftHand = true;
      } else {
        inRangeLeftHand = false;
      }
      if (angleRightHand >= 165 && angleRightHand <= 195) {
        inRangeRightHand = true;
      } else {
        inRangeRightHand = false;
      }

      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      //canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)

      for (let i = 0; i < 2; i++) {
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 8;

        canvasCtx.moveTo(back[i].x, back[i].y);
        canvasCtx.lineTo(back[i + 1].x, back[i + 1].y);
        if (inRangeBack) {
          canvasCtx.strokeStyle = "green";
        } else {
          canvasCtx.strokeStyle = "red";
        }
        canvasCtx.stroke();

        canvasCtx.beginPath();
        canvasCtx.moveTo(leftHand[i].x, leftHand[i].y);
        canvasCtx.lineTo(leftHand[i + 1].x, leftHand[i + 1].y);
        if (inRangeLeftHand) {
          canvasCtx.strokeStyle = "green";
        } else {
          canvasCtx.strokeStyle = "red";
        }
        canvasCtx.stroke();

        canvasCtx.beginPath();
        canvasCtx.moveTo(rightHand[i].x, rightHand[i].y);
        canvasCtx.lineTo(rightHand[i + 1].x, rightHand[i + 1].y);
        if (inRangeRightHand) {
          canvasCtx.strokeStyle = "green";
        } else {
          canvasCtx.strokeStyle = "red";
        }
        canvasCtx.stroke();
      }

      for (let i = 0; i < 3; i++) {
        canvasCtx.beginPath();
        //right hand
        canvasCtx.arc(rightHand[i].x, rightHand[i].y, 8, 0, Math.PI * 2);
        //left hand
        canvasCtx.arc(leftHand[i].x, leftHand[i].y, 8, 0, Math.PI * 2);
        canvasCtx.fillStyle = "#AAFF00";
        canvasCtx.fill();

        canvasCtx.beginPath();
        canvasCtx.arc(back[i].x, back[i].y, 8, 0, Math.PI * 2);
        canvasCtx.fillStyle = "#AAFF00";
        canvasCtx.fill();
      }

      if (!(inRangeBack && inRangeLeftHand && inRangeRightHand)) {
        t = new Date().getTime();
        completed = 0;
      }

      if(Math.round((new Date().getTime() -t)/1000)>=max_time){ 
        if(!completed){
        var message = new SpeechSynthesisUtterance();
        message.text = "You have performed Trikonasan for " + max_time + " seconds";
        window.speechSynthesis.speak(message);
        completed = 1;}
      }

      canvasCtx.fillStyle = "green";
      canvasCtx.font = "30px aerial";
      canvasCtx.fillText(angleLeftHand, leftHand[1].x + 20, leftHand[1].y + 20);
      canvasCtx.fillText(
        angleRightHand,
        rightHand[1].x - 120,
        rightHand[1].y + 20
      );
      canvasCtx.fillText(angleBack, back[1].x, back[1].y + 40);

      canvasCtx.fillStyle = "black";
      canvasCtx.font = "30px aerial";
      canvasCtx.fillText(
        "Seconds holded: ".concat(
          String(Math.round((new Date().getTime() - t) / 1000))
        ),
        10,
        40
      );

      canvasCtx.restore();
    }
  }

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1624666670/${file}`;
      },
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResult);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if(webcamRef.current)await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      // Remove the previous onResult callback
      pose.close(); // Close the earlier Pose instance to release resources
    };
  });

  return (
    <div>
      <div>
        <Webcam ref={webcamRef} style={styles.webcam} />
        <canvas ref={canvasRef} style={styles.webcam} />
      </div>
      <div style={styles.info}>
        <p>
          Try to mimic this pose
        </p>
        <img src={yoga2} alternate="Yoga 2" style={{height:400, marginTop:50}}></img>
      </div>
    </div>
  );
};

export default Trikonasana;