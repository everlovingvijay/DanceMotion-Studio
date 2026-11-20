import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';

export function computeSampleDancePose(timeSeconds: number): PoseLandmarkerResult {
  // Normalize against 720 x 1280
  const width = 720;
  const height = 1280;

  const t = timeSeconds * 2.0; // rhythm speed
  const hipX = 360 + Math.sin(t) * 45;
  const hipY = 680 + Math.cos(t * 2) * 22;

  const norm = (x: number, y: number, z = 0, vis = 0.99) => ({
    x: x / width,
    y: y / height,
    z: z / width,
    visibility: vis,
  });

  const nose = norm(hipX + Math.sin(t) * 12, hipY - 270, 0);
  const leftEye = norm(hipX + Math.sin(t) * 12 - 12, hipY - 280, -5);
  const rightEye = norm(hipX + Math.sin(t) * 12 + 12, hipY - 280, -5);
  const leftEar = norm(hipX + Math.sin(t) * 12 - 25, hipY - 275, 5);
  const rightEar = norm(hipX + Math.sin(t) * 12 + 25, hipY - 275, 5);

  const leftShoulder = norm(hipX - 55, hipY - 190, 0);
  const rightShoulder = norm(hipX + 55, hipY - 190, 0);

  const leftElbow = norm(hipX - 120, hipY - 120 + Math.cos(t) * 65, 10);
  const rightElbow = norm(hipX + 120, hipY - 120 - Math.cos(t) * 65, -10);

  const leftWrist = norm(hipX - 170, hipY - 180 + Math.cos(t) * 95, 20);
  const rightWrist = norm(hipX + 175, hipY - 180 - Math.cos(t) * 95, -20);

  const leftHip = norm(hipX - 35, hipY, 0);
  const rightHip = norm(hipX + 35, hipY, 0);

  const leftKnee = norm(hipX - 55 + Math.sin(t) * 45, hipY + 185, 10);
  const rightKnee = norm(hipX + 55 - Math.sin(t) * 45, hipY + 185, -10);

  const leftAnkle = norm(hipX - 65 + Math.sin(t) * 65, hipY + 365, 15);
  const rightAnkle = norm(hipX + 65 - Math.sin(t) * 65, hipY + 365, -15);

  const leftHeel = norm(hipX - 70 + Math.sin(t) * 65, hipY + 380, 20);
  const rightHeel = norm(hipX + 70 - Math.sin(t) * 65, hipY + 380, -20);

  const leftToe = norm(hipX - 50 + Math.sin(t) * 65, hipY + 385, 25);
  const rightToe = norm(hipX + 50 - Math.sin(t) * 65, hipY + 385, -25);

  const landmarks = [
    nose, // 0
    leftEye, leftEye, leftEye, // 1, 2, 3
    rightEye, rightEye, rightEye, // 4, 5, 6
    leftEar, rightEar, // 7, 8
    norm(hipX - 10, hipY - 245), norm(hipX + 10, hipY - 245), // 9, 10
    leftShoulder, rightShoulder, // 11, 12
    leftElbow, rightElbow, // 13, 14
    leftWrist, rightWrist, // 15, 16
    norm(leftWrist.x * width - 15, leftWrist.y * height - 10), // 17
    norm(rightWrist.x * width + 15, rightWrist.y * height - 10), // 18
    norm(leftWrist.x * width - 10, leftWrist.y * height - 20), // 19
    norm(rightWrist.x * width + 10, rightWrist.y * height - 20), // 20
    norm(leftWrist.x * width + 5, leftWrist.y * height - 15), // 21
    norm(rightWrist.x * width - 5, rightWrist.y * height - 15), // 22
    leftHip, rightHip, // 23, 24
    leftKnee, rightKnee, // 25, 26
    leftAnkle, rightAnkle, // 27, 28
    leftHeel, rightHeel, // 29, 30
    leftToe, rightToe, // 31, 32
  ];

  return {
    landmarks: [landmarks],
    worldLandmarks: [landmarks],
    segmentationMasks: [],
    close: () => {},
  };
}
