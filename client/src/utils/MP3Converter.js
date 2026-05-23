/**
 * @author Wai Lok Daniel Tam
 * @description A utility function to convert a video file to a mp3 file.
 */

// Imports
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/**
 * Converts a video or audio file to a mp3 file.
 * @param {File} file - The video or audio file to convert.
 * @returns {Promise<string>} A promise that resolves to the converted mp3 file.
 */
export async function videoToMp3(file) {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    const fileType = file.name.split('.').pop();
    await ffmpeg.writeFile(`input.${fileType}`, await fetchFile(file));
    await ffmpeg.exec([
        '-i', `input.${fileType}`,
        '-q:a', '0', // Set the audio quality (codec-specific, VBR). This is an alias for -q:a.
        '-map', 'a', // ’a’ for audio
        'output.mp3'
    ]);

    const data = await ffmpeg.readFile('output.mp3');
    return new Blob([data.buffer], { type: 'audio/mpeg' });
}