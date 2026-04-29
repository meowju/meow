import { Extension } from '../Extension';
import { AudioEditor } from './lib/audio_logic';

export const audioExtension: Extension = {
  name: "audio-editor",
  description: "Advanced programmatic audio editing tools for silence removal and transcription prep.",
  tools: [
    {
      name: "audio_detect_silence",
      description: "Detect silences in an audio file (args: path|threshold|min_duration)",
      execute: async (args: string) => {
        const [path, threshold, minDuration] = args.split("|");
        const silences = await AudioEditor.detectSilence(
          path, 
          threshold ? parseInt(threshold) : -30, 
          minDuration ? parseFloat(minDuration) : 0.5
        );
        return JSON.stringify(silences, null, 2);
      },
    },
    {
      name: "audio_trim_silence",
      description: "Automatically remove silences from an audio file (args: input|output)",
      execute: async (args: string) => {
        const [input, output] = args.split("|");
        AudioEditor.trimSilence(input, output);
        return `Successfully trimmed silence. Output saved to ${output}`;
      },
    }
  ]
};

export default audioExtension;
