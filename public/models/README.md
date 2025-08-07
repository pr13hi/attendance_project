
# Face API Models

For the face recognition system to work properly, you need to download the face-api.js models and place them in this directory.

## Required Models:
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1

## Download Instructions:
1. Visit: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download the required model files
3. Place them in this `/public/models/` directory

## Note:
For this demo, the face recognition system will work with simulated results.
In production, ensure all model files are properly loaded for accurate face detection and recognition.
