const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models")
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withAgeAndGender()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    console.log(detections);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    detections.forEach(item => {
      let text = [
        `Gender: ${item.gender}`,
        `Age: ${parseFloat(item.age).toFixed(0)}`
      ];

      let anchor = {
        y: item.detection.box.topRight.y - 12,
        x: item.detection.box.topRight.x + 52
      };
      // see DrawTextField below
      const drawOptions = {
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      };
      const drawBox = new faceapi.draw.DrawTextField(text, anchor, drawOptions);
      drawBox.draw(canvas);
    });
  }, 100);
});
