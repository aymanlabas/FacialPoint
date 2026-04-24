import * as faceapi from 'face-api.js';

class FaceRecognitionService {
    constructor() {
        this.modelsLoaded = false;
        this.MODEL_URL = '/models';
    }

    async loadModels() {
        if (this.modelsLoaded) return true;
        try {
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL),
            ]);
            this.modelsLoaded = true;
            return true;
        } catch (error) {
            console.error("Error loading face models:", error);
            throw error;
        }
    }

    async detectFace(videoElement) {
        return await faceapi.detectAllFaces(videoElement)
            .withFaceLandmarks()
            .withFaceDescriptors();
    }

    extractDescriptor(detection) {
        if (detection && detection.descriptor) {
            return Array.from(detection.descriptor);
        }
        return null;
    }

    // Crée un modèle d'identification (FaceMatcher) à partir des employés enregistrés
    createFaceMatcher(employeesList) {
        const labeledDescriptors = employeesList
            .filter(emp => emp.descriptor && emp.descriptor.length > 0)
            .map(emp => {
                const float32Desc = new Float32Array(emp.descriptor);
                return new faceapi.LabeledFaceDescriptors(emp.id, [float32Desc]);
            });

        if (labeledDescriptors.length === 0) return null;
        return new faceapi.FaceMatcher(labeledDescriptors, 0.55); // Le seuil de tolérance (distance euclidienne)
    }

    // Identifie un visage détecté (Renvoie l'ID de l'employé ou "unknown")
    identifyFace(matcher, capturedDescriptor) {
        if (!matcher) return null;
        try {
            const match = matcher.findBestMatch(capturedDescriptor);
            return match; // return { label: 'userId', distance: 0.4 }
        } catch (e) {
            console.error("Erreur d'identification:", e);
            return null;
        }
    }

    drawDetections(canvas, videoElement, detections) {
        const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
    }
}

export default new FaceRecognitionService();
