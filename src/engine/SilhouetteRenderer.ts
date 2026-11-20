import { PoseLandmarkerResult, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { RenderSettings } from '../types';
import { MotionSmoother } from './MotionSmoother';

export class SilhouetteRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private smoother: MotionSmoother;
  private prevLandmarks: Array<{ x: number; y: number }> = [];

  constructor() {
    this.smoother = new MotionSmoother(0.5);
  }

  public attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
  }

  public render(
    poseResult: PoseLandmarkerResult | null,
    handResult: HandLandmarkerResult | null,
    settings: RenderSettings,
    targetWidth: number,
    targetHeight: number
  ): void {
    if (!this.canvas || !this.ctx) return;

    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
    }

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 1. Clear background to pure black (#000000)
    ctx.fillStyle = settings.backgroundColor || '#000000';
    ctx.fillRect(0, 0, width, height);

    // Check if we have valid landmarks in poseResult
    let rawLandmarks: Array<{ x: number; y: number; z?: number; visibility?: number }> | null = null;
    if (poseResult && poseResult.landmarks && poseResult.landmarks.length > 0 && poseResult.landmarks[0].length >= 33) {
      rawLandmarks = poseResult.landmarks[0];
    }

    // If no new landmarks, fall back to held previous landmarks
    if (!rawLandmarks && this.prevLandmarks.length >= 33) {
      rawLandmarks = this.prevLandmarks.map((pt) => ({
        x: pt.x / width,
        y: pt.y / height,
        visibility: 0.9,
      }));
    }

    // If still no landmarks, create a default centered dance ready pose
    if (!rawLandmarks) {
      const cx = 0.5;
      const cy = 0.52;
      rawLandmarks = [
        { x: cx, y: cy - 0.22, visibility: 1 }, // nose
        { x: cx - 0.015, y: cy - 0.23, visibility: 1 },
        { x: cx - 0.02, y: cy - 0.23, visibility: 1 },
        { x: cx - 0.025, y: cy - 0.23, visibility: 1 },
        { x: cx + 0.015, y: cy - 0.23, visibility: 1 },
        { x: cx + 0.02, y: cy - 0.23, visibility: 1 },
        { x: cx + 0.025, y: cy - 0.23, visibility: 1 },
        { x: cx - 0.035, y: cy - 0.22, visibility: 1 },
        { x: cx + 0.035, y: cy - 0.22, visibility: 1 },
        { x: cx - 0.015, y: cy - 0.19, visibility: 1 },
        { x: cx + 0.015, y: cy - 0.19, visibility: 1 },
        { x: cx - 0.08, y: cy - 0.15, visibility: 1 }, // left shoulder
        { x: cx + 0.08, y: cy - 0.15, visibility: 1 }, // right shoulder
        { x: cx - 0.15, y: cy - 0.08, visibility: 1 }, // left elbow
        { x: cx + 0.15, y: cy - 0.08, visibility: 1 }, // right elbow
        { x: cx - 0.20, y: cy - 0.02, visibility: 1 }, // left wrist
        { x: cx + 0.20, y: cy - 0.02, visibility: 1 }, // right wrist
        { x: cx - 0.21, y: cy - 0.01, visibility: 1 },
        { x: cx + 0.21, y: cy - 0.01, visibility: 1 },
        { x: cx - 0.22, y: cy - 0.01, visibility: 1 },
        { x: cx + 0.22, y: cy - 0.01, visibility: 1 },
        { x: cx - 0.20, y: cy + 0.01, visibility: 1 },
        { x: cx + 0.20, y: cy + 0.01, visibility: 1 },
        { x: cx - 0.05, y: cy, visibility: 1 }, // left hip
        { x: cx + 0.05, y: cy, visibility: 1 }, // right hip
        { x: cx - 0.06, y: cy + 0.16, visibility: 1 }, // left knee
        { x: cx + 0.06, y: cy + 0.16, visibility: 1 }, // right knee
        { x: cx - 0.07, y: cy + 0.32, visibility: 1 }, // left ankle
        { x: cx + 0.07, y: cy + 0.32, visibility: 1 }, // right ankle
        { x: cx - 0.08, y: cy + 0.34, visibility: 1 }, // left heel
        { x: cx + 0.08, y: cy + 0.34, visibility: 1 }, // right heel
        { x: cx - 0.05, y: cy + 0.35, visibility: 1 }, // left toe
        { x: cx + 0.05, y: cy + 0.35, visibility: 1 }, // right toe
      ];
    }

    // 2. Temporal smoothing factor
    const alphaMap = { none: 1.0, low: 0.8, medium: 0.5, high: 0.25 };
    const smoothingAlpha = alphaMap[settings.smoothing] || 0.5;

    // Smooth landmarks
    const landmarks = rawLandmarks.map((lm, idx) => {
      let x = lm.x * width;
      let y = lm.y * height;
      if (settings.smoothing !== 'none' && this.prevLandmarks[idx]) {
        const prev = this.prevLandmarks[idx];
        const conf = lm.visibility ?? 1.0;
        const effectiveAlpha = smoothingAlpha * Math.max(0.2, conf);
        x = this.smoother.smoothValue(prev.x, x, effectiveAlpha);
        y = this.smoother.smoothValue(prev.y, y, effectiveAlpha);
      }
      return { x, y, visibility: lm.visibility ?? 1.0 };
    });

    this.prevLandmarks = landmarks.map((l) => ({ x: l.x, y: l.y }));

    // 3. Render Grey Silhouette (#888888)
    const silColor = settings.silhouetteColor || '#888888';
    ctx.fillStyle = silColor;
    ctx.strokeStyle = silColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    const shoulderDist = Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y) || (width * 0.18);
    const limbWidth = Math.max(8, shoulderDist * 0.30);
    const torsoMidX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
    const torsoMidY = (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;

    const drawCapsule = (p1: { x: number; y: number }, p2: { x: number; y: number }, radius: number) => {
      ctx.lineWidth = Math.max(6, radius * 2);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    const drawPolygon = (pts: Array<{ x: number; y: number }>) => {
      if (pts.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // A. Torso Body Core
    const shoulderPadding = limbWidth * 0.5;
    const hipPadding = limbWidth * 0.6;
    drawPolygon([
      { x: leftShoulder.x - shoulderPadding, y: leftShoulder.y },
      { x: rightShoulder.x + shoulderPadding, y: rightShoulder.y },
      { x: rightHip.x + hipPadding, y: rightHip.y + hipPadding },
      { x: leftHip.x - hipPadding, y: leftHip.y + hipPadding },
    ]);

    // B. Head & Neck
    const nose = landmarks[0];
    const headRadius = Math.max(16, shoulderDist * 0.38);
    const headY = nose.y || (leftShoulder.y + rightShoulder.y) / 2 - headRadius * 1.5;
    const headX = nose.x || torsoMidX;

    // Neck
    ctx.lineWidth = limbWidth * 0.9;
    ctx.beginPath();
    ctx.moveTo(torsoMidX, torsoMidY);
    ctx.lineTo(headX, headY + headRadius * 0.5);
    ctx.stroke();

    // Head ellipse
    ctx.beginPath();
    ctx.ellipse(headX, headY, headRadius * 0.85, headRadius * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // C. Upper and Lower Limbs
    // Left arm
    drawCapsule(leftShoulder, landmarks[13], limbWidth * 0.85);
    drawCapsule(landmarks[13], landmarks[15], limbWidth * 0.7);

    // Right arm
    drawCapsule(rightShoulder, landmarks[14], limbWidth * 0.85);
    drawCapsule(landmarks[14], landmarks[16], limbWidth * 0.7);

    // Left leg
    drawCapsule(leftHip, landmarks[25], limbWidth * 1.05);
    drawCapsule(landmarks[25], landmarks[27], limbWidth * 0.85);

    // Right leg
    drawCapsule(rightHip, landmarks[26], limbWidth * 1.05);
    drawCapsule(landmarks[26], landmarks[28], limbWidth * 0.85);

    // D. Feet & Grounding
    if (settings.footTracking) {
      const lAnkle = landmarks[27];
      const lHeel = landmarks[29];
      const lToe = landmarks[31];
      drawCapsule(lAnkle, lHeel, limbWidth * 0.5);
      drawCapsule(lHeel, lToe, limbWidth * 0.5);

      const rAnkle = landmarks[28];
      const rHeel = landmarks[30];
      const rToe = landmarks[32];
      drawCapsule(rAnkle, rHeel, limbWidth * 0.5);
      drawCapsule(rHeel, rToe, limbWidth * 0.5);
    }

    // E. Hands & Fingers
    if (settings.handsAndFingers && handResult && handResult.landmarks && handResult.landmarks.length > 0) {
      for (const hand of handResult.landmarks) {
        if (hand.length < 21) continue;
        const pts = hand.map((p) => ({ x: p.x * width, y: p.y * height }));
        drawPolygon([pts[0], pts[5], pts[9], pts[13], pts[17]]);
        const fingerChains = [
          [0, 1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 15, 16],
          [17, 18, 19, 20],
        ];
        ctx.lineWidth = Math.max(3, limbWidth * 0.22);
        for (const chain of fingerChains) {
          ctx.beginPath();
          ctx.moveTo(pts[chain[0]].x, pts[chain[0]].y);
          for (let c = 1; c < chain.length; c++) {
            ctx.lineTo(pts[chain[c]].x, pts[chain[c]].y);
          }
          ctx.stroke();
        }
      }
    } else {
      ctx.beginPath();
      ctx.arc(landmarks[15].x, landmarks[15].y, limbWidth * 0.55, 0, Math.PI * 2);
      ctx.arc(landmarks[16].x, landmarks[16].y, limbWidth * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export const silhouetteRenderer = new SilhouetteRenderer();
