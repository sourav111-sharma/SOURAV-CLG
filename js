
const deviceSelect = document.getElementById("opticalType");
const objectDistance = document.getElementById("objectDistance");
const focalLength = document.getElementById("focalLength");
const objectHeight = document.getElementById("objectHeight");
const showRays = document.getElementById("showRays");
const canvas = document.getElementById("rayCanvas");
const ctx = canvas.getContext("2d");

const uValue = document.getElementById("uValue");
const fValue = document.getElementById("fValue");
const hValue = document.getElementById("hValue");

const imagePosition = document.getElementById("imagePosition");
const imageSize = document.getElementById("imageSize");
const imageNature = document.getElementById("imageNature");
const imageOrientation = document.getElementById("imageOrientation");
const explanation = document.getElementById("explanation");

const resetBtn = document.getElementById("resetBtn");

const SCALE = 4;
const CENTER_X = 425;
const AXIS_Y = 220;

function getDeviceName(type) {
  const names = {
    concaveMirror: "concave mirror",
    convexMirror: "convex mirror",
    convexLens: "convex lens",
    concaveLens: "concave lens"
  };
  return names[type];
}

function calculateImage(type, u, focal) {
  // Cartesian sign convention:
  // Object is on the left, so u is negative.
  // Concave mirror and convex lens have positive focal length.
  // Convex mirror and concave lens have negative focal length.

  const signedU = -u;

  let signedF = focal;

  if (type === "convexMirror" || type === "concaveLens") {
    signedF = -focal;
  }

  // Mirror/lens equation: 1/f = 1/v + 1/u
  const denominator = (1 / signedF) - (1 / signedU);
  const v = 1 / denominator;

  // Magnification m = -v/u
  const magnification = -v / signedU;

  let nature = v > 0 ? "Real" : "Virtual";
  let orientation = magnification < 0 ? "Inverted" : "Erect";

  let size;
  const absoluteM = Math.abs(magnification);

  if (Math.abs(absoluteM - 1) < 0.05) {
    size = "Same size";
  } else if (absoluteM > 1) {
    size = "Enlarged";
  } else {
    size = "Diminished";
  }

  let explanationText = "";

  if (type === "concaveMirror") {
    if (u > 2 * focal) {
      explanationText = "The object is beyond the centre of curvature (C). A concave mirror forms a real, inverted and diminished image between F and C.";
    } else if (Math.abs(u - 2 * focal) < 0.5) {
      explanationText = "The object is at the centre of curvature (C). The image is real, inverted and approximately the same size.";
    } else if (u > focal) {
      explanationText = "The object is between F and C. The image is real, inverted and enlarged, and forms beyond C.";
    } else if (Math.abs(u - focal) < 0.5) {
      explanationText = "The object is approximately at the principal focus. Reflected rays are nearly parallel, so the image is formed very far away.";
    } else {
      explanationText = "The object is between the pole and F. The image is virtual, erect and enlarged behind the mirror.";
    }
  } else if (type === "convexMirror") {
    explanationText = "A convex mirror always forms a virtual, erect and diminished image behind the mirror, regardless of the object's position.";
  } else if (type === "convexLens") {
    if (u > 2 * focal) {
      explanationText = "The object is beyond 2F. A convex lens forms a real, inverted and diminished image between F and 2F on the other side.";
    } else if (Math.abs(u - 2 * focal) < 0.5) {
      explanationText = "The object is at 2F. The image is real, inverted and approximately the same size at 2F on the other side.";
    } else if (u > focal) {
      explanationText = "The object is between F and 2F. The image is real, inverted and enlarged beyond 2F.";
    } else if (Math.abs(u - focal) < 0.5) {
      explanationText = "The object is approximately at F. Refracted rays become parallel, so the image is formed very far away.";
    } else {
      explanationText = "The object is within the focal length. A convex lens forms a virtual, erect and enlarged image on the same side as the object.";
    }
  } else {
    explanationText = "A concave lens always forms a virtual, erect and diminished image on the same side as the object.";
  }

  return {
    v,
    magnification,
    nature,
    orientation,
    size,
    explanationText
  };
}

