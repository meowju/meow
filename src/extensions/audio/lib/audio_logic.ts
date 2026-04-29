import ffmpeg from 'fluent-ffmpeg';
import { execSync } from 'child_process';

export interface SilencePeriod {
  start: number;
  end: number;
  duration: number;
}

export class AudioEditor {
  /**
   * Detects silent periods in an audio file.
   * @param filePath Path to the audio file
   * @param threshold Noise threshold in dB (default -30dB)
   * @param minDuration Minimum silence duration in seconds (default 0.5s)
   */
  static async detectSilence(filePath: string, threshold: number = -30, minDuration: number = 0.5): Promise<SilencePeriod[]> {
    return new Promise((resolve, reject) => {
      const silences: SilencePeriod[] = [];
      let currentSilence: Partial<SilencePeriod> = {};

      ffmpeg(filePath)
        .audioFilters(`silencedetect=noise=${threshold}dB:d=${minDuration}`)
        .format('null')
        .on('stderr', (line: string) => {
          const startMatch = line.match(/silence_start: ([\d.]+)/);
          const endMatch = line.match(/silence_end: ([\d.]+)/);
          const durationMatch = line.match(/silence_duration: ([\d.]+)/);

          if (startMatch) {
            currentSilence.start = parseFloat(startMatch[1]);
          }
          if (endMatch) {
            currentSilence.end = parseFloat(endMatch[1]);
            if (durationMatch) {
              currentSilence.duration = parseFloat(durationMatch[1]);
            }
            silences.push(currentSilence as SilencePeriod);
            currentSilence = {};
          }
        })
        .on('error', reject)
        .on('end', () => resolve(silences))
        .save('-'); // Required to trigger execution
    });
  }

  /**
   * Trims silences from an audio file.
   * @param inputPath Input audio file
   * @param outputPath Output audio file
   */
  static trimSilence(inputPath: string, outputPath: string, threshold: number = -30): void {
    // We use the silenceremove filter for a surgical, efficient cut
    // stop_periods=-1: remove all silence periods
    // stop_duration=1: minimum duration to trigger removal
    // stop_threshold: threshold in dB
    const filter = `silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=${threshold}dB`;
    execSync(`ffmpeg -i "${inputPath}" -af "${filter}" "${outputPath}" -y`);
  }
}
