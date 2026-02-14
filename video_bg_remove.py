import cv2
import numpy as np
from rembg import remove
from PIL import Image


def remove_video_background(input_path, output_path):
    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
        print("❌ Error opening video file")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Windows-safe codec
    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_count = 0

    # 🔥 TEMPORAL VARIABLES
    prev_alpha = None
    prev_gray = None

    while True:
        ret, frame = cap.read()

        if not ret:
            print("❌ No more frames / video read failed")
            break

        frame_count += 1
        print(f"Processing frame {frame_count}")

        # Grayscale for motion detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_gray is None:
            motion_mask = np.zeros_like(gray, dtype=np.float32)
        else:
            diff = cv2.absdiff(gray, prev_gray)
            motion_mask = diff.astype(np.float32) / 255.0

        prev_gray = gray

        # Convert frame to PIL
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)

        # Background removal
        cutout = remove(pil_img)
        cutout_np = np.array(cutout)

        subject = cutout_np[:, :, :3].astype(np.float32)
        alpha = cutout_np[:, :, 3].astype(np.float32) / 255.0

        # 🔥 MOTION-AWARE TEMPORAL SMOOTHING
        motion_weight = np.clip(motion_mask, 0.0, 1.0)

        if prev_alpha is None:
            smooth_alpha = alpha
        else:
            smooth_alpha = (
                (1 - motion_weight) * prev_alpha +
                motion_weight * alpha
            )

        # ✅ FIX 3: edge stabilization
        smooth_alpha = cv2.GaussianBlur(smooth_alpha, (5, 5), 0)
        smooth_alpha = np.clip(smooth_alpha, 0.0, 1.0)

        # Store alpha for next frame
        prev_alpha = smooth_alpha

        # Background (BLACK)
        bg = np.zeros_like(subject)  # BLACK (best for now)



        # Alpha compositing
        alpha_3 = np.stack([smooth_alpha] * 3, axis=-1)
        result = subject * alpha_3 + bg * (1 - alpha_3)
        result = result.astype(np.uint8)

        out.write(cv2.cvtColor(result, cv2.COLOR_RGB2BGR))

    cap.release()
    out.release()
    print("✅ Video background removal complete")


if __name__ == "__main__":
    remove_video_background("input.mp4", "output.avi")