function drawArrow(x, y, height, color, label, dashed = false) {
  const tipY = y - height;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  if (dashed) {
    ctx.setLineDash([7, 5]);
  }

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, tipY);
  ctx.stroke();

  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(x, tipY);
  ctx.lineTo(x - 7, tipY + 13);
  ctx.lineTo(x + 7, tipY + 13);
  ctx.closePath();
  ctx.fill();

  ctx.font = "13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 22);
  ctx.restore();
}

function drawRay(x1, y1, x2, y2, color, dashed = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  if (dashed) {
    ctx.setLineDash([7, 6]);
  }

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawDevice(type) {
  ctx.save();
  ctx.lineWidth = 5;

  if (type.includes("Mirror")) {
    ctx.strokeStyle = "#8c9eff";
    ctx.beginPath();

    if (type === "concaveMirror") {
      ctx.arc(CENTER_X, AXIS_Y, 85, -Math.PI / 2, Math.PI / 2);
    } else {
      ctx.arc(CENTER_X - 85, AXIS_Y, 85, -Math.PI / 2, Math.PI / 2);
    }

    ctx.stroke();

    ctx.strokeStyle = "rgba(140,158,255,.35)";
    ctx.lineWidth = 2;

    for (let y = AXIS_Y - 65; y <= AXIS_Y + 65; y += 13) {
      ctx.beginPath();
      ctx.moveTo(CENTER_X + (type === "concaveMirror" ? 0 : -5), y);
      ctx.lineTo(CENTER_X + (type === "concaveMirror" ? 12 : -12), y);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = "#8c9eff";
    ctx.lineWidth = 5;

    ctx.beginPath();
    if (type === "convexLens") {
      ctx.moveTo(CENTER_X, AXIS_Y - 100);
      ctx.quadraticCurveTo(CENTER_X + 35, AXIS_Y, CENTER_X, AXIS_Y + 100);
      ctx.quadraticCurveTo(CENTER_X - 35, AXIS_Y, CENTER_X, AXIS_Y - 100);
    } else {
      ctx.moveTo(CENTER_X - 10, AXIS_Y - 100);
      ctx.quadraticCurveTo(CENTER_X + 15, AXIS_Y, CENTER_X - 10, AXIS_Y + 100);
      ctx.quadraticCurveTo(CENTER_X - 35, AXIS_Y, CENTER_X - 10, AXIS_Y - 100);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawDiagram(type, u, f, h, result) {
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = "#091626";
  ctx.fillRect(0, 0, width, height);

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,.055)";
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 35) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 35) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Principal axis
  ctx.strokeStyle = "#9fb1c7";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, AXIS_Y);
  ctx.lineTo(width - 20, AXIS_Y);
  ctx.stroke();

  ctx.fillStyle = "#d8e5f5";
  ctx.font = "12px Arial";
  ctx.fillText("Principal axis", 25, AXIS_Y - 10);

  drawDevice(type);

  const isMirror = type.includes("Mirror");

  // Object is always on the left of the optical device.
  const objectX = isMirror
    ? CENTER_X - Math.min(u * SCALE, 330)
    : CENTER_X - Math.min(u * SCALE, 330);

  const objectPixelHeight = h * 3;

  drawArrow(
    objectX,
    AXIS_Y,
    objectPixelHeight,
    "#6ee7d2",
    "Object"
  );

  const imageDistance = Math.min(Math.abs(result.v) * SCALE, 350);

  let imageX;

  if (isMirror) {
    // Positive v: real image in front of mirror (left).
    // Negative v: virtual image behind mirror (right).
    imageX = result.v > 0
      ? CENTER_X - imageDistance
      : CENTER_X + imageDistance;
  } else {
    // Positive v: real image on the right of lens.
    // Negative v: virtual image on the left.
    imageX = result.v > 0
      ? CENTER_X + imageDistance
      : CENTER_X - imageDistance;
  }

  imageX = Math.max(25, Math.min(width - 25, imageX));

  const imagePixelHeight = Math.min(
    Math.abs(result.magnification) * objectPixelHeight,
    150
  );

  const signedImageHeight = result.magnification < 0
    ? -imagePixelHeight
    : imagePixelHeight;

  drawArrow(
    imageX,
    AXIS_Y,
    signedImageHeight,
    "#ff9b85",
    "Image",
    result.nature === "Virtual"
  );

  // Focal point markers
  const focalX = Math.min(f * SCALE, 300);

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(CENTER_X - focalX, AXIS_Y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd166";
  ctx.font = "13px Arial";
  ctx.textAlign = "center";
  ctx.fillText("F", CENTER_X - focalX, AXIS_Y + 22);

  if (type === "convexLens" || type === "concaveLens") {
    ctx.beginPath();
    ctx.arc(CENTER_X + focalX, AXIS_Y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("F", CENTER_X + focalX, AXIS_Y + 22);
  }

  // Simplified illustrative rays, not a full ray-tracing construction.
  if (showRays.checked) {
    const objectTipY = AXIS_Y - objectPixelHeight;
    const imageTipY = AXIS_Y - signedImageHeight;

    drawRay(
      objectX,
      objectTipY,
      CENTER_X,
      AXIS_Y,
      "#ffd166"
    );

    drawRay(
      CENTER_X,
      AXIS_Y,
      imageX,
      imageTipY,
      "#ffd166",
      result.nature === "Virtual"
    );

    drawRay(
      objectX,
      objectTipY,
      imageX,
      imageTipY,
      "#8c9eff",
      result.nature === "Virtual"
    );
  }

  // Labels
  ctx.fillStyle = "#d8e5f5";
  ctx.textAlign = "left";
  ctx.font = "12px Arial";
  ctx.fillText(getDeviceName(type), CENTER_X + 15, 35);
  ctx.fillText("Schematic ray diagram — not to scale", 20, height - 17);
}

function updateSimulation() {
  const type = deviceSelect.value;
  const u = Number(objectDistance.value);
  const f = Number(focalLength.value);
  const h = Number(objectHeight.value);

  uValue.textContent = `${u} cm`;
  fValue.textContent = `${f} cm`;
  hValue.textContent = `${h} cm`;

  const result = calculateImage(type, u, f);

  const positionText = Math.abs(result.v) > 300
    ? "Very far away"
    : `${Math.abs(result.v).toFixed(1)} cm`;

  imagePosition.textContent = positionText;
  imageSize.textContent = result.size;
  imageNature.textContent = result.nature;
  imageOrientation.textContent = result.orientation;
  explanation.textContent = result.explanationText;

  drawDiagram(type, u, f, h, result);
}

[
  deviceSelect,
  objectDistance,
  focalLength,
  objectHeight,
  showRays
].forEach(control => {
  control.addEventListener("input", updateSimulation);
  control.addEventListener("change", updateSimulation);
});

resetBtn.addEventListener("click", () => {
  deviceSelect.value = "concaveMirror";
  objectDistance.value = 30;
  focalLength.value = 15;
  objectHeight.value = 10;
  showRays.checked = true;
  updateSimulation();
});

// Light and dark theme
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  themeToggle.textContent = document.body.classList.contains("light-theme")
    ? "🌙"
    : "☀️";
});

// Prediction challenge
const challengeOptions = document.getElementById("challengeOptions");
const challengeFeedback = document.getElementById("challengeFeedback");

challengeOptions.addEventListener("click", event => {
  const button = event.target.closest("button[data-answer]");
  if (!button) return;

  const buttons = challengeOptions.querySelectorAll("button");
  buttons.forEach(item => item.disabled = true);

  if (button.dataset.answer === "b") {
    challengeFeedback.textContent =
      "Correct! The object is inside the focal length of a convex lens, so the image is virtual, erect and enlarged.";
    challengeFeedback.className = "feedback correct";
  } else {
    challengeFeedback.textContent =
      "Not quite. When an object is placed inside the focal length of a convex lens, the image is virtual, erect and enlarged.";
    challengeFeedback.className = "feedback incorrect";
  }
});

// Quiz
const quizQuestions = [
  {
    question: "Which mirror is used as a rear-view mirror in vehicles?",
    options: ["Concave mirror", "Convex mirror", "Plane mirror", "None of these"],
    answer: 1,
    explanation: "A convex mirror provides a wider field of view and forms an erect, diminished image."
  },
  {
    question: "Which lens is thicker at the centre than at the edges?",
    options: ["Concave lens", "Convex lens", "Both lenses", "Neither lens"],
    answer: 1,
    explanation: "A convex lens is thicker at the centre and thinner at the edges."
  },
  {
    question: "What kind of image is always formed by a convex mirror?",
    options: ["Real and inverted", "Virtual and erect", "Real and enlarged", "Inverted and same size"],
    answer: 1,
    explanation: "A convex mirror always forms a virtual, erect and diminished image."
  },
  {
    question: "What happens to light when it passes from air into glass at an angle?",
    options: ["It is reflected only", "It stops moving", "It is refracted", "It disappears"],
    answer: 2,
    explanation: "Light changes speed and usually changes direction when it enters another medium."
  },
  {
    question: "Where should an object be placed in front of a convex lens to form a virtual, enlarged image?",
    options: ["Beyond 2F", "At 2F", "Between F and the lens", "At infinity"],
    answer: 2,
    explanation: "An object placed between the principal focus and optical centre produces a virtual, erect and enlarged image."
  }
];

let currentQuestion = 0;
let score = 0;
let questionAnswered = false;

const questionCount = document.getElementById("questionCount");
const scoreLabel = document.getElementById("scoreLabel");
const progressBar = document.getElementById("progressBar");
const questionText = document.getElementById("questionText");
const quizOptions = document.getElementById("quizOptions");
const quizFeedback = document.getElementById("quizFeedback");
const nextQuestion = document.getElementById("nextQuestion");

function loadQuestion() {
  const item = quizQuestions[currentQuestion];

  questionAnswered = false;
  questionCount.textContent =
    `Question ${currentQuestion + 1} of ${quizQuestions.length}`;

  scoreLabel.textContent = `Score: ${score}`;
  progressBar.style.width =
    `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;

  questionText.textContent = item.question;
  quizOptions.innerHTML = "";
  quizFeedback.textContent = "";
  quizFeedback.className = "feedback";
  nextQuestion.disabled = true;
  nextQuestion.textContent =
    currentQuestion === quizQuestions.length - 1
      ? "See My Result →"
      : "Next Question →";

  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => selectAnswer(index));
    quizOptions.appendChild(button);
  });
}

function selectAnswer(selectedIndex) {
  if (questionAnswered) return;

  questionAnswered = true;

  const item = quizQuestions[currentQuestion];
  const buttons = quizOptions.querySelectorAll("button");

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === item.answer) {
      button.classList.add("correct-answer");
    }

    if (index === selectedIndex && index !== item.answer) {
      button.classList.add("wrong-answer");
    }
  });

  if (selectedIndex === item.answer) {
    score++;
    quizFeedback.textContent = `Correct! ${item.explanation}`;
    quizFeedback.className = "feedback correct";
  } else {
    quizFeedback.textContent = `Good try! ${item.explanation}`;
    quizFeedback.className = "feedback incorrect";
  }

  scoreLabel.textContent = `Score: ${score}`;
  nextQuestion.disabled = false;
}

nextQuestion.addEventListener("click", () => {
  if (!questionAnswered) return;

  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    showFinalResult();
  }
});

function showFinalResult() {
  questionCount.textContent = "Quiz completed!";
  progressBar.style.width = "100%";

  questionText.textContent =
    `You scored ${score} out of ${quizQuestions.length}!`;

  quizOptions.innerHTML = "";

  let message;

  if (score === 5) {
    message = "Excellent! You have a strong understanding of basic optics.";
  } else if (score >= 3) {
    message = "Good work! Review the explanations and try again.";
  } else {
    message = "Keep learning! Explore the concepts and simulation once more.";
  }

  quizFeedback.textContent = message;
  quizFeedback.className = "feedback correct";

  nextQuestion.disabled = false;
  nextQuestion.textContent = "Try Again ↻";

  nextQuestion.onclick = () => {
    currentQuestion = 0;
    score = 0;
    nextQuestion.onclick = null;
    nextQuestion.addEventListener("click", () => {}, { once: true });
    loadQuestion();
  };
}

// Start the website
updateSimulation();
loadQuestion();
