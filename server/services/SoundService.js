/**
 * FileName: SoundService.js
 * Author: Wai Lok Daniel Tam
 * Description: Service for handling sound.
 */

/**
 * SoundService class for handling sound operations.
 */
class SoundService {
    /**
     * The constructor for the SoundService class.
     * 
     * @param {File} soundFile The sound file in mp3 format
     */
    constructor(soundFile) {
        this.decodedSound = decode(soundFile);
        this.audioCtx = new AudioContext();
    }

    /**
     * Decodes the sound file.
     * 
     * @returns {Promise<AudioBuffer>} The decoded audio buffer
     */
    async decode() {
        const res = await fetch(this.soundFile);
        const fileArrBuffer = await res.arrayBuffer();
        return await this.audioCtx.decodeAudioData(fileArrBuffer);
    }

    /**
     * Gets the BPM of the sound.
     * 
     * @returns {number} The BPM of the sound
     */
    getBPM() {

    }
}